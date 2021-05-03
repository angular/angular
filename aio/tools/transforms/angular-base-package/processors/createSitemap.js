module.exports = function createSitemap() {
  return {
    ignoredDocTypes: [
      'announcements-json',
      'contributors-json',
      'navigation-json',
      'resources-json',
      'events-json'
    ],
    ignoredPaths: [
      'file-not-found',
      'overview-dump',
      'test',
    ],
    $runAfter: ['paths-computed'],
    $runBefore: ['rendering-docs'],
    $process(docs) {
      docs.push({
        id: 'sitemap.xml',
        path: 'sitemap.xml',
        outputPath: '../sitemap.xml',
        template: 'sitemap.template.xml',
        urls: docs
          // Filter out docs that are not outputted
          .filter(doc => doc.outputPath)
          // Filter out unwanted docs
          .filter(doc => this.ignoredDocTypes.indexOf(doc.docType) === -1)
          .filter(doc => this.ignoredPaths.indexOf(doc.path) === -1)
          // Capture the path of each doc
          .map(doc => doc.path)
          // Convert the homepage: `index` to `/`
          .map(path => path === 'index' ? '' : path)
      });
    }
  };
};
