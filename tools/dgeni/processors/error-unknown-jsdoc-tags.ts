import {DocCollection, Processor} from 'dgeni';
import {isApiDocWithJsdocTags} from '../common/tags';

/**
 * Processor that checks API docs for unknown JSDoc tags. Dgeni by default will
 * warn about unknown tags. This processor will throw an error instead.
 */
export class ErrorUnknownJsdocTagsProcessor implements Processor {
  name = 'error-unknown-tags';
  $runAfter = ['docs-private-filter'];
  $runBefore = ['categorizer'];

  $process(docs: DocCollection) {
    for (const doc of docs) {
      if (!isApiDocWithJsdocTags(doc)) {
        continue;
      }

      if (doc.tags.badTags.length > 0) {
        let errorMessage = `Found errors for processed JSDoc comments in ${doc.id}:\n`;

        for (const tag of doc.tags.badTags) {
          errorMessage += '\n';

          if (tag.tagDef === undefined) {
            errorMessage += `  * Tag "${tag.tagName}": Unknown tag.\n`;
          }

          for (const concreteError of tag.errors ?? []) {
            errorMessage += `  * Tag "${tag.tagName}": ${concreteError}\n`;
          }
        }

        throw new Error(errorMessage);
      }
    }
  }
}
