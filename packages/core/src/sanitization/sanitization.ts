/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {XSS_SECURITY_URL} from '../error_details_base_url';
import {RuntimeError, RuntimeErrorCode} from '../errors';
import {getTemplateLocationDetails} from '../render3/instructions/element_validation';
import {getDocument} from '../render3/interfaces/document';
import {TNode, TNodeName, TNodeType} from '../render3/interfaces/node';
import {RElement} from '../render3/interfaces/renderer_dom';
import {ENVIRONMENT} from '../render3/interfaces/view';
import {getLView, getSelectedIndex, getSelectedTNode} from '../render3/state';
import {renderStringify} from '../render3/util/stringify_utils';
import {getNativeByTNode} from '../render3/util/view_utils';
import {NAMESPACE_URIS} from '../render3/namespaces';
import {TrustedHTML, TrustedScript, TrustedScriptURL} from '../util/security/trusted_type_defs';
import {trustedHTMLFromString, trustedScriptURLFromString} from '../util/security/trusted_types';
import {
  trustedHTMLFromStringBypass,
  trustedScriptFromStringBypass,
  trustedScriptURLFromStringBypass,
} from '../util/security/trusted_types_bypass';

import {allowSanitizationBypassAndThrow, BypassType, unwrapSafeValue} from './bypass';
import {_sanitizeHtml} from './html_sanitizer';
import {enforceIframeSecurity} from './iframe_attrs_validation';
import {Sanitizer} from './sanitizer';
import {checkSecurityContext, SecurityContext, SVG_NAMESPACE} from './dom_security_schema';
import {_sanitizeUrl} from './url_sanitizer';
import {splitNsName} from '../render3/util/tags';

/**
 * An `html` sanitizer which converts untrusted `html` **string** into trusted string by removing
 * dangerous content.
 *
 * This method parses the `html` and locates potentially dangerous content (such as urls and
 * javascript) and removes it.
 *
 * It is possible to mark a string as trusted by calling {@link bypassSanitizationTrustHtml}.
 *
 * @param unsafeHtml untrusted `html`, typically from the user.
 * @returns `html` string which is safe to display to user, because all of the dangerous javascript
 * and urls have been removed.
 *
 * @codeGenApi
 */
export function ɵɵsanitizeHtml(
  unsafeHtml: any,
  tagName?: string,
  propName?: string,
): TrustedHTML | string {
  if (
    tagName !== undefined &&
    propName !== undefined &&
    getSecurityContext(tagName, propName) !== SecurityContext.HTML
  ) {
    return unsafeHtml;
  }

  const sanitizer = getSanitizer();
  if (sanitizer) {
    return trustedHTMLFromStringBypass(sanitizer.sanitize(SecurityContext.HTML, unsafeHtml) || '');
  }
  if (allowSanitizationBypassAndThrow(unsafeHtml, BypassType.Html)) {
    return trustedHTMLFromStringBypass(unwrapSafeValue(unsafeHtml));
  }
  return _sanitizeHtml(getDocument(), renderStringify(unsafeHtml));
}

/**
 * A `style` sanitizer which converts untrusted `style` **string** into trusted string by removing
 * dangerous content.
 *
 * It is possible to mark a string as trusted by calling {@link bypassSanitizationTrustStyle}.
 *
 * @param unsafeStyle untrusted `style`, typically from the user.
 * @returns `style` string which is safe to bind to the `style` properties.
 *
 * @codeGenApi
 */
export function ɵɵsanitizeStyle(unsafeStyle: any): string {
  const sanitizer = getSanitizer();
  if (sanitizer) {
    return sanitizer.sanitize(SecurityContext.STYLE, unsafeStyle) || '';
  }
  if (allowSanitizationBypassAndThrow(unsafeStyle, BypassType.Style)) {
    return unwrapSafeValue(unsafeStyle);
  }
  return renderStringify(unsafeStyle);
}

/**
 * A `url` sanitizer which converts untrusted `url` **string** into trusted string by removing
 * dangerous
 * content.
 *
 * This method parses the `url` and locates potentially dangerous content (such as javascript) and
 * removes it.
 *
 * It is possible to mark a string as trusted by calling {@link bypassSanitizationTrustUrl}.
 *
 * @param unsafeUrl untrusted `url`, typically from the user.
 * @returns `url` string which is safe to bind to the `src` properties such as `<img src>`, because
 * all of the dangerous javascript has been removed.
 *
 * @codeGenApi
 */
