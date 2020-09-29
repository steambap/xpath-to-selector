import Parser from "./parser";
import toSelector from "./to-selector";

export const parse = (query: string) => new Parser(query).parse();

export const isXPath = (query: string) => {
  try {
    parse(query);

    return true;
  } catch (e) {
    return false;
  }
};

export const xpath2css = (query: string) => toSelector(parse(query));

export default xpath2css;

export const x = (arg: string[], ...param: any[]) => {
  if (arg.length <= 1) {
    return xpath2css(arg[0]);
  }

  let query = arg[0];
  for (let i = 1; i < arg.length; i++) {
    query += String(param[i - 1]);
    query += arg[i];
  }

  return xpath2css(query);
};
