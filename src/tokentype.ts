export class TokenType {
  label: string;
  constructor(label: string) {
    this.label = label;
  }
}

const types = {
  num: new TokenType("num"),
  string: new TokenType("string"),
  name: new TokenType("name"),
  eof: new TokenType("eof"),

  // Operators
  bracketL: new TokenType("["),
  bracketR: new TokenType("]"),
  parenL: new TokenType("("),
  parenR: new TokenType(")"),
  pipe: new TokenType("|"),
  slash: new TokenType("/"),
  doubleSlash: new TokenType("//"),
  star: new TokenType("*"),
  at: new TokenType("@"),
  eq: new TokenType("="),
  comma: new TokenType(","),
};

export default types;
