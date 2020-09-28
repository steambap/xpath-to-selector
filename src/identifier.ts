export const isIdentifierStart = function (code: number): boolean {
  if (code < 65) return code === 36; // $
  if (code < 91) return true; // A-Z
  if (code < 97) return code === 95; // _
  return code < 123; // `a-z`
};

export const isIdentifierChar = function (code: number): boolean {
  if (code < 48) return code === 36; // $
  if (code < 58) return true; // 0-9
  if (code < 65) return false;
  if (code < 91) return true; // A-Z
  if (code < 97) return code === 95; // _
  return code < 123; // `a-z`
};
