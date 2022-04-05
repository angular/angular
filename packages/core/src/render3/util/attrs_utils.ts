/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {CharCode} from '../../util/char_code';
import {trustedScriptFromString} from '../../util/security/trusted_types';
import {AttributeMarker, TAttributes} from '../interfaces/node';
import {CssSelector} from '../interfaces/projection';
import {isProceduralRenderer, ProceduralRenderer3, Renderer3} from '../interfaces/renderer';
import {RElement} from '../interfaces/renderer_dom';



/**
 * Assigns all attribute values to the provided element via the inferred renderer.
 *
 * This function accepts two forms of attribute entries:
 *
 * default: (key, value):
 *  attrs = [key1, value1, key2, value2]
 *
 * namespaced: (NAMESPACE_MARKER, uri, name, value)
 *  attrs = [NAMESPACE_MARKER, uri, name, value, NAMESPACE_MARKER, uri, name, value]
 *
 * The `attrs` array can contain a mix of both the default and namespaced entries.
 * The "default" values are set without a marker, but if the function comes across
 * a marker value then it will attempt to set a namespaced value. If the marker is
 * not of a namespaced value then the function will quit and return the index value
 * where it stopped during the iteration of the attrs array.
 *
 * See [AttributeMarker] to understand what the namespace marker value is.
 *
 * Note that this instruction does not support assigning style and class values to
 * an element. See `elementStart` and `elementHostAttrs` to learn how styling values
 * are applied to an element.
 * @param renderer The renderer to be used
 * @param native The element that the attributes will be assigned to
 * @param attrs The attribute array of values that will be assigned to the element
 * @returns the index value that was last accessed in the attributes array
 */
export function setUpAttributes(renderer: Renderer3, native: RElement, attrs: TAttributes): number {
  const isProc = isProceduralRenderer(renderer);

  let i = 0;
  while (i < attrs.length) {
    const value = attrs[i];
    if (typeof value === 'number') {
      // only namespaces are supported. Other value types (such as style/class
      // entries) are not supported in this function.
      if (value !== AttributeMarker.NamespaceURI) {
        break;
      }

      // we just landed on the marker value ... therefore
      // we should skip to the next entry
      i++;

      const namespaceURI = attrs[i++] as string;
      const attrName = attrs[i++] as string;
      const attrVal = attrs[i++] as string;
      ngDevMode && ngDevMode.rendererSetAttribute++;
      isProc ?
          (renderer as ProceduralRenderer3).setAttribute(native, attrName, attrVal, namespaceURI) :
          native.setAttributeNS(namespaceURI, attrName, attrVal);
    } else {
      // attrName is string;
      const attrName = value as string;
      const attrVal = attrs[++i];
      // Standard attributes
      ngDevMode && ngDevMode.rendererSetAttribute++;
      if (isAnimationProp(attrName)) {
        if (isProc) {
          (renderer as ProceduralRenderer3).setProperty(native, attrName, attrVal);
        }
      } else {
        let value = attrVal as string;
        if (isScriptSink(attrName)) {
          // To be compatible with Trusted Types, certain attributes (inline event
          // handlers in particular) must be specified as a TrustedScript.
          // Attributes passed to this function are non-bound static attributes
          // taken directly from Angular templates, and thus completely
          // application developer controlled. This makes them safe to promote to
          // a TrustedScript.
          value = trustedScriptFromString(value) as string;
        }

        isProc ? (renderer as ProceduralRenderer3).setAttribute(native, attrName, value) :
                 native.setAttribute(attrName, value);
      }
      i++;
    }
  }

  // another piece of code may iterate over the same attributes array. Therefore
  // it may be helpful to return the exact spot where the attributes array exited
  // whether by running into an unsupported marker or if all the static values were
  // iterated over.
  return i;
}

/**
 * Test whether the given value is a marker that indicates that the following
 * attribute values in a `TAttributes` array are only the names of attributes,
 * and not name-value pairs.
 * @param marker The attribute marker to test.
 * @returns true if the marker is a "name-only" marker (e.g. `Bindings`, `Template` or `I18n`).
 */
export function isNameOnlyAttributeMarker(marker: string|AttributeMarker|CssSelector) {
  return marker === AttributeMarker.Bindings || marker === AttributeMarker.Template ||
      marker === AttributeMarker.I18n;
}

export function isAnimationProp(name: string): boolean {
  // Perf note: accessing charCodeAt to check for the first character of a string is faster as
  // compared to accessing a character at index 0 (ex. name[0]). The main reason for this is that
  // charCodeAt doesn't allocate memory to return a substring.
  return name.charCodeAt(0) === CharCode.AT_SIGN;
}

