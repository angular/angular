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

    beforeEach(() => {
      doc = getDOM().createHtmlDocument();
      initialFavicon = getDOM().querySelector(doc, 'link[rel*=\'icon\']');
      faviconService = new Favicon(doc);
    });

    afterEach(() => {
      const link = getDOM().querySelector(this._doc, 'link[rel*=\'icon\']') ||
          document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = initialFavicon.href;
      getDOM().getElementsByTagName(this._doc, 'head')[0].appendChild(link);
    });

    it('should allow reading initial favicon',
       () => { expect(faviconService.getFavicon().href).toEqual(initialFavicon.href); });

    it('should set a favicon on the injected document', () => {
      faviconService.setFavicon('test favicon url');
      expect(getDOM().querySelector(doc, 'link[rel*=\'icon\']').href).toEqual('test favicon url');
      expect(faviconService.getFavicon().href).toEqual('test favicon url');
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
       () => { expect(TestBed.get(DependsOnFavicon).title).toBeAnInstanceOf(Favicon); });
  });
}
