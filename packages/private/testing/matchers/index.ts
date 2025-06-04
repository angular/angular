/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵgetDOM as getDOM} from '@angular/common';
import {Type} from '@angular/core';
import {ComponentFixture} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {childNodesAsList, hasClass, hasStyle, isCommentNode} from '../src/browser_utils';

/**
 * Jasmine matchers that check Angular specific conditions.
 *
 * Note: These matchers will only work in a browser environment.
 */
export interface NgMatchers<T = any> extends jasmine.Matchers<T> {
  /**
   * Expect the element to have exactly the given text.
   *
   * @usageNotes
   * ### Example
   *
   * {@example testing/ts/matchers.ts region='toHaveText'}
   */
  toHaveText(expected: string): boolean;

  /**
   * Expect the element to have the given CSS class.
   *
   * @usageNotes
   * ### Example
   *
   * {@example testing/ts/matchers.ts region='toHaveCssClass'}
   */
  toHaveCssClass(expected: string): boolean;

  /**
   * Expect the element to have the given CSS styles.
   *
   * @usageNotes
   * ### Example
   *
   * {@example testing/ts/matchers.ts region='toHaveCssStyle'}
   */
  toHaveCssStyle(expected: {[k: string]: string} | string): boolean;

  /**
   * Expect a class to implement the interface of the given class.
   *
   * @usageNotes
   * ### Example
   *
   * {@example testing/ts/matchers.ts region='toImplement'}
   */
  toImplement(expected: any): boolean;

  /**
   * Expect a component of the given type to show.
   */
  toContainComponent(expectedComponentType: Type<any>, expectationFailOutput?: any): boolean;

  /**
   * Invert the matchers.
   */
  not: NgMatchers<T>;
}

/**
 * Jasmine matching function with Angular matchers mixed in.
 *
 * ## Example
 *
 * {@example testing/ts/matchers.ts region='toHaveText'}
 */
const _expect: <T = any>(actual: T) => NgMatchers<T> = expect as any;
export {_expect as expect};

beforeEach(function () {
  jasmine.addMatchers({
    toHaveText: function () {
      return {
        compare: function (actual: any, expectedText: string) {
          const actualText = elementText(actual);
          return {
            pass: actualText == expectedText,
            get message() {
              return 'Expected ' + actualText + ' to be equal to ' + expectedText;
            },
          };
        },
      };
    },

    toHaveCssClass: function () {
      return {compare: buildError(false), negativeCompare: buildError(true)};

      function buildError(isNot: boolean) {
        return function (actual: any, className: string) {
          return {
            pass: hasClass(actual, className) == !isNot,
            get message() {
              return `Expected ${actual.outerHTML} ${
                isNot ? 'not ' : ''
              }to contain the CSS class "${className}"`;
            },
          };
        };
      }
    },

    toHaveCssStyle: function () {
      return {
        compare: function (actual: any, styles: {[k: string]: string} | string) {
          let allPassed: boolean;
          if (typeof styles === 'string') {
            allPassed = hasStyle(actual, styles);
          } else {
            allPassed = Object.keys(styles).length !== 0;
            Object.keys(styles).forEach((prop) => {
              allPassed = allPassed && hasStyle(actual, prop, styles[prop]);
            });
          }

          return {
            pass: allPassed,
            get message() {
              const expectedValueStr = typeof styles === 'string' ? styles : JSON.stringify(styles);
              return `Expected ${actual.outerHTML} ${!allPassed ? ' ' : 'not '}to contain the
                      CSS ${
                        typeof styles === 'string' ? 'property' : 'styles'
                      } "${expectedValueStr}"`;
            },
          };
        },
      };
    },

    toImplement: function () {
      return {
        compare: function (actualObject: any, expectedInterface: any) {
          const intProps = Object.keys(expectedInterface.prototype);

          const missedMethods: any[] = [];
          intProps.forEach((k) => {
            if (!actualObject.constructor.prototype[k]) missedMethods.push(k);
          });

          return {
            pass: missedMethods.length == 0,
            get message() {
              return (
                'Expected ' +
                actualObject +
                ' to have the following methods: ' +
                missedMethods.join(', ')
              );
            },
          };
        },
      };
    },

    toContainComponent: function () {
      return {
        compare: function (actualFixture: any, expectedComponentType: Type<any>) {
          const failOutput = arguments[2];
          const msgFn = (msg: string): string => [msg, failOutput].filter(Boolean).join(', ');

          // verify correct actual type
          if (!(actualFixture instanceof ComponentFixture)) {
            return {
              pass: false,
              message: msgFn(
                `Expected actual to be of type \'ComponentFixture\' [actual=${actualFixture.constructor.name}]`,
              ),
            };
          }

          const found = !!actualFixture.debugElement.query(By.directive(expectedComponentType));
          return found
            ? {pass: true}
            : {pass: false, message: msgFn(`Expected ${expectedComponentType.name} to show`)};
        },
      };
    },
  });
});

function elementText(n: any): string {
  const hasNodes = (n: any) => {
    const children = n.childNodes;
    return children && children.length > 0;
  };

  if (n instanceof Array) {
    return n.map(elementText).join('');
  }

  if (isCommentNode(n)) {
    return '';
  }

  if (getDOM().isElementNode(n)) {
    const tagName = (n as Element).tagName;

    if (tagName === 'CONTENT') {
      return elementText(Array.prototype.slice.apply((<any>n).getDistributedNodes()));
    } else if (tagName === 'SLOT') {
      return elementText(Array.prototype.slice.apply((<any>n).assignedNodes()));
    }
  }

  if (hasShadowRoot(n)) {
    return elementText(childNodesAsList((<any>n).shadowRoot));
  }

  if (hasNodes(n)) {
    return elementText(childNodesAsList(n));
  }

  return (n as any).textContent;
}

function hasShadowRoot(node: any): boolean {
  return node.shadowRoot != null && node instanceof HTMLElement;
}
