/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CssSelector, SelectorMatcher, createElementCssSelector} from '@angular/compiler';
import {Compiler, Type} from '@angular/core';

import * as angular from '../common/angular1';
import {COMPILER_KEY} from '../common/constants';
import {ContentProjectionHelper} from '../common/content_projection_helper';
import {getAttributesAsArray, getComponentName} from '../common/util';


export class DynamicContentProjectionHelper extends ContentProjectionHelper {
  groupProjectableNodes($injector: angular.IInjectorService, component: Type<any>, nodes: Node[]):
      Node[][] {
    const ng2Compiler = $injector.get(COMPILER_KEY) as Compiler;
    const ngContentSelectors = ng2Compiler.getNgContentSelectors(component);

    if (!ngContentSelectors) {
      throw new Error('Expecting ngContentSelectors for: ' + getComponentName(component));
    }

    return this.groupNodesBySelector(ngContentSelectors, nodes);
  }

  /**
   * Group a set of DOM nodes into `ngContent` groups, based on the given content selectors.
   */
  groupNodesBySelector(ngContentSelectors: string[], nodes: Node[]): Node[][] {
    const projectableNodes: Node[][] = [];
    let matcher = new SelectorMatcher();
    let wildcardNgContentIndex: number;

    for (let i = 0, ii = ngContentSelectors.length; i < ii; ++i) {
      projectableNodes[i] = [];

      const selector = ngContentSelectors[i];
      if (selector === '*') {
        wildcardNgContentIndex = i;
      } else {
        matcher.addSelectables(CssSelector.parse(selector), i);
      }
    }

    for (let j = 0, jj = nodes.length; j < jj; ++j) {
      const ngContentIndices: number[] = [];
      const node = nodes[j];
      const selector =
          createElementCssSelector(node.nodeName.toLowerCase(), getAttributesAsArray(node));

      matcher.match(selector, (_, index) => ngContentIndices.push(index));
      ngContentIndices.sort();

      if (wildcardNgContentIndex !== undefined) {
        ngContentIndices.push(wildcardNgContentIndex);
      }

      if (ngContentIndices.length) {
        projectableNodes[ngContentIndices[0]].push(node);
      }
    }

    return projectableNodes;
  }
}
