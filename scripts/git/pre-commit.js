'use strict';

const isNegatedGlob = require('is-negated-glob');
const minimatch = require('minimatch');
const sh = require('shelljs');
const {srcsToFmt} = require('../../tools/gulp-tasks/format');

sh.set('-e');

const globsToFormat = srcsToFmt.map(isNegatedGlob);
const committedFilePaths = process.argv.slice(2);
const filePathsToFormat = matchFiles(globsToFormat, committedFilePaths);

const formatCmds = filePathsToFormat.map(filePath => {
  const gitDiff = sh.exec(`git diff --staged --unified=0 ${filePath}`, {silent: true});
  const linesArgs = gitDiff.stdout.
    split('\n').
    map(l => l.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/)).
    filter(m => m && (m[2] !== '0')).
    map(([, startLine, lineCount = 1]) => `-lines=${startLine}:${+startLine + +lineCount - 1}`).
    join(' ');

  return `node node_modules/clang-format -i -style=file ${linesArgs} ${filePath}`;
});

formatCmds.forEach(cmd => sh.exec(cmd, {silent: true}));
sh.exec(`git add ${filePathsToFormat.join(' ')}`, {silent: true});

// Helpers
function matchFiles(globs, allFilePaths) {
  return globs.reduce((matchedFilePaths, {negated, pattern}) => {
    const filePaths = negated ? matchedFilePaths : allFilePaths;
    const newMatchedFilePaths = filePaths.filter(fp => minimatch(fp, pattern));

    return negated ?
      matchedFilePaths.filter(fp => !newMatchedFilePaths.includes(fp)) :
      matchedFilePaths.concat(newMatchedFilePaths);
  }, []);
}
