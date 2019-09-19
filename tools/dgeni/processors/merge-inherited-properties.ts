import {DocCollection, Processor} from 'dgeni';
import {ClassExportDoc} from 'dgeni-packages/typescript/api-doc-types/ClassExportDoc';
import {ClassLikeExportDoc} from 'dgeni-packages/typescript/api-doc-types/ClassLikeExportDoc';
import {MemberDoc} from 'dgeni-packages/typescript/api-doc-types/MemberDoc';

/**
 * Processor that merges inherited properties of a class with the class doc. This is necessary
 * to properly show public properties from TypeScript mixin interfaces in the API.
 */
export class MergeInheritedProperties implements Processor {
  name = 'merge-inherited-properties';
  $runBefore = ['categorizer'];

  $process(docs: DocCollection) {
    return docs.filter(doc => doc.docType === 'class')
        .forEach(doc => this._addInheritedProperties(doc));
  }

  /** Gets all class like export documents which the given doc inherits from. */
  private _getBaseDocuments(doc: ClassLikeExportDoc): ClassLikeExportDoc[] {
    const directBaseDocs = [
      ...doc.implementsClauses.filter(clause => clause.doc).map(d => d.doc!),
      ...doc.extendsClauses.filter(clause => clause.doc).map(d => d.doc!),
    ];

    return [
      ...directBaseDocs,
      // recursively collect base documents of direct base documents.
      ...directBaseDocs.reduce(
          (res: ClassLikeExportDoc[], d) => res.concat(this._getBaseDocuments(d)), []),
    ];
  }

  private _addInheritedProperties(doc: ClassExportDoc) {
    // Note that we need to get check all base documents. We cannot assume
    // that directive base documents already have merged inherited members.
    this._getBaseDocuments(doc).forEach(d => {
      d.members.forEach(member => this._addMemberDocIfNotPresent(doc, member));
    });
  }

  private _addMemberDocIfNotPresent(destination: ClassExportDoc, memberDoc: MemberDoc) {
    if (!destination.members.find(member => member.name === memberDoc.name)) {
      // To be able to differentiate between member docs from the heritage clause and the
      // member doc for the destination class, we clone the member doc. It's important to keep
      // the prototype and reference because later, Dgeni identifies members and properties
      // by using an instance comparison.
      const newMemberDoc = Object.assign(Object.create(memberDoc), memberDoc);
      newMemberDoc.containerDoc = destination;

      destination.members.push(newMemberDoc);
    }
  }
}
