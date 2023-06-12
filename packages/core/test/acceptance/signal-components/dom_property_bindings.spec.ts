/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {USE_TEMPLATE_PIPELINE} from '@angular/compiler/src/template/pipeline/switch';
import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';

if (!USE_TEMPLATE_PIPELINE) {
  console.error(
      'ERROR: Cannot run this test target without: --//packages/compiler:use_template_pipeline');
  process.exit(1);
}

describe('dom property bindings in signal based components', () => {
  // TODO: this test should be passing but currently it doesn't since we are not propagating `vars`
  it('should bind to mapped property names', () => {
    @Component({
      signals: true,
      template: `<div [tabindex]="5"></div>`,
      standalone: true,
    })
    class App {
    }

    const fixture = TestBed.createComponent(App);
    const div = fixture.nativeElement.firstChild;

    fixture.detectChanges();
    expect(div.tabIndex).toBe(5);
  });
});
