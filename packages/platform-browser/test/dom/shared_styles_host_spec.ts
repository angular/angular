/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵgetDOM as getDOM} from '@angular/common';
import {SharedStylesHost} from '@angular/platform-browser/src/dom/shared_styles_host';
import {expect} from '@angular/platform-browser/testing/src/matchers';

{
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
  });
}
