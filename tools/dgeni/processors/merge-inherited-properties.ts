import {DocCollection, Processor} from 'dgeni';
import {ClassExportDoc} from 'dgeni-packages/typescript/api-doc-types/ClassExportDoc';
import {ClassLikeExportDoc} from 'dgeni-packages/typescript/api-doc-types/ClassLikeExportDoc';
import {MemberDoc} from 'dgeni-packages/typescript/api-doc-types/MemberDoc';
import ts from 'typescript';
import {getInheritedDocsOfClass} from '../common/class-inheritance';

/**
 * Factory function for the "MergeInheritedProperties" processor. Dgeni does not support
 * dependency injection for classes. The symbol docs map is provided by the TypeScript
 * dgeni package.
 */
export function mergeInheritedProperties(
  exportSymbolsToDocsMap: Map<ts.Symbol, ClassLikeExportDoc>,
) {
  return new MergeInheritedProperties(exportSymbolsToDocsMap);
}

/**
 * Processor that merges inherited properties of a class with the class doc. This is necessary
 * to properly show public properties from TypeScript mixin interfaces in the API.
 */
export class MergeInheritedProperties implements Processor {
  $runBefore = ['categorizer'];

  constructor(
    /** Shared map that can be used to resolve docs through symbols. */
    private _exportSymbolsToDocsMap: Map<ts.Symbol, ClassLikeExportDoc>,
  ) {}

  $process(docs: DocCollection) {
    return docs
      .filter(doc => doc.docType === 'class')
      .forEach(doc => this._addInheritedProperties(doc));
  }

  private _addInheritedProperties(doc: ClassExportDoc) {
    // Note that we need to get check all base documents. We cannot assume
    // that directive base documents already have merged inherited members.
    getInheritedDocsOfClass(doc, this._exportSymbolsToDocsMap).forEach(d => {
      d.members.forEach(member => {
        // only add inherited class members which are not "protected" or "private".
        if (member.accessibility === 'public') {
          this._addMemberDocIfNotPresent(doc, member);
        }
      });
    });
  }

  private _addMemberDocIfNotPresent(destination: ClassExportDoc, memberDoc: MemberDoc) {
    if (!destination.members.find(member => member.name === memberDoc.name)) {
      // To be able to differentiate between member docs from the heritage clause and the
      // member doc for the destination class, we clone the member doc. It's important to keep
      // the prototype and reference because later, Dgeni identifies members and properties
      // by using an instance comparison.
      // tslint:disable-next-line:ban Need to use Object.assign to preserve the prototype.
      const newMemberDoc = Object.assign(Object.create(memberDoc), memberDoc);

      newMemberDoc.containerDoc = destination;
      destination.members.push(newMemberDoc);
    }
  }
}
