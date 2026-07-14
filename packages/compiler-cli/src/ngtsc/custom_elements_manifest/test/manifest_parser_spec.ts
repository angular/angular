/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵCustomElementsManifestSchema as CustomElementsManifestSchema} from '@angular/compiler';
import type {Package as CustomElementsManifestPackage} from 'custom-elements-manifest';

import {ParsedCustomElementsManifest, parseCustomElementsManifest} from '../src/manifest_parser';

function parse(manifest: unknown): ParsedCustomElementsManifest {
  return parseCustomElementsManifest(JSON.stringify(manifest), '/custom-elements.json');
}

function schemaFor(
  result: {schemas: CustomElementsManifestSchema[]},
  tagName: string,
): CustomElementsManifestSchema | undefined {
  return result.schemas.find((schema) => schema.tagName === tagName);
}

describe('parseCustomElementsManifest', () => {
  it('should report an error for invalid JSON', () => {
    const result = parseCustomElementsManifest('not json {', '/custom-elements.json');
    expect(result.schemas).toEqual([]);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toContain(`Failed to parse '/custom-elements.json' as JSON`);
  });

  it('should report an error for JSON that is not a manifest', () => {
    const result = parse({some: 'object'});
    expect(result.schemas).toEqual([]);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toContain('does not appear to be a Custom Elements Manifest');
  });

  it('should require the schemaVersion field defined by the CEM schema', () => {
    const result = parse({modules: []});
    expect(result.schemas).toEqual([]);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toContain('schemaVersion');
  });

  it('should extract elements with members, attributes and events', () => {
    const result = parse({
      schemaVersion: '1.0.0',
      modules: [
        {
          kind: 'javascript-module',
          path: 'my-button.js',
          declarations: [
            {
              kind: 'class',
              name: 'MyButton',
              customElement: true,
              tagName: 'my-button',
              members: [
                {kind: 'field', name: 'label', type: {text: 'string'}},
                {kind: 'field', name: 'disabled', type: {text: 'boolean'}},
                {kind: 'field', name: 'count', type: {text: 'number'}},
                {kind: 'field', name: 'variant', type: {text: "'primary' | 'secondary'"}},
                {kind: 'field', name: 'items', type: {text: 'MyItem[]'}},
                {kind: 'field', name: 'untyped'},
                {kind: 'method', name: 'focusButton'},
                {kind: 'field', name: 'internalState', privacy: 'private'},
                {kind: 'field', name: 'protectedState', privacy: 'protected'},
                {kind: 'field', name: 'defaultVariant', static: true},
                {kind: 'field', name: 'validity', type: {text: 'object'}, readonly: true},
              ],
              attributes: [
                {name: 'label', fieldName: 'label'},
                {name: 'data-context', type: {text: 'string'}},
                // Backed by a non-bindable (readonly) field: not registered under either name.
                {name: 'validity', fieldName: 'validity', type: {text: 'string'}},
                // Dangling fieldName: the field is missing from the manifest, so the attribute
                // falls back to registration under its own name.
                {name: 'orphan', fieldName: 'missingField', type: {text: 'string'}},
              ],
              events: [{name: 'itemselect', type: {text: 'CustomEvent'}}],
            },
          ],
        },
      ],
    });

    expect(result.errors).toEqual([]);
    const schema = schemaFor(result, 'my-button')!;
    expect(schema).toBeDefined();
    const properties = new Map(schema.properties.map((p) => [p.name, p.type]));
    expect(properties.get('label')).toBe('string');
    expect(properties.get('disabled')).toBe('boolean');
    expect(properties.get('count')).toBe('number');
    expect(properties.get('variant')).toBe('string');
    expect(properties.get('items')).toBe('object');
    expect(properties.get('untyped')).toBe('object');
    // Attribute declarations do not imply same-named JavaScript properties.
    expect(properties.has('data-context')).toBe(false);
    // Methods, static, non-public and readonly fields are not bindable properties.
    expect(properties.has('focusButton')).toBe(false);
    expect(properties.has('internalState')).toBe(false);
    expect(properties.has('protectedState')).toBe(false);
    expect(properties.has('defaultVariant')).toBe(false);
    expect(properties.has('validity')).toBe(false);
    expect(properties.has('orphan')).toBe(false);
    expect(schema.attributes).toEqual([
      {name: 'label', fieldName: 'label'},
      {
        name: 'data-context',
        type: 'string',
        checkType: 'string',
        typeText: 'string',
      },
      {
        name: 'validity',
        fieldName: 'validity',
        type: 'string',
        checkType: 'string',
        typeText: 'string',
      },
      {
        name: 'orphan',
        fieldName: 'missingField',
        type: 'string',
        checkType: 'string',
        typeText: 'string',
      },
    ]);
    expect(schema.events).toEqual([
      {name: 'itemselect', checkType: 'CustomEvent', typeText: 'CustomEvent'},
    ]);
  });

  it('should extract documentation and deprecation metadata', () => {
    const result = parse({
      schemaVersion: '1.0.0',
      modules: [
        {
          kind: 'javascript-module',
          path: 'my-doc.js',
          declarations: [
            {
              kind: 'class',
              name: 'MyDoc',
              customElement: true,
              tagName: 'my-doc',
              summary: 'Short summary.',
              description: 'A documented element.',
              deprecated: true,
              members: [
                {
                  kind: 'field',
                  name: 'value',
                  type: {text: 'string'},
                  summary: 'Summary only.',
                  deprecated: 'Use newValue instead.',
                  default: 'initial',
                },
                {kind: 'field', name: 'plain', type: {text: 'string'}, deprecated: false},
              ],
              events: [{name: 'commit', description: 'Fired on commit.'}],
            },
          ],
        },
      ],
    });

    expect(result.errors).toEqual([]);
    const schema = schemaFor(result, 'my-doc')!;
    // `description` is preferred over `summary`; `deprecated: false` is omitted.
    expect(schema.description).toBe('A documented element.');
    expect(schema.deprecated).toBe(true);
    const value = schema.properties.find((p) => p.name === 'value')!;
    expect(value.description).toBe('Summary only.');
    expect(value.deprecated).toBe('Use newValue instead.');
    expect(value.typeText).toBe('string');
    expect(value.default).toBe('initial');
    const plain = schema.properties.find((p) => p.name === 'plain')!;
    expect(plain.description).toBeUndefined();
    expect(plain.deprecated).toBeUndefined();
    expect(schema.events).toEqual([{name: 'commit', description: 'Fired on commit.'}]);
  });

  it('should resolve tag names from custom-element-definition exports', () => {
    const result = parse({
      schemaVersion: '1.0.0',
      modules: [
        {
          kind: 'javascript-module',
          path: 'my-card.js',
          declarations: [
            {
              kind: 'class',
              name: 'MyCard',
              customElement: true,
              members: [{kind: 'field', name: 'elevated', type: {text: 'boolean'}}],
            },
          ],
        },
        {
          kind: 'javascript-module',
          path: 'define.js',
          exports: [
            {
              kind: 'custom-element-definition',
              name: 'my-card',
              declaration: {name: 'MyCard', module: 'my-card.js'},
            },
          ],
        },
      ],
    });

    expect(result.errors).toEqual([]);
    const schema = schemaFor(result, 'my-card')!;
    expect(schema).toBeDefined();
    expect(new Map(schema.properties.map((p) => [p.name, p.type])).get('elevated')).toBe('boolean');
  });

  it('should use the module path when export references share a declaration name', () => {
    const result = parse({
      schemaVersion: '1.0.0',
      modules: [
        {
          path: 'primary.js',
          declarations: [
            {
              kind: 'class',
              name: 'Button',
              customElement: true,
              members: [{kind: 'field', name: 'primary', type: {text: 'boolean'}}],
            },
          ],
        },
        {
          path: 'secondary.js',
          declarations: [
            {
              kind: 'class',
              name: 'Button',
              customElement: true,
              members: [{kind: 'field', name: 'secondary', type: {text: 'boolean'}}],
            },
          ],
        },
        {
          path: 'define.js',
          exports: [
            {
              kind: 'custom-element-definition',
              name: 'primary-button',
              declaration: {name: 'Button', module: './primary.js'},
            },
          ],
        },
      ],
    });

    expect(result.schemas.length).toBe(1);
    expect(result.schemas[0].tagName).toBe('primary-button');
    expect(result.schemas[0].properties.map((property) => property.name)).toEqual(['primary']);
  });

  it('should skip custom element declarations without a tag name', () => {
    const result = parse({
      schemaVersion: '1.0.0',
      modules: [
        {
          kind: 'javascript-module',
          path: 'base.js',
          declarations: [{kind: 'class', name: 'MyBase', customElement: true}],
        },
      ],
    });
    expect(result.errors).toEqual([]);
    expect(result.schemas).toEqual([]);
  });

  it('should skip declarations that are not custom elements and tolerate unknown shapes', () => {
    const result = parse({
      schemaVersion: '2.1.0',
      modules: [
        'garbage',
        {kind: 'javascript-module', path: 'util.js'},
        {
          kind: 'javascript-module',
          path: 'mixed.js',
          declarations: [
            {kind: 'class', name: 'NotAnElement'},
            {kind: 'function', name: 'helper'},
            42,
            {
              kind: 'class',
              name: 'MyChip',
              customElement: true,
              tagName: 'my-chip',
              members: 'unexpected',
              attributes: [null],
              events: [{noName: true}],
            },
          ],
        },
      ],
    });

    expect(result.errors).toEqual([]);
    expect(result.schemas.length).toBe(1);
    expect(result.schemas[0].tagName).toBe('my-chip');
    expect(result.schemas[0].properties).toEqual([]);
    expect(result.schemas[0].events).toEqual([]);
  });

  it('should compute check types for trustworthy type text', () => {
    const result = parse({
      schemaVersion: '1.0.0',
      modules: [
        {
          path: 'a.js',
          declarations: [
            {
              kind: 'class',
              name: 'MyButton',
              customElement: true,
              tagName: 'my-button',
              members: [
                {kind: 'field', name: 'count', type: {text: 'number'}},
                {kind: 'field', name: 'variant', type: {text: "'primary' | 'secondary'"}},
                {kind: 'field', name: 'items', type: {text: 'MyItem[]'}},
                {kind: 'field', name: 'mixed', type: {text: 'boolean | number'}},
                {kind: 'field', name: 'untyped'},
              ],
              attributes: [
                {name: 'data-mode', type: {text: "'on' | 'off'"}},
                {name: 'mixed', fieldName: 'mixed', type: {text: 'boolean | number'}},
              ],
            },
          ],
        },
      ],
    });

    const properties = new Map(schemaFor(result, 'my-button')!.properties.map((p) => [p.name, p]));
    expect(properties.get('count')!.checkType).toBe('number');
    expect(properties.get('variant')!.checkType).toBe("'primary' | 'secondary'");
    // Named type without references: coarse tag only.
    expect(properties.get('items')!.type).toBe('object');
    expect(properties.get('items')!.checkType).toBeUndefined();
    // Mixed serialization categories cannot be converted safely from static HTML text.
    expect(properties.get('mixed')!.type).toBe('object');
    expect(properties.get('mixed')!.checkType).toBe('boolean | number');
    expect(properties.get('untyped')!.checkType).toBeUndefined();
    expect(properties.has('data-mode')).toBe(false);
    expect(schemaFor(result, 'my-button')!.attributes).toEqual([
      {
        name: 'data-mode',
        type: 'string',
        checkType: "'on' | 'off'",
        typeText: "'on' | 'off'",
      },
      {
        name: 'mixed',
        fieldName: 'mixed',
        type: 'object',
        checkType: 'boolean | number',
        typeText: 'boolean | number',
      },
    ]);
  });

  it('should compute referenced check types using the owning package', () => {
    const result = parseCustomElementsManifest(
      JSON.stringify({
        schemaVersion: '1.0.0',
        modules: [
          {
            path: 'a.js',
            declarations: [
              {
                kind: 'class',
                name: 'MyList',
                customElement: true,
                tagName: 'my-list',
                members: [
                  {
                    kind: 'field',
                    name: 'items',
                    type: {
                      text: 'MyItem[]',
                      references: [{name: 'MyItem', package: '@my/elements', start: 0, end: 6}],
                    },
                  },
                ],
              },
            ],
          },
        ],
      }),
      '/custom-elements.json',
      '@my/elements',
    );

    const properties = new Map(schemaFor(result, 'my-list')!.properties.map((p) => [p.name, p]));
    expect(properties.get('items')!.checkType).toBe('import("@my/elements").MyItem[]');
  });

  it('should use a public re-export module for the element instance type', () => {
    const result = parseCustomElementsManifest(
      JSON.stringify({
        schemaVersion: '1.0.0',
        modules: [
          {
            kind: 'javascript-module',
            path: 'internal/button.js',
            declarations: [
              {
                kind: 'class',
                name: 'MyButton',
                customElement: true,
                tagName: 'my-button',
              },
            ],
          },
          {
            kind: 'javascript-module',
            path: 'index.js',
            exports: [
              {
                kind: 'js',
                name: 'PublicButton',
                declaration: {name: 'MyButton', module: 'internal/button.js'},
              },
            ],
          },
        ],
      }),
      '/custom-elements.json',
      '@my/elements',
    );

    expect(schemaFor(result, 'my-button')!.instanceCheckType).toBe(
      'import("@my/elements/index.js").PublicButton',
    );
  });

  it('should reject uppercase tag names instead of silently normalizing them', () => {
    const result = parse({
      schemaVersion: '1.0.0',
      modules: [
        {
          path: 'a.js',
          declarations: [
            {
              kind: 'class',
              name: 'MyTabA',
              customElement: true,
              tagName: 'My-Tab',
              members: [{kind: 'field', name: 'selected', type: {text: 'boolean'}}],
            },
            {
              kind: 'class',
              name: 'MyTabB',
              customElement: true,
              tagName: 'my-tab',
              members: [{kind: 'field', name: 'label', type: {text: 'string'}}],
              events: [{name: 'tabchange'}],
            },
          ],
        },
      ],
    });

    expect(result.errors).toEqual([]);
    expect(result.schemas.length).toBe(1);
    const schema = result.schemas[0];
    expect(schema.tagName).toBe('my-tab');
    const properties = new Map(schema.properties.map((p) => [p.name, p.type]));
    expect(properties.has('selected')).toBe(false);
    expect(properties.get('label')).toBe('string');
    expect(schema.events).toEqual([{name: 'tabchange'}]);
    expect(result.warnings.length).toBe(1);
    expect(result.warnings[0].kind).toBe('invalidTagName');
    expect(result.warnings[0].message).toContain(`'My-Tab'`);
    expect(result.warnings[0].message).toContain('MyTabA');
  });

  it('should skip declarations with invalid or native tag names', () => {
    const result = parse({
      schemaVersion: '1.0.0',
      modules: [
        {
          path: 'a.js',
          declarations: [
            {
              kind: 'class',
              name: 'FancyMarquee',
              customElement: true,
              tagName: 'marquee',
              members: [{kind: 'field', name: 'glitter', type: {text: 'boolean'}}],
            },
            {
              kind: 'class',
              name: 'ReservedName',
              customElement: true,
              tagName: 'font-face',
            },
            {
              kind: 'class',
              name: 'BadStart',
              customElement: true,
              tagName: '-leading-dash',
            },
            {
              kind: 'class',
              name: 'ValidElement',
              customElement: true,
              tagName: 'my-valid',
            },
          ],
        },
      ],
    });

    expect(result.errors).toEqual([]);
    expect(result.schemas.length).toBe(1);
    expect(result.schemas[0].tagName).toBe('my-valid');
    expect(result.warnings.length).toBe(3);
    for (const warning of result.warnings) {
      expect(warning.kind).toBe('invalidTagName');
    }
    expect(result.warnings[0].message).toContain(`'marquee'`);
    expect(result.warnings[0].message).toContain('hyphen');
    expect(result.warnings[1].message).toContain(`'font-face'`);
    expect(result.warnings[2].message).toContain(`'-leading-dash'`);
  });

  it('should accept non-ASCII PCENChars without changing their case', () => {
    const result = parse({
      schemaVersion: '1.0.0',
      modules: [
        {
          path: 'element.js',
          declarations: [
            {kind: 'class', name: 'UnicodeElement', customElement: true, tagName: 'my-Élément'},
          ],
        },
      ],
    });

    expect(result.warnings).toEqual([]);
    expect(result.schemas[0].tagName).toBe('my-Élément');
  });

  it('should resolve local type references against the containing module', () => {
    const result = parseCustomElementsManifest(
      JSON.stringify({
        schemaVersion: '1.0.0',
        modules: [
          {
            kind: 'javascript-module',
            path: 'element.js',
            declarations: [
              {
                kind: 'class',
                name: 'MyElement',
                customElement: true,
                tagName: 'my-element',
                members: [
                  {
                    kind: 'field',
                    name: 'value',
                    type: {text: 'LocalType', references: [{name: 'LocalType'}]},
                  },
                ],
              },
            ],
          },
        ],
      }),
      '/custom-elements.json',
      '@my/elements',
    );

    expect(result.schemas[0].properties[0].checkType).toBe(
      'import("@my/elements/element.js").LocalType',
    );
  });

  it('should support global type references', () => {
    const result = parse({
      schemaVersion: '1.0.0',
      modules: [
        {
          kind: 'javascript-module',
          path: 'element.js',
          declarations: [
            {
              kind: 'class',
              name: 'MyElement',
              customElement: true,
              tagName: 'my-element',
              events: [
                {
                  name: 'keydown',
                  type: {
                    text: 'KeyboardEvent',
                    references: [{name: 'KeyboardEvent', package: 'global:'}],
                  },
                },
              ],
            },
          ],
        },
      ],
    });

    expect(result.schemas[0].events[0].checkType).toBe('KeyboardEvent');
  });

  it('should resolve a local custom-element-definition to a class without customElement metadata', () => {
    const manifest: CustomElementsManifestPackage = {
      schemaVersion: '1.0.0',
      modules: [
        {
          kind: 'javascript-module',
          path: 'element.js',
          declarations: [
            {
              kind: 'class',
              name: 'MyElement',
              members: [{kind: 'field', name: 'value', type: {text: 'string'}}],
            },
          ],
          exports: [
            {
              kind: 'custom-element-definition',
              name: 'my-element',
              declaration: {name: 'MyElement'},
              deprecated: 'Use new-element.',
            },
          ],
        },
      ],
    };
    const result = parse(manifest);

    expect(result.schemas.length).toBe(1);
    expect(result.schemas[0].tagName).toBe('my-element');
    expect(result.schemas[0].properties.map((property) => property.name)).toEqual(['value']);
    expect(result.schemas[0].deprecated).toBe('Use new-element.');
  });
});
