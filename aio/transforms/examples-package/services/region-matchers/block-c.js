// These kind of comments are used CSS and other languages that do not support inline comments
module.exports = {
  regionStartMatcher: /^\s*\/\*\s*#docregion\s*(.*)\s*\*\/\s*$/,
  regionEndMatcher: /^\s*\/\*\s*#enddocregion\s*(.*)\s*\*\/\s*$/,
  plasterMatcher: /^\s*\/\*\s*#docplaster\s*(.*)\s*\*\/\s*$/,
  createPlasterComment: plaster => `/* ${plaster} */`
};