/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {absoluteFrom as _, AbsoluteFsPath, getSourceFileOrError} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {TypeScriptReflectionHost} from '../../reflection';
import {makeProgram} from '../../testing';
import {TelemetryScope} from '../src/api';
import {recordNodeTelemetry} from '../src/node_telemetry';

runInEachFileSystem(() => {
  describe('function call telemetry', () => {
    it('does not initialize telemetry when there is no data to record', () => {
      const {program} = makeProgram([
        {
          name: _('/entry.ts'),
          contents: `
          export declare function inject(): void;
          export declare function signal(): void;
          export declare function computed(): void;
          export declare function effect(): void;

          inject();
          signal();
          computed();
          effect();
          `,
        },
      ]);

      const telemetry = recordTelemetry(program, _('/entry.ts'));
      expect(telemetry).toBeNull();
    });

    it('gathers telemetry of function usages', () => {
      const {program} = makeProgram([
        {
          name: _('/node_modules/@angular/core/index.d.ts'),
          contents: `
          export declare function inject(): void;
          export declare function signal(): void;
          export declare function computed(): void;
          export declare function effect(): void;
          `,
        },
        {
          name: _('/entry.ts'),
          contents: `
          import {inject, signal, computed, effect} from '@angular/core';

          inject();
          signal(); signal();
          computed(); computed(); computed();
          effect(); effect(); effect(); effect();

          // The below variants should not be counted
          const _ = [inject, signal, computed, effect];
          const irrelevant = {
            signal() {}
          };
          irrelevant.signal();
          const deep = {irrelevant};
          deep.irrelevant.signal();
        `,
        },
      ]);

      const telemetry = recordTelemetry(program, _('/entry.ts'))!;
      expect(telemetry).not.toBeNull();
      expect(telemetry.inject).toBe(1);
      expect(telemetry.signal).toBe(2);
      expect(telemetry.computed).toBe(3);
      expect(telemetry.effect).toBe(4);
    });

    it('supports namespaces usages', () => {
      const {program} = makeProgram([
        {
          name: _('/node_modules/@angular/core/index.d.ts'),
          contents: `
          export declare function inject(): void;
          export declare function signal(): void;
          export declare function computed(): void;
          export declare function effect(): void;
          `,
        },
        {
          name: _('/entry.ts'),
          contents: `
          import * as ng from '@angular/core';

          ng.inject();
          ng.signal(); ng.signal();
          ng.computed(); ng.computed(); ng.computed();
          ng.effect(); ng.effect(); ng.effect(); ng.effect();
        `,
        },
      ]);

      const telemetry = recordTelemetry(program, _('/entry.ts'))!;
      expect(telemetry).not.toBeNull();
      expect(telemetry.inject).toBe(1);
      expect(telemetry.signal).toBe(2);
      expect(telemetry.computed).toBe(3);
      expect(telemetry.effect).toBe(4);
    });

    it('ignores usages from an unrelated module', () => {
      const {program} = makeProgram([
        {
          name: _('/node_modules/unrelated/index.d.ts'),
          contents: `
          export declare function inject(): void;
          export declare function signal(): void;
          export declare function computed(): void;
          export declare function effect(): void;
          `,
        },
        {
          name: _('/entry.ts'),
          contents: `
          import {inject, signal, computed, effect} from 'unrelated';

          inject();
          signal();
          computed();
          effect();
        `,
        },
      ]);

      const telemetry = recordTelemetry(program, _('/entry.ts'))!;
      expect(telemetry).toBeNull();
    });
  });
});

function recordTelemetry(program: ts.Program, filePath: AbsoluteFsPath): TelemetryScope|null {
  let telemetryScope: TelemetryScope|null = null;
  const acquireTelemetryScope = () => telemetryScope ??= new TelemetryScope();

  const reflector = new TypeScriptReflectionHost(program.getTypeChecker());

  const visit = (node: ts.Node): void => {
    recordNodeTelemetry(node, acquireTelemetryScope, reflector);
    ts.forEachChild(node, visit);
  };
  visit(getSourceFileOrError(program, filePath));

  return telemetryScope;
}
