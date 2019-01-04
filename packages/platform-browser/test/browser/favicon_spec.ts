/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BrowserModule, Favicon} from '@angular/platform-browser';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {expect} from '@angular/platform-browser/testing/src/matchers';

{
  describe('favicon service', () => {
    let doc: Document;
    let initialFavicon: any;
    let faviconService: Favicon;
    const testFaviconUrl = 'test_favicon_url';

    beforeEach(() => {
      doc = getDOM().createHtmlDocument();
      initialFavicon = getDOM().querySelector(doc, 'link[rel*=\'icon\']');
      faviconService = new Favicon(doc);
    });

    it('should allow reading initial favicon', () => {
      if (!initialFavicon) {
        expect(faviconService.getFavicon()).toBeNull();
      } else {
        expect(faviconService.getFavicon().href).toEqual(initialFavicon.href);
      }
    });

    it('should set a favicon on the injected document', () => {
      faviconService.setFavicon(testFaviconUrl);
      let faviconHrefByDOM =
          getDOM().querySelector(doc, 'link[rel*=\'icon\']').href.split('/').pop();
      let faviconHrefByService = faviconService.getFavicon().href.split('/').pop();
      expect(faviconHrefByDOM).toEqual(testFaviconUrl);
      expect(faviconHrefByService).toEqual(testFaviconUrl);
    });
  });

  describe('integration test', () => {

    @Injectable()
    class DependsOnFavicon {
      constructor(public favicon: Favicon) {}
    }

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [BrowserModule],
        providers: [DependsOnFavicon],
      });
    });

    it('should inject Favicon service when using BrowserModule',
       () => { expect(TestBed.get(DependsOnFavicon).favicon).toBeAnInstanceOf(Favicon); });
  });
}
