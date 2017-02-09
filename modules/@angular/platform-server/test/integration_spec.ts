/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule, destroyPlatform} from '@angular/core';
import {PlatformLocation} from '@angular/common';
import {async} from '@angular/core/testing';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {ServerModule, platformDynamicServer} from '@angular/platform-server';

function writeBody(html: string): any {
  const dom = getDOM();
  const doc = dom.defaultDoc();
  const body = dom.querySelector(doc, 'body');
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

  fdescribe('platform-server integration', () => {

    beforeEach(() => destroyPlatform());
    afterEach(() => destroyPlatform());

    it('should bootstrap', async(() => {
         const body = writeBody('<app></app>');
         platformDynamicServer().bootstrapModule(ExampleModule).then(() => {
           expect(getDOM().getText(body)).toEqual('Works!');
         });
       }));
    
    describe('PlatformLocation', () => {
      it('is injectable', () => {
        const body = writeBody('<app></app>');
        platformDynamicServer().bootstrapModule(ExampleModule).then(appRef => {
          const location: PlatformLocation = appRef.injector.get(PlatformLocation);
          expect(location.pathname).toBe('/');
        });
      });
      it('pushState causes the URL to update', () => {
        const body = writeBody('<app></app>');
        platformDynamicServer().bootstrapModule(ExampleModule).then(appRef => {
          const location: PlatformLocation = appRef.injector.get(PlatformLocation);
          location.pushState(null, 'Test', '/foo#bar');
          expect(location.pathname).toBe('/foo');
          expect(location.hash).toBe('#bar');
        });
      });
      it('allows subscription to the hash state', done => {
        const body = writeBody('<app></app>');
        platformDynamicServer().bootstrapModule(ExampleModule).then(appRef => {
          const location: PlatformLocation = appRef.injector.get(PlatformLocation);
          expect(location.pathname).toBe('/');
          location.onHashChange((e: any) => {
            expect(e.type).toBe('hashchange');
            expect(e.oldUrl).toBe('/');
            expect(e.newUrl).toBe('/foo#bar');
            done();
          });
          location.pushState(null, 'Test', '/foo#bar');
        });
      });
    });
  });
}
