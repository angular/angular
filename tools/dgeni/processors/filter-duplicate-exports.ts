import {DocCollection, Processor} from 'dgeni';
import {ExportDoc} from 'dgeni-packages/typescript/api-doc-types/ExportDoc';

/**
 * Processor to filter out Dgeni documents that are exported multiple times. This is necessary
 * to avoid that API entries are showing up multiple times in the docs.
 *
 * ```ts
 *   // Some file in @angular/cdk/scrolling
 *   export {ScrollDispatcher} from './scroll-dispatcher.ts';
 *
 *   // Other file in @angular/cdk/overlay
 *   export {ScrollDispatcher} from '@angular/cdk/scrolling';
 * ```
 *
 * This issue occurs sometimes in the Angular Material repository, if specific imports are
 * re-exported from a different secondary entry-point (e.g. ScrollDispatcher in the overlay).
 */
export class FilterDuplicateExports implements Processor {
  name = 'filter-duplicate-exports';
  $runBefore = ['filter-export-aliases'];

  $process(docs: DocCollection) {
    return docs.forEach(this.checkForDuplicateExports);
  }

  checkForDuplicateExports = (doc: ExportDoc, index: number, docs: DocCollection) => {
    if (!(doc instanceof ExportDoc)) {
      return;
    }

    // Checks for export documents that have the same name, originate from the same module, but
    // have a different Dgeni document id. Those documents can be considered as duplicates.
    const duplicateDocs = docs.filter(d => doc.name === d.name &&
        doc.originalModule === d.originalModule && doc.id !== d.id);

    if (duplicateDocs.length > 0) {
      docs.splice(index, 1);
    }
  }

}
