/**
 * @dgProcessor renderLinkInfo
 * @description For each doc that has one of the specified docTypes,
 * add HTML comments that describe the links to and from the doc.
 */
module.exports = function renderLinkInfo(extractLinks) {
  return {
    docTypes: [],
    $runBefore: ['convertToJsonProcessor'],
    $runAfter: ['fixInternalDocumentLinks'],
    $process(docs) {
      const toLinks = {};
      const fromLinks = {};
      const docsToCheck = docs.filter(doc => this.docTypes.indexOf(doc.docType) !==  -1);

      // Extract and store all links found in each doc in hashes
      docsToCheck.forEach(doc => {
        const linksFromDoc = extractLinks(doc.renderedContent).hrefs;
        // Update the hashes
        fromLinks[doc.path] = linksFromDoc;
        linksFromDoc.forEach(linkPath => {
          linkPath = linkPath.match(/^[^#?]+/)[0]; // remove the query and hash from the link
          (toLinks[linkPath] = toLinks[linkPath] || []).push(doc.path);
        });
      });

      // Add HTML comments to the end of the rendered content that list the links found above
      docsToCheck.forEach(doc => {
        const linksFromDoc = getLinks(fromLinks, doc.path);
        const linksToDoc = getLinks(toLinks, doc.path);
        doc.renderedContent +=
        `\n<!-- links to this doc:${linksToDoc.map(link => `\n - ${link}`).join('')}\n-->\n` +
        `<!-- links from this doc:${linksFromDoc.map(link => `\n - ${link}`).join('')}\n-->`;
      });
    }
  };
};

function getLinks(hash, docPath) {
  const links = (hash[docPath] || []).filter(link => link !== docPath);
  const internal = {};
  const external = {};
  links.forEach(link => {
    if (/^[^:/#?]+:/.test(link)) {
      external[link] = true;
    } else {
      internal[link] = true;
    }
  });
  return Object.keys(internal).sort()
        .concat(Object.keys(external).sort());
}
