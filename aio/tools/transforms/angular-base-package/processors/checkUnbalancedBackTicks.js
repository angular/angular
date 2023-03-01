/**
 * @dgProcessor checkUnbalancedBackTicks
 * @description
 * Searches the rendered content for an odd number of (```) backticks,
 * which would indicate an unbalanced pair and potentially a typo in the
 * source content.
 */
module.exports = function checkUnbalancedBackTicks(log, createDocMessage) {

  const BACKTICK_REGEX = /^ *```/gm;
  const UNBALANCED_BACKTICK_WARNING = 'checkUnbalancedBackTicks processor: unbalanced backticks found in rendered content';

  return {
    $runAfter: ['inlineTagProcessor'],
    $runBefore: ['writeFilesProcessor'],
    $process: function(docs) {
      docs
      .forEach(doc => setUnbalancedBackTicks(doc));
    }
  };

  function setUnbalancedBackTicks(doc) {
    if (!doc.renderedContent) {
      return;
    }

    const matches = doc.renderedContent.match(BACKTICK_REGEX);
    if (matches && matches.length % 2 !== 0) {
      doc.unbalancedBackTicks = true;
      log.warn(createDocMessage(UNBALANCED_BACKTICK_WARNING, doc));
      log.warn(doc.renderedContent);
    }
  }
};