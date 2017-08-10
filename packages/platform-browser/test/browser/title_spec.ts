/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BrowserModule, Title} from '@angular/platform-browser';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {expect} from '@angular/platform-browser/testing/src/matchers';

export function main() {
  describe('title service', () => {
    const doc = getDOM().createHtmlDocument();
    const initialTitle = getDOM().getTitle(doc);
    const titleService = new Title(doc);

    afterEach(() => { getDOM().setTitle(doc, initialTitle); });

    it('should allow reading initial title',
       () => { expect(titleService.getTitle()).toEqual(initialTitle); });

    it('should set a title on the injected document', () => {
      titleService.setTitle('test title');
      expect(getDOM().getTitle(doc)).toEqual('test title');
      expect(titleService.getTitle()).toEqual('test title');
    });

    it('should reset title to empty string if title not provided', () => {
      titleService.setTitle(null !);
      expect(getDOM().getTitle(doc)).toEqual('');
    });
  });

  describe('integration test', () => {

    @Injectable()
    class DependsOnTitle {
      constructor(public title: Title) {}
    }

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [BrowserModule],
        providers: [DependsOnTitle],
      });
    });

    it('should inject Title service when using BrowserModule',
       () => { expect(TestBed.get(DependsOnTitle).title).toBeAnInstanceOf(Title); });
  });
}
