/**
 * @dgProcessor
 *
 * @description
 * Merge the description from `@param` tags into the parameter docs
 * extracted from the TypeScript
 *
 * This is actually an override of the processor provided by the `typescript` dgeni package.
 * The original does not set the `defaultValue`.
 */
module.exports = function mergeParameterInfo() {
  return {
    $runAfter: ['readTypeScriptModules', 'tags-extracted'],
    $runBefore: ['extra-docs-added'],
    $process(docs) {
      docs.forEach((doc) => {
        if (doc.docType === 'parameter') {
          // The `params` property comes from parsing the `@param` jsdoc tags on the container doc
          const paramTag =
              doc.container.params && doc.container.params.find(param => param.name === doc.name);
          if (paramTag && paramTag.description) {
            doc.description = paramTag.description;
            if (doc.defaultValue === undefined) {
              doc.defaultValue = paramTag.defaultValue;
            }
          }
        }
      });
    },
  };
};
