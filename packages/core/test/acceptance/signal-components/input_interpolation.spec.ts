/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {USE_TEMPLATE_PIPELINE} from '@angular/compiler/src/template/pipeline/switch/index';
import {Component, input, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';

import {Input} from '../../../src/metadata';


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

  // TODO: compiler needs to generate the ɵɵpropertyInterpolationCreate instruction
  xit('should bind interpolated values', () => {
    @Component({
      signals: true,
      template: `<print text="a{{1}}b{{2}}c{{3}}d{{4}}e{{5}}f{{6}}g{{7}}h{{8}}i{{9}}j"></print>`,
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
});
