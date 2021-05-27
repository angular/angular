import {DocCollection, Processor} from 'dgeni';
import {BaseApiDoc} from 'dgeni-packages/typescript/api-doc-types/ApiDoc';
import {ClassExportDoc} from 'dgeni-packages/typescript/api-doc-types/ClassExportDoc';
import {InterfaceExportDoc} from 'dgeni-packages/typescript/api-doc-types/InterfaceExportDoc';
import {getDocsPublicTag, isPublicDoc} from '../common/private-docs';

/**
 * Processor to filter out symbols that should not be shown in the Material docs.
 */
export class DocsPrivateFilter implements Processor {
  name = 'docs-private-filter';
  $runBefore = ['categorizer'];
  $runAfter = ['mergeInheritedProperties'];

  $process(docs: DocCollection) {
    const publicDocs = docs.filter(isPublicDoc);

    publicDocs.forEach(doc => {
      // Update the API document name in case the "@docs-public" tag is used
      // with an alias name.
      if (doc instanceof BaseApiDoc) {
        const docsPublicTag = getDocsPublicTag(doc);
        if (docsPublicTag !== undefined && docsPublicTag.description) {
          doc.name = docsPublicTag.description;
        }
      }

      if (doc instanceof InterfaceExportDoc) {
        doc.members = doc.members.filter(isPublicDoc);
      }

      // Filter out private class members which could be annotated
      // with the "@docs-private" tag.
      if (doc instanceof ClassExportDoc) {
        doc.members = doc.members.filter(isPublicDoc);
        doc.statics = doc.statics.filter(isPublicDoc);
      }
    });

    return publicDocs;
  }
}
