import Parser from './parser';

export const parse = (query: string) => new Parser(query).parse();

export const isXPath = (query: string) => {
  try {
    parse(query);

    return true;
  } catch(e) {
    return false;
  }
}
