/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, Input} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {VisibleDirective} from './visible.directive';

@Component({
  selector: 'ng-test',
  template: '<div class="target" [ngVisible]="visible"></div>',
  imports: [VisibleDirective],
})
class TestComponent {
  @Input() visible = false;
}

describe('VisibleDirective', () => {
  let targetEl: Element;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent, VisibleDirective],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    targetEl = fixture.debugElement.query(By.css('.target')).nativeElement;

    fixture.detectChanges();
  });

  it('should make the test component visible', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();

    expect(targetEl.hasAttribute('hidden')).toBeFalse();
  });

  it('should hide the test component', () => {
    fixture.componentRef.setInput('visible', false);
    fixture.detectChanges();

    expect(targetEl.hasAttribute('hidden')).toBeTrue();
  });
});
