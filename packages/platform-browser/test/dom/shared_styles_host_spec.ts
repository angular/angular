/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵgetDOM as getDOM} from '@angular/common';
import {SharedStylesHost} from '../../src/dom/shared_styles_host';
import {expect} from '@angular/private/testing/matchers';

describe('SharedStylesHost', () => {
  let doc: Document;
  let ssh: SharedStylesHost;
  let someHost: Element;
  beforeEach(() => {
    doc = getDOM().createHtmlDocument();
    doc.title = '';
    ssh = new SharedStylesHost(doc, 'app-id');
    someHost = getDOM().createElement('div');
  });

  describe('inline', () => {
    it('should add existing styles to new hosts', () => {
      ssh.addStyles(['a {};']);
      ssh.addHost(someHost);
      expect(someHost.innerHTML).toEqual('<style>a {};</style>');
    });

    it('should add new styles to hosts', () => {
      ssh.addHost(someHost);
      ssh.addStyles(['a {};']);
      expect(someHost.innerHTML).toEqual('<style>a {};</style>');
    });

    it('should add styles only once to hosts', () => {
      ssh.addStyles(['a {};']);
      ssh.addHost(someHost);
      ssh.addStyles(['a {};']);
      expect(someHost.innerHTML).toEqual('<style>a {};</style>');
    });

    it('should remove style nodes on destroy', () => {
      ssh.addStyles(['a {};']);
      ssh.addHost(someHost);
      expect(someHost.innerHTML).toEqual('<style>a {};</style>');

      ssh.ngOnDestroy();
      expect(someHost.innerHTML).toEqual('');
    });

    it(`should add 'nonce' attribute when a nonce value is provided`, () => {
      ssh = new SharedStylesHost(doc, 'app-id', '{% nonce %}');
      ssh.addStyles(['a {};']);
      ssh.addHost(someHost);
      expect(someHost.innerHTML).toEqual('<style nonce="{% nonce %}">a {};</style>');
    });

    it(`should reuse SSR generated element`, () => {
      const style = doc.createElement('style');
      style.setAttribute('ng-app-id', 'app-id');
      style.textContent = 'a {};';
      doc.head.appendChild(style);

      ssh = new SharedStylesHost(doc, 'app-id');
      ssh.addStyles(['a {};']);
      expect(doc.head.innerHTML).toContain('<style ng-style-reused="">a {};</style>');
      expect(doc.head.innerHTML).not.toContain('ng-app-id');
    });

    it('should not duplicate styles when the same host is added multiple times', () => {
      ssh.addStyles(['a {};']);
      ssh.addHost(doc.head);
      ssh.addHost(doc.head);

      expect(doc.head.querySelectorAll('style')).toHaveSize(1);
    });

    it('should not duplicate styles from prerendering', () => {
      const ssrStyle = document.createElement('style');
      ssrStyle.textContent = 'a {};';
      ssrStyle.setAttribute('ng-app-id', 'app-id');
      doc.head.appendChild(ssrStyle);

      ssh = new SharedStylesHost(doc, 'app-id');
      ssh.addHost(doc.head);

      expect(doc.head.querySelectorAll('style')).toHaveSize(1);
    });

    it('should not duplicate styles from prerendering during subsequent renders', () => {
      const styleContent = 'a {};';

      const ssrStyle = document.createElement('style');
      ssrStyle.textContent = styleContent;
      ssrStyle.setAttribute('ng-app-id', 'app-id');
      doc.head.appendChild(ssrStyle);

      ssh = new SharedStylesHost(doc, 'app-id');
      ssh.addHost(doc.head);

      expect(doc.head.querySelectorAll('style')).toHaveSize(1);

      ssh.addStyles([styleContent]);

      expect(doc.head.querySelectorAll('style')).toHaveSize(1);
    });
  });

  describe('external', () => {
    it('should add existing styles to new hosts', () => {
      ssh.addStyles([], ['component-1.css']);
      ssh.addHost(someHost);
      expect(someHost.innerHTML).toEqual('<link rel="stylesheet" href="component-1.css">');
    });

    it('should add new styles to hosts', () => {
      ssh.addHost(someHost);
      ssh.addStyles([], ['component-1.css']);
      expect(someHost.innerHTML).toEqual('<link rel="stylesheet" href="component-1.css">');
    });

    it('should add styles only once to hosts', () => {
      ssh.addStyles([], ['component-1.css']);
      ssh.addHost(someHost);
      ssh.addStyles([], ['component-1.css']);
      expect(someHost.innerHTML).toEqual('<link rel="stylesheet" href="component-1.css">');
    });

    it('should remove style nodes on destroy', () => {
      ssh.addStyles([], ['component-1.css']);
      ssh.addHost(someHost);
      expect(someHost.innerHTML).toEqual('<link rel="stylesheet" href="component-1.css">');

      ssh.ngOnDestroy();
      expect(someHost.innerHTML).toEqual('');
    });

    it(`should add 'nonce' attribute when a nonce value is provided`, () => {
      ssh = new SharedStylesHost(doc, 'app-id', '{% nonce %}');
      ssh.addStyles([], ['component-1.css']);
      ssh.addHost(someHost);
      expect(someHost.innerHTML).toEqual(
        '<link rel="stylesheet" href="component-1.css" nonce="{% nonce %}">',
      );
    });

    it('should keep search parameters of urls', () => {
      ssh.addHost(someHost);
      ssh.addStyles([], ['component-1.css?ngcomp=ng-app-c123456789']);
      expect(someHost.innerHTML).toEqual(
        '<link rel="stylesheet" href="component-1.css?ngcomp=ng-app-c123456789">',
      );
    });

    it(`should reuse SSR generated element`, () => {
      const link = doc.createElement('link');
      link.setAttribute('rel', 'stylesheet');
      link.setAttribute('href', 'component-1.css');
      link.setAttribute('ng-app-id', 'app-id');
      doc.head.appendChild(link);

      ssh = new SharedStylesHost(doc, 'app-id');
      ssh.addStyles([], ['component-1.css']);
      expect(doc.head.innerHTML).toContain(
        '<link rel="stylesheet" href="component-1.css" ng-style-reused="">',
      );
      expect(doc.head.innerHTML).not.toContain('ng-app-id');
    });

    it('should not duplicate styles when the same host is added multiple times', () => {
      ssh.addStyles([], ['component-1.css']);
      ssh.addHost(doc.head);
      ssh.addHost(doc.head);

      expect(doc.head.querySelectorAll('link')).toHaveSize(1);
    });

    it('should not duplicate styles from prerendering', () => {
      const ssrLink = document.createElement('link');
      ssrLink.setAttribute('href', 'component-1.css');
      ssrLink.setAttribute('ng-app-id', 'app-id');
      doc.head.appendChild(ssrLink);

      ssh = new SharedStylesHost(doc, 'app-id');
      ssh.addHost(doc.head);

      expect(doc.head.querySelectorAll('link')).toHaveSize(1);
    });

    it('should not duplicate styles from prerendering during subsequent renders', () => {
      const href = 'component-1.css';
      const ssrLink = document.createElement('link');
      ssrLink.setAttribute('href', href);
      ssrLink.setAttribute('ng-app-id', 'app-id');
      doc.head.appendChild(ssrLink);

      ssh = new SharedStylesHost(doc, 'app-id');
      ssh.addHost(doc.head);

      expect(doc.head.querySelectorAll('link')).toHaveSize(1);

      ssh.addStyles([], [href]);

      expect(doc.head.querySelectorAll('link')).toHaveSize(1);
    });
  });

  describe('removeHost', () => {
    it('should remove inline style nodes from the host', () => {
      ssh.addStyles(['a {}']);
      ssh.addHost(someHost);
      expect(someHost.innerHTML).toEqual('<style>a {}</style>');

      ssh.removeHost(someHost);
      expect(someHost.innerHTML).toEqual('');
    });

    it('should remove external style nodes from the host', () => {
      ssh.addStyles([], ['component.css']);
      ssh.addHost(someHost);
      expect(someHost.innerHTML).toEqual('<link rel="stylesheet" href="component.css">');

      ssh.removeHost(someHost);
      expect(someHost.innerHTML).toEqual('');
    });

    it('should not add new styles to the host after removal', () => {
      ssh.addHost(someHost);
      ssh.removeHost(someHost);
      ssh.addStyles(['a {}']);
      expect(someHost.innerHTML).toEqual('');
    });
  });

  describe('replaceStyles', () => {
    it('should mutate inline style node textContent in-place', () => {
      ssh.addStyles(['a { color: red; }']);
      ssh.addHost(someHost);
      const originalStyleNode = someHost.querySelector('style');
      expect(someHost.innerHTML).toEqual('<style>a { color: red; }</style>');

      ssh.replaceStyles(['a { color: red; }'], ['a { color: blue; }']);

      const updatedStyleNode = someHost.querySelector('style');
      expect(someHost.innerHTML).toEqual('<style>a { color: blue; }</style>');
      expect(updatedStyleNode).toBe(originalStyleNode);
    });

    it('should mutate external link href in-place', () => {
      ssh.addStyles([], ['component-1.css?v=1']);
      ssh.addHost(someHost);
      const originalLinkNode = someHost.querySelector('link');
      expect(someHost.innerHTML).toEqual('<link rel="stylesheet" href="component-1.css?v=1">');

      ssh.replaceStyles([], [], ['component-1.css?v=1'], ['component-1.css?v=2']);

      const updatedLinkNode = someHost.querySelector('link');
      expect(someHost.innerHTML).toEqual('<link rel="stylesheet" href="component-1.css?v=2">');
      expect(updatedLinkNode).toBe(originalLinkNode);
    });

    it('should mutate style nodes across multiple host nodes in-place', () => {
      const secondHost = getDOM().createElement('div');
      ssh.addStyles(['a { color: red; }']);
      ssh.addHost(someHost);
      ssh.addHost(secondHost);

      const style1 = someHost.querySelector('style');
      const style2 = secondHost.querySelector('style');

      ssh.replaceStyles(['a { color: red; }'], ['a { color: green; }']);

      expect(someHost.innerHTML).toEqual('<style>a { color: green; }</style>');
      expect(secondHost.innerHTML).toEqual('<style>a { color: green; }</style>');
      expect(someHost.querySelector('style')).toBe(style1);
      expect(secondHost.querySelector('style')).toBe(style2);
    });

    it('should merge usage and remove duplicate element when replacing with an existing style', () => {
      ssh.addStyles(['a { color: blue; }']);
      ssh.addStyles(['a { color: red; }']);
      ssh.addHost(someHost);
      expect(someHost.children.length).toBe(2);

      ssh.replaceStyles(['a { color: red; }'], ['a { color: blue; }']);

      expect(someHost.children.length).toBe(1);
      expect(someHost.innerHTML).toEqual('<style>a { color: blue; }</style>');

      ssh.removeStyles(['a { color: blue; }']);
      expect(someHost.children.length).toBe(1);

      ssh.removeStyles(['a { color: blue; }']);
      expect(someHost.children.length).toBe(0);
    });

    it('should merge usage and remove duplicate link when replacing with an existing URL', () => {
      ssh.addStyles([], ['a.css']);
      ssh.addStyles([], ['b.css']);
      ssh.addHost(someHost);
      expect(someHost.children.length).toBe(2);

      ssh.replaceStyles([], [], ['b.css'], ['a.css']);

      expect(someHost.children.length).toBe(1);
      expect(someHost.innerHTML).toEqual('<link rel="stylesheet" href="a.css">');
    });

    it('should handle arrays of different lengths by adding or removing styles', () => {
      ssh.addStyles(['a { color: red; }', 'b { color: red; }']);
      ssh.addHost(someHost);
      expect(someHost.children.length).toBe(2);

      ssh.replaceStyles(['a { color: red; }', 'b { color: red; }'], ['a { color: blue; }']);

      expect(someHost.children.length).toBe(1);
      expect(someHost.innerHTML).toEqual('<style>a { color: blue; }</style>');
    });

    it('should mutate style in-place and preserve usage count for multiple instances of an emulated component', () => {
      const emulatedStyleRed = 'a[_ngcontent-c1] { color: red; }';
      const emulatedStyleBlue = 'a[_ngcontent-c1] { color: blue; }';

      ssh.addStyles([emulatedStyleRed]); // Instance 1
      ssh.addStyles([emulatedStyleRed]); // Instance 2
      ssh.addHost(someHost);

      const originalStyleNode = someHost.querySelector('style');
      expect(someHost.innerHTML).toEqual(`<style>${emulatedStyleRed}</style>`);

      ssh.replaceStyles([emulatedStyleRed], [emulatedStyleBlue]);

      // Style node is mutated in-place and shared across active instances
      expect(someHost.innerHTML).toEqual(`<style>${emulatedStyleBlue}</style>`);
      expect(someHost.querySelector('style')).toBe(originalStyleNode);

      // Unmounting Instance 1 should NOT remove the style node
      ssh.removeStyles([emulatedStyleBlue]);
      expect(someHost.innerHTML).toEqual(`<style>${emulatedStyleBlue}</style>`);

      // Unmounting Instance 2 removes the style node
      ssh.removeStyles([emulatedStyleBlue]);
      expect(someHost.innerHTML).toEqual('');
    });

    it('should not mutate style in-place when un-encapsulated style has usage > 1 to protect other components', () => {
      // Simulate Component A and Component B sharing the same initial un-encapsulated style
      ssh.addStyles(['a { color: red; }']); // Comp A
      ssh.addStyles(['a { color: red; }']); // Comp B
      ssh.addHost(someHost);

      expect(someHost.innerHTML).toEqual('<style>a { color: red; }</style>');

      // Comp A (ViewEncapsulation.None) changes style to blue
      ssh.replaceStyles(
        ['a { color: red; }'],
        ['a { color: blue; }'],
        [],
        [],
        /* isScoped */ false,
      );

      // Comp B must retain its red style while Comp A receives its new blue style
      expect(someHost.children.length).toBe(2);
      expect(someHost.innerHTML).toEqual(
        '<style>a { color: red; }</style><style>a { color: blue; }</style>',
      );
    });
    it('should not lose styles when style arrays overlap or shift positions', () => {
      ssh.addStyles(['a { color: red; }', 'b { color: red; }']);
      ssh.addHost(someHost);
      expect(someHost.children.length).toBe(2);

      ssh.replaceStyles(
        ['a { color: red; }', 'b { color: red; }'],
        ['b { color: red; }', 'c { color: red; }'],
      );

      expect(someHost.children.length).toBe(2);
      expect(someHost.innerHTML).toEqual(
        '<style>b { color: red; }</style><style>c { color: red; }</style>',
      );
    });
  });
});
