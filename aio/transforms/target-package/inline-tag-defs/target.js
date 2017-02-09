/**
 * @dgService
 * @description
 * Process inline `target` block tags
 * (of the form `{@target environment1 environment2}...{@endtarget}`),
 * filtering out the blocks that do not match the active `targetEnvironments`.
 */
module.exports = function targetInlineTagDef(targetEnvironments, log, createDocMessage) {
  return {
    name: 'target',
    end: 'endtarget',
    handler: function(doc, tagName, tagDescription) {
      var targets = tagDescription && tagDescription.tag.split(' ');
      var hasTargets = targets && targets.length;

      try {
        // Return the contents of this block if any of the following is true:
        // * it has no targets
        // * there are no targets stored in the targetEnvironments service
        // * the block's targets overlap with the active targets in the targetEnvironments service
        if (!hasTargets || !targetEnvironments.hasActive() ||
            targetEnvironments.someActive(targets)) {
          return tagDescription.content;
        }
      } catch (x) {
        log.error(createDocMessage('Error processing target inline tag def - ' + x.message, doc));
      }

      // Otherwise return an empty string
      return '';
    }
  };
};