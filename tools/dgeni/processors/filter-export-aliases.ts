import {DocCollection, Processor} from 'dgeni';
import {ExportDoc} from 'dgeni-packages/typescript/api-doc-types/ExportDoc';
import {ModuleDoc} from 'dgeni-packages/typescript/api-doc-types/ModuleDoc';

/**
 * Processor to filter out Dgeni documents that are export aliases. Keeping them means
 * that a given document shows up multiple times in the docs.
 *
 * ```ts
 *   export {ObserveContent} from './X';
 *   export {ObserveContent as CdkObserveContent} from './X';
 * ```
 *
 * This is a common pattern inside of Angular Material, but causes Dgeni to generate
 * documents for both exports. The second document is identical to the original document and
 * doesn't even show the aliased name.
 *
 * See: https://github.com/angular/dgeni-packages/issues/248
 */
export class FilterExportAliases implements Processor {
  name = 'filter-export-aliases';
  $runBefore = ['categorizer'];

  $process(docs: DocCollection) {
    return docs.filter(doc => this.filterAliasExport(doc));
  }

  private filterAliasExport(doc: ExportDoc) {
    if (!doc.moduleDoc) {
      return true;
    }

    const moduleDoc = doc.moduleDoc as ModuleDoc;
    const duplicateDocs = moduleDoc.exports.filter(exportDoc => exportDoc.id === doc.id);

    // Remove the current export document if there are multiple Dgeni export documents with the
    // same document id. If there are multiple docs with the same id, we can assume that this doc
    // is an alias export.
    if (duplicateDocs && duplicateDocs.length > 1) {
      moduleDoc.exports.splice(
        moduleDoc.exports.findIndex(exportDoc => exportDoc.id === doc.id), 1);
      return false;
    }

    return true;
  }

}
