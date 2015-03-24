var file2modulename = require('../../../tools/build/file2modulename');
/**
 * Wrapper around traceur that can parse the contents of a file
 */
module.exports = function atParser(AttachCommentTreeVisitor, SourceFile, TraceurParser, traceurOptions, log) {

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
    var sourceFile = new SourceFile(moduleName, fileInfo.content);
    var comments = [];
    var moduleTree;
    var errorReporter = {
      reportError: function(position, message) {
      }
    };

    traceurOptions.setFromObject(service.traceurOptions);
    var parser = new TraceurParser(sourceFile, errorReporter, traceurOptions);

    // Configure the parser
    parser.handleComment = function(range) {
      comments.push({ range: range });
    };

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

    var visitor = new AttachCommentTreeVisitor();
    // Visit every node of the tree using our custom method
    visitor.visit(tree, comments);
  }
};