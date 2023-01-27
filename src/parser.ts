import tt, { TokenType, keywords } from "./tokentype";
import { isIdentifierChar, isIdentifierStart } from "./identifier";
import { ASTNode } from "./definition";

const isNewLine = function (code: number): boolean {
  return code === 10 || code === 13 || code === 0x2028 || code === 0x2029;
};

interface ParseError extends SyntaxError {
  pos?: number;
}

class Parser {
  input: string;
  pos: number;
  start: number;
  end: number;
  type: TokenType;
  value: string | undefined;
  lastTokStart: number;
  lastTokEnd: number;
  constructor(query: string) {
    this.input = String(query);
    this.pos = 0;
    this.start = 0;
    this.end = 0;

    this.type = tt.eof;
    this.value = undefined;

    this.lastTokStart = this.pos;
    this.lastTokEnd = this.pos;
  }

  /**
   * Exception handling
   */
  raise(pos: number, msg: string): never {
    msg += " (" + pos + ")";
    const err: ParseError = new SyntaxError(msg);
    err.pos = pos;

    throw err;
  }

  next() {
    this.lastTokEnd = this.end;
    this.lastTokStart = this.start;

    return this.nextToken();
  }

  // tokenizer
  nextToken() {
    this.skipSpace();

    this.start = this.pos;
    if (this.pos >= this.input.length) {
      return this.finishToken(tt.eof);
    }

    return this.readToken(this.fullCharCodeAtPos());
  }

  readToken(code: number) {
    if (isIdentifierStart(code)) {
      return this.readWord();
    }

    return this.getTokenFromCode(code);
  }

  fullCharCodeAtPos() {
    const code = this.input.charCodeAt(this.pos);

    return code;
  }

  skipSpace() {
    loop: while (this.pos < this.input.length) {
      const ch = this.input.charCodeAt(this.pos);
      switch (ch) {
        case 32:
        case 160: // ' '
          ++this.pos;
          break;
        case 13: // CR
          if (this.input.charCodeAt(this.pos + 1) === 10) {
            ++this.pos;
          }
        case 10:
        case 8232:
        case 8233: // eslint-disable-line no-fallthrough
          this.raise(this.pos, "Unexpected newline character");
        default:
          if (ch > 8 && ch < 14) {
            ++this.pos;
          } else {
            break loop;
          }
      }
    }
  }
  readTokenSlash() {
    const next = this.input.charCodeAt(this.pos + 1);
    if (next === 47) {
      const str = this.input.slice(this.pos, (this.pos += 2));

      return this.finishToken(tt.doubleSlash, str);
    }
    const str = this.input.slice(this.pos, (this.pos += 1));

    return this.finishToken(tt.slash, str);
  }

  getTokenFromCode(code: number) {
    switch (code) {
      case 40:
        ++this.pos;
        return this.finishToken(tt.parenL);
      case 41:
        ++this.pos;
        return this.finishToken(tt.parenR);
      case 44:
        ++this.pos;
        return this.finishToken(tt.comma);
      case 91:
        ++this.pos;
        return this.finishToken(tt.bracketL);
      case 93:
        ++this.pos;
        return this.finishToken(tt.bracketR);

      // Numbers
      case 48:
      case 49:
      case 50:
      case 51:
      case 52:
      case 53:
      case 54:
      case 55:
      case 56:
      case 57:
        return this.readNumber();

      // String
      case 34:
      case 39:
        return this.readString(code);

      case 47: // '/'
        return this.readTokenSlash();
      case 124:
        ++this.pos; // '|'
        return this.finishToken(tt.pipe);
      case 42:
        ++this.pos; // '*'
        return this.finishToken(tt.star);
      case 64:
        ++this.pos; // '@'
        return this.finishToken(tt.at);
      case 61:
        ++this.pos; // '='
        return this.finishToken(tt.eq);
      default:
        this.raise(
          this.pos,
          'Unexpected character "' + this.input[this.pos] + '"'
        );
    }
  }

  finishToken(type: TokenType, val?: string) {
    this.end = this.pos;
    this.type = type;
    this.value = val;
  }

