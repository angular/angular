/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {form, isFieldTree} from '../../public_api';

describe('assertions', () => {
  it('should detect field trees', () => {
    @Component({template: ''})
    class App {
      readonly form = form(
        signal({
          firstName: 'Frodo',
          lastName: 'Baggins',
        }),
      );
    }

    const fixture = TestBed.createComponent(App);
    const tree = fixture.componentInstance.form;
    expect(isFieldTree(tree)).toBe(true);
    expect(isFieldTree(tree().fieldTree)).toBe(true);
  });

  it('should distinguish non-field-tree values from field trees', () => {
    expect(isFieldTree(true)).toBe(false);
    expect(isFieldTree(1)).toBe(false);
    expect(isFieldTree({})).toBe(false);
    expect(isFieldTree(() => 123)).toBe(false);
    expect(isFieldTree(null)).toBe(false);
    expect(isFieldTree(undefined)).toBe(false);
    expect(isFieldTree(signal(1))).toBe(false);
  });
});
