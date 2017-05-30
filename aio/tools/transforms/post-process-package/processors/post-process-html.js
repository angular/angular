const rehype = require('rehype');

/**
 * @dgProcessor postProcessHtml
 *
 * @description
 * Use the rehype processing engine to manipulate the
 * `renderedContent` HTML via rehype "plugins" that work with HTML ASTs (HASTs).
 * See https://github.com/wooorm/rehype
 *
 * Each plugin is a factory function that will be called with the "rehype" engine as `this`.
 * The factory should return a "transform" function that takes a HAST and returns a `boolean` or `undefined`.
 * The HAST can be mutated by the "transform" function.
 * If `false` is returned then the processing stops with that plugin.
 *
 * @property docTypes {string[]} the `docTypes` of docs that should be post-processed
 * @property plugins {Function[]} the rehype plugins that will modify the HAST.
 *
 */
module.exports = function postProcessHtml(log, createDocMessage) {
  return {
    $runAfter: ['docs-rendered'],
    $runBefore: ['writing-files'],
    docTypes: [],
    plugins: [],
    $process(docs) {
      const engine = rehype()
            .data('settings', { fragment: true });
      this.plugins.forEach(plugin => engine.use(plugin));

      let vFile;

      docs
        .filter(doc => this.docTypes.indexOf(doc.docType) !== -1)
        .forEach(doc => {
          try {
            vFile = engine.processSync(doc.renderedContent);
            doc.renderedContent = vFile.contents;
            vFile.messages.forEach(m => {
              log.warn(createDocMessage(m.message, doc));
            });
            doc.vFile = vFile;
          } catch(e) {
            throw new Error(createDocMessage(e.message, doc));
          }
        });
    }
  };
};
