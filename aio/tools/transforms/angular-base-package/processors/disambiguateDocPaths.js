/**
 * @dgProcessor disambiguateDocPathsProcessor
 * @description
 *
 * Ensures that docs that have the same output path, other than case changes,
 * are disambiguated.
 *
 * For example in Angular there is the `ROUTES` const and a `Routes` type.
 * In a case-sensitive file-system these would both be stored at the paths
 *
 * ```
 * aio/src/generated/router/Routes.json
 * aio/src/generated/router/ROUTES.json
 * ```
 *
 * but in a case-insensitive file-system these two paths point to the same file!
 *
 * So this processor will encode the paths into lower case that is not affected
 * by case-insensitive file-systems.
 */
module.exports = function disambiguateDocPathsProcessor() {
  return {
    $runAfter: ['paths-computed'],
    $runBefore: ['rendering-docs', 'createSitemap'],
    $process(docs) {
      for (const doc of docs) {
        if (!doc.outputPath) {
          continue;
        }
        doc.outputPath = encodeToLowercase(doc.outputPath);
      }
    }
  };
};

/**
 * To avoid collisions on case-insensitive file-systems, we encode the path to the content in
 * a deterministic case-insensitive form - converting all uppercase letters to lowercase followed
 * by an underscore.
 */
function encodeToLowercase(str) {
  return str.replace(/[A-Z_]/g, char => char.toLowerCase() + '_');
}
