/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgIf} from '@angular/common';
import {Component, Directive, Input} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {expect} from '@angular/private/testing/matchers';

describe('integration tests', () => {
  describe('directives', () => {
    it('should support dotted selectors', async () => {
      @Directive({
        selector: '[dot.name]',
      })
      class MyDir {
        @Input('dot.name') value!: string;
      }

      @Component({
        imports: [MyDir],
        template: `<div [dot.name]="'foo'"></div>`,
      })
      class TestComponent {}

      const fixture = TestBed.createComponent(TestComponent);
      await fixture.whenStable();
      const myDir = fixture.debugElement.query(By.directive(MyDir)).injector.get(MyDir);
      expect(myDir.value).toEqual('foo');
    });
  });

  describe('ng-container', () => {
    it('should work regardless the namespace', () => {
      @Component({
        imports: [NgIf],
        template:
          '<svg><ng-container *ngIf="1"><rect x="10" y="10" width="30" height="30"></rect></ng-container></svg>',
      })
      class MyCmp {}

      const f = TestBed.createComponent(MyCmp);
      f.detectChanges();

      expect(f.nativeElement.children[0].children[0].tagName).toEqual('rect');
    });
  });
});
