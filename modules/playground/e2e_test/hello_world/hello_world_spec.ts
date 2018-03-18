/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {verifyNoBrowserErrors} from 'e2e_util/e2e_util';
import {browser} from 'protractor';

describe('hello world', function() {

  afterEach(verifyNoBrowserErrors);

  describe('hello world app', function() {
    const URL = 'all/playground/src/hello_world/index.html';

    it('should greet', function() {
      browser.get(URL);

      expect(getComponentText('hello-app', '.greeting')).toEqual('hello world!');
    });

    it('should change greeting', function() {
      browser.get(URL);

      clickComponentButton('hello-app', '.changeButton');
      expect(getComponentText('hello-app', '.greeting')).toEqual('howdy world!');
    });

    it('should handle HostListener window:click', function() {
      browser.get(URL);
      clickBody();
      clickComponentText('hello-app', '.greeting');

      // HostListener was registered as 'outsideOfAngular', so dom will not refresh
      expect(getComponentText('hello-app', '.windowZone')).toEqual('window click zone: ');
      expect(getComponentText('hello-app', '.compZone')).toEqual('Hello Component click zone: ');
      // refresh by click button
      clickComponentButton('hello-app', '.changeButton');
      expect(getComponentText('hello-app', '.windowZone')).toEqual('window click zone: <root>');
      expect(getComponentText('hello-app', '.compZone'))
          .toEqual('Hello Component click zone: <root>');
      clickComponentButton('hello-app', '.changeButton');
      expect(getComponentText('hello-app', '.windowZone')).toEqual('');
      clickComponentText('hello-app', '.divZone');
      expect(getComponentText('hello-app', '.windowZone')).toEqual('window click zone: <root>');
      expect(getComponentText('hello-app', '.divZone')).toEqual('div click zone: <root>');
      clickComponentButton('hello-app', '.changeButton');
      clickComponentText('hello-app', '.divZone');
      expect(getComponentText('hello-app', '.divZone')).toEqual('');
      expect(getComponentText('hello-app', '.windowZone')).toEqual('');
    });
  });

});

function getComponentText(selector: string, innerSelector: string) {
  return browser.executeScript(
      `return document.querySelector("${selector}").querySelector("${innerSelector}").textContent`);
}

function clickComponentButton(selector: string, innerSelector: string) {
  return browser.executeScript(
      `return document.querySelector("${selector}").querySelector("${innerSelector}").click()`);
}

function clickBody() {
  return browser.executeScript(`return document.body.click()`);
}

function clickComponentText(selector: string, innerSelector: string) {
  return browser.executeScript(
      `return document.querySelector("${selector}").querySelector("${innerSelector}").click()`);
}
