interface ttOptions {
  keyword?: string;
  beforeExpr?: boolean;
}

export class TokenType {
  label: string;
  beforeExpr: boolean;
  constructor(label: string, options: ttOptions = {}) {
    this.label = label;
    this.beforeExpr = Boolean(options.beforeExpr);
  }
}

type keywordsMap = {
  [name: string]: TokenType;
};

export const keywords: keywordsMap = {};

function kw(name: string, options: ttOptions = {}): TokenType {
  options.keyword = name;
  const tt = new TokenType(name, options);
  keywords[name] = tt;

  return tt;
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
  and: kw("and", {beforeExpr: true}),
};

export default types;
