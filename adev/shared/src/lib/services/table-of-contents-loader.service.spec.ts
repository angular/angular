/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';

import {TableOfContentsLoader} from './table-of-contents-loader.service';

describe('TableOfContentsLoader', () => {
  let service: TableOfContentsLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TableOfContentsLoader],
    });
    service = TestBed.inject(TableOfContentsLoader);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create empty table of content list when there is no headings in content', () => {
    const element = createElement('element-without-headings');

    service.buildTableOfContent(element);

    expect(service.tableOfContentItems).toEqual([]);
  });

  it('should create empty table of content list when there is only h1 elements', () => {
    const element = createElement('element-with-only-h1');

    service.buildTableOfContent(element);

    expect(service.tableOfContentItems).toEqual([]);
  });

  it('should create table of content list with h2 and h3 when h2 and h3 headings exists', () => {
    const element = createElement('element-with-h1-h2-h3-h4');

    service.buildTableOfContent(element);

    expect(service.tableOfContentItems.length).toEqual(5);
    expect(service.tableOfContentItems[0].id).toBe('item-2');
    expect(service.tableOfContentItems[1].id).toBe('item-3');
    expect(service.tableOfContentItems[2].id).toBe('item-5');
    expect(service.tableOfContentItems[3].id).toBe('item-6');
    expect(service.tableOfContentItems[4].id).toBe('item-7');

    expect(service.tableOfContentItems[0].level).toBe('h2');
    expect(service.tableOfContentItems[1].level).toBe('h3');
    expect(service.tableOfContentItems[2].level).toBe('h3');
    expect(service.tableOfContentItems[3].level).toBe('h2');
    expect(service.tableOfContentItems[4].level).toBe('h3');
  });
});

function createElement(id: string): HTMLElement {
  const div = document.createElement('div');
  div.innerHTML = fakeElementHtml[id];
  return div;
}

const fakeElementHtml: Record<string, string> = {
  'element-without-headings': `<div>content</div>`,
  'element-with-only-h1': `<div><h1>heading</h1></div>`,
  'element-with-h1-h2-h3-h4': `<div>
    <h1 id="item-1">H1</h1>
    <h2 id="item-2">H2 - first <docs-icon>link</docs-icon></h2>
    <h3 id="item-3">H3 - first</h3>
    <h4 id="item-4">H4</h4>
    <h3 id="item-5">H3 - second</h3>
    <h2 id="item-6">H2 - second</h2>
    <h3 id="item-7">H3 - third</h3>
  </div>
  `,
};
