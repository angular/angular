/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {provideLocationMocks} from '@angular/common/testing';
import {Component} from '@angular/core';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';

import {provideRouter, Router, withRouterConfig} from '@angular/router';

describe('metadata strategy', () => {
  describe('DefaultMetadataStrategy', () => {
    let router: Router;
    let document: Document;

    function getMetaHTML() {
      return Array.from(document.head.querySelectorAll('meta'))
        .map((el) => el.outerHTML)
        .join('');
    }

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [],
        providers: [
          provideLocationMocks(),
          provideRouter([], withRouterConfig({paramsInheritanceStrategy: 'always'})),
        ],
      });
      router = TestBed.inject(Router);
      document = TestBed.inject(DOCUMENT);
      document.head.innerHTML = '';
    });

    it('sets page metadata from data', fakeAsync(() => {
      router.resetConfig([{path: 'home', metadata: [{name: 'foo'}], component: BlankCmp}]);
      router.navigateByUrl('home');
      tick();
      expect(getMetaHTML()).toBe(`<meta name="foo">`);
    }));

    it('sets page metadata from resolved data function', fakeAsync(() => {
      router.resetConfig([{path: 'home', metadata: () => [{name: 'foo'}], component: BlankCmp}]);
      router.navigateByUrl('home');
      tick();
      expect(getMetaHTML()).toBe(`<meta name="foo">`);
    }));

    it('merges metadata correctly', fakeAsync(() => {
      router.resetConfig([
        {
          path: 'home',
          metadata: [{charset: 'utf-8'}],
          children: [
            {path: '', metadata: [{property: 'og:title', content: 'bar'}], component: BlankCmp},
          ],
        },
      ]);
      router.navigateByUrl('home');
      tick();
      expect(getMetaHTML()).toBe(`<meta charset="utf-8"><meta property="og:title" content="bar">`);

      router.resetConfig([
        {
          path: 'home',
          metadata: [
            {charset: 'root'},
            {name: 'name-1', content: 'root'},
            {name: 'name-2', content: 'root'},
            {httpEquiv: 'pragma-1', content: 'root'},
            {httpEquiv: 'pragma-2', content: 'root'},
            {itemprop: 'itemprop-1', content: 'root'},
            {itemprop: 'itemprop-2', content: 'root'},
            {property: 'property-1', content: 'root'},
            {property: 'property-2', content: 'root'},
          ],
          children: [
            {
              path: '',
              metadata: [
                {charset: 'child'},
                {name: 'name-2', content: 'child'},
                {name: 'name-3', content: 'child'},
                {httpEquiv: 'pragma-2', content: 'child'},
                {httpEquiv: 'pragma-3', content: 'child'},
                {itemprop: 'itemprop-2', content: 'child'},
                {itemprop: 'itemprop-3', content: 'child'},
                {property: 'property-2', content: 'child'},
                {property: 'property-3', content: 'child'},
              ],
              component: BlankCmp,
            },
          ],
        },
      ]);
      router.navigateByUrl('home');
      tick();
      expect(getMetaHTML()).toBe(
        `<meta charset="child"><meta name="name-1" content="root"><meta name="name-2" content="child"><meta http-equiv="pragma-1" content="root"><meta http-equiv="pragma-2" content="child"><meta itemprop="itemprop-1" content="root"><meta itemprop="itemprop-2" content="child"><meta property="property-1" content="root"><meta property="property-2" content="child"><meta name="name-3" content="child"><meta http-equiv="pragma-3" content="child"><meta itemprop="itemprop-3" content="child"><meta property="property-3" content="child">`,
      );
    }));
  });
});

@Component({template: '', standalone: true})
export class BlankCmp {}
