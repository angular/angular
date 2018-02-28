import {DocCollection, Processor} from 'dgeni';
import {ExportDoc} from 'dgeni-packages/typescript/api-doc-types/ExportDoc';

/**
 * Processor to filter out Dgeni documents that are exported multiple times. This is necessary
 * to avoid that API entries are showing up multiple times in the docs.
 *
 * ```ts
 *   // Some file in @angular/cdk/scrolling
 *   export {ScrollDispatcher} from './scroll-dispatcher';
 *
 *   // Other file in @angular/cdk/overlay
 *   export {ScrollDispatcher} from '@angular/cdk/scrolling';
 *
 *   // Re-export of the same export with a different name (alias).
 *   export {ScrollDispatcher as X} from './scroll-dispatcher';
 * ```
 *
 * This issue occurs sometimes in the Angular Material repository, because some imports are
 * re-exported with a different name (for deprecation), or from a different secondary entry-point.
 */
export class FilterDuplicateExports implements Processor {
  name = 'filter-duplicate-exports';
  $runBefore = ['categorizer'];

  $process(docs: DocCollection) {
    const duplicateDocs = this.findDuplicateExports(docs);
    return docs.filter(d => !duplicateDocs.has(d));
  }

  findDuplicateExports(docs: DocCollection) {
    const duplicates = new Set<ExportDoc>();

    docs.forEach(doc => {
      if (!(doc instanceof ExportDoc)) {
        return;
      }

      // Check for Dgeni documents that refer to the same TypeScript symbol. Those can be
      // considered as duplicates of the current document.
      const similarDocs = docs.filter(d => d.symbol === doc.symbol);

      if (similarDocs.length > 1) {
        // If there are multiple docs that refer to the same TypeScript symbol, but have a
        // different name than the resolved symbol, we can remove those documents, since they
        // are just aliasing an already existing export.
        similarDocs
          .filter(d => d.symbol.name !== d.name)
          .forEach(d => duplicates.add(d));

        const docsWithSameName = similarDocs
          .filter(d => d.symbol.name === d.name);

        // If there are multiple docs that refer to the same TypeScript symbol and have
        // the same name, we need to remove all of those duplicates except one.
        if (docsWithSameName.length > 1) {
          docsWithSameName.slice(1).forEach(d => duplicates.add(d));
        }
      }
    });

    return duplicates;
  }
}