  /**
   * Read an integer in the given radix. Return null if zero digits
   * were read, the integer value otherwise. When `len` is given, this
   * will return `null` unless the integer has exactly `len` digits.
   */
  readInt(radix: number, len = null) {
    const start = this.pos;
    let total = 0;
    let e: number = len === null ? Infinity : len!;
    for (let i = 0; i < e; ++i) {
      const code = this.fullCharCodeAtPos();
      let val;
      if (code >= 97) {
        val = code - 97 + 10; // `a`
      } else if (code >= 65) {
        val = code - 65 + 10; // A
      } else if (code >= 48 && code <= 57) {
        val = code - 48; // 0-9
      } else {
        val = Infinity;
      }
      if (val >= radix) {
        break;
      }
      ++this.pos;
      total = total * radix + val;
    }
    if (this.pos === start || (len !== null && this.pos - start !== len)) {
      return null;
    }

    return total;
  }

  readNumber() {
    const start = this.pos;
    if (this.readInt(10) === null) {
      this.raise(start, "Invalid Number");
    }
    let next = this.fullCharCodeAtPos();
    if (next === 46) {
      // '.'
      ++this.pos;
      this.readInt(10);
      next = this.fullCharCodeAtPos();
    }
    if (next === 69 || next === 101) {
      // `eE`
      next = this.input.charCodeAt(++this.pos);
      if (next === 43 || next === 45) {
        ++this.pos; // +/-
      }
      if (this.readInt(10) === null) {
        this.raise(start, "Invalid number");
      }
    }
    if (isIdentifierStart(this.fullCharCodeAtPos())) {
      this.raise(this.pos, "Identifier directly after number");
    }

    const str = this.input.slice(start, this.pos);

    return this.finishToken(tt.num, str);
  }

  readString(quote: number) {
    let out = "";
    const start = this.start;
    let chunkStart = ++this.pos;
    for (;;) {
      if (this.pos >= this.input.length) {
        this.raise(start, "Unterminated string");
      }
      const ch = this.fullCharCodeAtPos();
      if (ch === quote) {
        break;
      }
      if (ch === 92) {
        // '\' escape
        out += this.input.slice(chunkStart, this.pos);
        out += this.readEscapedChar();
        chunkStart = this.pos;
      } else {
        if (isNewLine(ch)) {
          this.raise(start, "Unterminated string");
        }
        ++this.pos;
      }
    }

    out += this.input.slice(chunkStart, this.pos++);
    return this.finishToken(tt.string, out);
  }

  readEscapedChar() {
    const ch = this.input.charCodeAt(++this.pos);
    ++this.pos;
    switch (ch) {
      case 110:
        return "\n";
      case 114:
        return "\r";
      case 116:
        return "\t";
      case 98:
        return "\b";
      case 118:
        return "\u000b"; // eslint-disable-line unicorn/escape-case
      case 102:
        return "\f";
      case 13:
        if (this.fullCharCodeAtPos() === 10) {
          ++this.pos; // '\r\n'
        }
      case 10:
        return ""; // eslint-disable-line no-fallthrough
      default:
        return String.fromCharCode(ch);
    }
  }

  readWord1() {
    const chunkStart = this.pos;
    while (this.pos < this.input.length) {
      const ch = this.fullCharCodeAtPos();
      if (isIdentifierChar(ch)) {
        ++this.pos;
      } else {
        break;
      }
    }
    const word = this.input.slice(chunkStart, this.pos);

    return word;
  }

  readWord() {
    const word = this.readWord1();
    if (keywords[word]) {
      return this.finishToken(keywords[word], word);
    }

    return this.finishToken(tt.name, word);
  }

  startNode(): ASTNode {
    return {
      type: "",
      start: this.start,
      end: 0,
    };
  }

  finishNode(node: ASTNode, type: string) {
    node.type = type;
    node.end = this.lastTokEnd;

    return node;
  }

  parse() {
    this.nextToken();

    return this.parseTopLevel();
  }

  parseTopLevel() {
    const steps = [];

    while (this.type !== tt.eof) {
      const step = this.parseStep();
      steps.push(step);
    }

    return steps;
  }

  parseStep() {
    const node = this.startNode();
    node.axis = this.parseAxis();
    node.nodeTest = this.parseNodeTest();
    node.predicate = this.parseFilters();

    return this.finishNode(node, "step");
  }

