/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as domGenerator from '../src/generator';
import {Property} from '../src/property';

import {safeElement, testonlyHtml} from './html';

const domContent = `<div id="container">
<div id="innercontainer">
  <span id="host">
    <span id="target"></span>
  </span>
</div>
</div>

<div id="owner">
</div>

<div id="containeractions">
<div id="actionnode" jsaction="action1">
  <span id="action-1"></span>
</div>
</div>`;


function assertExpectedPath(
    g: domGenerator.Generator,
    expectedPath: Element[],
) {
  let i = 0;
  for (let n; (n = g.next());) {
    expect(n).toBe(expectedPath[i++]);
  }
}

describe('generator test.ts', () => {
  let el!: HTMLElement;
  function elem(id: string): Element {
    return el.querySelector('#' + id)!;
  }
  beforeAll(async () => {
    el = document.createElement('div');
    await safeElement.setInnerHtml(el, testonlyHtml(domContent));
  });

  it('dom ancestor generator', () => {
    const target = elem('target');
    const container = elem('container');
    const expected = [
      elem('target'),
      elem('host'),
      elem('innercontainer'),
      container,
    ];
    const g = new domGenerator.Ancestors(target, container);
    assertExpectedPath(g, expected);
  });

  it('event path generator', () => {
    const container = elem('container');
    const expected = [
      elem('target'),
      elem('host'),
      elem('innercontainer'),
      container,
    ];
    const g = new domGenerator.EventPath(expected, container);
    assertExpectedPath(g, expected);
  });

  it('dom ancestor generator with owner property', () => {
    const container = elem('containeractions');
    const actionNode = elem('actionnode');
    const owned = elem('owner');
    const element = elem('action-1');
    owned[Property.OWNER] = element;
    const expected = [owned, element, actionNode, container];
    const g = new domGenerator.Ancestors(owned, container);
    assertExpectedPath(g, expected);
  });

  it('event path generator with owner property', () => {
    const container = elem('containeractions');
    const actionNode = elem('actionnode');
    const owned = elem('owner');
    const element = elem('action-1');
    owned[Property.OWNER] = element;
    const expected = [owned, element, actionNode, container];

    const g = new domGenerator.EventPath([owned], container);
    assertExpectedPath(g, expected);
  });
});
