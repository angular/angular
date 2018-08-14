/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {By} from '@angular/platform-browser/src/dom/debug/by';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {expect} from '@angular/platform-browser/testing/src/matchers';

{
  describe('ngLet directive', () => {
    let fixture: ComponentFixture<any>;

    function getComponent(): TestComponent { return fixture.componentInstance; }

    afterEach(() => { fixture = null !; });

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [TestComponent],
        imports: [CommonModule],
      });
    });

    it('should support binding to variable using let', async(() => {
         const template = '<span *ngLet="booleanCondition let v">{{v}}</span>';

         fixture = createTestComponent(template);

         fixture.detectChanges();
         expect(fixture.nativeElement).toHaveText('true');

         getComponent().booleanCondition = false;
         fixture.detectChanges();
         expect(fixture.nativeElement).toHaveText('false');
       }));

    it('should support binding to variable using as', async(() => {
         const template = '<span *ngLet="booleanCondition as v">{{v}}</span>';

         fixture = createTestComponent(template);

         fixture.detectChanges();
         expect(fixture.nativeElement).toHaveText('true');

         getComponent().booleanCondition = false;
         fixture.detectChanges();
         expect(fixture.nativeElement).toHaveText('false');
       }));
  });
}

@Component({selector: 'test-cmp', template: ''})
class TestComponent {
  booleanCondition: boolean = true;
}

function createTestComponent(template: string): ComponentFixture<TestComponent> {
  return TestBed.overrideComponent(TestComponent, {set: {template: template}})
      .createComponent(TestComponent);
}
