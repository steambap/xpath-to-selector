import { isIdentifierStart } from "./identifier";

test("isIdentifierStart", () => {
  "$_asdfghjklASDFGHJKL".split("").forEach((char) => {
    const code = char.charCodeAt(0);
    expect(isIdentifierStart(code)).toEqual(true);
  });
});

test("isNotIdentifierStart", () => {
  "#@1234567890*()".split("").forEach((char) => {
    const code = char.charCodeAt(0);
    expect(isIdentifierStart(code)).toEqual(false);
  });
});
