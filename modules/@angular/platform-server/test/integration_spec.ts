/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule, destroyPlatform} from '@angular/core';
import {async} from '@angular/core/testing';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {ServerModule, platformDynamicServer} from '@angular/platform-server';

function writeBody(html: string): any {
  var dom = getDOM();
  var doc = dom.defaultDoc();
  var body = dom.querySelector(doc, 'body');
  dom.setInnerHTML(body, html);
  return body;
}


@Component({selector: 'app', template: `Works!`})
class MyServerApp {
}

@NgModule({declarations: [MyServerApp], imports: [ServerModule], bootstrap: [MyServerApp]})
class ExampleModule {
}

export function main() {
  if (getDOM().supportsDOMEvents()) return;  // NODE only

  describe('platform-server integration', () => {

    beforeEach(() => destroyPlatform());
    afterEach(() => destroyPlatform());

    it('should bootstrap', async(() => {
         var body = writeBody('<app></app>');
         platformDynamicServer().bootstrapModule(ExampleModule).then(() => {
           expect(getDOM().getText(body)).toEqual('Works!');
         });
       }));
  });
}
