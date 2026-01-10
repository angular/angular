/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵgetDOM as getDOM} from '@angular/common';
import {SharedStylesHost} from '../../src/dom/shared_styles_host';
import {isNode} from '@angular/private/testing';
import {expect} from '@angular/private/testing/matchers';

describe('SharedStylesHost', () => {
  // Shadow DOM isn't supported by DOM emulation in Node.
  if (isNode) {
    // Jasmine will throw if there are no tests.
    it('should pass', () => {});
    return;
  }

  let doc: Document;
  let ssh: SharedStylesHost;
  beforeEach(() => {
    doc = getDOM().createHtmlDocument();
    doc.title = '';
    ssh = new SharedStylesHost(doc, 'app-id');
  });

  afterEach(() => {
    ssh.ngOnDestroy();
  });

  const shadowRootHosts: Element[] = [];
  function createShadowRoot(hostTag: string = 'div'): ShadowRoot {
    const host = doc.createElement(hostTag);
    const shadowRoot = host.attachShadow({mode: 'open'});
    doc.body.append(host);
    shadowRootHosts.push(host);
    return shadowRoot;
  }

  afterEach(() => {
    for (const host of shadowRootHosts) host.remove();
    shadowRootHosts.splice(0, shadowRootHosts.length);
  });

  describe('inline', () => {
    it('should add styles', () => {
      ssh.addStyles(doc, ['a {};']);
      expect(doc.head.innerHTML).toContain('<style>a {};</style>');
    });

    it('should add styles only once', () => {
      ssh.addStyles(doc, ['a {};']);
      ssh.addStyles(doc, ['a {};']);
      expect(doc.head.innerHTML.indexOf('<style>a {};</style>')).toBe(
        doc.head.innerHTML.lastIndexOf('<style>a {};</style>'),
      );
    });

    it('should remove style nodes on destroy', () => {
      ssh.addStyles(doc, ['a {};']);
      expect(doc.head.innerHTML).toContain('<style>a {};</style>');

      ssh.ngOnDestroy();
      expect(doc.head.innerHTML).not.toContain('<style>a {};</style>');
    });

    it(`should add 'nonce' attribute when a nonce value is provided`, () => {
      ssh = new SharedStylesHost(doc, 'app-id', '{% nonce %}');
      ssh.addStyles(doc, ['a {};']);
      expect(doc.head.innerHTML).toContain('<style nonce="{% nonce %}">a {};</style>');
    });

    it(`should reuse SSR generated elements`, () => {
      const style = doc.createElement('style');
      style.setAttribute('ng-app-id', 'app-id');
      style.textContent = 'a {};';
      doc.head.appendChild(style);

      ssh = new SharedStylesHost(doc, 'app-id');
      ssh.addStyles(doc, ['a {};']);
      expect(doc.head.innerHTML).toContain('<style ng-style-reused="">a {};</style>');
      expect(doc.head.innerHTML).not.toContain('ng-app-id');
    });
  });

  describe('external', () => {
    it('should add styles', () => {
      ssh.addStyles(doc, [], ['component-1.css']);
      expect(doc.head.innerHTML).toContain('<link rel="stylesheet" href="component-1.css">');
    });

    it('should add styles only once', () => {
      ssh.addStyles(doc, [], ['component-1.css']);
      ssh.addStyles(doc, [], ['component-1.css']);
      expect(doc.head.innerHTML.indexOf('<link rel="stylesheet" href="component-1.css">')).toBe(
        doc.head.innerHTML.lastIndexOf('<link rel="stylesheet" href="component-1.css">'),
      );
    });

    it('should remove styles on destroy', () => {
      ssh.addStyles(doc, [], ['component-1.css']);
      expect(doc.head.innerHTML).toContain('<link rel="stylesheet" href="component-1.css">');

      ssh.ngOnDestroy();
      expect(doc.head.innerHTML).not.toContain('<link rel="stylesheet" href="component-1.css">');
    });

    it(`should add 'nonce' attribute when a nonce value is provided`, () => {
      ssh = new SharedStylesHost(doc, 'app-id', '{% nonce %}');
      ssh.addStyles(doc, [], ['component-1.css']);
      expect(doc.head.innerHTML).toContain(
        '<link rel="stylesheet" href="component-1.css" nonce="{% nonce %}">',
      );
    });

    it('should keep search parameters of urls', () => {
      ssh.addStyles(doc, [], ['component-1.css?ngcomp=ng-app-c123456789']);
      expect(doc.head.innerHTML).toContain(
        '<link rel="stylesheet" href="component-1.css?ngcomp=ng-app-c123456789">',
      );
    });

    it(`should reuse SSR generated elements`, () => {
      const link = doc.createElement('link');
      link.setAttribute('rel', 'stylesheet');
      link.setAttribute('href', 'component-1.css');
      link.setAttribute('ng-app-id', 'app-id');
      doc.head.appendChild(link);

      ssh = new SharedStylesHost(doc, 'app-id');
      ssh.addStyles(doc, [], ['component-1.css']);
      expect(doc.head.innerHTML).toContain(
        '<link rel="stylesheet" href="component-1.css" ng-style-reused="">',
      );
      expect(doc.head.innerHTML).not.toContain('ng-app-id');
    });
  });

  it('should track styles in shadow roots', () => {
    const shadowRoot = createShadowRoot();
    ssh.addStyles(shadowRoot, ['a {};']);
    expect(shadowRoot.innerHTML).toContain('<style>a {};</style>');
    expect(doc.head.innerHTML).not.toContain('<style>a {};</style>');

    ssh.removeStyles(shadowRoot, ['a {};']);
    expect(shadowRoot.innerHTML).not.toContain('<style>a {};</style>');
  });

  it('does not duplicate styles', () => {
    const shadowRoot = createShadowRoot();
    ssh.addStyles(shadowRoot, ['a {};']);
    ssh.addStyles(shadowRoot, ['a {};']);

    expect(shadowRoot.innerHTML).toContain('<style>a {};</style>');
    expect(shadowRoot.innerHTML.indexOf('<style>a {};</style>')).toBe(
      shadowRoot.innerHTML.lastIndexOf('<style>a {};</style>'),
    );
  });

  it('should track usage per-shadow root', () => {
    const shadowRoot1 = createShadowRoot();
    ssh.addStyles(shadowRoot1, ['a {};']);
    expect(shadowRoot1.innerHTML).toContain('<style>a {};</style>');

    // Multiple usages in a different shadow root.
    const shadowRoot2 = createShadowRoot();
    ssh.addStyles(shadowRoot2, ['b {};']);
    ssh.addStyles(shadowRoot2, ['b {};']);
    ssh.addStyles(shadowRoot2, ['b {};']);
    expect(shadowRoot2.innerHTML).toContain('<style>b {};</style>');

    // Should not have mixed the styles.
    expect(shadowRoot1.innerHTML).not.toContain('<style>b {};</style>');
    expect(shadowRoot2.innerHTML).not.toContain('<style>a {};</style>');

    // `shadowRoot2` has three usages, all need to be removed to have an effect.
    ssh.removeStyles(shadowRoot2, ['b {};']);
    expect(shadowRoot2.innerHTML).toContain('<style>b {};</style>');
    ssh.removeStyles(shadowRoot2, ['b {};']);
    ssh.removeStyles(shadowRoot2, ['b {};']);
    expect(shadowRoot2.innerHTML).not.toContain('<style>b {};</style>');

    // `shadowRoot1` should not be affected at all.
    expect(shadowRoot1.innerHTML).toContain('<style>a {};</style>');
  });

  it('throws when removing a style which was never added', () => {
    expect(() => ssh.removeStyles(doc, ['a {};'])).toThrowError(
      /remove styles which are not in the provided `StyleRoot`/,
    );

    // Add a different style to track something for this root.
    ssh.addStyles(doc, ['a {};']);

    // Removing the wrong style from a known root.
    expect(() => ssh.removeStyles(doc, ['b {};'])).toThrowError(
      /remove styles which are not in the provided `StyleRoot`/,
    );
  });
});
