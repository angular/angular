import {ApiDoc} from 'dgeni-packages/typescript/api-doc-types/ApiDoc';
import {ClassExportDoc} from 'dgeni-packages/typescript/api-doc-types/ClassExportDoc';
import {MemberDoc} from 'dgeni-packages/typescript/api-doc-types/MemberDoc';
import {PropertyMemberDoc} from 'dgeni-packages/typescript/api-doc-types/PropertyMemberDoc';
import {CategorizedClassDoc, DeprecationInfo, HasDecoratorsDoc} from './dgeni-definitions';
import {findJsDocTag, hasJsDocTag} from './tags';

export function isMethod(doc: MemberDoc): boolean {
  return doc.hasOwnProperty('parameters') && !doc.isGetAccessor && !doc.isSetAccessor;
}

export function isGenericTypeParameter(doc: MemberDoc): boolean {
  if (doc.containerDoc instanceof ClassExportDoc) {
    return !!doc.containerDoc.typeParams && `<${doc.name}>` === doc.containerDoc.typeParams;
  }
  return false;
}

export function isProperty(doc: MemberDoc): boolean {
  if (
    doc instanceof PropertyMemberDoc ||
    // The latest Dgeni version no longer treats getters or setters as properties.
    // From a user perspective, these are still properties and should be handled the same
    // way as normal properties.
    (!isMethod(doc) && (doc.isGetAccessor || doc.isSetAccessor))
  ) {
    return !isGenericTypeParameter(doc);
  }
  return false;
}

export function isDirective(doc: ClassExportDoc): boolean {
  return hasClassDecorator(doc, 'Component') || hasClassDecorator(doc, 'Directive');
}

export function isService(doc: ClassExportDoc): boolean {
  return hasClassDecorator(doc, 'Injectable');
}

export function isNgModule(doc: ClassExportDoc): boolean {
  return hasClassDecorator(doc, 'NgModule');
}

export function isDeprecatedDoc(doc: ApiDoc): boolean {
  return hasJsDocTag(doc, 'deprecated');
}

/** Whether the given document is annotated with the "@docs-primary-export" jsdoc tag. */
export function isPrimaryExportDoc(doc: ApiDoc): boolean {
  return hasJsDocTag(doc, 'docs-primary-export');
}

export function getDirectiveSelectors(classDoc: CategorizedClassDoc): string[] | undefined {
  if (classDoc.directiveMetadata) {
    const directiveSelectors: string = classDoc.directiveMetadata.get('selector');

    if (directiveSelectors) {
      return directiveSelectors
        .replace(/[\r\n]/g, '')
        .split(/\s*,\s*/)
        .filter(s => s !== '');
    }
  }
  return undefined;
}

export function hasMemberDecorator(doc: MemberDoc, decoratorName: string): boolean {
  return doc.docType == 'member' && hasDecorator(doc, decoratorName);
}

export function hasClassDecorator(doc: ClassExportDoc, decoratorName: string): boolean {
  return doc.docType == 'class' && hasDecorator(doc, decoratorName);
}

export function hasDecorator(doc: HasDecoratorsDoc, decoratorName: string): boolean {
  return (
    !!doc.decorators &&
    doc.decorators.length > 0 &&
    doc.decorators.some(d => d.name == decoratorName)
  );
}

export function getBreakingChange(doc: ApiDoc): string | null {
  const breakingChange = findJsDocTag(doc, 'breaking-change');
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
