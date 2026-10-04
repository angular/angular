/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵCustomElementsManifestSchema as CustomElementsManifestSchema} from '@angular/compiler';
import ts from 'typescript';

import {NgCompilerAdapter} from '../../core/api';
import {ErrorCode, ngErrorCode} from '../../diagnostics';
import {
  absoluteFrom as _,
  AbsoluteFsPath,
  getFileSystem,
  NgtscCompilerHost,
} from '../../file_system';
import {initMockFileSystem, runInEachFileSystem} from '../../file_system/testing';
import {CustomElementsManifestLoadResult, loadCustomElementsManifests} from '../src/loader';
import {resolveCustomElementsManifest} from '../src/manifest_resolver';
import {customElementsManifest} from '../testing';

/** The loaded schemas, or `null` when no manifest yielded any. */
function schemasOf(
  result: CustomElementsManifestLoadResult,
): CustomElementsManifestSchema[] | null {
  return result.index === null ? null : [...result.index.schemas];
}

const OPTIONS: ts.CompilerOptions = {moduleResolution: ts.ModuleResolutionKind.NodeJs};
const DEFAULT_LIBRARY = `interface Array<T> { length: number; }`;

function makeAdapter(
  sourceFileOverrides: ReadonlyMap<string, string> = new Map(),
): NgCompilerAdapter {
  const host = new NgtscCompilerHost(getFileSystem(), OPTIONS);
  return {
    fileExists: (fileName) => host.fileExists(fileName),
    readFile: (fileName) => host.readFile(fileName),
    directoryExists: (directoryName) => getFileSystem().exists(_(directoryName)),
    getCurrentDirectory: () => host.getCurrentDirectory(),
    getCanonicalFileName: (fileName) => host.getCanonicalFileName(fileName),
    getSourceFile: (fileName) => {
      const override = sourceFileOverrides.get(fileName);
      return override === undefined
        ? host.getSourceFile(fileName, ts.ScriptTarget.Latest)
        : ts.createSourceFile(fileName, override, ts.ScriptTarget.Latest, true);
    },
    entryPoint: null,
    constructionDiagnostics: [],
    ignoreForEmit: new Set(),
    unifiedModulesHost: null,
    rootDirs: [_('/')],
    isShim: () => false,
    isResource: () => false,
  };
}

function makeProgram(
  rootNames: AbsoluteFsPath[],
  projectReferences?: readonly ts.ProjectReference[],
  defaultLibrary?: string,
): ts.Program {
  const fs = getFileSystem();
  const options = {...OPTIONS, noLib: defaultLibrary === undefined};
  const host = new NgtscCompilerHost(fs, options);
  if (defaultLibrary !== undefined) {
    const defaultLibraryPath = _(host.getDefaultLibFileName(options));
    fs.ensureDir(fs.dirname(defaultLibraryPath));
    fs.writeFile(defaultLibraryPath, defaultLibrary);
  }
  return ts.createProgram({
    rootNames,
    options,
    host,
    projectReferences,
  });
}

