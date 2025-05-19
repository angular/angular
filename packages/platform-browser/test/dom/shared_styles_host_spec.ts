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

    it('should use the document head as default host', () => {
      ssh.addStyles(['a {};', 'b {};']);
      expect(doc.head).toHaveText('a {};b {};');
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

    it('should use the document head as default host', () => {
      ssh.addStyles([], ['component-1.css', 'component-2.css']);
      expect(doc.head.innerHTML).toContain('<link rel="stylesheet" href="component-1.css">');
      expect(doc.head.innerHTML).toContain('<link rel="stylesheet" href="component-2.css">');
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
  });
});
