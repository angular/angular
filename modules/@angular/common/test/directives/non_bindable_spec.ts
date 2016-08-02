/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive} from '@angular/core';
import {ElementRef} from '@angular/core/src/linker/element_ref';
import {TestComponentBuilder} from '@angular/core/testing';
import {AsyncTestCompleter, beforeEach, ddescribe, describe, iit, inject, it, xit} from '@angular/core/testing/testing_internal';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {expect} from '@angular/platform-browser/testing/matchers';

export function main() {
  describe('non-bindable', () => {
    it('should not interpolate children',
       inject(
           [TestComponentBuilder, AsyncTestCompleter],
           (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
             var template = '<div>{{text}}<span ngNonBindable>{{text}}</span></div>';
             tcb.overrideTemplate(TestComponent, template)
                 .createAsync(TestComponent)
                 .then((fixture) => {
                   fixture.detectChanges();
                   expect(fixture.debugElement.nativeElement).toHaveText('foo{{text}}');
                   async.done();
                 });
           }));

    it('should ignore directives on child nodes',
       inject(
           [TestComponentBuilder, AsyncTestCompleter],
           (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
             var template = '<div ngNonBindable><span id=child test-dec>{{text}}</span></div>';
             tcb.overrideTemplate(TestComponent, template)
                 .createAsync(TestComponent)
                 .then((fixture) => {
                   fixture.detectChanges();

                   // We must use getDOM().querySelector instead of fixture.query here
                   // since the elements inside are not compiled.
                   var span = getDOM().querySelector(fixture.debugElement.nativeElement, '#child');
                   expect(getDOM().hasClass(span, 'compiled')).toBeFalsy();
                   async.done();
                 });
           }));

    it('should trigger directives on the same node',
       inject(
           [TestComponentBuilder, AsyncTestCompleter],
           (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
             var template = '<div><span id=child ngNonBindable test-dec>{{text}}</span></div>';
             tcb.overrideTemplate(TestComponent, template)
                 .createAsync(TestComponent)
                 .then((fixture) => {
                   fixture.detectChanges();
                   var span = getDOM().querySelector(fixture.debugElement.nativeElement, '#child');
                   expect(getDOM().hasClass(span, 'compiled')).toBeTruthy();
                   async.done();
                 });
           }));
  });
}

@Directive({selector: '[test-dec]'})
class TestDirective {
  constructor(el: ElementRef) { getDOM().addClass(el.nativeElement, 'compiled'); }
}

@Component({selector: 'test-cmp', directives: [TestDirective], template: ''})
class TestComponent {
  text: string;
  constructor() { this.text = 'foo'; }
}