function writeManifest(path: AbsoluteFsPath, tagName: string, extra: object = {}): void {
  const fs = getFileSystem();
  fs.ensureDir(fs.dirname(path));
  fs.writeFile(
    path,
    JSON.stringify(
      customElementsManifest({
        tagName,
        name: 'SomeElement',
        path: 'element.js',
        members: [{kind: 'field', name: 'value', type: {text: 'string'}}],
        ...extra,
      }),
    ),
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
        expect(result.reason).toContain(
          `Relative entries resolve against the project directory '${basePath}'`,
        );
      }
    });

    it('should not describe the project directory for missing absolute paths', () => {
      const result = resolveCustomElementsManifest(
        _('/elsewhere/missing.json'),
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
      );
      expect(result.kind).toBe('failure');
      if (result.kind === 'failure') {
        expect(result.reason).toBe(`The file '${_('/elsewhere/missing.json')}' does not exist.`);
      }
    });

    it('should suggest the path form when a bare .json entry names a project file', () => {
      writeManifest(_('/project/src/custom-elements.json'), 'my-element');
      const result = resolveCustomElementsManifest(
        'src/custom-elements.json',
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
      );
      expect(result.kind).toBe('failure');
      if (result.kind === 'failure') {
        expect(result.reason).toContain(
          `To load the project file '${_('/project/src/custom-elements.json')}', ` +
            `use './src/custom-elements.json'.`,
        );
      }
    });

    it('should not suggest the path form when no project file matches', () => {
      const result = resolveCustomElementsManifest(
        'src/custom-elements.json',
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
      );
      expect(result.kind).toBe('failure');
      if (result.kind === 'failure') {
        expect(result.reason).toBe(
          `The module specifier 'src/custom-elements.json' does not resolve to a file.`,
        );
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
          // Track the missing dist/package.json because creating it can change the package root.
          _('/project/node_modules/@my/exported/dist/package.json'),
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

    it('should register a missing package manifest when the adapter has no directoryExists', () => {
      const fs = getFileSystem();
      const packagePath = _('/project/node_modules/@my/lib/package.json');
      fs.ensureDir(fs.dirname(packagePath));
      fs.writeFile(packagePath, JSON.stringify({name: '@my/lib'}));
      const adapter = makeAdapter();
      delete adapter.directoryExists;
      const dependencies = new Set<AbsoluteFsPath>();
      adapter.recordResourceDependency = (path) => {
        dependencies.add(path);
      };
      const result = resolveCustomElementsManifest(
        '@my/lib/custom-elements.json',
        basePath,
        OPTIONS,
        adapter,
        null,
      );
      const manifestPath = _('/project/node_modules/@my/lib/custom-elements.json');
      expect(result.kind).toBe('failure');
      expect(result.resolutionPaths.has(manifestPath)).toBe(true);
      expect(dependencies.has(manifestPath)).toBe(true);
    });
  });

  describe('loadCustomElementsManifests', () => {
    let basePath: AbsoluteFsPath;
    let program: ts.Program;

    beforeEach(() => {
      basePath = _('/project');
      const fs = getFileSystem();
      fs.ensureDir(basePath);
      fs.writeFile(
        _('/project/globals.d.ts'),
        `interface Event {}
         interface CustomEvent<T = any> extends Event { detail: T; }
         interface KeyboardEvent extends Event { key: string; }`,
      );
      program = makeProgram([_('/project/globals.d.ts')], undefined, DEFAULT_LIBRARY);
    });

    it('should load schemas from multiple manifests, first manifest winning duplicate tags', () => {
      writeManifest(_('/project/first.json'), 'my-element');
      const fs = getFileSystem();
      fs.writeFile(
        _('/project/second.json'),
        JSON.stringify(
          customElementsManifest(
            {
              tagName: 'my-element',
              members: [{kind: 'field', name: 'value', type: {text: 'number'}}],
              events: [{name: 'commit', type: {text: 'unknown'}}],
            },
            {tagName: 'second-element'},
          ),
        ),
      );

      const result = loadCustomElementsManifests(
        ['./first.json', './second.json'],
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
        program,
      );

      expect([...result.resolutionPaths]).toEqual(
        jasmine.arrayContaining([_('/project/first.json'), _('/project/second.json')]),
      );
      expect(schemasOf(result)!.length).toBe(2);
      const winner = schemasOf(result)!.find((schema) => schema.tagName === 'my-element')!;
      // The first manifest's declaration wins.
      const value = winner.properties.find((p) => p.name === 'value')!;
      expect(value.checkType).toBe('string');
      expect(winner.events).toEqual([]);
      // The skipped duplicate is reported as a warning.
      expect(result.diagnostics.length).toBe(1);
      expect(result.diagnostics[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(result.diagnostics[0].code).toBe(
        ngErrorCode(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_DUPLICATE_TAG),
      );
      expect(result.diagnostics[0].messageText).toContain(`'my-element'`);
      expect(result.diagnostics[0].messageText).toContain(`'./first.json'`);
      expect(result.diagnostics[0].messageText).toContain(`'./second.json'`);
    });

    it('should apply first-wins between a definition-only schema and a later full declaration', () => {
      const fs = getFileSystem();
      fs.writeFile(
        _('/project/definition-only.json'),
        JSON.stringify({
          schemaVersion: '1.0.0',
          modules: [
            {
              kind: 'javascript-module',
              path: 'define.js',
              exports: [
                {
                  kind: 'custom-element-definition',
                  name: 'shared-element',
                  declaration: {name: 'Missing', module: 'nope.js'},
                },
              ],
            },
          ],
        }),
      );
      writeManifest(_('/project/full.json'), 'shared-element');

      const result = loadCustomElementsManifests(
        ['./definition-only.json', './full.json'],
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
        program,
      );

      // The first registration wins even when a later manifest declares more members.
      expect(schemasOf(result)!.length).toBe(1);
      expect(schemasOf(result)![0].tagName).toBe('shared-element');
      expect(schemasOf(result)![0].properties).toEqual([]);
      expect(result.diagnostics.map((diagnostic) => diagnostic.code).sort()).toEqual(
        [
          ngErrorCode(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNUSABLE_TYPE),
          ngErrorCode(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_DUPLICATE_TAG),
        ].sort(),
      );
    });

    it('should produce a diagnostic for unresolvable entries', () => {
      const result = loadCustomElementsManifests(
        ['./nope.json'],
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
        program,
      );
      expect(schemasOf(result)).toBeNull();
      expect(result.diagnostics.length).toBe(1);
      expect(result.diagnostics[0].code).toBe(
        ngErrorCode(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_NOT_FOUND),
      );
      expect(result.diagnostics[0].category).toBe(ts.DiagnosticCategory.Error);
      expect(result.diagnostics[0].messageText).toContain(`'./nope.json'`);
    });

    it('should report NG4007 when a manifest disappears between resolution and the read', () => {
      writeManifest(_('/project/vanishing.json'), 'vanishing-element');
      writeManifest(_('/project/good.json'), 'good-element');

      // Simulate deletion between resolution and reading. The resource read returns an empty
      // string, and later existence checks report the file missing.
      const base = makeAdapter();
      let vanished = false;
      const adapter: NgCompilerAdapter = {
        ...base,
        readResource: (fileName) => {
          if (fileName === _('/project/vanishing.json')) {
            vanished = true;
            return '';
          }
          return base.readFile(fileName) ?? '';
        },
        fileExists: (fileName) =>
          fileName === _('/project/vanishing.json') && vanished ? false : base.fileExists(fileName),
      };

      const result = loadCustomElementsManifests(
        ['./vanishing.json', './good.json'],
        basePath,
        OPTIONS,
        adapter,
        null,
        program,
      );

      // Report a read error for the deleted manifest and keep the other manifest's schemas.
      expect(schemasOf(result)!.map((schema) => schema.tagName)).toEqual(['good-element']);
      expect(result.diagnostics.length).toBe(1);
      expect(result.diagnostics[0].code).toBe(
        ngErrorCode(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_NOT_FOUND),
      );
      expect(result.diagnostics[0].messageText).toContain('cannot be read');
    });

    it('should report NG4008 for a genuinely empty manifest file', () => {
      getFileSystem().writeFile(_('/project/empty.json'), '');
      const result = loadCustomElementsManifests(
        ['./empty.json'],
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
        program,
      );
      expect(schemasOf(result)).toBeNull();
      expect(result.diagnostics.length).toBe(1);
      expect(result.diagnostics[0].code).toBe(
        ngErrorCode(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_INVALID),
      );
    });

    it('should produce a diagnostic for unparsable manifests', () => {
      getFileSystem().writeFile(_('/project/bad.json'), 'not json {');
      const result = loadCustomElementsManifests(
        ['./bad.json'],
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
        program,
      );
      expect(schemasOf(result)).toBeNull();
      expect(result.diagnostics.length).toBe(1);
      expect(result.diagnostics[0].code).toBe(
        ngErrorCode(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_INVALID),
      );
      expect(result.diagnostics[0].category).toBe(ts.DiagnosticCategory.Error);
      // The manifest still counts as resolved so watch invalidation can track it.
      expect([...result.resolutionPaths]).toEqual(
        jasmine.arrayContaining([_('/project/bad.json')]),
      );
    });

    it('should retain valid schemas when other configured entries fail', () => {
      writeManifest(_('/project/good.json'), 'good-element');
      getFileSystem().writeFile(
        _('/project/invalid.json'),
        JSON.stringify({schemaVersion: '1.0.0', modules: 'not-an-array'}),
      );

      const result = loadCustomElementsManifests(
        ['./missing.json', './invalid.json', './good.json'],
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
        program,
      );

      expect(schemasOf(result)?.map((schema) => schema.tagName)).toEqual(['good-element']);
      expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([
        ngErrorCode(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_NOT_FOUND),
        ngErrorCode(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_INVALID),
      ]);
      expect(
        result.diagnostics.every(
          (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
        ),
      ).toBe(true);
    });

    it('should keep self-contained inline object event types', () => {
      writeManifest(_('/project/custom-elements.json'), 'some-element', {
        events: [
          {
            name: 'commit',
            type: {
              text: 'CustomEvent<{value?: {nested: string}}>',
              references: [{name: 'CustomEvent', package: 'global:', start: 0, end: 11}],
            },
          },
        ],
      });

      const result = loadCustomElementsManifests(
        ['./custom-elements.json'],
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
        program,
      );

      expect(result.diagnostics).toEqual([]);
      expect(schemasOf(result)![0].events[0].checkType).toBe(
        'CustomEvent<{value?: {nested: string}}>',
      );
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
      writeManifest(_('/project/node_modules/@ce/lib/custom-elements.json'), 'some-element', {
        members: [
          {
            kind: 'field',
            name: 'variant',
            attribute: 'variant',
            type: {text: 'Variant', references: [{name: 'Variant', package: '@ce/lib'}]},
          },
        ],
        attributes: [{name: 'variant', fieldName: 'variant'}],
      });

      const result = loadCustomElementsManifests(
        ['@ce/lib'],
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
        program,
      );

      expect(result.diagnostics).toEqual([]);
      const schema = schemasOf(result)!.find((s) => s.tagName === 'some-element')!;
      expect(schema.properties.find((p) => p.name === 'variant')!.checkType).toBe(
        'import("@ce/lib").Variant',
      );
      expect(schema.attributes!.find((a) => a.name === 'variant')).toEqual(
        jasmine.objectContaining({
          checkType: 'import("@ce/lib").Variant',
          stringLiteralValues: ['a', 'b'],
        }),
      );
      expect(schema.instanceCheckType).toBe('import("@ce/lib/element.js").SomeElement');
    });

    for (const parameters of ['<T>', '<T extends string>', '<T, U = string>', '<T = string>']) {
      for (const reexport of [false, true]) {
        it(`should validate generic instance parameters ${parameters} through ${reexport ? 'an alias' : 'a direct export'}`, () => {
          const fs = getFileSystem();
          const packagePath = _('/project/node_modules/@ce/lib');
          writeManifest(_(`${packagePath}/custom-elements.json`), 'some-element');
          fs.writeFile(
            _(`${packagePath}/package.json`),
            JSON.stringify({
              name: '@ce/lib',
              customElements: './custom-elements.json',
            }),
          );
          const declaration = `export declare class SomeElement${parameters} extends HTMLElement { value: string; }`;
          fs.writeFile(
            _(`${packagePath}/element.d.ts`),
            reexport ? `export {SomeElement} from './generic';` : declaration,
          );
          if (reexport) {
            fs.writeFile(_(`${packagePath}/generic.d.ts`), declaration);
          }
          const result = loadCustomElementsManifests(
            ['@ce/lib'],
            basePath,
            OPTIONS,
            makeAdapter(),
            null,
            program,
          );
          const schema = schemasOf(result)![0];
          expect(schema.properties.find((property) => property.name === 'value')!.checkType).toBe(
            'string',
          );
          if (parameters === '<T = string>') {
            expect(schema.instanceCheckType).toBe('import("@ce/lib/element.js").SomeElement');
            expect(result.diagnostics).toEqual([]);
          } else {
            expect(schema.instanceCheckType).toBeUndefined();
            expect(result.diagnostics.length).toBe(1);
            expect(result.diagnostics[0].category).toBe(ts.DiagnosticCategory.Warning);
            expect(result.diagnostics[0].messageText).toContain('requires type arguments');
            expect(result.diagnostics[0].messageText).toContain(
              'Local references to the element are typed as HTMLElement',
            );
          }
        });
      }
    }

    const SOME_ELEMENT = 'import("@ce/lib/element.js").SomeElement';
    for (const {description, declaration, instanceCheckType} of [
      {
        description: 'extends HTMLElement',
        declaration: `extends HTMLElement { value: string; }`,
        instanceCheckType: SOME_ELEMENT,
      },
      {
        // For example, a DOM library that changed the type of an inherited property.
        description: 'extends HTMLElement with a conflicting member',
        declaration: `extends HTMLElement { value: string; autocorrect: 'off' | 'on'; }`,
        instanceCheckType: SOME_ELEMENT,
      },
      {
        description: 'omits its HTMLElement heritage',
        declaration: `{ value: string; }`,
        instanceCheckType: `(${SOME_ELEMENT}) & HTMLElement`,
      },
      {
        description: 'omits its HTMLElement heritage and has a conflicting member',
        declaration: `{ value: string; autocorrect: 'off' | 'on'; }`,
        instanceCheckType: undefined,
      },
    ]) {
      it(`should type element instances whose class ${description}`, () => {
        const fs = getFileSystem();
        fs.writeFile(
          _('/project/dom.d.ts'),
          `interface HTMLElement {
             autocorrect: boolean;
             addEventListener(type: string, listener: unknown): void;
           }
           declare var HTMLElement: {prototype: HTMLElement; new (): HTMLElement};`,
        );
        const domProgram = makeProgram(
          [_('/project/globals.d.ts'), _('/project/dom.d.ts')],
          undefined,
          DEFAULT_LIBRARY,
        );
        const packagePath = _('/project/node_modules/@ce/lib');
        writeManifest(_(`${packagePath}/custom-elements.json`), 'some-element');
        fs.writeFile(
          _(`${packagePath}/package.json`),
          JSON.stringify({name: '@ce/lib', customElements: './custom-elements.json'}),
        );
        fs.writeFile(
          _(`${packagePath}/element.d.ts`),
          `export declare class SomeElement ${declaration}`,
        );

        const result = loadCustomElementsManifests(
          ['@ce/lib'],
          basePath,
          OPTIONS,
          makeAdapter(),
          null,
          domProgram,
        );

        expect(schemasOf(result)![0].instanceCheckType).toBe(instanceCheckType);
        if (instanceCheckType !== undefined) {
          expect(result.diagnostics).toEqual([]);
        } else {
          expect(result.diagnostics.length).toBe(1);
          expect(result.diagnostics[0].code).toBe(
            ngErrorCode(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNUSABLE_TYPE),
          );
          expect(result.diagnostics[0].category).toBe(ts.DiagnosticCategory.Warning);
          expect(result.diagnostics[0].messageText).toContain(
            `the element class 'SomeElement' in 'element.js' has no addEventListener method, and ` +
              `its members conflict with HTMLElement`,
          );
        }
      });
    }

    it('should strip check types with unresolvable import specifiers and warn once each', () => {
      const fs = getFileSystem();
      writeManifest(_('/project/custom-elements.json'), 'some-element', {
        members: [
          {
            kind: 'field',
            name: 'variant',
            type: {text: 'Variant', references: [{name: 'Variant', package: '@does/not-exist'}]},
          },
          {
            kind: 'field',
            name: 'other',
            type: {text: 'Other', references: [{name: 'Other', package: '@does/not-exist'}]},
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
            type: {text: 'Mode', references: [{name: 'Mode', package: '@does/not-exist'}]},
          },
        ],
      });

      const result = loadCustomElementsManifests(
        ['./custom-elements.json'],
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
        program,
      );

      // One warning per unresolvable specifier, not one per use.
      expect(result.diagnostics.length).toBe(1);
      expect(result.diagnostics[0].code).toBe(
        ngErrorCode(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNRESOLVABLE_TYPE_REFERENCE),
      );
      expect(result.diagnostics[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(result.diagnostics[0].messageText).toContain(`'@does/not-exist'`);

      // Remove unresolved check types and keep self-contained types.
      const schema = schemasOf(result)!.find((s) => s.tagName === 'some-element')!;
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
      writeManifest(_('/project/node_modules/@ce/lib/custom-elements.json'), 'missing-element', {
        name: 'MissingElement',
        members: [
          {
            kind: 'field',
            name: 'present',
            type: {text: 'Present', references: [{name: 'Present', package: '@ce/lib'}]},
          },
          {
            kind: 'field',
            name: 'missing',
            type: {text: 'Missing', references: [{name: 'Missing', package: '@ce/lib'}]},
          },
        ],
        events: [
          {
            name: 'commit',
            type: {text: 'MissingEvent', references: [{name: 'MissingEvent', package: '@ce/lib'}]},
          },
        ],
      });

      const result = loadCustomElementsManifests(
        ['@ce/lib'],
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
        program,
        'verbose',
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

      const schema = schemasOf(result)![0];
      expect(schema.properties.find((property) => property.name === 'present')!.checkType).toBe(
        'import("@ce/lib").Present',
      );
      expect(
        schema.properties.find((property) => property.name === 'missing')!.checkType,
      ).toBeUndefined();
      expect(schema.events[0].checkType).toBeUndefined();
      expect(schema.instanceCheckType).toBeUndefined();
    });

    it('should summarize unresolvable references per manifest by default', () => {
      writeManifest(_('/project/custom-elements.json'), 'some-element', {
        members: [
          {
            kind: 'field',
            name: 'first',
            type: {text: 'First', references: [{name: 'First', package: '@does/not-exist-a'}]},
          },
          {
            kind: 'field',
            name: 'second',
            type: {text: 'Second', references: [{name: 'Second', package: '@does/not-exist-b'}]},
          },
        ],
      });

      const result = loadCustomElementsManifests(
        ['./custom-elements.json'],
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
        program,
      );

      // In the default summary mode, one warning describes all unusable references.
      expect(result.diagnostics.length).toBe(1);
      expect(result.diagnostics[0].code).toBe(
        ngErrorCode(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNRESOLVABLE_TYPE_REFERENCE),
      );
      expect(result.diagnostics[0].category).toBe(ts.DiagnosticCategory.Warning);
      const message = result.diagnostics[0].messageText as string;
      expect(message).toContain('2 type references do not resolve to usable TypeScript types');
      expect(message).toContain(`'@does/not-exist-a'`);
      expect(message).toContain(`'@does/not-exist-b'`);
      expect(message).toContain(
        `set "customElementsManifestsDiagnostics": "verbose" in angularCompilerOptions`,
      );
      // Stripping still applies to every affected check type.
      const schema = schemasOf(result)![0];
      expect(
        schema.properties.find((property) => property.name === 'first')!.checkType,
      ).toBeUndefined();
      expect(
        schema.properties.find((property) => property.name === 'second')!.checkType,
      ).toBeUndefined();
    });

    it('should summarize invalid tag name warnings per manifest by default', () => {
      getFileSystem().writeFile(
        _('/project/custom-elements.json'),
        JSON.stringify(
          customElementsManifest(
            {tagName: 'BaseButton'},
            {tagName: 'BaseInput'},
            {tagName: 'good-element'},
          ),
        ),
      );

      const result = loadCustomElementsManifests(
        ['./custom-elements.json'],
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
        program,
      );

      expect(schemasOf(result)!.map((schema) => schema.tagName)).toEqual(['good-element']);
      expect(result.diagnostics.length).toBe(1);
      expect(result.diagnostics[0].code).toBe(
        ngErrorCode(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_INVALID_TAG_NAME),
      );
      const message = result.diagnostics[0].messageText as string;
      expect(message).toContain(
        '2 declarations use tag names that are not valid custom element names',
      );
      expect(message).toContain(`'BaseButton'`);
      expect(message).toContain(`'BaseInput'`);
      expect(message).toContain(
        `set "customElementsManifestsDiagnostics": "verbose" in angularCompilerOptions`,
      );

      // Verbose mode restores the individual warnings.
      const verbose = loadCustomElementsManifests(
        ['./custom-elements.json'],
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
        program,
        'verbose',
      );
      expect(verbose.diagnostics.length).toBe(2);
      expect(verbose.diagnostics[0].messageText).toContain(`'BaseButton'`);
      expect(verbose.diagnostics[1].messageText).toContain(`'BaseInput'`);
    });

    it('should summarize structural inconsistencies and expand them in verbose mode', () => {
      writeManifest(_('/project/custom-elements.json'), 'some-element', {
        members: [
          {kind: 'field', name: 'variant', attribute: 'variant', type: {text: 'string'}},
          {kind: 'field', name: 'mode', privacy: 'internal', type: {text: 'string'}},
        ],
      });

      const result = loadCustomElementsManifests(
        ['./custom-elements.json'],
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
        program,
      );

      expect(result.diagnostics.length).toBe(1);
      expect(result.diagnostics[0].code).toBe(
        ngErrorCode(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_INVALID_STRUCTURE),
      );
      expect(result.diagnostics[0].category).toBe(ts.DiagnosticCategory.Warning);
      const message = result.diagnostics[0].messageText as string;
      expect(message).toContain('2 records are inconsistent with the rest of the manifest');
      expect(message).toContain(`'some-element.variant'`);
      expect(message).toContain(`'some-element.mode'`);
      expect(message).toContain(
        `set "customElementsManifestsDiagnostics": "verbose" in angularCompilerOptions`,
      );

      const schema = schemasOf(result)![0];
      expect(schema.properties.map((property) => property.name)).toEqual(['variant']);
      expect(schema.attributes).toEqual([]);

      const verbose = loadCustomElementsManifests(
        ['./custom-elements.json'],
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
        program,
        'verbose',
      );
      expect(verbose.diagnostics.length).toBe(2);
      expect(
        verbose.diagnostics.every(
          (diagnostic) =>
            diagnostic.code ===
            ngErrorCode(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_INVALID_STRUCTURE),
        ),
      ).toBeTrue();
      expect(verbose.diagnostics[0].messageText).toContain(
        'Angular uses the property without the attribute',
      );
      expect(verbose.diagnostics[1].messageText).toContain('invalid "privacy" value');
    });

    it('should summarize unusable type warnings and expand them in verbose mode', () => {
      writeManifest(_('/project/custom-elements.json'), 'my-element', {
        members: [
          {
            kind: 'field',
            name: 'variant',
            attribute: 'variant',
            type: {text: 'default | loading | success | error'},
          },
        ],
        attributes: [{name: 'variant', fieldName: 'variant'}],
        events: [{name: 'change', type: {text: '(value: string) => void'}}],
      });

      const result = loadCustomElementsManifests(
        ['./custom-elements.json'],
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
        program,
      );

      expect(result.diagnostics.length).toBe(1);
      expect(result.diagnostics[0].code).toBe(
        ngErrorCode(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNUSABLE_TYPE),
      );
      expect(result.diagnostics[0].category).toBe(ts.DiagnosticCategory.Warning);
      const message = result.diagnostics[0].messageText as string;
      expect(message).toContain('2 elements or members have missing or unusable type information');
      expect(message).toContain(`'my-element.variant'`);
      expect(message).toContain(`'my-element.change'`);
      expect(message).toContain(
        `set "customElementsManifestsDiagnostics": "verbose" in angularCompilerOptions`,
      );

      const schema = schemasOf(result)![0];
      expect(schema.properties[0].checkType).toBeUndefined();
      expect(schema.attributes![0].checkType).toBeUndefined();
      expect(schema.events[0].checkType).toBeUndefined();

      const verbose = loadCustomElementsManifests(
        ['./custom-elements.json'],
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
        program,
        'verbose',
      );
      expect(verbose.diagnostics.length).toBe(2);
      expect(verbose.diagnostics[0].messageText).toContain('default | loading | success | error');
      expect(verbose.diagnostics[0].messageText).toContain('type.references');
      expect(verbose.diagnostics[1].messageText).toContain('(value: string) => void');
      expect(verbose.diagnostics[1].messageText).toContain(
        'syntax or characters that Angular does not support',
      );
    });

    describe('cross-compiler caching', () => {
      const load = (
        cache: {entry: unknown},
        mode: 'summary' | 'verbose' = 'summary',
        loadProgram: ts.Program = program,
        options: ts.CompilerOptions = OPTIONS,
        entries: readonly string[] = ['./custom-elements.json'],
      ) =>
        loadCustomElementsManifests(
          entries,
          basePath,
          options,
          makeAdapter(),
          null,
          loadProgram,
          mode,
          cache,
        );

      it('should reuse the cached result while nothing has changed', () => {
        writeManifest(_('/project/custom-elements.json'), 'my-element');
        const cache = {entry: null};
        const first = load(cache);
        const second = load(cache);
        const equivalentProgram = makeProgram(
          [_('/project/globals.d.ts')],
          undefined,
          DEFAULT_LIBRARY,
        );
        const third = load(cache, 'summary', equivalentProgram);

        expect(second).toBe(first);
        expect(third).toBe(first);
        expect(schemasOf(first)![0].tagName).toBe('my-element');
      });

      it('should reuse cached types when manifest JSON files enter the program', () => {
        const manifestPath = _('/project/custom-elements.json');
        writeManifest(manifestPath, 'my-element');
        const cache = {entry: null};
        const first = load(cache);
        const programWithManifest = ts.createProgram({
          rootNames: [_('/project/globals.d.ts'), manifestPath],
          options: {...OPTIONS, resolveJsonModule: true},
          host: new NgtscCompilerHost(getFileSystem(), OPTIONS),
        });
        expect(programWithManifest.getSourceFile(manifestPath)).toBeDefined();
        expect(load(cache, 'summary', programWithManifest)).toBe(first);
      });

      it('should not cache results from a host-provided module resolver', () => {
        writeManifest(_('/project/custom-elements.json'), 'my-element');
        const cache = {entry: null};
        const adapter: NgCompilerAdapter = {
          ...makeAdapter(),
          resolveModuleNames: () => [],
        };
        const loadWithCustomResolver = () =>
          loadCustomElementsManifests(
            ['./custom-elements.json'],
            basePath,
            OPTIONS,
            adapter,
            null,
            program,
            'summary',
            cache,
          );

        expect(loadWithCustomResolver()).not.toBe(loadWithCustomResolver());
        expect(cache.entry).toBeNull();
      });

      it('should reload when a manifest file changes', () => {
        writeManifest(_('/project/custom-elements.json'), 'my-element');
        const cache = {entry: null};
        const first = load(cache);

        writeManifest(_('/project/custom-elements.json'), 'renamed-element');
        const second = load(cache);

        expect(second).not.toBe(first);
        expect(schemasOf(second)![0].tagName).toBe('renamed-element');
        // The refreshed result is cached in turn.
        expect(load(cache)).toBe(second);
      });

      it('should reload when a manifest is deleted', () => {
        writeManifest(_('/project/custom-elements.json'), 'my-element');
        const cache = {entry: null};
        const first = load(cache);
        expect(schemasOf(first)!.length).toBe(1);

        getFileSystem().removeFile(_('/project/custom-elements.json'));
        const second = load(cache);

        expect(schemasOf(second)).toBeNull();
        expect(second.diagnostics.length).toBe(1);
        expect(second.diagnostics[0].code).toBe(
          ngErrorCode(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_NOT_FOUND),
        );
      });

      it('should distinguish an empty manifest from a missing resource across cache entries', () => {
        const manifestPath = _('/project/custom-elements.json');
        const fs = getFileSystem();
        fs.writeFile(manifestPath, '');
        const baseAdapter = makeAdapter();
        const resourceAdapter: NgCompilerAdapter = {
          ...baseAdapter,
          // Match the language-service resource host, which represents an unavailable read as ''.
          readResource: (path) => baseAdapter.readFile(path) ?? '',
        };
        const cache = {entry: null};
        const loadResource = () =>
          loadCustomElementsManifests(
            ['./custom-elements.json'],
            basePath,
            OPTIONS,
            resourceAdapter,
            null,
            program,
            'summary',
            cache,
          );

        const empty = loadResource();
        expect(empty.diagnostics[0].code).toBe(
          ngErrorCode(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_INVALID),
        );

        fs.removeFile(manifestPath);
        const missing = loadResource();
        expect(missing).not.toBe(empty);
        expect(missing.diagnostics[0].code).toBe(
          ngErrorCode(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_NOT_FOUND),
        );

        fs.writeFile(manifestPath, '');
        const emptyAgain = loadResource();
        expect(emptyAgain).not.toBe(missing);
        expect(emptyAgain.diagnostics[0].code).toBe(
          ngErrorCode(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_INVALID),
        );
      });

      it('should reload when a missing manifest is created', () => {
        const cache = {entry: null};
        const missing = load(cache);
        expect(schemasOf(missing)).toBeNull();

        writeManifest(_('/project/custom-elements.json'), 'created-element');
        const created = load(cache);

        expect(created).not.toBe(missing);
        expect(schemasOf(created)![0].tagName).toBe('created-element');
      });

      it('should reload when a package.json affecting resolution changes', () => {
        const fs = getFileSystem();
        writeManifest(_('/project/node_modules/@my/lib/a/custom-elements.json'), 'element-a');
        writeManifest(_('/project/node_modules/@my/lib/b/custom-elements.json'), 'element-b');
        fs.writeFile(
          _('/project/node_modules/@my/lib/package.json'),
          JSON.stringify({
            name: '@my/lib',
            main: './index.js',
            customElements: './a/custom-elements.json',
          }),
        );
        const cache = {entry: null};
        const loadPackage = () =>
          loadCustomElementsManifests(
            ['@my/lib'],
            basePath,
            OPTIONS,
            makeAdapter(),
            null,
            program,
            'summary',
            cache,
          );
        expect(schemasOf(loadPackage())![0].tagName).toBe('element-a');

        fs.writeFile(
          _('/project/node_modules/@my/lib/package.json'),
          JSON.stringify({
            name: '@my/lib',
            main: './index.js',
            customElements: './b/custom-elements.json',
          }),
        );
        expect(schemasOf(loadPackage())![0].tagName).toBe('element-b');
      });

      it('should invalidate definition-only JSON manifests when package exports change', () => {
        const fs = getFileSystem();
        const packagePath = _('/project/node_modules/@my/lib');
        fs.ensureDir(packagePath);
        for (const tag of ['element-a', 'element-b']) {
          fs.writeFile(
            _(`${packagePath}/${tag}.json`),
            JSON.stringify({
              schemaVersion: '1.0.0',
              modules: [
                {
                  kind: 'javascript-module',
                  path: 'element.js',
                  exports: [
                    {kind: 'custom-element-definition', name: tag, declaration: {name: 'Element'}},
                  ],
                },
              ],
            }),
          );
        }
        const packageJsonPath = _(`${packagePath}/package.json`);
        const writeExports = (tag: string) =>
          fs.writeFile(
            packageJsonPath,
            JSON.stringify({
              name: '@my/lib',
              exports: {'./custom-elements.json': `./${tag}.json`},
            }),
          );
        const cache = {entry: null};
        const options = {moduleResolution: ts.ModuleResolutionKind.Bundler};
        const loadJson = () =>
          load(cache, 'summary', program, options, ['@my/lib/custom-elements.json']);
        writeExports('element-a');
        const first = loadJson();
        expect(schemasOf(first)![0].tagName).toBe('element-a');
        expect(first.resolutionPaths.has(packageJsonPath)).toBe(true);
        expect(loadJson()).toBe(first);
        writeExports('element-b');
        const second = loadJson();
        expect(second).not.toBe(first);
        expect(schemasOf(second)![0].tagName).toBe('element-b');
      });

      it('should not reuse results across diagnostics modes', () => {
        getFileSystem().writeFile(
          _('/project/custom-elements.json'),
          JSON.stringify(customElementsManifest({tagName: 'BaseA'}, {tagName: 'BaseB'})),
        );
        const cache = {entry: null};
        const summary = load(cache, 'summary');
        expect(summary.diagnostics.length).toBe(1);

        const verbose = load(cache, 'verbose');
        expect(verbose).not.toBe(summary);
        expect(verbose.diagnostics.length).toBe(2);
      });

      it('should not reuse results when entry order changes', () => {
        writeManifest(_('/project/first.json'), 'shared-element');
        writeManifest(_('/project/second.json'), 'shared-element', {
          members: [{kind: 'field', name: 'value', type: {text: 'number'}}],
        });
        const cache = {entry: null};

        const first = load(cache, 'summary', program, OPTIONS, ['./first.json', './second.json']);
        const second = load(cache, 'summary', program, OPTIONS, ['./second.json', './first.json']);

        expect(second).not.toBe(first);
        expect(schemasOf(first)![0].properties[0].checkType).toBe('string');
        expect(schemasOf(second)![0].properties[0].checkType).toBe('number');
      });

      it('should not reuse results across module resolution options', () => {
        writeManifest(_('/project/custom-elements.json'), 'my-element');
        const cache = {entry: null};
        const first = load(cache, 'summary', program, {
          ...OPTIONS,
          moduleSuffixes: ['.first', ''],
        });
        const second = load(cache, 'summary', program, {
          ...OPTIONS,
          moduleSuffixes: ['.second', ''],
        });

        expect(second).not.toBe(first);
      });

      it('should reload when the availability of a referenced global type changes', () => {
        writeManifest(_('/project/custom-elements.json'), 'global-element', {
          members: [
            {
              kind: 'field',
              name: 'value',
              type: {
                text: 'CacheGlobal',
                references: [{name: 'CacheGlobal', package: 'global:'}],
              },
            },
          ],
        });
        const cache = {entry: null};
        const missing = load(cache);
        expect(schemasOf(missing)![0].properties[0].checkType).toBeUndefined();

        getFileSystem().writeFile(
          _('/project/cache-global.d.ts'),
          'interface CacheGlobal { value: string; }',
        );
        const programWithGlobal = makeProgram(
          [_('/project/globals.d.ts'), _('/project/cache-global.d.ts')],
          undefined,
          DEFAULT_LIBRARY,
        );
        const available = load(cache, 'summary', programWithGlobal);
        expect(available).not.toBe(missing);
        expect(schemasOf(available)![0].properties[0].checkType).toBe('CacheGlobal');

        const missingAgain = load(cache);
        expect(missingAgain).not.toBe(available);
        expect(schemasOf(missingAgain)![0].properties[0].checkType).toBeUndefined();
      });

      it('should reload missing-global guidance when the consuming program shape changes', () => {
        writeManifest(_('/project/custom-elements.json'), 'global-element', {
          members: [
            {
              kind: 'field',
              name: 'value',
              type: {
                text: 'MissingGlobal',
                references: [{name: 'MissingGlobal', package: 'global:'}],
              },
            },
          ],
        });
        const cache = {entry: null};

        const withDefaultLibrary = load(cache);
        expect(withDefaultLibrary.diagnostics[0].messageText).not.toContain(
          'TypeScript library files',
        );

        const rootedLiblessProgram = makeProgram([_('/project/globals.d.ts')]);
        const withoutDefaultLibrary = load(cache, 'summary', rootedLiblessProgram);
        expect(withoutDefaultLibrary).not.toBe(withDefaultLibrary);
        expect(withoutDefaultLibrary.diagnostics[0].messageText).toContain(
          'The program loads no TypeScript library files',
        );
        expect(withoutDefaultLibrary.diagnostics[0].messageText).not.toContain(
          'only project references',
        );

        const solutionStyleProgram = makeProgram([], [{path: _('/project/application')}]);
        const solutionStyle = load(cache, 'summary', solutionStyleProgram);
        expect(solutionStyle).not.toBe(withoutDefaultLibrary);
        expect(solutionStyle.diagnostics[0].messageText).toContain('only project references');
      });

      function writeWalkupPackage(): void {
        const fs = getFileSystem();
        fs.ensureDir(_('/project/node_modules/@ce/walkup/dist'));
        fs.writeFile(
          _('/project/node_modules/@ce/walkup/package.json'),
          JSON.stringify({name: '@ce/walkup', customElements: './dist/custom-elements.json'}),
        );
        fs.writeFile(
          _('/project/node_modules/@ce/walkup/dist/element.d.ts'),
          `export type Variant = 'a' | 'b';
           export declare class WalkupElement extends HTMLElement {}`,
        );
        // The manifest lives in dist/ and its module paths are manifest-relative, so resolving
        // the reference depends on the package-root walk-up from the manifest directory.
        writeManifest(
          _('/project/node_modules/@ce/walkup/dist/custom-elements.json'),
          'walkup-element',
          {
            name: 'WalkupElement',
            members: [
              {
                kind: 'field',
                name: 'variant',
                type: {text: 'Variant', references: [{name: 'Variant', module: 'element.js'}]},
              },
            ],
            attributes: [{name: 'variant', fieldName: 'variant'}],
          },
        );
      }

      it('should reload when a nearer matching package.json appears on the walk-up path', () => {
        writeWalkupPackage();
        const cache = {entry: null};
        const first = load(cache, 'summary', program, OPTIONS, ['@ce/walkup']);
        expect(schemasOf(first)![0].properties[0].checkType).toBe(
          'import("@ce/walkup/dist/element.js").Variant',
        );
        expect(load(cache, 'summary', program, OPTIONS, ['@ce/walkup'])).toBe(first);

        // A matching package.json in dist/ changes the package root and breaks this type reference.
        // Creating the previously missing file must invalidate the cache.
        getFileSystem().writeFile(
          _('/project/node_modules/@ce/walkup/dist/package.json'),
          JSON.stringify({name: '@ce/walkup'}),
        );
        const changed = load(cache, 'summary', program, OPTIONS, ['@ce/walkup']);
        expect(changed).not.toBe(first);
        expect(schemasOf(changed)![0].properties[0].checkType).toBeUndefined();
      });

      it('should reload when a malformed walk-up package.json candidate is repaired', () => {
        writeWalkupPackage();
        // Correcting a skipped package.json changes the package root and must invalidate the cache.
        getFileSystem().writeFile(
          _('/project/node_modules/@ce/walkup/dist/package.json'),
          '{ not json',
        );
        const cache = {entry: null};
        const first = load(cache, 'summary', program, OPTIONS, ['@ce/walkup']);
        expect(schemasOf(first)![0].properties[0].checkType).toBe(
          'import("@ce/walkup/dist/element.js").Variant',
        );
        expect(load(cache, 'summary', program, OPTIONS, ['@ce/walkup'])).toBe(first);

        getFileSystem().writeFile(
          _('/project/node_modules/@ce/walkup/dist/package.json'),
          JSON.stringify({name: '@ce/walkup'}),
        );
        const changed = load(cache, 'summary', program, OPTIONS, ['@ce/walkup']);
        expect(changed).not.toBe(first);
        expect(schemasOf(changed)![0].properties[0].checkType).toBeUndefined();
      });

      it('should reload when referenced or transitive declarations change', () => {
        const fs = getFileSystem();
        const packageRoot = _('/project/node_modules/@ce/cache-types');
        fs.ensureDir(packageRoot);
        fs.writeFile(
          _('/project/node_modules/@ce/cache-types/package.json'),
          JSON.stringify({
            name: '@ce/cache-types',
            types: './element.d.ts',
            customElements: './custom-elements.json',
          }),
        );
        fs.writeFile(
          _('/project/node_modules/@ce/cache-types/element.d.ts'),
          `export {Variant} from './variant';
           export declare class SomeElement extends HTMLElement {}`,
        );
        fs.writeFile(
          _('/project/node_modules/@ce/cache-types/variant.d.ts'),
          `export type Variant = 'a' | 'b';`,
        );
        writeManifest(
          _('/project/node_modules/@ce/cache-types/custom-elements.json'),
          'cache-element',
          {
            members: [
              {
                kind: 'field',
                name: 'variant',
                attribute: 'variant',
                type: {
                  text: 'Variant',
                  references: [{name: 'Variant', package: '@ce/cache-types'}],
                },
              },
            ],
            attributes: [{name: 'variant', fieldName: 'variant'}],
          },
        );
        const cache = {entry: null};
        const loadPackage = (adapter: NgCompilerAdapter = makeAdapter()) =>
          loadCustomElementsManifests(
            ['@ce/cache-types'],
            basePath,
            OPTIONS,
            adapter,
            null,
            program,
            'summary',
            cache,
          );
        const literalValues = (result: ReturnType<typeof loadPackage>) =>
          schemasOf(result)![0].attributes![0].stringLiteralValues;

        const initial = loadPackage();
        expect(literalValues(initial)).toEqual(['a', 'b']);

        const editorType = loadPackage(
          makeAdapter(
            new Map([
              [
                _('/project/node_modules/@ce/cache-types/variant.d.ts'),
                `export type Variant = 'a' | 'editor';`,
              ],
            ]),
          ),
        );
        expect(editorType).not.toBe(initial);
        expect(literalValues(editorType)).toEqual(['a', 'editor']);

        fs.writeFile(
          _('/project/node_modules/@ce/cache-types/variant.d.ts'),
          `export type Variant = 'a' | 'c';`,
        );
        const changedTransitiveType = loadPackage();
        expect(changedTransitiveType).not.toBe(editorType);
        expect(literalValues(changedTransitiveType)).toEqual(['a', 'c']);

        fs.writeFile(
          _('/project/node_modules/@ce/cache-types/element.d.ts'),
          `export declare class SomeElement extends HTMLElement {}`,
        );
        const removedExport = loadPackage();
        expect(removedExport).not.toBe(changedTransitiveType);
        expect(schemasOf(removedExport)![0].properties[0].checkType).toBeUndefined();

        fs.writeFile(
          _('/project/node_modules/@ce/cache-types/element.d.ts'),
          `export {Variant} from './variant';
           export declare class SomeElement extends HTMLElement {}`,
        );
        const restoredExport = loadPackage();
        expect(restoredExport).not.toBe(removedExport);
        expect(schemasOf(restoredExport)![0].properties[0].checkType).toBe(
          'import("@ce/cache-types").Variant',
        );
        expect(loadPackage()).toBe(restoredExport);
      });

      it('should reload when a previously failed type lookup is created', () => {
        const fs = getFileSystem();
        fs.ensureDir(_('/project/node_modules/@ce/cache-create'));
        fs.writeFile(
          _('/project/node_modules/@ce/cache-create/package.json'),
          JSON.stringify({name: '@ce/cache-create'}),
        );
        fs.writeFile(
          _('/project/node_modules/@ce/cache-create/element.d.ts'),
          `export declare class SomeElement extends HTMLElement {}`,
        );
        writeManifest(
          _('/project/node_modules/@ce/cache-create/custom-elements.json'),
          'created-type-element',
          {
            members: [
              {
                kind: 'field',
                name: 'variant',
                type: {
                  text: 'Variant',
                  references: [{name: 'Variant', package: '@ce/cache-create', module: 'types.js'}],
                },
              },
            ],
          },
        );
        const cache = {entry: null};
        const loadPackage = () =>
          load(cache, 'summary', program, OPTIONS, ['@ce/cache-create/custom-elements.json']);

        const missing = loadPackage();
        expect(schemasOf(missing)![0].properties[0].checkType).toBeUndefined();

        fs.writeFile(
          _('/project/node_modules/@ce/cache-create/types.d.ts'),
          `export type Variant = 'created';`,
        );
        const created = loadPackage();
        expect(created).not.toBe(missing);
        expect(schemasOf(created)![0].properties[0].checkType).toBe(
          'import("@ce/cache-create/types.js").Variant',
        );
      });
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
      writeManifest(
        _('/project/node_modules/@ce/value-only/custom-elements.json'),
        'value-element',
        {
          name: 'ValueElement',
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
      );

      const result = loadCustomElementsManifests(
        ['@ce/value-only'],
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
        program,
      );

      expect(result.diagnostics.length).toBe(1);
      expect(result.diagnostics[0].code).toBe(
        ngErrorCode(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNRESOLVABLE_TYPE_REFERENCE),
      );
      expect(result.diagnostics[0].messageText).toContain('do not export that name as a type');
      expect(schemasOf(result)![0].properties[0].checkType).toBeUndefined();
      expect(schemasOf(result)![0].instanceCheckType).toBe(
        'import("@ce/value-only/element.js").ValueElement',
      );
    });

    it('should strip references to missing global types while keeping declared globals', () => {
      writeManifest(_('/project/custom-elements.json'), 'global-element', {
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
            type: {text: 'NotARealType', references: [{name: 'NotARealType', package: 'global:'}]},
          },
        ],
      });

      const result = loadCustomElementsManifests(
        ['./custom-elements.json'],
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
        program,
      );

      expect(result.diagnostics.length).toBe(1);
      expect(result.diagnostics[0].code).toBe(
        ngErrorCode(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNRESOLVABLE_TYPE_REFERENCE),
      );
      expect(result.diagnostics[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(result.diagnostics[0].messageText).toContain(
        `'NotARealType' is referenced with "package": "global:"`,
      );
      // A program with a loaded default library gets the normal per-name advice.
      expect(result.diagnostics[0].messageText).not.toContain('TypeScript library files');
      expect(result.diagnostics[0].messageText).not.toContain('only project references');
      const properties = schemasOf(result)![0].properties;
      expect(properties.find((property) => property.name === 'keyboardEvent')!.checkType).toBe(
        'KeyboardEvent',
      );
      expect(properties.find((property) => property.name === 'missing')!.checkType).toBeUndefined();
    });

    it('should explain missing globals in a solution-style root in summary and verbose modes', () => {
      writeManifest(_('/project/custom-elements.json'), 'libless-element', {
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
            name: 'external',
            type: {
              text: 'ExternalType',
              references: [{name: 'ExternalType', package: '@does/not-exist'}],
            },
          },
        ],
      });

      // Identify a solution-style tsconfig by its project references and lack of source files.
      const solutionStyleProgram = makeProgram([], [{path: _('/project/application')}]);
      const result = loadCustomElementsManifests(
        ['./custom-elements.json'],
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
        solutionStyleProgram,
      );

      expect(result.diagnostics.length).toBe(1);
      expect(result.diagnostics[0].code).toBe(
        ngErrorCode(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNRESOLVABLE_TYPE_REFERENCE),
      );
      const message = result.diagnostics[0].messageText as string;
      expect(message).toContain('only project references');
      expect(message).toContain('tsconfig.app.json');
      // Unresolved check types are still removed.
      expect(schemasOf(result)![0].properties[0].checkType).toBeUndefined();

      const verbose = loadCustomElementsManifests(
        ['./custom-elements.json'],
        basePath,
        OPTIONS,
        makeAdapter(),
        null,
        solutionStyleProgram,
        'verbose',
      );
      expect(verbose.diagnostics.length).toBe(2);
      const globalMessage = verbose.diagnostics.find((diagnostic) =>
        String(diagnostic.messageText).includes('"package": "global:"'),
      )?.messageText;
      expect(globalMessage).toContain('only project references');
      expect(globalMessage).toContain('tsconfig.app.json');
    });

    it('should use a manifest-relative module path and its declared default export as a fallback', () => {
      const fs = getFileSystem();
      const typeText = `null | NestedVariant`;
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
        JSON.stringify(
          customElementsManifest({
            tagName: 'nested-element',
            path: 'components/nested/nested.js',
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
            exports: [{kind: 'js', name: 'default', declaration: {name: 'NestedElement'}}],
          }),
        ),
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
        program,
      );

      expect(result.diagnostics).toEqual([]);
      expect(schemasOf(result)![0].instanceCheckType).toBe(
        'import("@ce/nested/dist/components/nested/nested.js").default',
      );
      expect(schemasOf(result)![0].properties[0].checkType).toBe('string');
      expect(schemasOf(result)![0].properties[1].checkType).toBe(
        `null | import("@ce/nested/dist/components/nested/nested.js").NestedVariant`,
      );
    });
  });
});

describe('manifest resolution on a case-insensitive Windows file system', () => {
  beforeEach(() => {
    initMockFileSystem('Windows');
    getFileSystem().ensureDir(_('/project'));
  });

  function windowsProgram(): ts.Program {
    return makeProgram([], undefined, DEFAULT_LIBRARY);
  }

  it('should resolve a path entry that differs from the on-disk casing', () => {
    writeManifest(_('/project/elements/custom-elements.json'), 'cased-element');
    const result = loadCustomElementsManifests(
      ['./Elements/Custom-Elements.JSON'],
      _('/project'),
      OPTIONS,
      makeAdapter(),
      null,
      windowsProgram(),
    );
    expect(result.diagnostics).toEqual([]);
    expect(schemasOf(result)!.map((schema) => schema.tagName)).toEqual(['cased-element']);
  });

  it('should discover the package root and emit portable specifiers for a scoped package', () => {
    const fs = getFileSystem();
    fs.ensureDir(_('/project/node_modules/@scope/pkg/dist'));
    fs.writeFile(
      _('/project/node_modules/@scope/pkg/package.json'),
      JSON.stringify({name: '@scope/pkg', customElements: './dist/custom-elements.json'}),
    );
    fs.writeFile(
      _('/project/node_modules/@scope/pkg/dist/element.d.ts'),
      `export type Variant = 'a' | 'b';
       export declare class ScopedElement extends HTMLElement {}`,
    );
    // Resolve the package root from a nested manifest directory on a case-insensitive Windows path.
    writeManifest(
      _('/project/node_modules/@scope/pkg/dist/custom-elements.json'),
      'scoped-element',
      {
        members: [
          {
            kind: 'field',
            name: 'variant',
            type: {text: 'Variant', references: [{name: 'Variant', module: 'element.js'}]},
          },
        ],
        name: 'ScopedElement',
      },
    );

    const result = loadCustomElementsManifests(
      ['@scope/pkg'],
      _('/project'),
      OPTIONS,
      makeAdapter(),
      null,
      windowsProgram(),
    );

    expect(result.diagnostics).toEqual([]);
    const schema = schemasOf(result)![0];
    // The emitted specifiers are portable package specifiers with forward slashes only,
    // regardless of the host path separator.
    expect(schema.properties[0].checkType).toBe('import("@scope/pkg/dist/element.js").Variant');
    expect(schema.instanceCheckType).toBe('import("@scope/pkg/dist/element.js").ScopedElement');
    expect(JSON.stringify(schemasOf(result))).not.toContain('\\\\');
  });

  it('should drop check types for manifest module paths that use backslashes', () => {
    const fs = getFileSystem();
    fs.ensureDir(_('/project/node_modules/@scope/back/dist'));
    fs.writeFile(
      _('/project/node_modules/@scope/back/package.json'),
      JSON.stringify({name: '@scope/back', customElements: './custom-elements.json'}),
    );
    fs.writeFile(
      _('/project/node_modules/@scope/back/dist/element.d.ts'),
      `export type Variant = 'a' | 'b';`,
    );
    fs.writeFile(
      _('/project/node_modules/@scope/back/custom-elements.json'),
      JSON.stringify(
        customElementsManifest({
          tagName: 'backslash-element',
          path: 'dist\\element.js',
          members: [
            {
              kind: 'field',
              name: 'variant',
              type: {text: 'Variant', references: [{name: 'Variant', module: 'dist\\element.js'}]},
            },
          ],
        }),
      ),
    );

    const result = loadCustomElementsManifests(
      ['@scope/back'],
      _('/project'),
      OPTIONS,
      makeAdapter(),
      null,
      windowsProgram(),
    );

    // Reject backslash module paths with a warning. Keep the declaration without its check types.
    const schema = schemasOf(result)![0];
    expect(schema.tagName).toBe('backslash-element');
    expect(schema.properties[0].checkType).toBeUndefined();
    expect(schema.instanceCheckType).toBeUndefined();
    expect(result.diagnostics.length).toBeGreaterThan(0);
    expect(
      result.diagnostics.every(
        (diagnostic) =>
          diagnostic.code === ngErrorCode(ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNUSABLE_TYPE),
      ),
    ).toBe(true);
  });
});
