import {DocCollection, Processor} from 'dgeni';
import {ClassExportDoc} from 'dgeni-packages/typescript/api-doc-types/ClassExportDoc';
import {MemberDoc} from 'dgeni-packages/typescript/api-doc-types/MemberDoc';

/**
 * Processor that merges inherited properties of a class with the class doc. This is necessary
 * to properly show public properties from TypeScript mixin interfaces in the API.
 */
export class MergeInheritedProperties implements Processor {
  name = 'merge-inherited-properties';
  $runBefore = ['categorizer'];

  $process(docs: DocCollection) {
    return docs
      .filter(doc => doc.docType === 'class')
      .forEach(doc => this.addInheritedProperties(doc));
  }

  private addInheritedProperties(doc: ClassExportDoc) {
    doc.implementsClauses.filter(clause => clause.doc).forEach(clause => {
      clause.doc!.members.forEach(member => this.addMemberDocIfNotPresent(doc, member));
    });

    doc.extendsClauses.filter(clause => clause.doc).forEach(clause => {
      clause.doc!.members.forEach(member => this.addMemberDocIfNotPresent(doc, member));
    });
  }

  private addMemberDocIfNotPresent(destination: ClassExportDoc, memberDoc: MemberDoc) {
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
