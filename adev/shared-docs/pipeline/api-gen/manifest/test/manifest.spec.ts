// @ts-ignore This compiles fine, but Webstorm doesn't like the ESM import in a CJS context.
import {DocEntry, EntryType, JsDocTagEntry} from '@angular/compiler-cli';
import {generateManifest} from '../generate_manifest';

describe('api manifest generation', () => {
  it('should generate a manifest from multiple collections', () => {
    const manifest = generateManifest([
      {
        moduleName: '@angular/core',
        entries: [entry({name: 'PI', entryType: EntryType.Constant})],
      },
      {
        moduleName: '@angular/router',
        entries: [entry({name: 'Router', entryType: EntryType.UndecoratedClass})],
      },
    ]);

    expect(manifest).toEqual({
      '@angular/core': [
        {
          name: 'PI',
          type: EntryType.Constant,
          isDeprecated: false,
          isDeveloperPreview: false,
          isExperimental: false,
        },
      ],
      '@angular/router': [
        {
          name: 'Router',
          type: EntryType.UndecoratedClass,
          isDeprecated: false,
          isDeveloperPreview: false,
          isExperimental: false,
        },
      ],
    });
  });

  it('should generate a manifest when collections share a symbol with the same name', () => {
    const manifest = generateManifest([
      {
        moduleName: '@angular/core',
        entries: [entry({name: 'PI', entryType: EntryType.Constant})],
      },
      {
        moduleName: '@angular/router',
        entries: [entry({name: 'PI', entryType: EntryType.Constant})],
      },
    ]);

    expect(manifest).toEqual({
      '@angular/core': [
        {
          name: 'PI',
          type: EntryType.Constant,
          isDeprecated: false,
          isDeveloperPreview: false,
          isExperimental: false,
        },
      ],
      '@angular/router': [
        {
          name: 'PI',
          type: EntryType.Constant,
          isDeprecated: false,
          isDeveloperPreview: false,
          isExperimental: false,
        },
      ],
    });
  });

  it('should union collections for the same module into one manifest', () => {
    const manifest = generateManifest([
      {
        moduleName: '@angular/core',
        entries: [entry({name: 'PI', entryType: EntryType.Constant})],
      },
      {
        moduleName: '@angular/core',
        entries: [entry({name: 'TAO', entryType: EntryType.Constant})],
      },
    ]);

    expect(manifest).toEqual({
      '@angular/core': [
        {
          name: 'PI',
          type: EntryType.Constant,
          isDeprecated: false,
          isDeveloperPreview: false,
          isExperimental: false,
        },
        {
          name: 'TAO',
          type: EntryType.Constant,
          isDeprecated: false,
          isDeveloperPreview: false,
          isExperimental: false,
        },
      ],
    });
  });

  it('should mark a manifest entry as deprecated', () => {
    const manifest = generateManifest([
      {
        moduleName: '@angular/core',
        entries: [
          entry({name: 'PI', entryType: EntryType.Constant, jsdocTags: jsdocTags('deprecated')}),
          entry({name: 'XI', entryType: EntryType.Constant, jsdocTags: jsdocTags('experimental')}),
        ],
      },
    ]);

    expect(manifest).toEqual({
      '@angular/core': [
        {
          name: 'PI',
          type: EntryType.Constant,
          isDeprecated: true,
          isDeveloperPreview: false,
          isExperimental: false,
        },
        {
          name: 'XI',
          type: EntryType.Constant,
          isDeprecated: false,
          isDeveloperPreview: false,
          isExperimental: true,
        },
      ],
    });
  });

  it('should deduplicate function overloads', () => {
    const manifest = generateManifest([
      {
        moduleName: '@angular/core',
        entries: [
          entry({name: 'save', entryType: EntryType.Function}),
          entry({name: 'save', entryType: EntryType.Function}),
        ],
      },
    ]);

    expect(manifest).toEqual({
      '@angular/core': [
        {
          name: 'save',
          type: EntryType.Function,
          isDeprecated: false,
          isDeveloperPreview: false,
          isExperimental: false,
        },
      ],
    });
  });

  it('should not mark a function as deprecated if only one overload is deprecated', () => {
    const manifest = generateManifest([
      {
        moduleName: '@angular/core',
        entries: [
          entry({name: 'save', entryType: EntryType.Function}),
          entry({name: 'save', entryType: EntryType.Function, jsdocTags: jsdocTags('deprecated')}),
        ],
      },
    ]);

    expect(manifest).toEqual({
      '@angular/core': [
        {
          name: 'save',
          type: EntryType.Function,
          isDeprecated: false,
          isDeveloperPreview: false,
          isExperimental: false,
        },
      ],
    });
  });

  it('should mark a function as deprecated if all overloads are deprecated', () => {
    const manifest = generateManifest([
      {
        moduleName: '@angular/core',
        entries: [
          entry({name: 'save', entryType: EntryType.Function, jsdocTags: jsdocTags('deprecated')}),
          entry({name: 'save', entryType: EntryType.Function, jsdocTags: jsdocTags('deprecated')}),
        ],
      },
    ]);

    expect(manifest).toEqual({
      '@angular/core': [
        {
          name: 'save',
          type: EntryType.Function,
          isDeprecated: true,
          isDeveloperPreview: false,
          isExperimental: false,
        },
      ],
    });
  });

  it("should mark a fn as deprecated if there's one w/ the same name in another collection", () => {
    const manifest = generateManifest([
      {
        moduleName: '@angular/core',
        entries: [
          entry({name: 'save', entryType: EntryType.Function, jsdocTags: jsdocTags('deprecated')}),
        ],
      },
      {
        moduleName: '@angular/more',
        entries: [entry({name: 'save', entryType: EntryType.Function})],
      },
    ]);

    expect(manifest).toEqual({
      '@angular/core': [
        {
          name: 'save',
          type: EntryType.Function,
          isDeprecated: true,
          isDeveloperPreview: false,
          isExperimental: false,
        },
      ],
      '@angular/more': [
        {
          name: 'save',
          type: EntryType.Function,
          isDeprecated: false,
          isDeveloperPreview: false,
          isExperimental: false,
        },
      ],
    });
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
      },
    ]);

    expect(manifest).toEqual({
      '@angular/core': [
        {
          name: 'PI',
          type: EntryType.Constant,
          isDeveloperPreview: true,
          isDeprecated: false,
          isExperimental: false,
        },
        {
          name: 'XI',
          type: EntryType.Constant,
          isDeveloperPreview: false,
          isDeprecated: false,
          isExperimental: true,
        },
      ],
    });
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

/** Creates a fake jsdoc tag entry list that contains a tag with the given name */
function jsdocTags(name: string): JsDocTagEntry[] {
  return [{name, comment: ''}];
}