  parseAxis() {
    const type = this.type;

    if (type === tt.doubleSlash) {
      this.next();
      return tt.doubleSlash;
    } else if (type === tt.slash) {
      this.next();
      return tt.slash;
    } else {
      this.raise(this.start, "Expect an axis");
    }
  }

  parseNodeTest() {
    const node = this.startNode();
    const type = this.type;

    if (type === tt.star) {
      node.value = "*";
      this.next();

      return this.finishNode(node, "nodeTest");
    } else if (type === tt.name) {
      return this.parseTag(node);
    } else if (type === tt.at) {
      node.value = "@";
      const childNode = this.startNode();
      node.predicate = [childNode];
      this.parseAttrFilter(childNode);

      return this.finishNode(node, "nodeTest");
    } else {
      this.raise(this.start, "Expect a node test");
    }
  }

  parseTag(node: ASTNode) {
    node.value = this.value;
    this.next();

    if (this.type === tt.parenL) {
      this.raise(this.start, "Unexpected xpath function");
    }

    return this.finishNode(node, "nodeTest");
  }

  parseFilters() {
    const filters = [];

    while (this.eat(tt.bracketL)) {
      const filter = this.parsePredicate();
      filters.push(filter);
      if (filter.type !== "positionFilter" && this.eat(tt.and)) {
        const filter2 = this.parsePredicate();
        filters.push(filter2);
      }
      this.expect(tt.bracketR);
    }

    return filters;
  }

  parsePredicate() {
    const node = this.startNode();
    const type = this.type;

    switch (type) {
      case tt.at:
        return this.parseAttrFilter(node);
      case tt.name:
        return this.parseMaybeFun(node);
      case tt.num:
        node.position = this.value;
        this.next();

        return this.finishNode(node, "positionFilter");

      default:
        this.raise(this.start, "Unexpected node predicate");
    }
  }

  parseAttrFilter(node: ASTNode) {
    this.next();
    // @attr
    node.attr = this.getName();
    if (this.eat(tt.eq)) {
      node.value = this.getString();
    }

    return this.finishNode(node, "attributeFilter");
  }

  parseFunction(node: ASTNode) {
    this.next();
    node.arg = this.parseBindingList(tt.parenR);

    return this.finishNode(node, "function");
  }

  // ## Parser utilities
  eat(type: TokenType) {
    if (this.type === type) {
      this.next();

      return true;
    }

    return false;
  }

  expect(type: TokenType) {
    return (
      this.eat(type) ||
      this.raise(
        this.lastTokEnd,
        `Expect a "${type.label}" after, got ${this.type.label}`
      )
    );
  }

  getName() {
    if (this.type !== tt.name) {
      this.raise(this.start, "Expect a valid name");
    }
    const val = this.value;
    this.next();

    return val;
  }

  getString() {
    if (this.type !== tt.string) {
      this.raise(this.start, "Expect a string");
    }
    const val = this.value;
    this.next();

    return val;
  }

  parseBindingList(close: TokenType) {
    const elts = [];
    let first = true;

    while (!this.eat(close)) {
      if (first) {
        first = false;
      } else {
        // (1, ...)
        this.expect(tt.comma);
      }

      const el = this.parseArg();
      elts.push(el);
    }

    return elts;
  }

  parseArg() {
    const node = this.startNode();
    const type = this.type;

    switch (type) {
      case tt.name:
        return this.parseMaybeFun(node);
      case tt.string:
        node.name = this.getString();

        return this.finishNode(node, "string");
      case tt.at:
        this.next();
        node.attr = this.getName();

        return this.finishNode(node, "attribute");

      default:
        this.raise(this.start, "Unexpected function argument");
    }
  }

  parseMaybeFun(node: ASTNode) {
    node.name = this.getName();
    // position function have its arguments like this
    // position() = 2
    if (node.name === "position") {
      this.expect(tt.parenL);
      this.expect(tt.parenR);
      this.expect(tt.eq);
      const type = this.type;
      if (type !== tt.num) {
        this.raise(
          this.start,
          `Expect a number for position function, got ${this.type.label}.`
        );
      }
      node.position = this.value;
      this.next();
      return this.finishNode(node, "function");
    }
    // normal functions(arg1, arg2...)
    if (this.type === tt.parenL) {
      return this.parseFunction(node);
    }

    return this.finishNode(node, "name");
  }
}

export default Parser;
