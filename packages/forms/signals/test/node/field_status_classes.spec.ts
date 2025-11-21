/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {
  Field,
  FIELD_STATUS_CLASSES,
  FieldStatusClasses,
  form,
  validate,
} from '@angular/forms/signals';

describe('Field Status Classes', () => {
  it('should not apply classes when token is not provided', () => {
    @Component({
      template: '<input [field]="control">',
      imports: [Field],
    })
    class TestComponent {
      control = form(signal(''));
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    expect(input.className).toBe('');
  });

  it('should apply custom valid class', () => {
    const customClasses: FieldStatusClasses = {
      valid: 'border-green-500',
      invalid: 'border-red-500',
    };

    @Component({
      template: '<input [field]="control">',
      imports: [Field],
      providers: [{provide: FIELD_STATUS_CLASSES, useValue: customClasses}],
    })
    class TestComponent {
      control = form(signal('value'));
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    expect(input.className).toContain('border-green-500');
    expect(input.className).not.toContain('border-red-500');
  });

  it('should apply custom invalid class', () => {
    const customClasses: FieldStatusClasses = {
      valid: 'border-green-500',
      invalid: 'border-red-500',
    };

    @Component({
      template: '<input [field]="control">',
      imports: [Field],
      providers: [{provide: FIELD_STATUS_CLASSES, useValue: customClasses}],
    })
    class TestComponent {
      control = form(signal(''), (p) => {
        validate(p, () => ({kind: 'error', message: 'Invalid'}));
      });
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    expect(input.className).toContain('border-red-500');
    expect(input.className).not.toContain('border-green-500');
  });

  it('should apply multiple status classes', () => {
    const customClasses: FieldStatusClasses = {
      pristine: 'pristine-class',
      untouched: 'untouched-class',
      valid: 'valid-class',
    };

    @Component({
      template: '<input [field]="control">',
      imports: [Field],
      providers: [{provide: FIELD_STATUS_CLASSES, useValue: customClasses}],
    })
    class TestComponent {
      control = form(signal('value'));
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    expect(input.className).toContain('pristine-class');
    expect(input.className).toContain('untouched-class');
    expect(input.className).toContain('valid-class');
  });

  it('should update classes when status changes', () => {
    const customClasses: FieldStatusClasses = {
      pristine: 'pristine-class',
      dirty: 'dirty-class',
    };

    @Component({
      template: '<input [field]="control">',
      imports: [Field],
      providers: [{provide: FIELD_STATUS_CLASSES, useValue: customClasses}],
    })
    class TestComponent {
      control = form(signal(''));
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    expect(input.className).toContain('pristine-class');
    expect(input.className).not.toContain('dirty-class');

    // Explicitly mark as dirty
    fixture.componentInstance.control().markAsDirty();
    fixture.detectChanges();

    expect(input.className).not.toContain('pristine-class');
    expect(input.className).toContain('dirty-class');
  });
});
