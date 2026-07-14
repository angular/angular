/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {NgCompilerAdapter} from '../../core/api';
import {ErrorCode, ngErrorCode} from '../../diagnostics';
import {
  absoluteFrom as _,
  AbsoluteFsPath,
  getFileSystem,
  NgtscCompilerHost,
} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {analyzeCheckType, loadCustomElementsManifests} from '../src/loader';
import {resolveCustomElementsManifest} from '../src/manifest_resolver';

const OPTIONS: ts.CompilerOptions = {moduleResolution: ts.ModuleResolutionKind.NodeJs};

describe('analyzeCheckType', () => {
  it('should fail closed when an import type cannot be fully accounted for', () => {
    expect(analyzeCheckType('import("pkg").Foo.Bar')).toBeNull();
  });
});

function makeAdapter(): NgCompilerAdapter {
  const host = new NgtscCompilerHost(getFileSystem(), OPTIONS);
  return {
    fileExists: (fileName) => host.fileExists(fileName),
    readFile: (fileName) => host.readFile(fileName),
    directoryExists: (directoryName) => getFileSystem().exists(_(directoryName)),
    getCurrentDirectory: () => host.getCurrentDirectory(),
    getCanonicalFileName: (fileName) => host.getCanonicalFileName(fileName),
    getSourceFile: (fileName) => host.getSourceFile(fileName, ts.ScriptTarget.Latest),
    entryPoint: null,
    constructionDiagnostics: [],
    ignoreForEmit: new Set(),
    unifiedModulesHost: null,
    rootDirs: [_('/')],
    isShim: () => false,
    isResource: () => false,
  };
}

function writeManifest(path: AbsoluteFsPath, tagName: string, extra: object = {}): void {
  const fs = getFileSystem();
  fs.ensureDir(fs.dirname(path));
  fs.writeFile(
    path,
    JSON.stringify({
      schemaVersion: '1.0.0',
      modules: [
        {
          path: 'element.js',
          declarations: [
            {
              kind: 'class',
              name: 'SomeElement',
              customElement: true,
              tagName,
              members: [{kind: 'field', name: 'value', type: {text: 'string'}}],
              events: [{name: 'valuechange'}],
              ...extra,
            },
          ],
        },
      ],
    }),
  );
}