export function ɵɵsanitizeUrl(unsafeUrl: any): string {
  const sanitizer = getSanitizer();
  if (sanitizer) {
    return sanitizer.sanitize(SecurityContext.URL, unsafeUrl) || '';
  }
  if (allowSanitizationBypassAndThrow(unsafeUrl, BypassType.Url)) {
    return unwrapSafeValue(unsafeUrl);
  }
  return _sanitizeUrl(renderStringify(unsafeUrl));
}

/**
 * A `url` sanitizer which only lets trusted `url`s through.
 *
 * This passes only `url`s marked trusted by calling {@link bypassSanitizationTrustResourceUrl}.
 *
 * @param unsafeResourceUrl untrusted `url`, typically from the user.
 * @returns `url` string which is safe to bind to the `src` properties such as `<img src>`, because
 * only trusted `url`s have been allowed to pass.
 *
 * @codeGenApi
 */
export function ɵɵsanitizeResourceUrl(unsafeResourceUrl: any): TrustedScriptURL | string {
  const sanitizer = getSanitizer();
  if (sanitizer) {
    return trustedScriptURLFromStringBypass(
      sanitizer.sanitize(SecurityContext.RESOURCE_URL, unsafeResourceUrl) || '',
    );
  }
  if (allowSanitizationBypassAndThrow(unsafeResourceUrl, BypassType.ResourceUrl)) {
    return trustedScriptURLFromStringBypass(unwrapSafeValue(unsafeResourceUrl));
  }
  throw new RuntimeError(
    RuntimeErrorCode.UNSAFE_VALUE_IN_RESOURCE_URL,
    ngDevMode && `unsafe value used in a resource URL context (see ${XSS_SECURITY_URL})`,
  );
}

/**
 * A `script` sanitizer which only lets trusted javascript through.
 *
 * This passes only `script`s marked trusted by calling {@link
 * bypassSanitizationTrustScript}.
 *
 * @param unsafeScript untrusted `script`, typically from the user.
 * @returns `url` string which is safe to bind to the `<script>` element such as `<img src>`,
 * because only trusted `scripts` have been allowed to pass.
 *
 * @codeGenApi
 */
export function ɵɵsanitizeScript(unsafeScript: any): TrustedScript | string {
  const sanitizer = getSanitizer();
  if (sanitizer) {
    return trustedScriptFromStringBypass(
      sanitizer.sanitize(SecurityContext.SCRIPT, unsafeScript) || '',
    );
  }
  if (allowSanitizationBypassAndThrow(unsafeScript, BypassType.Script)) {
    return trustedScriptFromStringBypass(unwrapSafeValue(unsafeScript));
  }
  throw new RuntimeError(
    RuntimeErrorCode.UNSAFE_VALUE_IN_SCRIPT,
    ngDevMode && 'unsafe value used in a script context',
  );
}

/**
 * A template tag function for promoting the associated constant literal to a
 * TrustedHTML. Interpolation is explicitly not allowed.
 *
 * @param html constant template literal containing trusted HTML.
 * @returns TrustedHTML wrapping `html`.
 *
 * @security This is a security-sensitive function and should only be used to
 * convert constant values of attributes and properties found in
 * application-provided Angular templates to TrustedHTML.
 *
 * @codeGenApi
 */
export function ɵɵtrustConstantHtml(html: TemplateStringsArray): TrustedHTML | string {
  // The following runtime check ensures that the function was called as a
  // template tag (e.g. ɵɵtrustConstantHtml`content`), without any interpolation
  // (e.g. not ɵɵtrustConstantHtml`content ${variable}`). A TemplateStringsArray
  // is an array with a `raw` property that is also an array. The associated
  // template literal has no interpolation if and only if the length of the
  // TemplateStringsArray is 1.
  if (ngDevMode && (!Array.isArray(html) || !Array.isArray(html.raw) || html.length !== 1)) {
    throw new Error(`Unexpected interpolation in trusted HTML constant: ${html.join('?')}`);
  }
  return trustedHTMLFromString(html[0]);
}

