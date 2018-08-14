/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {Component, EventEmitter, WrappedValue} from '@angular/core';
import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {By} from '@angular/platform-browser/src/dom/debug/by';
import {expect} from '@angular/platform-browser/testing/src/matchers';

{
  describe('ngLet  directive', () => {
    let fixture: ComponentFixture<any>;

    function getComponent(): TestComponent { return fixture.componentInstance; }

    afterEach(() => { fixture = null !; });

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [TestComponent],
        imports: [CommonModule],
      });
    });

    it('should work in a template attribute', async(() => {
         const template = '<span *ngLet="booleanCondition">hello</span>';
         fixture = createTestComponent(template);
         fixture.detectChanges();
         expect(fixture.debugElement.queryAll(By.css('span')).length).toEqual(1);
         expect(fixture.nativeElement).toHaveText('hello');
       }));

    it('should work on a template element', async(() => {
         const template = '<ng-template [ngLet]="booleanCondition">hello2</ng-template>';
         fixture = createTestComponent(template);
         fixture.detectChanges();
         expect(fixture.nativeElement).toHaveText('hello2');
       }));

    it('should support binding to observable using as', async(() => {
         const template = '<span *ngLet="observableStringValue | async as val">{{val}}</span>';
         fixture = createTestComponent(template);
         fixture.detectChanges();
         expect(fixture.debugElement.queryAll(By.css('span')).length).toEqual(1);
         expect(fixture.nativeElement).toHaveText('');

         getComponent().observableStringValue.emit('some string');
         fixture.detectChanges();
         expect(fixture.nativeElement).toHaveText('some string');
       }));

    it('should support binding to variable using as', async(() => {
         const template = '<span *ngLet="stringValue as val">{{val}}</span>';
         fixture = createTestComponent(template);
         fixture.detectChanges();
         expect(fixture.debugElement.queryAll(By.css('span')).length).toEqual(1);
         expect(fixture.nativeElement).toHaveText('some string');
       }));

    it('should support binding to variable using let', async(() => {
         const template = '<span *ngLet="stringValue; let v">{{v}}</span>' +
             '<ng-template #elseBlock let-v>{{v}}</ng-template>';

         fixture = createTestComponent(template);

         fixture.detectChanges();
         expect(fixture.nativeElement).toHaveText('some string');

         getComponent().stringValue = 'some other string';
         fixture.detectChanges();
         expect(fixture.nativeElement).toHaveText('some other string');
       }));
  });
}

@Component({selector: 'test-cmp', template: ''})
class TestComponent {
  booleanValue: boolean = true;
  stringValue: string = 'some string';
  observableStringValue: EventEmitter<any> = new EventEmitter();
}

function createTestComponent(template: string): ComponentFixture<TestComponent> {
  return TestBed.overrideComponent(TestComponent, {set: {template: template}})
      .createComponent(TestComponent);
}
