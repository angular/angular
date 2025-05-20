/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// @ts-ignore This compiles fine, but Webstorm doesn't like the ESM import in a CJS context.
import {DocEntry, EntryType, FunctionEntry, JsDocTagEntry} from '@angular/compiler-cli';
import {generateManifest, Manifest} from '../generate_manifest.mjs';

describe('api manifest generation', () => {
  it('should generate a manifest from multiple collections', () => {
    const manifest: Manifest = generateManifest([
      {
        moduleName: '@angular/router',
        entries: [entry({name: 'Router', entryType: EntryType.UndecoratedClass})],
        normalizedModuleName: 'angular_router',
        moduleLabel: 'router',
      },
      {
        moduleName: '@angular/core',
        entries: [entry({name: 'PI', entryType: EntryType.Constant})],
        normalizedModuleName: 'angular_core',
        moduleLabel: 'core',
      },
      {
        moduleName: '@angular/core',
        entries: [entry({name: 'foo', entryType: EntryType.Constant})],
        normalizedModuleName: 'angular_core',
        moduleLabel: 'core',
      },
    ]);

    // The test also makes sure that we sort modules & entries by name.
    expect(manifest).toEqual([
      {
        moduleName: '@angular/core',
        moduleLabel: 'core',
        normalizedModuleName: 'angular_core',
        entries: [
          {
            name: 'foo',
            type: EntryType.Constant,
            developerPreview: undefined,
            deprecated: undefined,
            experimental: undefined,
            stable: undefined,
          },
          {
            name: 'PI',
            type: EntryType.Constant,
            developerPreview: undefined,
            deprecated: undefined,
            experimental: undefined,
            stable: undefined,
          },
        ],
      },
      {
        moduleName: '@angular/router',
        moduleLabel: 'router',
        normalizedModuleName: 'angular_router',
        entries: [
          {
            name: 'Router',
            type: EntryType.UndecoratedClass,
            developerPreview: undefined,
            deprecated: undefined,
            experimental: undefined,
            stable: undefined,
          },
        ],
      },
    ]);
  });

  it('should generate a manifest when collections share a symbol with the same name', () => {
    const manifest = generateManifest([
      {
        moduleName: '@angular/core',
        entries: [entry({name: 'PI', entryType: EntryType.Constant})],
        normalizedModuleName: 'angular_core',
        moduleLabel: 'core',
      },
      {
        moduleName: '@angular/router',
        entries: [entry({name: 'PI', entryType: EntryType.Constant})],
        normalizedModuleName: 'angular_router',
        moduleLabel: 'router',
      },
    ]);

    expect(manifest).toEqual([
      {
        moduleName: '@angular/core',
        moduleLabel: 'core',
        normalizedModuleName: 'angular_core',
        entries: [
          {
            name: 'PI',
            type: EntryType.Constant,
            developerPreview: undefined,
            deprecated: undefined,
            experimental: undefined,
            stable: undefined,
          },
        ],
      },
      {
        moduleName: '@angular/router',
        moduleLabel: 'router',
        normalizedModuleName: 'angular_router',
        entries: [
          {
            name: 'PI',
            type: EntryType.Constant,
            developerPreview: undefined,
            deprecated: undefined,
            experimental: undefined,
            stable: undefined,
          },
        ],
      },
    ]);
  });

  it('should union collections for the same module into one manifest', () => {
    const manifest = generateManifest([
      {
        moduleName: '@angular/core',
        entries: [entry({name: 'PI', entryType: EntryType.Constant})],
        normalizedModuleName: 'angular_core',
        moduleLabel: 'core',
      },
      {
        moduleName: '@angular/core',
        entries: [entry({name: 'TAO', entryType: EntryType.Constant})],
        normalizedModuleName: 'angular_core',
        moduleLabel: 'core',
      },
    ]);

    expect(manifest).toEqual([
      {
        moduleName: '@angular/core',
        moduleLabel: 'core',
        normalizedModuleName: 'angular_core',
        entries: [
          {
            name: 'PI',
            type: EntryType.Constant,
            developerPreview: undefined,
            deprecated: undefined,
            experimental: undefined,
            stable: undefined,
          },
          {
            name: 'TAO',
            type: EntryType.Constant,
            developerPreview: undefined,
            deprecated: undefined,
            experimental: undefined,
            stable: undefined,
          },
        ],
      },
    ]);
  });

  it('should mark a manifest entry as deprecated', () => {
    const manifest = generateManifest([
      {
        moduleName: '@angular/core',
        entries: [
          entry({name: 'PI', entryType: EntryType.Constant, jsdocTags: jsdocTags('deprecated')}),
          entry({name: 'XI', entryType: EntryType.Constant, jsdocTags: jsdocTags('experimental')}),
        ],
        normalizedModuleName: 'angular_core',
        moduleLabel: 'core',
      },
    ]);

    expect(manifest).toEqual([
      {
        moduleName: '@angular/core',
        moduleLabel: 'core',
        normalizedModuleName: 'angular_core',
        entries: [
          {
            name: 'PI',
            type: EntryType.Constant,
            developerPreview: undefined,
            deprecated: {version: undefined},
            experimental: undefined,
            stable: undefined,
          },
          {
            name: 'XI',
            type: EntryType.Constant,
            developerPreview: undefined,
            deprecated: undefined,
            experimental: {version: undefined},
            stable: undefined,
          },
        ],
      },
    ]);
  });

  it('should not mark a function as deprecated if only one overload is deprecated', () => {
    const manifest = generateManifest([
      {
        moduleName: '@angular/core',
        entries: [
          functionEntry({
            name: 'save',
            entryType: EntryType.Function,
            jsdocTags: [],
            signatures: [
              {
                name: 'save',
                returnType: 'void',
                jsdocTags: [],
                description: '',
                entryType: EntryType.Function,
                params: [],
                generics: [],
                isNewType: false,
                rawComment: '',
              },
              {
                name: 'save',
                returnType: 'void',
                jsdocTags: jsdocTags('deprecated'),
                description: '',
                entryType: EntryType.Function,
                params: [],
                generics: [],
                isNewType: false,
                rawComment: '',
              },
            ],
          }),
        ],
        normalizedModuleName: 'angular_core',
        moduleLabel: 'core',
      },
    ]);

    expect(manifest).toEqual([
      {
        moduleName: '@angular/core',
        moduleLabel: 'core',
        normalizedModuleName: 'angular_core',
        entries: [
          {
            name: 'save',
            type: EntryType.Function,
            developerPreview: undefined,
            deprecated: undefined,
            experimental: undefined,
            stable: undefined,
          },
        ],
      },
    ]);
  });

  it('should mark a function as deprecated if all overloads are deprecated', () => {
    const manifest = generateManifest([
      {
        moduleName: '@angular/core',
        entries: [
          functionEntry({
            name: 'save',
            entryType: EntryType.Function,
            jsdocTags: [],
            signatures: [
              {
                name: 'save',
                returnType: 'void',
                jsdocTags: jsdocTags('deprecated'),
                description: '',
                entryType: EntryType.Function,
                params: [],
                generics: [],
                isNewType: false,
                rawComment: '',
              },
              {
                name: 'save',
                returnType: 'void',
                jsdocTags: jsdocTags('deprecated'),
                description: '',
                entryType: EntryType.Function,
                params: [],
                generics: [],
                isNewType: false,
                rawComment: '',
              },
            ],
          }),
        ],
        normalizedModuleName: 'angular_core',
        moduleLabel: 'core',
      },
    ]);

    expect(manifest).toEqual([
      {
        moduleName: '@angular/core',
        normalizedModuleName: 'angular_core',
        moduleLabel: 'core',
        entries: [
          {
            name: 'save',
            type: EntryType.Function,
            developerPreview: undefined,
            deprecated: {version: undefined},
            experimental: undefined,
            stable: undefined,
          },
        ],
      },
    ]);
  });

  it("should mark a fn as deprecated if there's one w/ the same name in another collection", () => {
    const manifest = generateManifest([
      {
        moduleName: '@angular/core',
        entries: [
          entry({name: 'save', entryType: EntryType.Function, jsdocTags: jsdocTags('deprecated')}),
        ],
        normalizedModuleName: 'angular_core',
        moduleLabel: 'core',
      },
      {
        moduleName: '@angular/more',
        entries: [entry({name: 'save', entryType: EntryType.Function})],
        normalizedModuleName: 'angular_more',
        moduleLabel: 'more',
      },
    ]);

    expect(manifest).toEqual([
      {
        moduleName: '@angular/core',
        moduleLabel: 'core',
        normalizedModuleName: 'angular_core',
        entries: [
          {
            name: 'save',
            type: EntryType.Function,
            developerPreview: undefined,
            deprecated: {version: undefined},
            experimental: undefined,
            stable: undefined,
          },
        ],
      },
      {
        moduleName: '@angular/more',
        moduleLabel: 'more',
        normalizedModuleName: 'angular_more',
        entries: [
          {
            name: 'save',
            type: EntryType.Function,
            developerPreview: undefined,
            deprecated: undefined,
            experimental: undefined,
            stable: undefined,
          },
        ],
      },
    ]);
  });

  it('should mark a manifest entry as developerPreview', () => {
    const manifest = generateManifest([
      {
        moduleName: '@angular/core',
        entries: [
          entry({
            name: 'PI',
            entryType: EntryType.Constant,
            jsdocTags: jsdocTags('developerPreview'),
          }),
          entry({name: 'XI', entryType: EntryType.Constant, jsdocTags: jsdocTags('experimental')}),
        ],
        normalizedModuleName: 'angular_core',
        moduleLabel: 'core',
      },
    ]);

    expect(manifest).toEqual([
      {
        moduleName: '@angular/core',
        moduleLabel: 'core',
        normalizedModuleName: 'angular_core',
        entries: [
          {
            name: 'PI',
            type: EntryType.Constant,
            developerPreview: {version: undefined},
            deprecated: undefined,
            experimental: undefined,
            stable: undefined,
          },
          {
            name: 'XI',
            type: EntryType.Constant,
            developerPreview: undefined,
            deprecated: undefined,
            experimental: {version: undefined},
            stable: undefined,
          },
        ],
      },
    ]);
  });
});

/** Creates a fake DocsEntry with the given object's fields patches onto the result. */
function entry(patch: Partial<DocEntry>): DocEntry {
  return {
    name: '',
    description: '',
    entryType: EntryType.Constant,
    jsdocTags: [],
    rawComment: '',
    ...patch,
  };
}

function functionEntry(patch: Partial<FunctionEntry>): FunctionEntry {
  return entry({
    entryType: EntryType.Function,
    implementation: [],
    signatures: [],
    ...patch,
  } as FunctionEntry) as FunctionEntry;
}

/** Creates a fake jsdoc tag entry list that contains a tag with the given name */
function jsdocTags(name: string): JsDocTagEntry[] {
  return [{name, comment: ''}];
}
