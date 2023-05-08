/**
 * @dgProcessor checkAioAbsoluteLinks
 * @description
 * Searches for absolute links to aio.
 * Absolute links are to be avoided because they appear as external links and won't point to the
 * currently visited version of the docs
 */
module.exports = function checkAioAbsoluteLinks(log, createDocMessage) {
  return {
    $runAfter: ['inlineTagProcessor'],
    $runBefore: ['convertToJsonProcessor'],
    $process: function (docs) {
      docs
        .filter((doc) => !doc.fileInfo?.relativePath?.endsWith('json'))
        .forEach((doc) => {
          const matches = [...doc.renderedContent.matchAll(/href="(https:\/\/angular.io\/.*?)"/g)];
          if (matches.length > 0) {
            log.warn(createDocMessage('AIO link', doc));
            matches.forEach(([, group]) => {
              log.warn(`• ${group}`);
            });
          }
        });
    },
  };
};
