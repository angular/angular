// This comment type is used in C like languages such as JS, TS, Dart, etc
module.exports = {
  regionStartMatcher: /^\s*\/\/\s*#docregion\s*(.*)\s*$/,
  regionEndMatcher: /^\s*\/\/\s*#enddocregion\s*(.*)\s*$/,
  plasterMatcher: /^\s*\/\/\s*#docplaster\s*(.*)\s*$/,
  createPlasterComment: plaster => `/* ${plaster} */`
};
