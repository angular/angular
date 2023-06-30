/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {USE_TEMPLATE_PIPELINE} from '@angular/compiler/src/template/pipeline/switch/index';
import {Component, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';

if (!USE_TEMPLATE_PIPELINE) {
  console.error(
      'ERROR: Cannot run this test target without: --//packages/compiler:use_template_pipeline');
  process.exit(1);
}

describe('Signal component DOM property interpolations', () => {
  it('should bind interpolated values', () => {
    @Component({
      signals: true,
      template: `<div title="Hello, {{name()}}!"></div>`,
      standalone: true,
    })
    class App {
      name = signal('Angular');
    }

    const fixture = TestBed.createComponent(App);
    const div = fixture.nativeElement.firstChild;

    fixture.detectChanges();

    expect(div.title).toBe('Hello, Angular!');
  });

  it('should support updating values', () => {
    @Component({
      signals: true,
      template: `<div title="Hello, {{name()}}!"></div>`,
      standalone: true,
    })
    class App {
      name = signal('Angular');
    }

    const fixture = TestBed.createComponent(App);
    const div = fixture.nativeElement.firstChild;

    fixture.detectChanges();

    expect(div.title).toBe('Hello, Angular!');

    fixture.componentInstance.name.set('New Name');
    fixture.detectChanges();

    expect(div.title).toBe('Hello, New Name!');
  });
});
