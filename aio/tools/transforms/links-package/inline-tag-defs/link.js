var INLINE_LINK = /(\S+)(?:\s+([\s\S]+))?/;

/**
 * @dgService linkInlineTagDef
 * @description
 * Process inline link tags (of the form {@link some/uri Some Title}), replacing them with HTML anchors
 * @kind function
 * @param  {Object} url   The url to match
 * @param  {Function} docs error message
 * @return {String}  The html link information
 *
 * @property {boolean} failOnBadLink Whether to throw an error (aborting the processing) if a link is invalid.
 */
module.exports = function linkInlineTagDef(getLinkInfo, createDocMessage, log) {
  return {
    name: 'link',
    failOnBadLink: true,
    description:
        'Process inline link tags (of the form {@link some/uri Some Title}), replacing them with HTML anchors',
    handler(doc, tagName, tagDescription) {

      // Parse out the uri and title
      return tagDescription.replace(INLINE_LINK, (match, uri, title) => {

        var linkInfo = getLinkInfo(uri, title, doc);

        if (!linkInfo.valid) {
          const message = createDocMessage(`Error in {@${tagName} ${tagDescription}} - ${linkInfo.error}`, doc);
          if (this.failOnBadLink) {
            throw new Error(message);
          } else {
            log.warn(message);
          }
        }

        return '<a href=\'' + linkInfo.url + '\'>' + linkInfo.title + '</a>';
      });
    }
  };
};