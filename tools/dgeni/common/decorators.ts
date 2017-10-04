/**
 * We want to avoid emitting selectors that are deprecated but don't have a way to mark
 * them as such in the source code. Thus, we maintain a separate blacklist of selectors
 * that should not be emitted in the documentation.
 */
import {ClassExportDoc} from 'dgeni-packages/typescript/api-doc-types/ClassExportDoc';
import {PropertyMemberDoc} from 'dgeni-packages/typescript/api-doc-types/PropertyMemberDoc';
import {MemberDoc} from 'dgeni-packages/typescript/api-doc-types/MemberDoc';

const SELECTOR_BLACKLIST = new Set([
  '[portal]',
  '[portalHost]',
  'textarea[mat-autosize]',
  '[overlay-origin]',
  '[connected-overlay]',
]);

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

export function isDirectiveOutput(doc: PropertyMemberDoc) {
  return hasMemberDecorator(doc, 'Output');
}

export function isDirectiveInput(doc: PropertyMemberDoc) {
  return hasMemberDecorator(doc, 'Input');
}

export function isDeprecatedDoc(doc: any) {
  return (doc.tags && doc.tags.tags || []).some((tag: any) => tag.tagName === 'deprecated');
}

export function getDirectiveInputAlias(doc: PropertyMemberDoc) {
  return isDirectiveInput(doc) ? doc.decorators!.find(d => d.name == 'Input')!.arguments![0] : '';
}

export function getDirectiveOutputAlias(doc: PropertyMemberDoc) {
  return isDirectiveOutput(doc) ? doc.decorators!.find(d => d.name == 'Output')!.arguments![0] : '';
}

export function getDirectiveSelectors(classDoc: ClassExportDoc) {
  const directiveSelectors = getMetadataProperty(classDoc, 'selector');

  if (directiveSelectors) {
    // Filter blacklisted selectors and remove line-breaks in resolved selectors.
    return directiveSelectors.replace(/[\r\n]/g, '').split(/\s*,\s*/)
      .filter(s => s !== '' && !s.includes('md') && !SELECTOR_BLACKLIST.has(s));
  }
}

export function getMetadataProperty(doc: ClassExportDoc, property: string) {
  const metadata = doc.decorators!
    .find(d => d.name === 'Component' || d.name === 'Directive')!.arguments![0];

  // Use a Regex to determine the given metadata property. This is necessary, because we can't
  // parse the JSON due to environment variables inside of the JSON (e.g module.id)
  const matches = new RegExp(`${property}s*:\\s*(?:"|'|\`)((?:.|\\n|\\r)+?)(?:"|'|\`)`)
    .exec(metadata);

  return matches && matches[1].trim();
}

export function hasMemberDecorator(doc: MemberDoc, decoratorName: string) {
  return doc.docType == 'member' && hasDecorator(doc, decoratorName);
}

export function hasClassDecorator(doc: ClassExportDoc, decoratorName: string) {
  return doc.docType == 'class' && hasDecorator(doc, decoratorName);
}

export function hasDecorator(doc: {decorators?: {name: string}[]}, decoratorName: string) {
  return !!doc.decorators &&
    doc.decorators.length > 0 &&
    doc.decorators.some(d => d.name == decoratorName);
}

/**
 * Decorates public exposed docs. Creates a property on the doc that indicates whether
 * the item is deprecated or not.
 **/
export function decorateDeprecatedDoc(doc: {isDeprecated: boolean}) {
  doc.isDeprecated = isDeprecatedDoc(doc);
}
