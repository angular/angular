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
import {FormsModule} from '@angular/forms';

export function main() {
  describe('range value accessor', () => {
    let fixture: ComponentFixture<any>;

    function getComponent(): TestComponent { return fixture.componentInstance; }

    afterEach(() => { fixture = null; });

    beforeEach(() => {
      TestBed.configureTestingModule(
          {declarations: [TestComponent], imports: [CommonModule, FormsModule]});
    });

    it('should add styles specified in an object literal', async(() => {
         const template = `<input type="range" [(ngModel)]="val">`;
         fixture = createTestComponent(template);
         fixture.nativeElement.value = '2';
         expect(typeof(fixture.componentInstance.val)).toBe('number');
       }));

  });
}

@Component({selector: 'test-cmp', template: ''})
class TestComponent {
  val: any;
}

function createTestComponent(template: string): ComponentFixture<TestComponent> {
  return TestBed.overrideComponent(TestComponent, {set: {template: template}})
      .createComponent(TestComponent);
}
