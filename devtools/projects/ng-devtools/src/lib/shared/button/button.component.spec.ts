/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ButtonComponent} from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;
  let element: Element;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    element = fixture.debugElement.nativeElement;
    fixture.detectChanges();
  });

  it('should be primary type by default', () => {
    expect(component.btnType()).toEqual('primary');
    expect(element.classList.contains('type-primary')).toBeTrue();
  });

  it('should be standard size by default', () => {
    expect(component.size()).toEqual('standard');
    expect(element.classList.contains('size-compact')).toBeFalse();
  });

  it('should be compact size', () => {
    fixture.componentRef.setInput('size', 'compact');
    fixture.detectChanges();

    expect(element.classList.contains('size-compact')).toBeTrue();
  });
});
