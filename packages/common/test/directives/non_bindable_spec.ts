/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵgetDOM as getDOM} from '@angular/common';
import {Component, Directive} from '@angular/core';
import {ElementRef} from '@angular/core/src/linker/element_ref';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {hasClass} from '@angular/platform-browser/testing/src/browser_util';
import {expect} from '@angular/platform-browser/testing/src/matchers';

{
  describe('non-bindable', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [TestComponent, TestDirective],
      });
    });

    it('should not interpolate children', waitForAsync(() => {
         const template = '<div>{{text}}<span ngNonBindable>{{text}}</span></div>';
         const fixture = createTestComponent(template);

         fixture.detectChanges();
         expect(fixture.nativeElement).toHaveText('foo{{text}}');
       }));

    it('should ignore directives on child nodes', waitForAsync(() => {
         const template = '<div ngNonBindable><span id=child test-dec>{{text}}</span></div>';
         const fixture = createTestComponent(template);
         fixture.detectChanges();

         // We must use getDOM().querySelector instead of fixture.query here
         // since the elements inside are not compiled.
         const span = fixture.nativeElement.querySelector('#child');
         expect(hasClass(span, 'compiled')).toBeFalsy();
       }));

    it('should trigger directives on the same node', waitForAsync(() => {
         const template = '<div><span id=child ngNonBindable test-dec>{{text}}</span></div>';
         const fixture = createTestComponent(template);
         fixture.detectChanges();
         const span = fixture.nativeElement.querySelector('#child');
         expect(hasClass(span, 'compiled')).toBeTruthy();
       }));
  });
}

@Directive({selector: '[test-dec]'})
class TestDirective {
  constructor(el: ElementRef) {
    el.nativeElement.classList.add('compiled');
  }
}

@Component({selector: 'test-cmp', template: ''})
class TestComponent {
  text: string;
  constructor() {
    this.text = 'foo';
  }
}

function createTestComponent(template: string): ComponentFixture<TestComponent> {
  return TestBed.overrideComponent(TestComponent, {set: {template: template}})
      .createComponent(TestComponent);
}