/**
 * A template tag function for promoting the associated constant literal to a
 * TrustedScriptURL. Interpolation is explicitly not allowed.
 *
 * @param url constant template literal containing a trusted script URL.
 * @returns TrustedScriptURL wrapping `url`.
 *
 * @security This is a security-sensitive function and should only be used to
 * convert constant values of attributes and properties found in
 * application-provided Angular templates to TrustedScriptURL.
 *
 * @codeGenApi
 */
export function ɵɵtrustConstantResourceUrl(url: TemplateStringsArray): TrustedScriptURL | string {
  // The following runtime check ensures that the function was called as a
  // template tag (e.g. ɵɵtrustConstantResourceUrl`content`), without any
  // interpolation (e.g. not ɵɵtrustConstantResourceUrl`content ${variable}`). A
  // TemplateStringsArray is an array with a `raw` property that is also an
  // array. The associated template literal has no interpolation if and only if
  // the length of the TemplateStringsArray is 1.
  if (ngDevMode && (!Array.isArray(url) || !Array.isArray(url.raw) || url.length !== 1)) {
    throw new Error(`Unexpected interpolation in trusted URL constant: ${url.join('?')}`);
  }
  return trustedScriptURLFromString(url[0]);
}

/**
 * Detects which sanitizer to use for URL property, based on tag name and prop name.
 *
 * The rules are based on the URL and RESOURCE_URL context config from
 * `packages/compiler/src/schema/dom_security_schema.ts`.
 * If tag and prop names don't match URL or Resource URL schema, no sanitizer is required.
 */
export function getUrlSanitizer(tag: string, prop: string) {
  switch (getSecurityContext(tag, prop)) {
    case SecurityContext.RESOURCE_URL:
      return ɵɵsanitizeResourceUrl;
    case SecurityContext.URL:
      return ɵɵsanitizeUrl;
    default:
      return null;
  }
}

/**
 * Sanitizes URL, selecting sanitizer function based on tag and property names.
 *
 * This function is used in case we can't define security context at compile time, when only prop
 * name is available. This happens when we generate host bindings for Directives/Components. The
 * host element is unknown at compile time, so we defer calculation of specific sanitizer to
 * runtime.
 *
 * @param unsafeUrl untrusted `url`, typically from the user.
 * @param tag target element tag name.
 * @param prop name of the property that contains the value.
 * @returns `url` string which is safe to bind.
 *
 * @codeGenApi
 */
export function ɵɵsanitizeUrlOrResourceUrl(unsafeUrl: any, tag: string, prop: string) {
  return getUrlSanitizer(tag, prop)?.(unsafeUrl) ?? unsafeUrl;
}

export function validateAgainstEventProperties(name: string) {
  if (name.toLowerCase().startsWith('on')) {
    const errorMessage =
      `Binding to event property '${name}' is disallowed for security reasons, ` +
      `please use (${name.slice(2)})=...` +
      `\nIf '${name}' is a directive input, make sure the directive is imported by the` +
      ` current module.`;
    throw new RuntimeError(RuntimeErrorCode.INVALID_EVENT_BINDING, errorMessage);
  }
}

function getSanitizer(): Sanitizer | null {
  const lView = getLView();
  return lView && lView[ENVIRONMENT].sanitizer;
}

function getSecurityContext(tagName: string, propName: string): SecurityContext {
  const [namespace, resolvedTagName] = resolveElement(tagName);
  return checkSecurityContext(resolvedTagName, propName, namespace);
}

function resolveElement(tagName: string): [namespace: string | null | undefined, tagName: string] {
  tagName = tagName.toLowerCase();
  const splitResult = splitNsName(tagName, false);
  if (splitResult[0]) {
    return splitResult;
  }

  const index = getSelectedIndex();
  const tNode = index === -1 ? null : getSelectedTNode();
  let namespace = tNode?.namespace;

  if (tagName === TNodeName.DynamicHost && tNode?.type === TNodeType.Element) {
    const element = getNativeByTNode(tNode, getLView()) as RElement;
    if (element.tagName) {
      tagName = element.tagName.toLowerCase();
    }

    if (namespace == null) {
      const namespaceURI = (element as RElement & {namespaceURI?: string | null}).namespaceURI;
      namespace = namespaceURI && NAMESPACE_URIS[namespaceURI];
    }
  }

  return [namespace, tagName];
}

