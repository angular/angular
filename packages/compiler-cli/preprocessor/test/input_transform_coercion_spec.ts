/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runPipeline, TestFile} from './utils.js';

function makeTsconfig(
  fileNames: string[],
  compilerOptions: Record<string, unknown> = {},
  angularCompilerOptions: Record<string, unknown> = {},
): string {
  return JSON.stringify({
    compilerOptions: {
      target: 'es2022',
      module: 'esnext',
      moduleResolution: 'bundler',
      experimentalDecorators: true,
      ...compilerOptions,
    },
    files: fileNames.map((f) => (f.startsWith('/') ? f.slice(1) : f)),
    angularCompilerOptions,
  });
}

async function compileFiles(
  files: Record<string, string>,
  options: {
    optimize?: boolean;
    compilerOptions?: Record<string, unknown>;
    angularCompilerOptions?: Record<string, unknown>;
    errors?: string[];
  } = {},
): Promise<Map<string, string>> {
  const testFiles: TestFile[] = [
    {
      path: '/tsconfig.json',
      content: makeTsconfig(
        Object.keys(files),
        options.compilerOptions,
        options.angularCompilerOptions,
      ),
    },
    ...Object.entries(files).map(([p, content]) => ({
      path: p.startsWith('/') ? p : `/${p}`,
      content,
    })),
  ];

  const outputs = await runPipeline(testFiles, {
    optimize: options.optimize ?? true,
    format: false,
    errors: options.errors,
  });

  const map = new Map<string, string>();
  for (const out of outputs) {
    map.set(out.path, out.content);
  }
  return map;
}

describe('@Input({ transform }) coercion member types', () => {
  it('emits ngAcceptInputType_* members for imported, same-file, and zero-parameter transforms', async () => {
    const outputs = await compileFiles({
      '/transforms.ts': `
        export function externalToBool(value: boolean | string): boolean {
          return !!value;
        }
        interface PrivateInput {
          raw: string;
        }
        export function unexportedParamTransform(value: PrivateInput): string {
          return value.raw;
        }
      `,
      '/test.ts': `
        import {Component, Input} from '@angular/core';
        import {externalToBool, unexportedParamTransform} from './transforms';

        function localToNumber(value: number | string): number {
          return Number(value);
        }

        function zeroArgNamed(): boolean {
          return true;
        }

        @Component({
          selector: 'transform-cmp',
          template: '',
        })
        export class TransformCmp {
          @Input({transform: externalToBool}) extFlag = false;
          @Input({transform: localToNumber}) localCount = 0;
          @Input({transform: () => true}) inlineZeroArg = false;
          @Input({transform: zeroArgNamed}) namedZeroArg = false;
          @Input({transform: unexportedParamTransform}) privateParam = '';
        }
      `,
    });

    const content = outputs.get('/out/test.ts')!;
    expect(content).toContain('static ngAcceptInputType_extFlag: boolean | string;');
    expect(content).toContain('static ngAcceptInputType_localCount: number | string;');
    expect(content).toContain('static ngAcceptInputType_inlineZeroArg: unknown;');
    expect(content).toContain('static ngAcceptInputType_namedZeroArg: unknown;');
    expect(content).toContain('static ngAcceptInputType_privateParam: unknown;');
    expect(content).toContain("inlineZeroArg: [2, 'inlineZeroArg', 'inlineZeroArg', () => true]");
  });

  it('resolves cross-file exported named types in imported transform functions', async () => {
    const outputs = await compileFiles(
      {
        '/models.ts': `
          export interface ExternalModel {
            label: string;
          }
        `,
        '/pkg/transforms.ts': `
          export interface PkgConfig {
            enabled: boolean;
          }
          export function toPkgConfig(value: PkgConfig | boolean): PkgConfig {
            return typeof value === 'boolean' ? {enabled: value} : value;
          }
        `,
        '/transforms.ts': `
          import {ExternalModel} from './models';

          export interface CustomConfig {
            id: string;
          }
          export type CustomAlias = number;
          export function toCustom(value: CustomConfig | string): CustomConfig {
            return typeof value === 'string' ? {id: value} : value;
          }
          export function toArray(value: Array<CustomConfig | CustomAlias>): CustomConfig[] {
            return [];
          }
          export function toModel(value: ExternalModel | null): ExternalModel | null {
            return value;
          }
        `,
        '/test.ts': `
          import {Component, Input} from '@angular/core';
          import {toCustom, toArray, toModel, CustomConfig} from './transforms';
          import {ExternalModel} from './models';
          import {toPkgConfig, PkgConfig} from '@pkg/transforms';

          @Component({
            selector: 'transform-cmp',
            template: '',
          })
          export class TransformCmp {
            @Input({transform: toCustom}) custom!: CustomConfig;
            @Input({transform: toArray}) list: CustomConfig[] = [];
            @Input({transform: toModel}) model: ExternalModel | null = null;
            @Input({transform: toPkgConfig}) pkg!: PkgConfig;
          }
        `,
      },
      {
        compilerOptions: {
          baseUrl: '/',
          paths: {
            '@pkg/*': ['pkg/*'],
          },
        },
      },
    );

    const content = outputs.get('/out/test.ts')!;
    expect(content).toContain("import * as i1 from './transforms';");
    expect(content).toContain("import * as i2 from './models';");
    expect(content).toContain("import * as i3 from '@pkg/transforms';");
    expect(content).toContain('declare static ngAcceptInputType_custom: i1.CustomConfig | string;');
    expect(content).toContain(
      'declare static ngAcceptInputType_list: Array<i1.CustomConfig | i1.CustomAlias>;',
    );
    expect(content).toContain('declare static ngAcceptInputType_model: i2.ExternalModel | null;');
    expect(content).toContain('declare static ngAcceptInputType_pkg: i3.PkgConfig | boolean;');
  });
});
