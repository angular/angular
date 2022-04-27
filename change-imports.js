const glob = require('glob').sync;
const ts = require('typescript');
const {
  readFileSync,
  writeFileSync,
  existsSync,
} = require('fs');
const path = require('path');

glob('**/*.ts', {absolute: true, ignore: ['**/node_modules/**', '**/aio/**']}).forEach(filePath => {
  if (filePath.endsWith('.d.ts')) {
    return;
  }

  let content = readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.ES2015, true);
  const transformations = [];

  sourceFile.forEachChild(function walk(node) {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier) && node.moduleSpecifier.text.startsWith('.') &&
        !node.moduleSpecifier.text.endsWith('.js')) {
      const isIndex =
          existsSync(path.join(path.dirname(filePath), node.moduleSpecifier.text, 'index.ts'));
      const newText = isIndex ? path.join(node.moduleSpecifier.text, 'index.js') :
                                node.moduleSpecifier.text + '.js';

      transformations.push({
        start: node.moduleSpecifier.getStart() + 1,
        end: node.moduleSpecifier.getEnd() - 1,
        // For some reason `path.join` strips the leading `./` in some cases.
        text: newText.startsWith('.') ? newText : './' + newText
      });
    }

    node.forEachChild(walk);
  });

  transformations.sort((a, b) => b.start - a.start).forEach(({start, end, text}) => {
    content = content.slice(0, start) + text + content.slice(end);
  });

  writeFileSync(filePath, content);
});
