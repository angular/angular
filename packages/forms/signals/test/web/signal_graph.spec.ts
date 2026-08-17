/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, signal, ɵgetSignalGraph as getSignalGraph} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {form, FormField, required} from '../../public_api';

describe('Signal Forms DevTools signal graph', () => {
  it('should mark internal forms signals as private in getSignalGraph for component and directive injectors', async () => {
    @Component({
      standalone: true,
      imports: [FormField],
      template: `
        <div>
          <input [formField]="f.name" />
          <span>{{ f.name().errors().length }}</span>
          <span>{{ f.name().valid() }}</span>
          <span>{{ f.name().dirty() }}</span>
          <span>{{ f.name().touched() }}</span>
          <span>{{ f.name().disabled() }}</span>
        </div>
      `,
    })
    class TestCmp {
      readonly model = signal({name: ''}, {debugName: 'model'});
      readonly f = form(this.model, (s) => {
        required(s.name);
      });
    }

    const fixture = TestBed.createComponent(TestCmp);
    await fixture.whenStable();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = 'test';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    const compInjector = fixture.componentRef.injector;
    const compGraph = getSignalGraph(compInjector);

    const inputDebugEl = fixture.debugElement.query(By.css('input'));
    const inputInjector = inputDebugEl.injector;
    const inputGraph = getSignalGraph(inputInjector);

    const checkNoInternalSignals = (graph: any, injectorLabel: string) => {
      const nonPrivateNodes = graph.nodes.filter((n: any) => !n.isPrivate);
      const nonPrivateLabels = nonPrivateNodes
        .map((n: any) => n.label || (n.debuggableFn ? n.debuggableFn.toString() : n.kind));

      const expectedPrivateInternalSignals = [
        'parseErrors',
        'rawSyncTreeErrors',
        'syncTreeErrors',
        'rawAsyncErrors',
        'asyncErrors',
        'selfTouched',
        'selfDirty',
        'isNonInteractive',
        'keyOrOrphan',
        'isOrphaned',
        'pathKeys',
        'reader',
        'shouldSkipValidation',
      ];

      for (const internalName of expectedPrivateInternalSignals) {
        expect(nonPrivateLabels).not.toContain(
          internalName,
          `Expected internal signal '${internalName}' to be marked as private in DevTools signal graph for ${injectorLabel}, but it was public.`,
        );
      }
    };

    checkNoInternalSignals(compGraph, 'Component Injector');
    checkNoInternalSignals(inputGraph, 'Input Directive Injector');

    // For the component graph, public signals consumed by the template (like errors, valid, dirty, touched, disabled)
    // should appear as non-private computed nodes in addition to the template consumer itself.
    const compNonPrivate = compGraph.nodes.filter((n: any) => !n.isPrivate);
    const compComputedNonPrivate = compNonPrivate.filter((n: any) => n.kind === 'computed');
    expect(compComputedNonPrivate.length).toBeGreaterThan(
      0,
    );

    // For the input directive graph, all internal effects and signals should remain private
    const inputNonPrivate = inputGraph.nodes.filter((n: any) => !n.isPrivate);
    expect(inputNonPrivate.length).toBe(0);
  });
});
