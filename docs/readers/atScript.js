var _ = require('lodash');
var traceur = require('traceur/src/node/traceur.js');

traceur.options.setFromObject({
  annotations: true, // parse annotations
  types: true, // parse types
  script: false, // parse as a module
  memberVariables: true, // parse class fields
  modules: 'instantiate',
  commentCallback: true
});

/**
 * @dgService atScriptFileReader
 * @description
 * This file reader will create a simple doc for each
 * file including a code AST of the AtScript in the file.
 */
module.exports = function atScriptFileReader(log) {
  return {
    name: 'atScriptFileReader',
    defaultPattern: /\.js$/,
    getDocs: function(fileInfo) {

      try {

        parseFile(fileInfo);

      } catch(ex) {
        log.error(ex.stack);
        throw ex;
      }

      return [{
        docType: 'atScriptFile'
      }];
    }
  };

  function parseFile(fileInfo) {

    var sourceFile = new traceur.syntax.SourceFile(fileInfo.relativePath, fileInfo.content);
    var parser = new traceur.syntax.Parser(sourceFile);

    parser.handleComment = function(range) {
      fileInfo.comments.push({ range: range });
    };

    fileInfo.comments = [];
    fileInfo.codeTree = parser.parseModule();
    attachComments(fileInfo.codeTree, fileInfo.comments);
  }

  function attachComments(tree, comments) {

    var ParseTreeVisitor = System.get("traceur@0.0.74/src/syntax/ParseTreeVisitor").ParseTreeVisitor;

    var visitor = new ParseTreeVisitor();
    var index = 0;
    var currentComment = comments[index];

    if (currentComment) log.silly('comment: ' + currentComment.range.start.line + ' - ' + currentComment.range.end.line);

    visitor.visitAny = function(tree) {
      if (tree && tree.location && currentComment) {
        if (currentComment.range.end.offset < tree.location.start.offset) {
          log.silly('tree: ' + tree.constructor.name + ' - ' + tree.location.start.line);
          tree.commentBefore = currentComment;
          currentComment.treeAfter = tree;
          index++;
          currentComment = comments[index];
          if (currentComment) log.silly('comment: ' + currentComment.range.start.line + ' - ' + currentComment.range.end.line);
        }
      }
      return ParseTreeVisitor.prototype.visitAny.call(this, tree);
    };
    visitor.visitAny(tree);
  }

};