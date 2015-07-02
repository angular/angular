var ts = require('typescript');
var LEADING_STAR = /^[^\S\r\n]*\*[^\S\n\r]?/gm;

module.exports = function getContent() {
  return function(symbol) {

    var content = "";

    if (!symbol.declarations) return content;

    symbol.declarations.forEach(function(declaration) {

      // If this is left side of dotted module declaration, there is no doc comment associated with this declaration
      if (declaration.kind === ts.SyntaxKind.ModuleDeclaration && declaration.body.kind === ts.SyntaxKind.ModuleDeclaration) {
          return content;
      }

      // If this is dotted module name, get the doc comments from the parent
      while (declaration.kind === ts.SyntaxKind.ModuleDeclaration && declaration.parent.kind === ts.SyntaxKind.ModuleDeclaration) {
          declaration = declaration.parent;
      }

      // If this is a variable declaration then we get the doc comments from the grand parent
      if (declaration.kind === ts.SyntaxKind.VariableDeclaration) {
        declaration = declaration.parent.parent;
      }

      // Get the source file of this declaration
      var sourceFile = ts.getSourceFileOfNode(declaration);
      var commentRanges = ts.getJsDocComments(declaration, sourceFile);

      if (commentRanges) {
        commentRanges.forEach(function(commentRange) {
          content += sourceFile.text
              .substring(commentRange.pos+ '/**'.length, commentRange.end - '*/'.length)
              .replace(LEADING_STAR, '')
              .trim();
          if (commentRange.hasTrailingNewLine) {
            content += '\n';
          }
        });
      }

      content += '\n';
    });

    return content;
  };
};