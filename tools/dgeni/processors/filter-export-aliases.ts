import {DocCollection, Processor} from 'dgeni';

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
    return docs.filter(doc => {
      // If the alias symbol and the actual resolved symbol have the same name, then this doc
      // shouldn't be filtered. This check is necessary, because technically as per TypeScript,
      // explicit and individual re-exports are being considered as aliases.
      // For example: export {Test} from './my-file`;
      return !(doc.aliasSymbol && doc.aliasSymbol.name !== doc.symbol.name);
    });
  }
}
