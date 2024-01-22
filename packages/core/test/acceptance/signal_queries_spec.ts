/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ViewChild} from '@angular/core';
import {viewChild} from '@angular/core/src/authoring/queries';
import {getComponentDef} from '@angular/core/src/render3/definition';

describe('signal queries', () => {
  it('should work', () => {
    @Component({standalone: true, template: '<span #ref>Works</span>'})
    class TestCmp {
      @ViewChild('ref', {isSignal: true} as any) el = viewChild.required<HTMLSpanElement>('ref');
    }

    // TODO: Add actual test. We don't have any runtime logic right now, so assert JIT output.
    expect(((getComponentDef(TestCmp)!) as any).viewQuery.toString())
        .toContain(`jit___viewQuerySignal`);
  });
});
