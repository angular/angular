var traceur = require('traceur/src/node/traceur.js');
var ParseTreeVisitor = System.get(System.map.traceur + '/src/syntax/ParseTreeVisitor').ParseTreeVisitor;
var file2modulename = require('../../../file2modulename');
/**
 * Wrapper around traceur that can parse the contents of a file
 */
module.exports = function atParser(log) {

  var service = {
    /**
     * The options to pass to traceur
     */
    traceurOptions: {
      annotations: true,     // parse annotations
      types: true,           // parse types
      memberVariables: true, // parse class fields
      commentCallback: true  // handle comments
    },

    /**
     * Parse a module AST from the contents of a file.
     * @param {Object} fileInfo information about the file to parse
     * @return { { moduleTree: Object, comments: Array } } An object containing the parsed module
     *             AST and an array of all the comments found in the file
     */
    parseModule: parseModule
  };

  return service;


  // Parse the contents of the file using traceur
  function parseModule(fileInfo) {

    var moduleName = file2modulename(fileInfo.relativePath);
    var sourceFile = new traceur.syntax.SourceFile(moduleName, fileInfo.content);
    var parser = new traceur.syntax.Parser(sourceFile);
    var comments = [];
    var moduleTree;

    // Configure the parser
    parser.handleComment = function(range) {
      comments.push({ range: range });
    };
    traceur.options.setFromObject(service.traceurOptions);

    try {
      // Parse the file as a module, attaching the comments
      moduleTree = parser.parseModule();
      attachComments(moduleTree, comments);
    } catch(ex) {
      // HACK: sometime traceur crashes for various reasons including
      // Not Yet Implemented (NYI)!
      log.error(ex.stack);
      moduleTree = {};
    }
    log.debug(moduleName);
    moduleTree.moduleName = moduleName;

    // We return the module AST but also a collection of all the comments
    // since it can be helpful to iterate through them without having to
    // traverse the AST again
    return {
      moduleTree: moduleTree,
      comments: comments
    };
  }

  // attach the comments to their nearest code tree
  function attachComments(tree, comments) {

    var visitor = new ParseTreeVisitor();
    var index = 0;
    var currentComment = comments[index];

    if (currentComment) log.silly('comment: ' + currentComment.range.start.line + ' - ' + currentComment.range.end.line);

    // Really we ought to subclass ParseTreeVisitor but this is fiddly in ES5 so
    // it is easier to simply override the prototype's method on the instance
    visitor.visitAny = function(tree) {
      if (tree && tree.location && tree.location.start && currentComment) {
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

    // Visit every node of the tree using our custom method
    visitor.visit(tree);
  }
};