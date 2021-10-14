import {ApiDoc} from 'dgeni-packages/typescript/api-doc-types/ApiDoc';
import {MemberDoc} from 'dgeni-packages/typescript/api-doc-types/MemberDoc';
import {isInheritanceCreatedDoc} from './class-inheritance';

const INTERNAL_METHODS = [
  // Lifecycle methods
  'ngOnInit',
  'ngOnChanges',
  'ngDoCheck',
  'ngAfterContentInit',
  'ngAfterContentChecked',
  'ngAfterViewInit',
  'ngAfterViewChecked',
  'ngOnDestroy',

  // ControlValueAccessor methods
  'writeValue',
  'registerOnChange',
  'registerOnTouched',
  'setDisabledState',

  // Don't ever need to document constructors
  'constructor',

  // tabIndex exists on all elements, no need to document it
  'tabIndex',
];

/** Checks whether the given API document is public. */
export function isPublicDoc(doc: ApiDoc) {
  // Always skip documents which have been created through inheritance. These docs are
  // not exported as they have not been resolved by Dgeni through a module entry-point.
  // The `@docs-public` tag is only applicable if a symbol is at least exported.
  if (isInheritanceCreatedDoc(doc)) {
    return false;
  }

  if (_isEnforcedPublicDoc(doc)) {
    return true;
  }

  if (
    _hasDocsPrivateTag(doc) ||
    doc.name.startsWith('_') ||
    doc.name.startsWith('ngAcceptInputType_')
  ) {
    return false;
  } else if (doc instanceof MemberDoc) {
    return !_isInternalMember(doc);
  }
  return true;
}

/** Gets the @docs-public tag from the given document if present. */
export function getDocsPublicTag(doc: any): {tagName: string; description: string} | undefined {
  const tags = doc.tags && doc.tags.tags;
  return tags ? tags.find((d: any) => d.tagName == 'docs-public') : undefined;
}

/** Whether the given method member is listed as an internal member. */
function _isInternalMember(memberDoc: MemberDoc) {
  return INTERNAL_METHODS.includes(memberDoc.name);
}

/** Whether the given doc has a @docs-private tag set. */
function _hasDocsPrivateTag(doc: any) {
  const tags = doc.tags && doc.tags.tags;
  return tags ? tags.find((d: any) => d.tagName == 'docs-private') : false;
}

/**
 * Whether the given doc has the @docs-public tag specified and should be enforced as
 * public document. This allows symbols which are usually private to show up in the docs.
 *
 * Additionally symbols with "@docs-public" tag can specify a public name under which the
 * document should show up in the docs. This is useful for cases where a class needs to be
 * split up into several base classes to support the MDC prototypes. e.g. "_MatMenu" should
 * show up in the docs as "MatMenu".
 */
function _isEnforcedPublicDoc(doc: any): boolean {
  return getDocsPublicTag(doc) !== undefined;
}
