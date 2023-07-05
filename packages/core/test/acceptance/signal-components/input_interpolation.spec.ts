/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {USE_TEMPLATE_PIPELINE} from '@angular/compiler/src/template/pipeline/switch/index';
import {Component, input, Input, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';

if (!USE_TEMPLATE_PIPELINE) {
  console.error(
      'ERROR: Cannot run this test target without: --//packages/compiler:use_template_pipeline');
  process.exit(1);
}

describe('Signal component input interpolations', () => {
  @Component({
    selector: 'print',
    signals: true,
    template: `{{text()}}`,
    standalone: true,
  })
  class Print {
    @Input() text = input('');
  }

  it('should bind interpolated values', () => {
    @Component({
      signals: true,
      template: `<print text="Hello, {{name()}}!">`,
      imports: [Print],
      standalone: true,
    })
    class App {
      name = signal('Angular');
    }

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('Hello, Angular!');
  });

  it('should allow updating interpolated values', () => {
    @Component({
      signals: true,
      template: `<print text="Hello, {{name()}}!">`,
      imports: [Print],
      standalone: true,
    })
    class App {
      name = signal('Angular');
    }

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('Hello, Angular!');

    fixture.componentInstance.name.set('New Name');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('Hello, New Name!');
  });
});
