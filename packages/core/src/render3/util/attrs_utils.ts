/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AttributeMarker, TAttributes} from '../interfaces/node';
import {CssSelector} from '../interfaces/projection';
import {ProceduralRenderer3, RElement, isProceduralRenderer} from '../interfaces/renderer';
import {RENDERER} from '../interfaces/view';
import {getLView} from '../state';


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
 *
 * @param native The element that the attributes will be assigned to
 * @param attrs The attribute array of values that will be assigned to the element
 * @returns the index value that was last accessed in the attributes array
 */
export function setUpAttributes(native: RElement, attrs: TAttributes): number {
  const renderer = getLView()[RENDERER];
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
        isProc ?
            (renderer as ProceduralRenderer3)
                .setAttribute(native, attrName as string, attrVal as string) :
            native.setAttribute(attrName as string, attrVal as string);
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


export function attrsStylingIndexOf(attrs: TAttributes, startIndex: number): number {
  for (let i = startIndex; i < attrs.length; i++) {
    const val = attrs[i];
    if (val === AttributeMarker.Classes || val === AttributeMarker.Styles) {
      return i;
    }
  }
  return -1;
}

/**
 * Test whether the given value is a marker that indicates that the following
 * attribute values in a `TAttributes` array are only the names of attributes,
 * and not name-value pairs.
 * @param marker The attribute marker to test.
 * @returns true if the marker is a "name-only" marker (e.g. `Bindings`, `Template` or `I18n`).
 */
export function isNameOnlyAttributeMarker(marker: string | AttributeMarker | CssSelector) {
  return marker === AttributeMarker.Bindings || marker === AttributeMarker.Template ||
      marker === AttributeMarker.I18n;
}

export const ANIMATION_PROP_PREFIX = '@';

export function isAnimationProp(name: string): boolean {
  return name[0] === ANIMATION_PROP_PREFIX;
}
