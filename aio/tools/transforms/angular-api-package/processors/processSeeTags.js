/**
 * @dgProcessor
 *
 * @description
 * Throws an error when @See is used with a backtick (`) reference.
 */
module.exports = function processSeeTags(createDocMessage) {
  return {
    $runAfter: ['tags-extracted'],
    $runBefore: [],
    $process(docs) {
      docs.forEach((doc) => {
        const backtick = doc.see?.find((see) => see.startsWith('`'));
        if (backtick) {
          throw new Error(createDocMessage(`@ "Use @link to create a link for ${backtick}`, doc));
        }
      });
    },
  };
};
