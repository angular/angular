var path = require('canonical-path');

/**
 * @dgService getLinkInfo
 * @description
 * Get link information to a document that matches the given url
 * @kind function
 * @param  {String} url   The url to match
 * @param  {String} title An optional title to return in the link information
 * @return {Object}       The link information
 *
 * @property {boolean} relativeLinks Whether we expect the links to be relative to the originating doc
 * @property {array<function(url, title, currentDoc, ambiguousDocs) : array} disambiguators a collection of functions
 *           that attempt to resolve ambiguous links. Each disambiguator returns a new collection of docs with
 *           unwanted ambiguous docs removed (see moduleScopeLinkDisambiguator service for an example).
 */
module.exports = function getLinkInfo(getDocFromAlias, encodeCodeBlock, log) {

  getLinkInfoImpl.disambiguators = [];

  return getLinkInfoImpl;

  function getLinkInfoImpl(url, title, currentDoc) {
    var linkInfo = {url: url, type: 'url', valid: true, title: title || url};

    if (!url) {
      throw new Error('Invalid url');
    }

    var docs = getDocFromAlias(url, currentDoc);

    // Give each disambiguator a chance to reduce the number of ambiguous docs
    docs = getLinkInfoImpl.disambiguators.reduce(function(docs, disambiguator) {
      return disambiguator(url, title, currentDoc, docs);
    }, docs);

    if (!getLinkInfoImpl.useFirstAmbiguousLink && docs.length > 1) {
      linkInfo.valid = false;
      linkInfo.errorType = 'ambiguous';
      linkInfo.error = 'Ambiguous link: "' + url + '".\n' + docs.reduce(function(msg, doc) {
        return msg + '\n  "' + doc.id + '" (' + doc.docType + ') : (' + doc.path + ' / ' +
            doc.fileInfo.relativePath + ')';
      }, 'Matching docs: ');

    } else if (docs.length >= 1) {
      linkInfo.url = docs[0].path;
      linkInfo.title = title || encodeCodeBlock(docs[0].name, true);
      linkInfo.type = 'doc';

      if (getLinkInfoImpl.relativeLinks && currentDoc && currentDoc.path) {
        var currentFolder = path.dirname(currentDoc.path);
        var docFolder = path.dirname(linkInfo.url);
        var relativeFolder =
            path.relative(path.join('/', currentFolder), path.join('/', docFolder));
        linkInfo.url = path.join(relativeFolder, path.basename(linkInfo.url));
        log.debug(currentDoc.path, docs[0].path, linkInfo.url);
      }

    } else if (url.indexOf('#') > 0) {
      var pathAndHash = url.split('#');
      linkInfo = getLinkInfoImpl(pathAndHash[0], title, currentDoc);
      linkInfo.url = linkInfo.url + '#' + pathAndHash[1];
      return linkInfo;

    } else if (url.indexOf('/') === -1 && url.indexOf('#') !== 0) {
      linkInfo.valid = false;
      linkInfo.errorType = 'missing';
      linkInfo.error = 'Invalid link (does not match any doc): "' + url + '"';

    } else {
      linkInfo.title =
          title || ((url.indexOf('#') === 0) ? url.substring(1) : path.basename(url, '.html'));
    }

    return linkInfo;
  }

};
