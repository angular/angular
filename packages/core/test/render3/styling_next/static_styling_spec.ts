/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AttributeMarker} from '../../../src/render3/interfaces/attribute_marker';
import {TAttributes, TNode, TNodeType} from '../../../src/render3/interfaces/node';
import {LView} from '../../../src/render3/interfaces/view';
import {enterView} from '../../../src/render3/state';
import {computeStaticStyling} from '../../../src/render3/styling/static_styling';
import {createTNode} from '../../../src/render3/tnode_manipulation';

describe('static styling', () => {
  const mockFirstCreatePassLView: LView = [null, {firstCreatePass: true}] as any;
  let tNode!: TNode;
  beforeEach(() => {
    enterView(mockFirstCreatePassLView);
    tNode = createTNode(null!, null!, TNodeType.Element, 0, '', null);
  });
  it('should initialize when no attrs', () => {
    computeStaticStyling(tNode, [], true);
    expect(tNode.classes).toEqual(null);
    expect(tNode.styles).toEqual(null);
  });

  it('should initialize from attrs', () => {
    const tAttrs: TAttributes = [
      'ignore', //
      AttributeMarker.Classes,
      'my-class', //
      AttributeMarker.Styles,
      'color',
      'red', //
    ];
    computeStaticStyling(tNode, tAttrs, true);
    expect(tNode.classes).toEqual('my-class');
    expect(tNode.styles).toEqual('color: red;');
  });

  it('should initialize from attrs when multiple', () => {
    const tAttrs: TAttributes = [
      'ignore', //
      AttributeMarker.Classes,
      'my-class',
      'other', //
      AttributeMarker.Styles,
      'color',
      'red',
      'width',
      '100px', //
    ];
    computeStaticStyling(tNode, tAttrs, true);
    expect(tNode.classes).toEqual('my-class other');
    expect(tNode.styles).toEqual('color: red; width: 100px;');
  });
});
