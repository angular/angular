/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';

import {TOC_SKIP_CONTENT_MARKER, TableOfContentsLoader} from './table-of-contents-loader.service';

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

    expect(service.tableOfContentItems()).toEqual([]);
  });

  it('should create empty table of content list when there is only h1 elements', () => {
    const element = createElement('element-with-only-h1');

    service.buildTableOfContent(element);

    expect(service.tableOfContentItems()).toEqual([]);
  });

  it('should create table of content list with h2 and h3 when h2 and h3 headings exists', () => {
    const element = createElement('element-with-h1-h2-h3-h4');

    service.buildTableOfContent(element);

    expect(service.tableOfContentItems().length).toEqual(5);
    expect(service.tableOfContentItems()[0].id).toBe('item-2');
    expect(service.tableOfContentItems()[1].id).toBe('item-3');
    expect(service.tableOfContentItems()[2].id).toBe('item-5');
    expect(service.tableOfContentItems()[3].id).toBe('item-6');
    expect(service.tableOfContentItems()[4].id).toBe('item-7');

    expect(service.tableOfContentItems()[0].level).toBe('h2');
    expect(service.tableOfContentItems()[1].level).toBe('h3');
    expect(service.tableOfContentItems()[2].level).toBe('h3');
    expect(service.tableOfContentItems()[3].level).toBe('h2');
    expect(service.tableOfContentItems()[4].level).toBe('h3');

    expect(service.tableOfContentItems()[0].title).toBe('H2 - first');
    expect(service.tableOfContentItems()[1].title).toBe('H3 - first');
    expect(service.tableOfContentItems()[2].title).toBe('H3 - second');
    expect(service.tableOfContentItems()[3].title).toBe('H2 - second');
    expect(service.tableOfContentItems()[4].title).toBe('H3 - third');
  });

  it('should not display in ToC h2,h3 without ids', () => {
    const element = createElement('element-with-h2-h3-without-id');

    service.buildTableOfContent(element);

    expect(service.tableOfContentItems().length).toBe(0);
  });

  it('should not display in ToC h2,h3 which are childrens of docs-example-viewer', () => {
    const element = createElement('headings-inside-docs-example-viewer');

    service.buildTableOfContent(element);

    expect(service.tableOfContentItems().length).toBe(0);
  });

  it(`should not display in ToC heading with ${TOC_SKIP_CONTENT_MARKER} attr`, () => {
    const element = createElement('headings-inside-toc-skip-content');

    service.buildTableOfContent(element);

    expect(service.tableOfContentItems().length).toBe(1);
    expect(service.tableOfContentItems()[0].id).toBe('item-1');
  });
});

function createElement(id: string): HTMLElement {
  const div = document.createElement('div');
  div.innerHTML = fakeElementHtml[id];
  return div;
}

const fakeHeadings = `<h1 id="item-1">H1</h1>
<h2 id="item-2">H2 - first</h2>
<h3 id="item-3">H3 - first</h3>
<h4 id="item-4">H4</h4>
<h3 id="item-5">H3 - second</h3>
<h2 id="item-6">H2 - second</h2>
<h3 id="item-7">H3 - third</h3>`;

const fakeElementHtml: Record<string, string> = {
  'element-without-headings': `<div>content</div>`,
  'element-with-only-h1': `<div><h1>heading</h1></div>`,
  'element-with-h1-h2-h3-h4': `<div>
    ${fakeHeadings}
  </div>
  `,
  'element-with-h2-h3-without-id': `<div><h2>heading</h2><h3>heading</h3></div>`,
  'headings-inside-docs-example-viewer': `<docs-example-viewer>${fakeHeadings}</docs-example-viewer>`,
  'headings-inside-toc-skip-content': `<div><h2 id="item-1">heading</h2><h3 id="item-2" toc-skip-content>skip heading</h3></div>`,
};
