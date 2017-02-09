// These type of comments are used in hash comment based languages such as bash and Yaml
module.exports = {
  regionStartMatcher: /^\s*#\s*#docregion\s*(.*)\s*$/,
  regionEndMatcher: /^\s*#\s*#enddocregion\s*(.*)\s*$/,
  plasterMatcher: /^\s*#\s*#docplaster\s*(.*)\s*$/,
  createPlasterComment: plaster => `# ${plaster}`
};