runInEachFileSystem(() => {
  describe('resolveCustomElementsManifest', () => {
    let basePath: AbsoluteFsPath;

    beforeEach(() => {
      basePath = _('/project');
      getFileSystem().ensureDir(basePath);
    });

    it('should resolve tsconfig-relative paths', () => {
      writeManifest(_('/project/elements/custom-elements.json'), 'my-element');
      const result = resolveCustomElementsManifest(
        './elements/custom-elements.json',
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
      );
      expect(result).toEqual({
        kind: 'success',
        path: _('/project/elements/custom-elements.json'),
        packageName: null,
        resolutionPaths: new Set([_('/project/elements/custom-elements.json')]),
      });
    });

    it('should fail for relative paths that do not exist', () => {
      const result = resolveCustomElementsManifest(
        './missing.json',
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
      );
      expect(result.kind).toBe('failure');
      if (result.kind === 'failure') {
        expect(result.reason).toContain('does not exist');
      }
    });

    it('should resolve .json module specifiers through node_modules', () => {
      writeManifest(_('/project/node_modules/@my/lib/custom-elements.json'), 'lib-element');
      const result = resolveCustomElementsManifest(
        '@my/lib/custom-elements.json',
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
      );
      expect(result).toEqual({
        kind: 'success',
        path: _('/project/node_modules/@my/lib/custom-elements.json'),
        packageName: '@my/lib',
        resolutionPaths: new Set([_('/project/node_modules/@my/lib/custom-elements.json')]),
      });
    });

    it('should resolve bare package names via the customElements package.json field', () => {
      const fs = getFileSystem();
      writeManifest(_('/project/node_modules/@my/lib/dist/custom-elements.json'), 'lib-element');
      fs.writeFile(
        _('/project/node_modules/@my/lib/package.json'),
        JSON.stringify({
          name: '@my/lib',
          main: './index.js',
          customElements: './dist/custom-elements.json',
        }),
      );
      const result = resolveCustomElementsManifest(
        '@my/lib',
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
      );
      expect(result).toEqual({
        kind: 'success',
        path: _('/project/node_modules/@my/lib/dist/custom-elements.json'),
        packageName: '@my/lib',
        resolutionPaths: new Set([
          _('/project/node_modules/@my/lib/package.json'),
          _('/project/node_modules/@my/lib/dist/custom-elements.json'),
        ]),
      });
    });

    it('should resolve a bare package whose exports do not expose package.json', () => {
      const fs = getFileSystem();
      writeManifest(
        _('/project/node_modules/@my/exported/dist/custom-elements.json'),
        'exported-element',
      );
      fs.writeFile(
        _('/project/node_modules/@my/exported/package.json'),
        JSON.stringify({
          name: '@my/exported',
          types: './dist/index.d.ts',
          customElements: './dist/custom-elements.json',
          exports: {'.': {types: './dist/index.d.ts', default: './dist/index.js'}},
        }),
      );
      fs.writeFile(_('/project/node_modules/@my/exported/dist/index.d.ts'), `export {};`);

      const result = resolveCustomElementsManifest(
        '@my/exported',
        basePath,
        {
          module: ts.ModuleKind.ESNext,
          moduleResolution: ts.ModuleResolutionKind.Bundler,
        },
        makeAdapter(),
        null,
      );

      expect(result).toEqual({
        kind: 'success',
        path: _('/project/node_modules/@my/exported/dist/custom-elements.json'),
        packageName: '@my/exported',
        resolutionPaths: new Set([
          _('/project/node_modules/@my/exported/package.json'),
          _('/project/node_modules/@my/exported/dist/custom-elements.json'),
        ]),
      });
    });

    it('should fail for packages without a customElements field', () => {
      const fs = getFileSystem();
      fs.ensureDir(_('/project/node_modules/plain-lib'));
      fs.writeFile(
        _('/project/node_modules/plain-lib/package.json'),
        JSON.stringify({name: 'plain-lib', main: './index.js'}),
      );
      const result = resolveCustomElementsManifest(
        'plain-lib',
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
      );
      expect(result.kind).toBe('failure');
      if (result.kind === 'failure') {
        expect(result.reason).toContain('no "customElements" field');
      }
    });

    it('should fail for packages that cannot be resolved', () => {
      const result = resolveCustomElementsManifest(
        '@does/not-exist',
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
      );
      expect(result.kind).toBe('failure');
      expect(result.resolutionPaths).toEqual(new Set());
    });

    it('should not retain every failed lookup for a missing JSON module specifier', () => {
      const result = resolveCustomElementsManifest(
        '@does/not-exist/custom-elements.json',
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
      );

      expect(result.kind).toBe('failure');
      expect(result.resolutionPaths).toEqual(new Set());
    });

    it('should retain a missing JSON manifest path inside an existing package', () => {
      getFileSystem().ensureDir(_('/project/node_modules/@my/lib'));
      const result = resolveCustomElementsManifest(
        '@my/lib/custom-elements.json',
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
      );

      expect(result.kind).toBe('failure');
      expect(result.resolutionPaths).toEqual(
        new Set([_('/project/node_modules/@my/lib/custom-elements.json')]),
      );
    });
  });

  describe('loadCustomElementsManifests', () => {
    let basePath: AbsoluteFsPath;
    let typeChecker: ts.TypeChecker;

    beforeEach(() => {
      basePath = _('/project');
      const fs = getFileSystem();
      fs.ensureDir(basePath);
      fs.writeFile(
        _('/project/globals.d.ts'),
        `interface Event {} interface KeyboardEvent extends Event { key: string; }`,
      );
      const options = {...OPTIONS, noLib: true};
      typeChecker = ts
        .createProgram({
          rootNames: [_('/project/globals.d.ts')],
          options,
          host: new NgtscCompilerHost(fs, options),
        })
        .getTypeChecker();
    });

    it('should load schemas from multiple manifests, first manifest winning duplicate tags', () => {
      writeManifest(_('/project/first.json'), 'my-element');
      const fs = getFileSystem();
      fs.writeFile(
        _('/project/second.json'),
        JSON.stringify({
          schemaVersion: '1.0.0',
          modules: [
            {
              path: 'other.js',
              declarations: [
                {
                  kind: 'class',
                  name: 'OtherElement',
                  customElement: true,
                  tagName: 'my-element',
                  members: [{kind: 'field', name: 'value', type: {text: 'number'}}],
                  events: [{name: 'commit'}],
                },
                {
                  kind: 'class',
                  name: 'SecondElement',
                  customElement: true,
                  tagName: 'second-element',
                },
              ],
            },
          ],
        }),
      );

      const result = loadCustomElementsManifests(
        ['./first.json', './second.json'],
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
        typeChecker,
      );

      expect(result.manifestPaths).toEqual(
        new Set([_('/project/first.json'), _('/project/second.json')]),
      );
      expect(result.schemas!.length).toBe(2);
      const winner = result.schemas!.find((schema) => schema.tagName === 'my-element')!;
      // Mirroring `customElements.define` semantics, the first manifest's declaration wins.
      const value = winner.properties.find((p) => p.name === 'value')!;
      expect(value.type).toBe('string');
      expect(value.checkType).toBe('string');
      expect(winner.events).toEqual([{name: 'valuechange'}]);
      // The skipped duplicate is reported as a warning.
      expect(result.diagnostics.length).toBe(1);
      expect(result.diagnostics[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(result.diagnostics[0].code).toBe(
        ngErrorCode(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_DUPLICATE_TAG),
      );
      expect(result.diagnostics[0].messageText).toContain(`'my-element'`);
    });

    it('should produce a diagnostic for unresolvable entries', () => {
      const result = loadCustomElementsManifests(
        ['./nope.json'],
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
        typeChecker,
      );
      expect(result.schemas).toBeNull();
      expect(result.diagnostics.length).toBe(1);
      expect(result.diagnostics[0].code).toBe(
        ngErrorCode(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_NOT_FOUND),
      );
      expect(result.diagnostics[0].messageText).toContain(`'./nope.json'`);
    });

    it('should produce a diagnostic for unparsable manifests', () => {
      getFileSystem().writeFile(_('/project/bad.json'), 'not json {');
      const result = loadCustomElementsManifests(
        ['./bad.json'],
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
        typeChecker,
      );
      expect(result.schemas).toBeNull();
      expect(result.diagnostics.length).toBe(1);
      expect(result.diagnostics[0].code).toBe(
        ngErrorCode(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_INVALID),
      );
      // The manifest still counts as resolved so watch invalidation can track it.
      expect(result.manifestPaths).toEqual(new Set([_('/project/bad.json')]));
    });

    it('should keep check types whose import specifiers resolve to type declarations', () => {
      const fs = getFileSystem();
      fs.ensureDir(_('/project/node_modules/@ce/lib'));
      fs.writeFile(
        _('/project/node_modules/@ce/lib/element.d.ts'),
        `export type Variant = 'a' | 'b'; export declare class SomeElement extends HTMLElement {}`,
      );
      fs.writeFile(
        _('/project/node_modules/@ce/lib/package.json'),
        JSON.stringify({
          name: '@ce/lib',
          types: './element.d.ts',
          customElements: './custom-elements.json',
        }),
      );
      fs.writeFile(
        _('/project/node_modules/@ce/lib/custom-elements.json'),
        JSON.stringify({
          schemaVersion: '1.0.0',
          modules: [
            {
              path: 'element.js',
              declarations: [
                {
                  kind: 'class',
                  name: 'SomeElement',
                  customElement: true,
                  tagName: 'some-element',
                  members: [
                    {
                      kind: 'field',
                      name: 'variant',
                      attribute: 'variant',
                      type: {
                        text: 'Variant',
                        references: [{name: 'Variant', package: '@ce/lib'}],
                      },
                    },
                  ],
                },
              ],
            },
          ],
        }),
      );

      const result = loadCustomElementsManifests(
        ['@ce/lib'],
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
        typeChecker,
      );

      expect(result.diagnostics).toEqual([]);
      const schema = result.schemas!.find((s) => s.tagName === 'some-element')!;
      expect(schema.properties.find((p) => p.name === 'variant')!.checkType).toBe(
        'import("@ce/lib").Variant',
      );
      expect(schema.attributes!.find((a) => a.name === 'variant')).toEqual(
        jasmine.objectContaining({
          type: 'string',
          checkType: 'import("@ce/lib").Variant',
          stringLiteralValues: ['a', 'b'],
        }),
      );
      expect(schema.instanceCheckType).toBe('import("@ce/lib/element.js").SomeElement');
    });

    it('should not treat import-like text in string literal types as a type reference', () => {
      const fs = getFileSystem();
      fs.writeFile(
        _('/project/custom-elements.json'),
        JSON.stringify({
          schemaVersion: '1.0.0',
          modules: [
            {
              path: 'element.js',
              declarations: [
                {
                  kind: 'class',
                  name: 'SomeElement',
                  customElement: true,
                  tagName: 'some-element',
                  members: [
                    {
                      kind: 'field',
                      name: 'label',
                      type: {text: `'import("@does/not-exist").Missing'`},
                    },
                  ],
                },
              ],
            },
          ],
        }),
      );

      const result = loadCustomElementsManifests(
        ['./custom-elements.json'],
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
        typeChecker,
      );

      expect(result.diagnostics).toEqual([]);
      expect(result.schemas![0].properties[0].checkType).toBe(
        `'import("@does/not-exist").Missing'`,
      );
    });

    it('should strip check types with unresolvable import specifiers and warn once each', () => {
      const fs = getFileSystem();
      fs.writeFile(
        _('/project/custom-elements.json'),
        JSON.stringify({
          schemaVersion: '1.0.0',
          modules: [
            {
              path: 'element.js',
              declarations: [
                {
                  kind: 'class',
                  name: 'SomeElement',
                  customElement: true,
                  tagName: 'some-element',
                  members: [
                    {
                      kind: 'field',
                      name: 'variant',
                      type: {
                        text: 'Variant',
                        references: [{name: 'Variant', package: '@does/not-exist'}],
                      },
                    },
                    {
                      kind: 'field',
                      name: 'other',
                      type: {
                        text: 'Other',
                        references: [{name: 'Other', package: '@does/not-exist'}],
                      },
                    },
                    {kind: 'field', name: 'count', type: {text: 'number'}},
                  ],
                  events: [
                    {
                      name: 'commit',
                      type: {
                        text: 'CommitEvent',
                        references: [{name: 'CommitEvent', package: '@does/not-exist'}],
                      },
                    },
                  ],
                  attributes: [
                    {
                      name: 'mode',
                      type: {
                        text: 'Mode',
                        references: [{name: 'Mode', package: '@does/not-exist'}],
                      },
                    },
                  ],
                },
              ],
            },
          ],
        }),
      );

      const result = loadCustomElementsManifests(
        ['./custom-elements.json'],
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
        typeChecker,
      );

      // One warning per unresolvable specifier, not one per use.
      expect(result.diagnostics.length).toBe(1);
      expect(result.diagnostics[0].code).toBe(
        ngErrorCode(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNRESOLVABLE_TYPE_REFERENCE),
      );
      expect(result.diagnostics[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(result.diagnostics[0].messageText).toContain(`'@does/not-exist'`);

      // The affected check types degrade to existence-only; self-contained ones are kept.
      const schema = result.schemas!.find((s) => s.tagName === 'some-element')!;
      expect(schema.properties.find((p) => p.name === 'variant')!.checkType).toBeUndefined();
      expect(schema.properties.find((p) => p.name === 'other')!.checkType).toBeUndefined();
      expect(schema.properties.find((p) => p.name === 'count')!.checkType).toBe('number');
      expect(schema.events.find((e) => e.name === 'commit')!.checkType).toBeUndefined();
      expect(schema.attributes!.find((a) => a.name === 'mode')!.checkType).toBeUndefined();
      expect(schema.instanceCheckType).toBeUndefined();
    });

    it('should strip references to names missing from resolvable declaration modules', () => {
      const fs = getFileSystem();
      fs.ensureDir(_('/project/node_modules/@ce/lib'));
      fs.writeFile(
        _('/project/node_modules/@ce/lib/element.d.ts'),
        `export type Present = string;`,
      );
      fs.writeFile(
        _('/project/node_modules/@ce/lib/package.json'),
        JSON.stringify({
          name: '@ce/lib',
          types: './element.d.ts',
          customElements: './custom-elements.json',
        }),
      );
      fs.writeFile(
        _('/project/node_modules/@ce/lib/custom-elements.json'),
        JSON.stringify({
          schemaVersion: '1.0.0',
          modules: [
            {
              path: 'element.js',
              declarations: [
                {
                  kind: 'class',
                  name: 'MissingElement',
                  customElement: true,
                  tagName: 'missing-element',
                  members: [
                    {
                      kind: 'field',
                      name: 'present',
                      type: {
                        text: 'Present',
                        references: [{name: 'Present', package: '@ce/lib'}],
                      },
                    },
                    {
                      kind: 'field',
                      name: 'missing',
                      type: {
                        text: 'Missing',
                        references: [{name: 'Missing', package: '@ce/lib'}],
                      },
                    },
                  ],
                  events: [
                    {
                      name: 'commit',
                      type: {
                        text: 'MissingEvent',
                        references: [{name: 'MissingEvent', package: '@ce/lib'}],
                      },
                    },
                  ],
                },
              ],
            },
          ],
        }),
      );

      const result = loadCustomElementsManifests(
        ['@ce/lib'],
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
        typeChecker,
      );

      expect(result.diagnostics.length).toBe(2);
      expect(
        result.diagnostics.every(
          (diagnostic) =>
            diagnostic.code ===
              ngErrorCode(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNRESOLVABLE_TYPE_REFERENCE) &&
            diagnostic.category === ts.DiagnosticCategory.Warning,
        ),
      ).toBe(true);
      expect(result.diagnostics.map((diagnostic) => diagnostic.messageText).join('\n')).toContain(
        `'Missing'`,
      );
      expect(result.diagnostics.map((diagnostic) => diagnostic.messageText).join('\n')).toContain(
        `'MissingEvent'`,
      );
      expect(result.diagnostics.map((diagnostic) => diagnostic.messageText).join('\n')).toContain(
        `'MissingElement'`,
      );

      const schema = result.schemas![0];
      expect(schema.properties.find((property) => property.name === 'present')!.checkType).toBe(
        'import("@ce/lib").Present',
      );
      expect(
        schema.properties.find((property) => property.name === 'missing')!.checkType,
      ).toBeUndefined();
      expect(schema.events[0].checkType).toBeUndefined();
      expect(schema.instanceCheckType).toBeUndefined();
    });

    it('should strip references to value-only exports', () => {
      const fs = getFileSystem();
      fs.ensureDir(_('/project/node_modules/@ce/value-only'));
      fs.writeFile(
        _('/project/node_modules/@ce/value-only/element.d.ts'),
        `export declare const ValueOnly: unique symbol;
         export declare class ValueElement extends HTMLElement {}`,
      );
      fs.writeFile(
        _('/project/node_modules/@ce/value-only/package.json'),
        JSON.stringify({
          name: '@ce/value-only',
          types: './element.d.ts',
          customElements: './custom-elements.json',
        }),
      );
      fs.writeFile(
        _('/project/node_modules/@ce/value-only/custom-elements.json'),
        JSON.stringify({
          schemaVersion: '1.0.0',
          modules: [
            {
              kind: 'javascript-module',
              path: 'element.js',
              declarations: [
                {
                  kind: 'class',
                  name: 'ValueElement',
                  customElement: true,
                  tagName: 'value-element',
                  members: [
                    {
                      kind: 'field',
                      name: 'value',
                      type: {
                        text: 'ValueOnly',
                        references: [{name: 'ValueOnly', package: '@ce/value-only'}],
                      },
                    },
                  ],
                },
              ],
            },
          ],
        }),
      );

      const result = loadCustomElementsManifests(
        ['@ce/value-only'],
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
        typeChecker,
      );

      expect(result.diagnostics.length).toBe(1);
      expect(result.diagnostics[0].code).toBe(
        ngErrorCode(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNRESOLVABLE_TYPE_REFERENCE),
      );
      expect(result.diagnostics[0].messageText).toContain('usable type');
      expect(result.schemas![0].properties[0].checkType).toBeUndefined();
      expect(result.schemas![0].instanceCheckType).toBe(
        'import("@ce/value-only/element.js").ValueElement',
      );
    });

    it('should strip references to missing global types while keeping declared globals', () => {
      const fs = getFileSystem();
      fs.writeFile(
        _('/project/custom-elements.json'),
        JSON.stringify({
          schemaVersion: '1.0.0',
          modules: [
            {
              kind: 'javascript-module',
              path: 'element.js',
              declarations: [
                {
                  kind: 'class',
                  name: 'GlobalElement',
                  customElement: true,
                  tagName: 'global-element',
                  members: [
                    {
                      kind: 'field',
                      name: 'keyboardEvent',
                      type: {
                        text: 'KeyboardEvent',
                        references: [{name: 'KeyboardEvent', package: 'global:'}],
                      },
                    },
                    {
                      kind: 'field',
                      name: 'missing',
                      type: {
                        text: 'NotARealType',
                        references: [{name: 'NotARealType', package: 'global:'}],
                      },
                    },
                  ],
                },
              ],
            },
          ],
        }),
      );

      const result = loadCustomElementsManifests(
        ['./custom-elements.json'],
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
        typeChecker,
      );

      expect(result.diagnostics.length).toBe(1);
      expect(result.diagnostics[0].code).toBe(
        ngErrorCode(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNRESOLVABLE_TYPE_REFERENCE),
      );
      expect(result.diagnostics[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(result.diagnostics[0].messageText).toContain(`'NotARealType' from 'global:'`);
      const properties = result.schemas![0].properties;
      expect(properties.find((property) => property.name === 'keyboardEvent')!.checkType).toBe(
        'KeyboardEvent',
      );
      expect(properties.find((property) => property.name === 'missing')!.checkType).toBeUndefined();
    });

    it('should use a manifest-relative module path and its declared default export as a fallback', () => {
      const fs = getFileSystem();
      const typeText = `'import("@ce/nested/components/nested/nested.js").NestedVariant' | NestedVariant`;
      fs.ensureDir(_('/project/node_modules/@ce/nested/dist/components/nested'));
      fs.writeFile(
        _('/project/node_modules/@ce/nested/package.json'),
        JSON.stringify({
          name: '@ce/nested',
          types: './dist/index.d.ts',
          customElements: './dist/custom-elements.json',
          exports: {
            '.': {types: './dist/index.d.ts', default: './dist/index.js'},
            './dist/components/*': './dist/components/*',
          },
        }),
      );
      fs.writeFile(_('/project/node_modules/@ce/nested/dist/index.d.ts'), `export {};`);
      fs.writeFile(
        _('/project/node_modules/@ce/nested/dist/components/nested/nested.d.ts'),
        `declare class NestedElement { value: string; }
         export type NestedVariant = 'compact' | 'comfortable';
         export {NestedElement as default};`,
      );
      fs.writeFile(
        _('/project/node_modules/@ce/nested/dist/custom-elements.json'),
        JSON.stringify({
          schemaVersion: '1.0.0',
          modules: [
            {
              kind: 'javascript-module',
              path: 'components/nested/nested.js',
              declarations: [
                {
                  kind: 'class',
                  name: 'NestedElement',
                  customElement: true,
                  tagName: 'nested-element',
                  members: [
                    {kind: 'field', name: 'value', type: {text: 'string'}},
                    {
                      kind: 'field',
                      name: 'variant',
                      type: {
                        text: typeText,
                        references: [
                          {
                            name: 'NestedVariant',
                            module: 'components/nested/nested.js',
                            start: typeText.lastIndexOf('NestedVariant'),
                            end: typeText.length,
                          },
                        ],
                      },
                    },
                  ],
                },
              ],
              exports: [
                {
                  kind: 'js',
                  name: 'default',
                  declaration: {name: 'NestedElement'},
                },
              ],
            },
          ],
        }),
      );
      const options = {
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
      };

      const result = loadCustomElementsManifests(
        ['@ce/nested'],
        basePath,
        options,
        makeAdapter(),
        null,
        typeChecker,
      );

      expect(result.diagnostics).toEqual([]);
      expect(result.schemas![0].instanceCheckType).toBe(
        'import("@ce/nested/dist/components/nested/nested.js").default',
      );
      expect(result.schemas![0].properties[0].checkType).toBe('string');
      expect(result.schemas![0].properties[1].checkType).toBe(
        `'import("@ce/nested/components/nested/nested.js").NestedVariant' | ` +
          `import("@ce/nested/dist/components/nested/nested.js").NestedVariant`,
      );
    });
  });
});
