import {DocCollection, Document, Processor} from 'dgeni';
import {ClassLikeExportDoc} from 'dgeni-packages/typescript/api-doc-types/ClassLikeExportDoc';
import ts from 'typescript';
import {getInheritedDocsOfClass, isInheritanceCreatedDoc} from '../common/class-inheritance';
import {ClassExportDoc} from 'dgeni-packages/typescript/api-doc-types/ClassExportDoc';
import {ApiDoc} from 'dgeni-packages/typescript/api-doc-types/ApiDoc';

/**
 * Factory function for the "ResolvedInheritedDocs" processor. Dgeni does not support
 * dependency injection for classes. The symbol docs map is provided by the TypeScript
 * dgeni package.
 */
export function resolveInheritedDocs(exportSymbolsToDocsMap: Map<ts.Symbol, ClassLikeExportDoc>) {
  return new ResolveInheritedDocs(exportSymbolsToDocsMap);
}

/**
 * Processor that resolves inherited API docs from class API documents. The resolved
 * API documents will be added to the Dgeni document collection so that they can be
 * processed by other standard processors in the Dgeni pipeline. This is helpful as
 * API documents for inheritance are created manually if not exported, and we'd want
 * such docs to be processed by the Dgeni JSDoc processor for example.
 *
 * Note that we also want to include external API docs (e.g. from the node modules)
 * since members from those can also be merged with public-facing API docs.
 */
export class ResolveInheritedDocs implements Processor {
  $runBefore = ['docs-private-filter', 'parsing-tags'];

  constructor(
    /** Shared map that can be used to resolve docs through symbols. */
    private _exportSymbolsToDocsMap: Map<ts.Symbol, ClassLikeExportDoc>,
  ) {}

  $process(docs: DocCollection) {
    const newDocs = new Set<Document>(docs);

    docs.forEach(doc => {
      if (doc.docType !== 'class') {
        return;
      }

      getInheritedDocsOfClass(doc, this._exportSymbolsToDocsMap).forEach(apiDoc => {
        // If the API document has not been resolved through inheritance, then it is already
        // part of the Dgeni doc collection. i.e. The doc already been resolved through Dgeni
        // itself (which happens if the doc is exported through an entry-point).
        if (!isInheritanceCreatedDoc(apiDoc)) {
          return;
        }
        // Add the member docs for the inherited doc to the Dgeni doc collection.
        this._getContainingMemberDocs(apiDoc).forEach(d => newDocs.add(d));
        // Add the class-like export doc to the Dgeni doc collection.
        newDocs.add(apiDoc);
      });
    });

    return Array.from(newDocs);
  }

  /**
   * Gets the nested API documents of the given class-like API document. This
   * follows the logic as per:
   * dgeni-packages/blob/master/typescript/src/processors/readTypeScriptModules/index.ts#L110-L121
   */
  private _getContainingMemberDocs(doc: ClassLikeExportDoc): ApiDoc[] {
    const nestedDocs: ApiDoc[] = [...doc.members];

    // For classes, also add the static member docs and optional constructor doc.
    if (doc instanceof ClassExportDoc) {
      nestedDocs.push(...doc.statics);

      if (doc.constructorDoc !== undefined) {
        nestedDocs.push(doc.constructorDoc);
      }
    }

    return nestedDocs;
  }
}