/**
 * Determine if `name` refers to an attribute that is a script sink, meaning
 * that it requires a TrustedScript value or else it triggers a Trusted Types
 * violation. This includes inline event handlers (e.g. 'onload' or 'onerror').
 * @param name The attribute name to check.
 * @returns true if the attribute requires a TrustedScript value.
 */
export function isScriptSink(name: string): boolean {
  // NB: We treat all attributes that start with 'on' as requiring a
  // TrustedScript. This includes all inline event handlers, but also (possibly
  // custom) attributes that are not security sensitive (e.g. 'online' or
  // 'one'). This is fine as browsers will stringify TrustedScript when
  // setAttribute is called. We use this coarse classification both to work
  // around a Chromium bug (https://crbug.com/993268) and to minimize code size.
  // Perf note: as in the isAnimationProp function, charCodeAt is used for
  // faster comparison.
  return (name.charCodeAt(0) & CharCode.UPPER_CASE) === CharCode.O &&
      (name.charCodeAt(1) & CharCode.UPPER_CASE) === CharCode.N;
}

/**
 * Merges `src` `TAttributes` into `dst` `TAttributes` removing any duplicates in the process.
 *
 * This merge function keeps the order of attrs same.
 *
 * @param dst Location of where the merged `TAttributes` should end up.
 * @param src `TAttributes` which should be appended to `dst`
 */
export function mergeHostAttrs(dst: TAttributes|null, src: TAttributes|null): TAttributes|null {
  if (src === null || src.length === 0) {
    // do nothing
  } else if (dst === null || dst.length === 0) {
    // We have source, but dst is empty, just make a copy.
    dst = src.slice();
  } else {
    let srcMarker: AttributeMarker = AttributeMarker.ImplicitAttributes;
    for (let i = 0; i < src.length; i++) {
      const item = src[i];
      if (typeof item === 'number') {
        srcMarker = item;
      } else {
        if (srcMarker === AttributeMarker.NamespaceURI) {
          // Case where we need to consume `key1`, `key2`, `value` items.
        } else if (
            srcMarker === AttributeMarker.ImplicitAttributes ||
            srcMarker === AttributeMarker.Styles) {
          // Case where we have to consume `key1` and `value` only.
          mergeHostAttribute(dst, srcMarker, item as string, null, src[++i] as string);
        } else {
          // Case where we have to consume `key1` only.
          mergeHostAttribute(dst, srcMarker, item as string, null, null);
        }
      }
    }
  }
  return dst;
}

/**
 * Append `key`/`value` to existing `TAttributes` taking region marker and duplicates into account.
 *
 * @param dst `TAttributes` to append to.
 * @param marker Region where the `key`/`value` should be added.
 * @param key1 Key to add to `TAttributes`
 * @param key2 Key to add to `TAttributes` (in case of `AttributeMarker.NamespaceURI`)
 * @param value Value to add or to overwrite to `TAttributes` Only used if `marker` is not Class.
 */
export function mergeHostAttribute(
    dst: TAttributes, marker: AttributeMarker, key1: string, key2: string|null,
    value: string|null): void {
  let i = 0;
  // Assume that new markers will be inserted at the end.
  let markerInsertPosition = dst.length;
  // scan until correct type.
  if (marker === AttributeMarker.ImplicitAttributes) {
    markerInsertPosition = -1;
  } else {
    while (i < dst.length) {
      const dstValue = dst[i++];
      if (typeof dstValue === 'number') {
        if (dstValue === marker) {
          markerInsertPosition = -1;
          break;
        } else if (dstValue > marker) {
          // We need to save this as we want the markers to be inserted in specific order.
          markerInsertPosition = i - 1;
          break;
        }
      }
    }
  }

  // search until you find place of insertion
  while (i < dst.length) {
    const item = dst[i];
    if (typeof item === 'number') {
      // since `i` started as the index after the marker, we did not find it if we are at the next
      // marker
      break;
    } else if (item === key1) {
      // We already have same token
      if (key2 === null) {
        if (value !== null) {
          dst[i + 1] = value;
        }
        return;
      } else if (key2 === dst[i + 1]) {
        dst[i + 2] = value!;
        return;
      }
    }
    // Increment counter.
    i++;
    if (key2 !== null) i++;
    if (value !== null) i++;
  }

  // insert at location.
  if (markerInsertPosition !== -1) {
    dst.splice(markerInsertPosition, 0, marker);
    i = markerInsertPosition + 1;
  }
  dst.splice(i++, 0, key1);
  if (key2 !== null) {
    dst.splice(i++, 0, key2);
  }
  if (value !== null) {
    dst.splice(i++, 0, value);
  }
}
