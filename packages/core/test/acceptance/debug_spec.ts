/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {getLContext} from '@angular/core/src/render3/context_discovery';
import {LViewDebug} from '@angular/core/src/render3/instructions/lview_debug';
import {TNodeType} from '@angular/core/src/render3/interfaces/node';
import {HEADER_OFFSET} from '@angular/core/src/render3/interfaces/view';
import {TestBed} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {onlyInIvy} from '@angular/private/testing';

import {matchDomElement, matchDomText, matchTI18n, matchTNode} from '../render3/matchers';

onlyInIvy('Ivy specific').describe('Debug Representation', () => {
  it('should generate a human readable version', () => {
    @Component({selector: 'my-comp', template: '<div id="123">Hello World</div>'})
    class MyComponent {
    }

    TestBed.configureTestingModule({declarations: [MyComponent]});
    const fixture = TestBed.createComponent(MyComponent);
    fixture.detectChanges();

    const hostView = getLContext(fixture.componentInstance)!.lView.debug!;
    expect(hostView.hostHTML).toEqual(null);
    const myCompView = hostView.childViews[0] as LViewDebug;
    expect(myCompView.hostHTML).toContain('<div id="123">Hello World</div>');
    expect(myCompView.nodes![0].html).toEqual('<div id="123">');
    expect(myCompView.nodes![0].children![0].html).toEqual('Hello World');
  });

  describe('LViewDebug', () => {
    describe('range', () => {
      it('should show ranges', () => {
        @Component({selector: 'my-comp', template: '<div i18n>Hello {{name}}</div>'})
        class MyComponent {
          name = 'World';
        }

        TestBed.configureTestingModule({declarations: [MyComponent]});
        const fixture = TestBed.createComponent(MyComponent);
        fixture.detectChanges();

        const hostView = getLContext(fixture.componentInstance)!.lView.debug!;
        const myComponentView = hostView.childViews[0] as LViewDebug;
        expect(myComponentView.decls).toEqual({
          start: HEADER_OFFSET,
          end: HEADER_OFFSET + 2,
          length: 2,
          content: [
            {index: HEADER_OFFSET + 0, t: matchTNode({value: 'div'}), l: matchDomElement('div')},
            {index: HEADER_OFFSET + 1, t: matchTI18n(), l: null},
          ]
        });
        expect(myComponentView.vars).toEqual({
          start: HEADER_OFFSET + 2,
          end: HEADER_OFFSET + 3,
          length: 1,
          content: [{index: HEADER_OFFSET + 2, t: null, l: 'World'}]
        });
        expect(myComponentView.expando).toEqual({
          start: HEADER_OFFSET + 3,
          end: HEADER_OFFSET + 4,
          length: 1,
          content: [{
            index: HEADER_OFFSET + 3,
            t: matchTNode({type: TNodeType.Text, value: '{{?}}'}),
            l: matchDomText('Hello World')
          }]
        });
      });
    });
  });
});
