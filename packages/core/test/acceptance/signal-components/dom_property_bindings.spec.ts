/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {USE_TEMPLATE_PIPELINE} from '@angular/compiler/src/template/pipeline/switch';
import {Component, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';

if (!USE_TEMPLATE_PIPELINE) {
  console.error(
      'ERROR: Cannot run this test target without: --//packages/compiler:use_template_pipeline');
  process.exit(1);
}

describe('dom property bindings in signal based components', () => {
  it('should bind to mapped property names', () => {
    @Component({
      signals: true,
      template: `<div [tabindex]="tIdx()"></div>`,
      standalone: true,
    })
    class App {
      tIdx = signal(5);
    }

    const fixture = TestBed.createComponent(App);
    const div = fixture.nativeElement.firstChild;

    fixture.detectChanges();
    expect(div.tabIndex).toBe(5);
  });

  it('should not update DOM binding if a binding is not reactive', () => {
    @Component({
      signals: true,
      template: `<div [tabindex]="nonReactive()">{{unrelated()}}</div>`,
      standalone: true,
    })
    class App {
      idx = 0;
      nonReactive() {
        return this.idx++;
      }
      unrelated = signal('foo');
    }

    const fixture = TestBed.createComponent(App);
    const cmpInstance = fixture.componentInstance;
    const div = fixture.nativeElement.firstChild;

    fixture.detectChanges();
    expect(div.tabIndex).toBe(0);

    cmpInstance.unrelated.set('bar');
    fixture.detectChanges();
    expect(div.tabIndex).toBe(0);
  });
});
