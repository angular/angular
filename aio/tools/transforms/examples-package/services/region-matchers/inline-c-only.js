// These kind of comments are used in languages that do not support block comments, such as Jade
module.exports = {
  regionStartMatcher: /^\s*\/\/\s*#docregion\s*(.*)\s*$/,
  regionEndMatcher: /^\s*\/\/\s*#enddocregion\s*(.*)\s*$/,
  plasterMatcher: /^\s*\/\/\s*#docplaster\s*(.*)\s*$/,
  createPlasterComment: plaster => `// ${plaster}`
};
