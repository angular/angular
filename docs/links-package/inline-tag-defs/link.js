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
 * @property {boolean} relativeLinks Whether we expect the links to be relative to the originating doc
 */
module.exports = function linkInlineTagDef(getLinkInfo, createDocMessage, log) {
  return {
    name: 'link',
    description: 'Process inline link tags (of the form {@link some/uri Some Title}), replacing them with HTML anchors',
    handler: function(doc, tagName, tagDescription) {

      // Parse out the uri and title
      return tagDescription.replace(INLINE_LINK, function(match, uri, title) {

        var linkInfo = getLinkInfo(uri, title, doc);

        if ( !linkInfo.valid ) {
          log.warn(createDocMessage(linkInfo.error, doc));
        }

        return "<a href='" + linkInfo.url + "'>" + linkInfo.title + "</a>";
      });
    }
  };
};