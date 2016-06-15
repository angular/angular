import {Component, disposePlatform} from '@angular/core';
import {afterEach, async, beforeEach, ddescribe, describe, expect, iit, inject, it, xdescribe, xit} from '@angular/core/testing';
import {BROWSER_APP_PROVIDERS} from '@angular/platform-browser';
import {BROWSER_APP_COMPILER_PROVIDERS} from '@angular/platform-browser-dynamic';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {serverBootstrap} from '@angular/platform-server';

function writeBody(html: string): any {
  var dom = getDOM();
  var doc = dom.defaultDoc();
  var body = dom.querySelector(doc, 'body');
  dom.setInnerHTML(body, html);
  return body;
}

export function main() {
  if (getDOM().supportsDOMEvents()) return;  // NODE only

  describe('platform-server integration', () => {

    afterEach(() => disposePlatform());

    it('should bootstrap', async(() => {
         var body = writeBody('<app></app>');
         serverBootstrap(MyServerApp, [
           BROWSER_APP_PROVIDERS, BROWSER_APP_COMPILER_PROVIDERS
         ]).then(() => { expect(getDOM().getText(body)).toEqual('Works!'); });
       }));
  });
}

@Component({selector: 'app', template: `Works!`})
class MyServerApp {
}
