
/**
 * A processor that can run arbitrary checking rules against properties of documents

 * The configuration for the processor is via the `docTypeRules`.
 * This is a hash of docTypes to rulesets.
 * Each rules set is a hash of properties to rule functions.
 *
 * The processor will run each rule function against each matching property of each matching doc.
 *
 * An example rule might look like:
 *
 * ```
 * function noMarkdownHeadings(doc, prop, value) {
 *   const match = /^\s?#+\s+.*$/m.exec(value);
 *   if (match) {
 *     return `Headings not allowed in "${prop}" property. Found "${match[0]}"`;
 *   }
 * }
 * ```
 *
 */
module.exports = function checkContentRules(log, createDocMessage) {
  return {
    /**
     * {
     *   [docType]: {
     *     [property]: Array<(doc: Document, property: string, value: any) => string|undefined>
     *   }
     * }
     */
    docTypeRules: {},
    failOnContentErrors: false,
    $runAfter: ['tags-extracted'],
    $runBefore: [],
    $process(docs) {
      const logMessage = this.failOnContentErrors ? log.error.bind(log) : log.warn.bind(log);
      const errors = [];
      docs.forEach(doc => {
        // Ignore private exports (and members of a private export).
        if (doc.id && doc.id.indexOf('ɵ') !== -1) return;
        const docErrors = [];
        const rules = this.docTypeRules[doc.docType] || {};
        if (rules) {
          Object.keys(rules).forEach(property => {
            const ruleFns = rules[property];
            ruleFns.forEach(ruleFn => {
              const error = ruleFn(doc, property, doc[property]);
              if (error) {
                docErrors.push(error);
              }
            });
          });
        }
        if (docErrors.length) {
          errors.push({ doc, errors: docErrors });
        }
      });

      if (errors.length) {
        logMessage('Content contains errors');
        errors.forEach(docError => {
          const errors = docError.errors.join('\n        ');
          logMessage(createDocMessage(errors + '\n        ', docError.doc));
        });
        if (this.failOnContentErrors) {
          throw new Error('Stopping due to content errors.');
        }
      }
    }
  };
};
