/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {verifySsrContentsIntegrity, SSR_CONTENT_INTEGRITY_MARKER} from '../../src/hydration/utils';

describe('verifySsrContentsIntegrity', () => {
  if (typeof DOMParser === 'undefined') {
    it('is only tested in the browser', () => {
      expect(typeof DOMParser).toBe('undefined');
    });
    return;
  }

  async function doc(html: string): Promise<Document> {
    return new DOMParser().parseFromString(html, 'text/html');
  }

  it('fails without integrity marker comment', async () => {
    const dom = await doc('<app-root></app-root>');
    expect(() => verifySsrContentsIntegrity(dom)).toThrowError(/NG0507/);
  });

  it('succeeds with "complete" DOM', async () => {
    const dom = await doc(
      `<!doctype html><head><title>Hi</title></head><body><!--${SSR_CONTENT_INTEGRITY_MARKER}--><app-root></app-root></body>`,
    );
    expect(() => verifySsrContentsIntegrity(dom)).not.toThrow();
  });

  it('succeeds with <body>-less DOM', async () => {
    const dom = await doc(
      `<!doctype html><head><title>Hi</title></head><!--${SSR_CONTENT_INTEGRITY_MARKER}--><app-root></app-root>`,
    );
    expect(() => verifySsrContentsIntegrity(dom)).not.toThrow();
  });

  it('succeeds with <body>- and <head>-less DOM', async () => {
    const dom = await doc(
      `<!doctype html><title>Hi</title><!--${SSR_CONTENT_INTEGRITY_MARKER}--><app-root></app-root>`,
    );
    expect(() => verifySsrContentsIntegrity(dom)).not.toThrow();
  });

  it('succeeds with <body>-less DOM that contains whitespace', async () => {
    const dom = await doc(
      `<!doctype html><head><title>Hi</title></head>\n<!--${SSR_CONTENT_INTEGRITY_MARKER}-->\n<app-root></app-root>`,
    );
    expect(() => verifySsrContentsIntegrity(dom)).not.toThrow();
  });

  it('succeeds with <body>- and <head>-less DOM that contains whitespace', async () => {
    const dom = await doc(
      `<!doctype html><title>Hi</title>\n<!--${SSR_CONTENT_INTEGRITY_MARKER}-->\n<app-root></app-root>`,
    );
    expect(() => verifySsrContentsIntegrity(dom, [dom.body])).not.toThrow();
  });

  it('succeeds when integrity marker is inside a specified element boundary', async () => {
    const dom = await doc(
      `<!doctype html><head></head><body><div id="island"><!--${SSR_CONTENT_INTEGRITY_MARKER}--><app-root></app-root></div></body>`,
    );
    const island = dom.getElementById('island')!;
    expect(() => verifySsrContentsIntegrity(dom, [island])).not.toThrow();
  });

  it('succeeds when integrity marker is inside a specified selector boundary', async () => {
    const dom = await doc(
      `<!doctype html><head></head><body><div id="island"><!--${SSR_CONTENT_INTEGRITY_MARKER}--><app-root></app-root></div></body>`,
    );
    expect(() => verifySsrContentsIntegrity(dom, ['#island'])).not.toThrow();
  });

  it('fails when integrity marker is outside the specified boundary', async () => {
    const dom = await doc(
      // Marker is inside body, but we configure `#island` as the boundary.
      `<!doctype html><head></head><body><!--${SSR_CONTENT_INTEGRITY_MARKER}--><div id="island"><app-root></app-root></div></body>`,
    );
    expect(() => verifySsrContentsIntegrity(dom, ['#island'])).toThrowError(/NG0507/);
  });
});
