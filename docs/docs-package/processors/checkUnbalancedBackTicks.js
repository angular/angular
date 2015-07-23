var _ = require('lodash');

/**
 * @dgProcessor checkUnbalancedBackTicks
 * @description
 * Searches the rendered content for an odd number of (```) backticks,
 * which would indicate an unbalanced pair and potentially a typo in the
 * source content.
 */
module.exports = function checkUnbalancedBackTicks(log, createDocMessage) {

  var BACKTICK_REGEX = /^ *```/gm;

  return {
    $runAfter: ['checkAnchorLinksProcessor'],
    $process: function(docs) {
      _.forEach(docs, function(doc) {
        if ( doc.renderedContent ) {
          var matches = doc.renderedContent.match(BACKTICK_REGEX);
          if (matches && matches.length % 2 !== 0) {
            log.warn(createDocMessage('checkUnbalancedBackTicks processor: unbalanced backticks found in rendered content', doc));
            console.log(doc.renderedContent);
          }
        }
      });
    }
  };
};