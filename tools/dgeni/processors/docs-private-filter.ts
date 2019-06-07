import {DocCollection, Processor} from 'dgeni';
import {BaseApiDoc} from 'dgeni-packages/typescript/api-doc-types/ApiDoc';
import {ClassExportDoc} from 'dgeni-packages/typescript/api-doc-types/ClassExportDoc';
import {getDocsPublicTag, isPublicDoc} from '../common/private-docs';

/**
 * Processor to filter out symbols that should not be shown in the Material docs.
 */
export class DocsPrivateFilter implements Processor {
  name = 'docs-private-filter';
  $runBefore = ['categorizer'];

  $process(docs: DocCollection) {
    return docs.filter(doc => {
      const isPublic = isPublicDoc(doc);

      // Update the API document name in case the "@docs-public" tag is used
      // with an alias name.
      if (isPublic && doc instanceof BaseApiDoc) {
        const docsPublicTag = getDocsPublicTag(doc);
        if (docsPublicTag !== undefined && docsPublicTag.description) {
          doc.name = docsPublicTag.description;
        }
      }

      // Filter out private class members which could be annotated
      // with the "@docs-private" tag.
      if (isPublic && doc instanceof ClassExportDoc) {
        doc.members = doc.members.filter(memberDoc => isPublicDoc(memberDoc));
      }

      return isPublic;
    });
  }
}
