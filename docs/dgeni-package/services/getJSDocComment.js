var LEADING_STAR = /^[^\S\r\n]*\*[^\S\n\r]?/gm;

/**
 * Extact comment info from a comment object
 * @param {Object} comment object to process
 * @return { {startingLine, endingLine, content, codeTree}= } a comment info object
 *                          or undefined if the comment is not a jsdoc style comment
 */
module.exports = function getJSDocComment() {
  return function(comment) {

    var commentInfo;

    // we need to check for `/**` at the start of the comment to find all the jsdoc style comments
    comment.range.toString().replace(/^\/\*\*([\w\W]*)\*\/$/g, function(match, commentBody) {
      commentBody = commentBody.replace(LEADING_STAR, '').trim();

      commentInfo = {
        startingLine: comment.range.start.line,
        endingLine: comment.range.end.line,
        content: commentBody,
        codeTree: comment.treeAfter
      };
    });

    return commentInfo;
  };
};