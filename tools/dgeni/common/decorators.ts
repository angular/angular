import {ApiDoc} from 'dgeni-packages/typescript/api-doc-types/ApiDoc';
import {ClassExportDoc} from 'dgeni-packages/typescript/api-doc-types/ClassExportDoc';
import {MemberDoc} from 'dgeni-packages/typescript/api-doc-types/MemberDoc';
import {PropertyMemberDoc} from 'dgeni-packages/typescript/api-doc-types/PropertyMemberDoc';
import {CategorizedClassDoc, DeprecationInfo, HasDecoratorsDoc} from './dgeni-definitions';

export function isMethod(doc: MemberDoc) {
  return doc.hasOwnProperty('parameters') && !doc.isGetAccessor && !doc.isSetAccessor;
}

export function isGenericTypeParameter(doc: MemberDoc) {
  if (doc.containerDoc instanceof ClassExportDoc) {
    return doc.containerDoc.typeParams && `<${doc.name}>` === doc.containerDoc.typeParams;
  }
  return false;
}

export function isProperty(doc: MemberDoc) {
  if (doc instanceof PropertyMemberDoc ||
      // The latest Dgeni version no longer treats getters or setters as properties.
      // From a user perspective, these are still properties and should be handled the same
      // way as normal properties.
      (!isMethod(doc) && (doc.isGetAccessor || doc.isSetAccessor))) {
    return !isGenericTypeParameter(doc);
  }
  return false;
}

export function isDirective(doc: ClassExportDoc) {
  return hasClassDecorator(doc, 'Component') || hasClassDecorator(doc, 'Directive');
}

export function isService(doc: ClassExportDoc) {
  return hasClassDecorator(doc, 'Injectable');
}

export function isNgModule(doc: ClassExportDoc) {
  return hasClassDecorator(doc, 'NgModule');
}

export function isDeprecatedDoc(doc: any) {
  return (doc.tags && doc.tags.tags || []).some((tag: any) => tag.tagName === 'deprecated');
}

export function getDirectiveSelectors(classDoc: CategorizedClassDoc) {
  if (!classDoc.directiveMetadata) {
    return;
  }

  const directiveSelectors: string = classDoc.directiveMetadata.get('selector');

  if (directiveSelectors) {
    return directiveSelectors.replace(/[\r\n]/g, '').split(/\s*,\s*/).filter(s => s !== '');
  }
}

export function hasMemberDecorator(doc: MemberDoc, decoratorName: string) {
  return doc.docType == 'member' && hasDecorator(doc, decoratorName);
}

export function hasClassDecorator(doc: ClassExportDoc, decoratorName: string) {
  return doc.docType == 'class' && hasDecorator(doc, decoratorName);
}

export function hasDecorator(doc: HasDecoratorsDoc, decoratorName: string) {
  return !!doc.decorators &&
    doc.decorators.length > 0 &&
    doc.decorators.some(d => d.name == decoratorName);
}

export function getBreakingChange(doc: any): string | null {
  if (!doc.tags) {
    return null;
  }

  const breakingChange = doc.tags.tags.find((t: any) => t.tagName === 'breaking-change');
  return breakingChange ? breakingChange.description : null;
}

/**
 * Decorates public exposed docs. Creates a property on the doc that indicates whether
 * the item is deprecated or not.
 */
export function decorateDeprecatedDoc(doc: ApiDoc & DeprecationInfo) {
  doc.isDeprecated = isDeprecatedDoc(doc);
  doc.breakingChange = getBreakingChange(doc);

  if (doc.isDeprecated && !doc.breakingChange) {
    console.warn('Warning: There is a deprecated item without a @breaking-change tag.', doc.id);
  }
}
