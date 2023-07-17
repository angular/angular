module.exports = function removeEslintComments(input, fileType) {
  const regexForFileType = regexesForFileTypes[fileType];

  if (!input || !regexForFileType) {
    return input;
  }

  return input.replace(regexForFileType, '');
};

const jsRegexes = [
  /\/\/ *eslint-disable(?:-next-line)?(?: .*)?(?:\n *|$)/,
  /\n? *\/\/ *eslint-(?:disable-line|enable)(?: .*)?(?=\n|$)/,
  /\/\*\s*eslint-disable(?:-next-line)?(?: [\s\S]*?)?\*\/ *(?:\n *)?/,
  /\n? *\/\*\s*eslint-(?:disable-line|enable)(?: [\s\S]*?)?\*\//,
];

const htmlRegexes = [
  /<!--\s*eslint-disable(?:-next-line)?(?: [\s\S]*?)?--> *(?:\n *)?/,
  /\n? *<!--\s*eslint-(?:disable-line|enable)(?: [\s\S]*?)?-->/,
];

const joinRegexes = regexes => new RegExp(regexes.map(regex => `(?:${regex.source})`).join('|'), 'g');
const htmlRegex = joinRegexes(htmlRegexes);
// Note: the js regex needs to also include the html ones to account for inline templates in @Components
const jsRegex = joinRegexes([...jsRegexes, ...htmlRegexes]);

const regexesForFileTypes = {
  js: jsRegex,
  ts: jsRegex,
  html: htmlRegex,
};
