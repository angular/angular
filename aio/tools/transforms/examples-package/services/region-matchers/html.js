// These kind of comments are used in HTML
module.exports = {
  regionStartMatcher: /^\s*<!--\s*#docregion\s*(.*?)\s*(?:-->)?\s*$/,
  regionEndMatcher: /^\s*<!--\s*#enddocregion\s*(.*?)\s*-->\s*$/,
  plasterMatcher: /^\s*<!--\s*#docplaster\s*(.*?)\s*-->\s*$/,
  createPlasterComment: plaster => `<!-- ${plaster} -->`
};
