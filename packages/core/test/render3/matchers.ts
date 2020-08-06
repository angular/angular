/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TI18n} from '@angular/core/src/render3/interfaces/i18n';
import {TNode} from '@angular/core/src/render3/interfaces/node';
import {TView} from '@angular/core/src/render3/interfaces/view';

import {isDOMElement, isDOMText, isTI18n, isTNode, isTView} from './is_shape_of';


/**
 * Generic matcher which asserts that an object is of a given shape (`shapePredicate`) and that it
 * contains a subset of properties.
 *
 * @param name Name of `shapePredicate` to display when assertion fails.
 * @param shapePredicate Predicate which verifies that the object is of correct shape.
 * @param expected Expected set of properties to be found on the object.
 */
export function matchObjectShape<T>(
    name: string, shapePredicate: (obj: any) => obj is T,
    expected: Partial<T> = {}): jasmine.AsymmetricMatcher<T> {
  const matcher = function() {};
  let _actual: any = null;

  matcher.asymmetricMatch = function(actual: any) {
    _actual = actual;
    if (!shapePredicate(actual)) return false;
    for (const key in expected) {
      if (expected.hasOwnProperty(key) && !jasmine.matchersUtil.equals(actual[key], expected[key]))
        return false;
    }
    return true;
  };
  matcher.jasmineToString = function() {
    return `${toString(_actual, false)} != ${toString(expected, true)})`;
  };

  function toString(obj: any, isExpected: boolean) {
    if (isExpected || shapePredicate(obj)) {
      const props =
          Object.keys(expected).map(key => `${key}: ${JSON.stringify((obj as any)[key])}`);
      if (isExpected === false) {
        // Push something to let the user know that there may be other ignored properties in actual
        props.push('...');
      }
      return `${name}({${props.length === 0 ? '' : '\n  ' + props.join(',\n  ') + '\n'}})`;
    } else {
      return JSON.stringify(obj);
    }
  }
  return matcher;
}


/**
 * Asymmetric matcher which matches a `TView` of a given shape.
 *
 * Expected usage:
 * ```
 * expect(tNode).toEqual(matchTView({type: TViewType.Root}));
 * expect({
 *   node: tNode
 * }).toEqual({
 *   node: matchTNode({type: TViewType.Root})
 * });
 * ```
 *
 * @param expected optional properties which the `TView` must contain.
 */
export function matchTView(expected?: Partial<TView>): jasmine.AsymmetricMatcher<TView> {
  return matchObjectShape('TView', isTView, expected);
}

/**
 * Asymmetric matcher which matches a `TNode` of a given shape.
 *
 * Expected usage:
 * ```
 * expect(tNode).toEqual(matchTNode({type: TNodeType.Element}));
 * expect({
 *   node: tNode
 * }).toEqual({
 *   node: matchTNode({type: TNodeType.Element})
 * });
 * ```
 *
 * @param expected optional properties which the `TNode` must contain.
 */
export function matchTNode(expected?: Partial<TNode>): jasmine.AsymmetricMatcher<TNode> {
  return matchObjectShape('TNode', isTNode, expected);
}


/**
 * Asymmetric matcher which matches a `T18n` of a given shape.
 *
 * Expected usage:
 * ```
 * expect(tNode).toEqual(matchT18n({vars: 0}));
 * expect({
 *   node: tNode
 * }).toEqual({
 *   node: matchT18n({vars: 0})
 * });
 * ```
 *
 * @param expected optional properties which the `TI18n` must contain.
 */
export function matchTI18n(expected?: Partial<TI18n>): jasmine.AsymmetricMatcher<TI18n> {
  return matchObjectShape('TI18n', isTI18n, expected);
}



/**
 * Asymmetric matcher which matches a DOM Element.
 *
 * Expected usage:
 * ```
 * expect(div).toEqual(matchT18n('div', {id: '123'}));
 * expect({
 *   node: div
 * }).toEqual({
 *   node: matchT18n('div', {id: '123'})
 * });
 * ```
 *
 * @param expectedTagName optional DOM tag name.
 * @param expectedAttributes optional DOM element properties.
 */
export function matchDomElement(
    expectedTagName: string|undefined = undefined,
    expectedAttrs: {[key: string]: string|null} = {}): jasmine.AsymmetricMatcher<Element> {
  const matcher = function() {};
  let _actual: any = null;

  matcher.asymmetricMatch = function(actual: any) {
    _actual = actual;
    if (!isDOMElement(actual)) return false;
    if (expectedTagName && (expectedTagName.toUpperCase() !== actual.tagName.toUpperCase())) {
      return false;
    }
    if (expectedAttrs) {
      for (const attrName in expectedAttrs) {
        if (expectedAttrs.hasOwnProperty(attrName)) {
          const expectedAttrValue = expectedAttrs[attrName];
          const actualAttrValue = actual.getAttribute(attrName);
          if (expectedAttrValue !== actualAttrValue) {
            return false;
          }
        }
      }
    }
    return true;
  };
  matcher.jasmineToString = function() {
    let actualStr = isDOMElement(_actual) ? `<${_actual.tagName}${toString(_actual.attributes)}>` :
                                            JSON.stringify(_actual);
    let expectedStr = `<${expectedTagName || '*'}${
        Object.keys(expectedAttrs).map(key => ` ${key}=${JSON.stringify(expectedAttrs[key])}`)}>`;
    return `[${actualStr} != ${expectedStr}]`;
  };

  function toString(attrs: NamedNodeMap) {
    let text = '';
    for (let i = 0; i < attrs.length; i++) {
      const attr = attrs[i];
      text += ` ${attr.name}=${JSON.stringify(attr.value)}`;
    }
    return text;
  }


  return matcher;
}

/**
 * Asymmetric matcher which matches DOM text node.
 *
 * Expected usage:
 * ```
 * expect(div).toEqual(matchDomText('text'));
 * expect({
 *   node: div
 * }).toEqual({
 *   node: matchDomText('text')
 * });
 * ```
 *
 * @param expectedText optional DOM text.
 */
export function matchDomText(expectedText: string|undefined = undefined):
    jasmine.AsymmetricMatcher<Text> {
  const matcher = function() {};
  let _actual: any = null;

  matcher.asymmetricMatch = function(actual: any) {
    _actual = actual;
    if (!isDOMText(actual)) return false;
    if (expectedText && (expectedText !== actual.textContent)) {
      return false;
    }
    return true;
  };
  matcher.jasmineToString = function() {
    let actualStr = isDOMText(_actual) ? `#TEXT: ${JSON.stringify(_actual.textContent)}` :
                                         JSON.stringify(_actual);
    let expectedStr = `#TEXT: ${JSON.stringify(expectedText)}`;
    return `[${actualStr} != ${expectedStr}]`;
  };

  return matcher;
}