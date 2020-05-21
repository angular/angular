// This comment type is used in C like languages such as JS, TS, Dart, etc
export const inlineC = {
  regionStartMatcher: /^\s*\/\/\s*#docregion\s*(.*)\s*$/,
  regionEndMatcher: /^\s*\/\/\s*#enddocregion\s*(.*)\s*$/,
};