/**
 * Set of attributes that are sensitive and should be sanitized.
 */
const SECURITY_SENSITIVE_ATTRIBUTE_NAMES: ReadonlySet<string> = new Set(['href', 'xlink:href']);

/**
 * @remarks Keep this in sync with DOM Security Schema.
 * @see [SECURITY_SCHEMA](../../../compiler/src/schema/dom_security_schema.ts)
 */
const SVG_ANIMATION_SENSITIVE_STATIC_VALUES: Record<
  string,
  Record<string, ReadonlySet<string>> | undefined
> = {
  'animate': {
    'to': SECURITY_SENSITIVE_ATTRIBUTE_NAMES,
    'values': SECURITY_SENSITIVE_ATTRIBUTE_NAMES,
    'from': SECURITY_SENSITIVE_ATTRIBUTE_NAMES,
  },
  'set': {'to': SECURITY_SENSITIVE_ATTRIBUTE_NAMES},
};

/**
 * Validates that the attribute binding is safe to use.
 *
 * @param value The value of the attribute.
 * @param tagName The name of the tag.
 * @param attributeName The name of the attribute.
 */
export function ɵɵvalidateAttribute<T = any>(value: T, tagName: string, attributeName: string): T {
  const index = getSelectedIndex();
  const tNode: TNode | null = index === -1 ? null : getSelectedTNode();
  if (tNode && tNode.type !== TNodeType.Element) {
    return value;
  }

  const [namespace, resolvedTagName] = resolveElement(tagName);
  const securityContext = checkSecurityContext(resolvedTagName, attributeName, namespace);

  if (securityContext !== SecurityContext.ATTRIBUTE_NO_BINDING) {
    return value;
  }

  const lView = getLView();
  if (tNode) {
    if (resolvedTagName === 'iframe') {
      const element = getNativeByTNode(tNode, lView) as RElement;
      enforceIframeSecurity(element as HTMLIFrameElement);
    } else if (namespace === SVG_NAMESPACE) {
      const config =
        SVG_ANIMATION_SENSITIVE_STATIC_VALUES[resolvedTagName]?.[attributeName.toLowerCase()];
      if (config) {
        const element = getNativeByTNode(tNode, lView) as SVGAnimateElement;
        const attributeNameValue = getSecuritySensitiveSVGAnimationAttributeName(element, config);

        if (attributeNameValue) {
          const errorMessage =
            ngDevMode &&
            `Angular has detected that the \`${attributeName}\` was applied ` +
              `as a binding to the <${resolvedTagName}> element${getTemplateLocationDetails(lView)}. ` +
              `For security reasons, the \`${attributeName}\` can be set on the <${resolvedTagName}> element ` +
              `as a static attribute only when the "attributeName" is set to \'${attributeNameValue}\'. \n` +
              `To fix this, switch the \`${attributeNameValue}\` binding to a static attribute ` +
              `in a template or in host bindings section.`;

          throw new RuntimeError(RuntimeErrorCode.UNSAFE_ATTRIBUTE_BINDING, errorMessage);
        }

        return value;
      }
    }
  }

  const errorMessage =
    ngDevMode &&
    `Angular has detected that the \`${attributeName}\` was applied ` +
      `as a binding to the <${resolvedTagName}> element${tNode ? getTemplateLocationDetails(lView) : ''}. ` +
      `For security reasons, the \`${attributeName}\` can be set on the <${resolvedTagName}> element ` +
      `as a static attribute only. \n` +
      `To fix this, switch the \`${attributeName}\` binding to a static attribute ` +
      `in a template or in host bindings section.`;

  throw new RuntimeError(RuntimeErrorCode.UNSAFE_ATTRIBUTE_BINDING, errorMessage);
}

function getSecuritySensitiveSVGAnimationAttributeName(
  element: SVGAnimateElement,
  validationConfig: ReadonlySet<string>,
): string | null {
  for (const attributeName of element.getAttributeNames()) {
    if (attributeName.toLowerCase() !== 'attributename') {
      continue;
    }

    const attributeNameValue = element.getAttribute(attributeName);
    if (attributeNameValue !== null && validationConfig.has(attributeNameValue.toLowerCase())) {
      return attributeNameValue;
    }
  }

  return null;
}
