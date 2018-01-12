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
      .forEach(doc => this.addInhertiedProperties(doc));
  }

  private addInhertiedProperties(doc: ClassExportDoc) {
    doc.implementsClauses.filter(clause => clause.doc).forEach(clause => {
      clause.doc!.members.forEach(member => this.addMemberDocIfNotPresent(doc, member));
    });

    doc.extendsClauses.filter(clause => clause.doc).forEach(clause => {
      clause.doc!.members.forEach(member => this.addMemberDocIfNotPresent(doc, member));
    });
  }

  private addMemberDocIfNotPresent(destination: ClassExportDoc, memberDoc: MemberDoc) {
    if (!destination.members.find(member => member.name === memberDoc.name)) {
      destination.members.push(memberDoc);
    }
  }
}
