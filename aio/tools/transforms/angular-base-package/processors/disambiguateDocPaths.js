/**
 * @dgProcessor disambiguateDocPathsProcessor
 * @description
 *
 * Ensures that docs that have the same path, other than case changes,
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
 */
module.exports = function disambiguateDocPathsProcessor(log) {
  return {
    $runAfter: ['paths-computed'],
    $runBefore: ['rendering-docs'],
    $process(docs) {
      // Collect all the ambiguous docs, whose outputPath is are only different by casing.
      const ambiguousDocMap = new Map();
      for (const doc of docs) {
        if (!doc.outputPath) {
          continue;
        }
        const outputPath = doc.outputPath.toLowerCase();
        if (!ambiguousDocMap.has(outputPath)) {
          ambiguousDocMap.set(outputPath, []);
        }
        const ambiguousDocs = ambiguousDocMap.get(outputPath);
        ambiguousDocs.push(doc);
      }

      // Create a disambiguator doc for each set of such ambiguous docs,
      // and update the ambiguous docs to have unique `path` and `outputPath` properties.
      for (const [outputPath, ambiguousDocs] of ambiguousDocMap) {
        if (ambiguousDocs.length === 1) {
          continue;
        }

        log.debug('Docs with ambiguous outputPath:' + ambiguousDocs.map((d, i) => `\n - ${d.id}: "${d.outputPath}" replaced with "${convertPath(d.outputPath, i)}".`));

        const doc = ambiguousDocs[0];
        const path = doc.path;
        const id = `${doc.id.toLowerCase()}-disambiguator`;
        const title = `${doc.id.toLowerCase()} (disambiguation)`;
        const aliases = [id];
        docs.push({ docType: 'disambiguator', id, title, aliases, path, outputPath, docs: ambiguousDocs });

        // Update the paths
        let count = 0;
        for (const doc of ambiguousDocs) {
          doc.path = convertPath(doc.path, count);
          doc.outputPath = convertPath(doc.outputPath, count);
          count += 1;
        }
      }
    }
  };
};

function convertPath(path, count) {
  // Add the counter before any extension
  return path.replace(/(\.[^.]*)?$/, `-${count}$1`);
}
