/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, Input} from '@angular/core';
import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {By} from '@angular/platform-browser/src/dom/debug/by';
import {expect} from '@angular/platform-browser/testing/matchers';

export function main() {
  describe('integration tests', () => {
    let fixture: ComponentFixture<TestComponent>;


    describe('directives', () => {
      it('should support dotted selectors', async(() => {
           @Directive({selector: '[dot.name]'})
           class MyDir {
             @Input('dot.name') value: string;
           }

           TestBed.configureTestingModule({
             declarations: [
               MyDir,
               TestComponent,
             ],
           });

           const template = `<div [dot.name]="'foo'"></div>`;
           fixture = createTestComponent(template);
           fixture.detectChanges();
           const myDir = fixture.debugElement.query(By.directive(MyDir)).injector.get(MyDir);
           expect(myDir.value).toEqual('foo');
         }));
    });

    it('should support shorthand property names in literal bindings', async(() => {
         @Component({
           selector: 'cmp',
           template: '<div>{{value.prop1}}-{{value.prop2}}-{{value.prop3}}-{{value.prop4}}</div>'
         })
         class SomeComponent {
           @Input() value: any;
         }

         TestBed.configureTestingModule({
           declarations: [
             SomeComponent,
             TestComponent,
           ],
         });

         const template = `<cmp [value]="{prop1: 'value1', prop2, prop3, prop4: prop4}"></cmp>`;
         fixture = createTestComponent(template);
         fixture.detectChanges();
         const div = fixture.debugElement.query(By.css('div')).nativeElement;
         expect(div).toHaveText('value1-value2-value3-value4');
       }));

  });
}

@Component({selector: 'test-cmp', template: ''})
class TestComponent {
  prop2 = 'value2';
  prop3 = 'value3';
  prop4 = 'value4';
}

function createTestComponent(template: string): ComponentFixture<TestComponent> {
  return TestBed.overrideComponent(TestComponent, {set: {template: template}})
      .createComponent(TestComponent);
}
