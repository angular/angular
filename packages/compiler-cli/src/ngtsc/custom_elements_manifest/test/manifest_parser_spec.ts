/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵCustomElementsManifestSchema as CustomElementsManifestSchema} from '@angular/compiler';
import {ParsedCustomElementsManifest, parseCustomElementsManifest} from '../src/manifest_parser';
import {isObject} from '../src/type_text';

function parse(manifest: unknown): ParsedCustomElementsManifest {
  return parseCustomElementsManifest(
    JSON.stringify(withRequiredDefinitionExports(manifest)),
    `'/custom-elements.json'`,
  );
}

/**
 * Adds definition exports to fixtures that test other parser behavior. Tests for invalid
 * declaration/export relationships call `parseCustomElementsManifest` directly.
 */
function withRequiredDefinitionExports(manifest: unknown): unknown {
  if (!isObject(manifest) || !Array.isArray(manifest['modules'])) {
    return manifest;
  }
  for (const module of manifest['modules']) {
    if (!isObject(module) || !Array.isArray(module['declarations'])) {
      continue;
    }
    const exports = Array.isArray(module['exports']) ? module['exports'] : [];
    module['exports'] = exports;
    for (const declaration of module['declarations']) {
      if (
        !isObject(declaration) ||
        declaration['customElement'] !== true ||
        typeof declaration['name'] !== 'string' ||
        typeof declaration['tagName'] !== 'string'
      ) {
        continue;
      }
      const hasDefinition = exports.some(
        (entry) =>
          isObject(entry) &&
          entry['kind'] === 'custom-element-definition' &&
          entry['name'] === declaration['tagName'] &&
          isObject(entry['declaration']) &&
          entry['declaration']['name'] === declaration['name'] &&
          entry['declaration']['module'] === undefined,
      );
      if (!hasDefinition) {
        exports.push({
          kind: 'custom-element-definition',
          name: declaration['tagName'],
          declaration: {name: declaration['name']},
        });
      }
    }
  }
  return manifest;
}

function schemaFor(
  result: {schemas: CustomElementsManifestSchema[]},
  tagName: string,
): CustomElementsManifestSchema | undefined {
  return result.schemas.find((schema) => schema.tagName === tagName);
}

describe('parseCustomElementsManifest', () => {
  it('should report an error for invalid JSON', () => {
    const result = parseCustomElementsManifest('not json {', `'/custom-elements.json'`);
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

  it('should accept supported semantic schema versions silently', () => {
    for (const schemaVersion of ['1.0.0', '2.1.0', '2.0.0-next.1+build.5']) {
      const result = parse({schemaVersion, modules: []});
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
    }
  });

  it('should warn and continue projection for invalid or unknown schema versions', () => {
    for (const schemaVersion of ['garbage', '1.0', '01.0.0', '3.0.0', '999.0.0']) {
      const result = parse({
        schemaVersion,
        modules: [
          {
            kind: 'javascript-module',
            path: 'known.js',
            declarations: [
              {
                kind: 'class',
                name: 'KnownElement',
                customElement: true,
                tagName: 'known-element',
              },
            ],
          },
        ],
      });

      expect(result.errors).toEqual([]);
      expect(result.schemas.map((schema) => schema.tagName)).toEqual(['known-element']);
      expect(result.warnings).toEqual([
        jasmine.objectContaining({
          kind: 'invalidStructure',
          subject: 'schemaVersion',
          message: jasmine.stringContaining(JSON.stringify(schemaVersion)),
        }),
      ]);
      expect(result.warnings[0].message).toContain('continues');
    }
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
                // Accept readonly in v1 manifests for compatibility with existing producers.
                {kind: 'field', name: 'validity', type: {text: 'object'}, readonly: true},
              ],
              attributes: [
                {name: 'label', fieldName: 'label'},
                {name: 'data-context', type: {text: 'string'}},
                // The readonly backing field excludes both names from property bindings.
                {name: 'validity', fieldName: 'validity', type: {text: 'string'}},
                // Keep the attribute and report its missing backing field.
                {name: 'orphan', fieldName: 'missingField', type: {text: 'string'}},
              ],
              events: [
                {
                  name: 'itemselect',
                  type: {
                    text: 'CustomEvent<{value: string}>',
                    references: [{name: 'CustomEvent', package: 'global:', start: 0, end: 11}],
                  },
                },
              ],
            },
          ],
        },
      ],
    });

    expect(result.errors).toEqual([]);
    const schema = schemaFor(result, 'my-button')!;
    expect(schema).toBeDefined();
    const properties = new Map(schema.properties.map((p) => [p.name, p.checkType]));
    expect(properties.get('label')).toBe('string');
    expect(properties.get('disabled')).toBe('boolean');
    expect(properties.get('count')).toBe('number');
    expect(properties.get('variant')).toBe("'primary' | 'secondary'");
    // Named types without usable references and untyped members are existence-checked only.
    expect(properties.has('items')).toBe(true);
    expect(properties.get('items')).toBeUndefined();
    expect(properties.has('untyped')).toBe(true);
    expect(properties.get('untyped')).toBeUndefined();
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
      {name: 'label'},
      {
        name: 'data-context',
        checkType: 'string',
        typeText: 'string',
      },
      {
        name: 'validity',
        checkType: 'string',
        typeText: 'string',
      },
      {
        name: 'orphan',
        checkType: 'string',
        typeText: 'string',
      },
    ]);
    expect(schema.events).toEqual([
      {
        name: 'itemselect',
        checkType: 'CustomEvent<{value: string}>',
        typeText: 'CustomEvent<{value: string}>',
      },
    ]);
    expect(result.warnings).toEqual([
      jasmine.objectContaining({
        kind: 'unusableType',
        subject: 'my-button.items',
      }),
      jasmine.objectContaining({
        kind: 'invalidStructure',
        subject: 'my-button.orphan',
      }),
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
    // Prefer description over summary. Omit deprecated when false.
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
    expect(result.warnings).toEqual([]);
    const schema = schemaFor(result, 'my-card')!;
    expect(schema).toBeDefined();
    expect(new Map(schema.properties.map((p) => [p.name, p.checkType])).get('elevated')).toBe(
      'boolean',
    );
  });

  it('should let one home-module definition refine a tagName seed without a warning', () => {
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
              tagName: 'my-card',
            },
          ],
          exports: [
            {
              kind: 'custom-element-definition',
              name: 'my-card',
              declaration: {name: 'MyCard'},
              deprecated: 'Use new-card.',
            },
          ],
        },
      ],
    });

    expect(result.warnings).toEqual([]);
    expect(result.schemas.map((schema) => schema.tagName)).toEqual(['my-card']);
    expect(result.schemas[0].deprecated).toBe('Use new-card.');
  });

  it('should reject a second tag for the same declaration and retain the tagName seed', () => {
    const result = parseCustomElementsManifest(
      JSON.stringify({
        schemaVersion: '1.0.0',
        modules: [
          {
            kind: 'javascript-module',
            path: 'define-first.js',
            exports: [
              {
                kind: 'custom-element-definition',
                name: 'x-two',
                declaration: {name: 'SharedElement', module: 'shared.js'},
              },
            ],
          },
          {
            kind: 'javascript-module',
            path: 'shared.js',
            declarations: [
              {
                kind: 'class',
                name: 'SharedElement',
                customElement: true,
                tagName: 'x-one',
              },
            ],
            exports: [
              {
                kind: 'custom-element-definition',
                name: 'x-one',
                declaration: {name: 'SharedElement'},
              },
            ],
          },
        ],
      }),
      `'/custom-elements.json'`,
    );

    expect(result.schemas.map((schema) => schema.tagName)).toEqual(['x-one']);
    expect(result.warnings).toEqual([
      jasmine.objectContaining({
        kind: 'invalidStructure',
        subject: 'SharedElement#x-two',
      }),
    ]);
    expect(result.warnings[0].message).toContain(
      `declaration 'SharedElement' in module 'shared.js'`,
    );
    expect(result.warnings[0].message).toContain(`module 'define-first.js'`);
    expect(result.warnings[0].message).toContain(`'x-one'`);
    expect(result.warnings[0].message).toContain(`'x-two'`);
  });

  it('should report repeated definitions and retain the first definition metadata', () => {
    const result = parseCustomElementsManifest(
      JSON.stringify({
        schemaVersion: '1.0.0',
        modules: [
          {
            kind: 'javascript-module',
            path: 'shared.js',
            declarations: [
              {
                kind: 'class',
                name: 'SharedElement',
                customElement: true,
                tagName: 'x-one',
              },
            ],
            exports: [
              {
                kind: 'custom-element-definition',
                name: 'x-one',
                declaration: {name: 'SharedElement'},
                deprecated: 'First registration.',
              },
            ],
          },
          {
            kind: 'javascript-module',
            path: 'repeat.js',
            exports: [
              {
                kind: 'custom-element-definition',
                name: 'x-one',
                declaration: {name: 'SharedElement', module: 'shared.js'},
                deprecated: 'Second registration.',
              },
            ],
          },
        ],
      }),
      `'/custom-elements.json'`,
    );

    expect(result.schemas.map((schema) => schema.tagName)).toEqual(['x-one']);
    expect(result.schemas[0].deprecated).toBe('First registration.');
    expect(result.warnings).toEqual([
      jasmine.objectContaining({kind: 'duplicateTag', subject: 'x-one'}),
    ]);
    expect(result.warnings[0].message).toContain(`module 'shared.js'`);
    expect(result.warnings[0].message).toContain(`module 'repeat.js'`);
    expect(result.warnings[0].message).toContain('first registration wins');
  });

  it('should name both declarations when distinct declarations register the same tag', () => {
    const result = parse({
      schemaVersion: '1.0.0',
      modules: [
        {
          kind: 'javascript-module',
          path: 'elements.js',
          declarations: [
            {kind: 'class', name: 'FirstElement', customElement: true, tagName: 'shared-tag'},
            {kind: 'class', name: 'SecondElement', customElement: true, tagName: 'shared-tag'},
          ],
        },
      ],
    });

    expect(result.schemas.length).toBe(1);
    expect(result.warnings).toEqual([
      jasmine.objectContaining({kind: 'duplicateTag', subject: 'shared-tag'}),
    ]);
    expect(result.warnings[0].message).toContain(`declaration 'FirstElement'`);
    expect(result.warnings[0].message).toContain(`declaration 'SecondElement'`);
    expect(result.warnings[0].message).toContain(`module 'elements.js'`);
  });

  it('should emit a closed schema for a definition whose declaration is missing', () => {
    const result = parse({
      schemaVersion: '1.0.0',
      modules: [
        {
          kind: 'javascript-module',
          path: 'define.js',
          exports: [
            {
              kind: 'custom-element-definition',
              name: 'ghost-element',
              declaration: {name: 'GhostElement', module: 'ghost.js'},
            },
          ],
        },
      ],
    });

    expect(result.errors).toEqual([]);
    const schema = schemaFor(result, 'ghost-element')!;
    expect(schema).toBeDefined();
    expect(schema.properties).toEqual([]);
    expect(schema.events).toEqual([]);
    expect(schema.instanceCheckType).toBeUndefined();
    expect(result.warnings.length).toBe(1);
    expect(result.warnings[0].kind).toBe('unusableType');
    expect(result.warnings[0].message).toContain(`'ghost-element'`);
    expect(result.warnings[0].message).toContain('cannot be found in the manifest');
    expect(result.warnings[0].message).toContain('unknown bindings remain errors');
  });

  it('should emit a closed schema for a definition declared in another package', () => {
    const result = parse({
      schemaVersion: '1.0.0',
      modules: [
        {
          kind: 'javascript-module',
          path: 'define.js',
          exports: [
            {
              kind: 'custom-element-definition',
              name: 'remote-element',
              declaration: {name: 'RemoteElement', package: '@other/pkg', module: 'remote.js'},
            },
          ],
        },
      ],
    });

    expect(result.errors).toEqual([]);
    const schema = schemaFor(result, 'remote-element')!;
    expect(schema).toBeDefined();
    expect(result.warnings.length).toBe(1);
    expect(result.warnings[0].kind).toBe('unusableType');
    expect(result.warnings[0].message).toContain(`another package ('@other/pkg')`);
  });

  it('should prefer a resolvable declaration of the same tag over a definition-only entry', () => {
    const result = parse({
      schemaVersion: '1.0.0',
      modules: [
        {
          kind: 'javascript-module',
          path: 'dual.js',
          declarations: [
            {
              kind: 'class',
              name: 'DualElement',
              customElement: true,
              tagName: 'dual-element',
              members: [{kind: 'field', name: 'value', type: {text: 'string'}}],
            },
          ],
        },
        {
          kind: 'javascript-module',
          path: 'define.js',
          exports: [
            {
              kind: 'custom-element-definition',
              name: 'dual-element',
              declaration: {name: 'Missing', module: 'nope.js'},
            },
          ],
        },
      ],
    });

    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
    const schema = schemaFor(result, 'dual-element')!;
    expect(schema.properties.map((p) => p.name)).toEqual(['value']);
    expect(result.schemas.filter((s) => s.tagName === 'dual-element').length).toBe(1);
  });

  it('should report an invalid tag name on a definition-only export', () => {
    const result = parse({
      schemaVersion: '1.0.0',
      modules: [
        {
          kind: 'javascript-module',
          path: 'define.js',
          exports: [
            {
              kind: 'custom-element-definition',
              name: 'NotATag',
              declaration: {name: 'Missing', module: 'nope.js'},
            },
          ],
        },
      ],
    });

    expect(result.schemas).toEqual([]);
    expect(result.warnings.length).toBe(1);
    expect(result.warnings[0].kind).toBe('invalidTagName');
    expect(result.warnings[0].message).toContain(`'NotATag'`);
  });

  it('should use the module path when export references share a declaration name', () => {
    const result = parse({
      schemaVersion: '1.0.0',
      modules: [
        {
          kind: 'javascript-module',
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
          kind: 'javascript-module',
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
          kind: 'javascript-module',
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

  it('should report invalid modules while retaining unrelated valid modules', () => {
    const result = parseCustomElementsManifest(
      JSON.stringify({
        schemaVersion: '1.0.0',
        modules: [
          {
            path: 'missing-kind.js',
            declarations: [
              {
                kind: 'class',
                name: 'IgnoredElement',
                customElement: true,
                tagName: 'ignored-element',
              },
            ],
          },
          {
            kind: 'javascript-module',
            path: 'valid.js',
            declarations: [
              {
                kind: 'class',
                name: 'ValidElement',
                customElement: true,
                tagName: 'valid-element',
              },
            ],
            exports: [
              {
                kind: 'custom-element-definition',
                name: 'valid-element',
                declaration: {name: 'ValidElement'},
              },
            ],
          },
        ],
      }),
      '/custom-elements.json',
    );

    expect(result.schemas.map((schema) => schema.tagName)).toEqual(['valid-element']);
    expect(result.warnings).toEqual([
      jasmine.objectContaining({
        kind: 'invalidStructure',
        subject: 'module[0]',
        message: jasmine.stringContaining('kind "javascript-module" and a string path'),
      }),
    ]);
  });

  it('should fail closed on malformed consumed field metadata and relationships', () => {
    const result = parse({
      schemaVersion: '2.1.0',
      modules: [
        {
          kind: 'javascript-module',
          path: 'strict.js',
          declarations: [
            {
              kind: 'class',
              name: 'StrictElement',
              customElement: true,
              tagName: 'strict-element',
              members: [
                {kind: 'field', name: 'badPrivacy', privacy: 'internal', type: {text: 'string'}},
                {kind: 'field', name: 'badStatic', static: 'true', type: {text: 'string'}},
                {kind: 'field', name: 'badReadonly', readonly: 'true', type: {text: 'string'}},
                {kind: 'field', name: 'reflected', reflects: true, type: {text: 'string'}},
                {
                  kind: 'field',
                  name: 'valid',
                  privacy: 'public',
                  static: false,
                  readonly: false,
                  attribute: 'valid',
                  type: {text: "'yes' | 'no'"},
                },
                {
                  kind: 'field',
                  name: 'actual',
                  attribute: 'actual',
                  type: {text: "'a' | 'b'"},
                },
                {
                  kind: 'field',
                  name: 'missingAttribute',
                  attribute: 'not-declared',
                  type: {text: 'string'},
                },
              ],
              attributes: [
                {name: 'actual', fieldName: 'missing'},
                {name: 'valid', fieldName: 'valid'},
              ],
            },
          ],
        },
      ],
    });

    const schema = schemaFor(result, 'strict-element')!;
    expect(schema.properties.map((property) => property.name)).toEqual([
      'reflected',
      'valid',
      'actual',
      'missingAttribute',
    ]);
    expect(schema.attributes).toEqual([
      {
        name: 'valid',
        checkType: "'yes' | 'no'",
        typeText: "'yes' | 'no'",
      },
      {name: 'actual'},
    ]);
    expect(result.warnings.map((warning) => warning.subject)).toEqual([
      'strict-element.badPrivacy',
      'strict-element.badStatic',
      'strict-element.badReadonly',
      'strict-element.reflected',
      'strict-element.missingAttribute',
      'strict-element.actual',
    ]);
    expect(result.warnings.every((warning) => warning.kind === 'invalidStructure')).toBeTrue();
    expect(result.warnings[0].message).toContain('invalid privacy metadata');
    expect(result.warnings[1].message).toContain('invalid static metadata');
    expect(result.warnings[2].message).toContain('invalid readonly metadata');
    expect(result.warnings[3].message).toContain('reflects: true');
    expect(result.warnings[5].message).toContain(`field 'missing'`);
  });

  it('should parse schema v2 manifests, including their v2-only fields', () => {
    // `readonly` on class fields, `deprecated` on attributes and events, and custom-element mixin
    // declarations only exist in schema v2.
    const manifest = {
      schemaVersion: '2.1.0',
      modules: [
        {
          kind: 'javascript-module',
          path: 'chip.js',
          declarations: [
            {
              kind: 'mixin',
              name: 'DisableableMixin',
              customElement: true,
              members: [{kind: 'field', name: 'disabled', type: {text: 'boolean'}}],
            },
            {
              kind: 'class',
              name: 'MyChip',
              customElement: true,
              tagName: 'my-chip',
              members: [
                {kind: 'field', name: 'label', type: {text: 'string'}},
                {kind: 'field', name: 'selected', type: {text: 'boolean'}, readonly: true},
              ],
              attributes: [{name: 'label', fieldName: 'label', deprecated: 'Use slotted content.'}],
              events: [
                {
                  name: 'remove',
                  type: {
                    text: 'Event',
                    references: [{name: 'Event', package: 'global:', start: 0, end: 5}],
                  },
                  deprecated: true,
                },
              ],
            },
          ],
        },
      ],
    };
    const result = parse(manifest);

    expect(result.errors).toEqual([]);
    expect(result.schemas.length).toBe(1);
    const schema = schemaFor(result, 'my-chip')!;
    // Exclude readonly fields from bindings. A mixin without a tag produces no schema.
    expect(schema.properties.map((property) => property.name)).toEqual(['label']);
    expect(schema.attributes).toEqual([{name: 'label', deprecated: 'Use slotted content.'}]);
    expect(schema.events).toEqual([
      {name: 'remove', checkType: 'Event', typeText: 'Event', deprecated: true},
    ]);
  });

  it('should compute check types for trustworthy type text', () => {
    const result = parse({
      schemaVersion: '1.0.0',
      modules: [
        {
          kind: 'javascript-module',
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
    // A named type without references keeps schema checks and produces a warning.
    expect(properties.get('items')!.checkType).toBeUndefined();
    expect(properties.get('mixed')!.checkType).toBe('boolean | number');
    expect(properties.get('untyped')!.checkType).toBeUndefined();
    expect(properties.has('data-mode')).toBe(false);
    expect(schemaFor(result, 'my-button')!.attributes).toEqual([
      {
        name: 'data-mode',
        checkType: "'on' | 'off'",
        typeText: "'on' | 'off'",
      },
      {
        name: 'mixed',
        checkType: 'boolean | number',
        typeText: 'boolean | number',
      },
    ]);
    expect(result.warnings).toEqual([
      jasmine.objectContaining({
        kind: 'unusableType',
        subject: 'my-button.items',
        message: jasmine.stringContaining('type text "MyItem[]"'),
      }),
    ]);
    expect(result.warnings[0].message).not.toContain('HTMLElement');
  });

  it('should treat an explicit attribute type as authoritative', () => {
    const result = parse({
      schemaVersion: '1.0.0',
      modules: [
        {
          kind: 'javascript-module',
          path: 'a.js',
          declarations: [
            {
              kind: 'class',
              name: 'MyButton',
              customElement: true,
              tagName: 'my-button',
              members: [
                {
                  kind: 'field',
                  name: 'variant',
                  attribute: 'variant',
                  type: {text: "'primary' | 'secondary'"},
                },
                {
                  kind: 'field',
                  name: 'size',
                  attribute: 'size',
                  type: {text: 'UnresolvedMemberType'},
                },
                {
                  kind: 'field',
                  name: 'state',
                  attribute: 'state',
                  type: {text: "'on' | 'off'"},
                },
                {
                  kind: 'field',
                  name: 'mode',
                  attribute: 'mode',
                  type: {text: "'light' | 'dark'"},
                },
              ],
              attributes: [
                {
                  name: 'variant',
                  fieldName: 'variant',
                  type: {text: 'UnresolvedAttributeType'},
                },
                {
                  name: 'size',
                  fieldName: 'size',
                  type: {text: "'small' | 'large'"},
                },
                {name: 'state', fieldName: 'state'},
                {name: 'mode', fieldName: 'mode', type: true},
              ],
            },
          ],
        },
      ],
    });

    const schema = schemaFor(result, 'my-button')!;
    const properties = new Map(schema.properties.map((property) => [property.name, property]));
    const attributes = new Map(schema.attributes!.map((attribute) => [attribute.name, attribute]));

    expect(properties.get('variant')!.checkType).toBe("'primary' | 'secondary'");
    expect(attributes.get('variant')).toEqual({
      name: 'variant',
      typeText: 'UnresolvedAttributeType',
    });
    expect(attributes.get('size')).toEqual({
      name: 'size',
      checkType: "'small' | 'large'",
      typeText: "'small' | 'large'",
    });
    expect(attributes.get('state')).toEqual({
      name: 'state',
      checkType: "'on' | 'off'",
      typeText: "'on' | 'off'",
    });
    expect(attributes.get('mode')).toEqual({name: 'mode'});
    expect(result.warnings.map((warning) => warning.subject)).toEqual([
      'my-button.size',
      'my-button.variant',
      'my-button.mode',
    ]);
    expect(result.warnings[2]).toEqual(
      jasmine.objectContaining({
        kind: 'unusableType',
        message: jasmine.stringContaining('without the required string "text" field'),
      }),
    );
  });

  it('should compute referenced check types using the owning package', () => {
    const result = parseCustomElementsManifest(
      JSON.stringify({
        schemaVersion: '1.0.0',
        modules: [
          {
            kind: 'javascript-module',
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
            exports: [
              {
                kind: 'custom-element-definition',
                name: 'my-list',
                declaration: {name: 'MyList'},
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

  it('should report unusable member and event types', () => {
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
              members: [
                {
                  kind: 'field',
                  name: 'variant',
                  type: {text: 'default | loading | success | error'},
                },
              ],
              events: [{name: 'change', type: {text: '(value: string) => void'}}],
            },
          ],
          exports: [
            {
              kind: 'custom-element-definition',
              name: 'my-element',
              declaration: {name: 'MyElement'},
            },
          ],
        },
      ],
    });

    expect(result.schemas[0].properties[0].checkType).toBeUndefined();
    expect(result.schemas[0].events[0].checkType).toBeUndefined();
    expect(result.warnings.map((warning) => warning.subject)).toEqual([
      'my-element.variant',
      'my-element.change',
    ]);
    expect(result.warnings.every((warning) => warning.kind === 'unusableType')).toBeTrue();
  });

  it('should report an ambiguous JavaScript export mapping for an element instance type', () => {
    const result = parseCustomElementsManifest(
      JSON.stringify({
        schemaVersion: '1.0.0',
        modules: [
          {
            kind: 'javascript-module',
            path: 'internal/element.js',
            declarations: [
              {
                kind: 'class',
                name: 'MyElement',
                customElement: true,
                tagName: 'my-element',
              },
            ],
            exports: [
              {
                kind: 'custom-element-definition',
                name: 'my-element',
                declaration: {name: 'MyElement'},
              },
            ],
          },
          {
            kind: 'javascript-module',
            path: 'index.js',
            exports: [
              {
                kind: 'js',
                name: 'FirstElement',
                declaration: {name: 'MyElement', module: 'internal/element.js'},
              },
              {
                kind: 'js',
                name: 'SecondElement',
                declaration: {name: 'MyElement', module: 'internal/element.js'},
              },
            ],
          },
        ],
      }),
      '/custom-elements.json',
      '@my/elements',
    );

    expect(result.schemas[0].instanceCheckType).toBeUndefined();
    expect(result.warnings).toEqual([
      jasmine.objectContaining({
        kind: 'unusableType',
        subject: 'internal/element.js#MyElement',
        message: jasmine.stringContaining('multiple JavaScript exports'),
      }),
    ]);
    expect(result.warnings[0].message).toContain('fall back to HTMLElement');
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
            exports: [
              {
                kind: 'custom-element-definition',
                name: 'my-button',
                declaration: {name: 'MyButton'},
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

  it("should prefer the declaration's home module for a barrel re-exported element instance type", () => {
    // Both the declaration's module and a barrel export the class by name. Select its own module.
    const result = parseCustomElementsManifest(
      JSON.stringify({
        schemaVersion: '1.0.0',
        modules: [
          {
            kind: 'javascript-module',
            path: 'accordion/accordion-header.js',
            declarations: [
              {
                kind: 'class',
                name: 'MyAccordionHeader',
                customElement: true,
                tagName: 'my-accordion-header',
              },
            ],
            exports: [
              {
                kind: 'custom-element-definition',
                name: 'my-accordion-header',
                declaration: {name: 'MyAccordionHeader'},
              },
              {
                kind: 'js',
                name: 'MyAccordionHeader',
                declaration: {name: 'MyAccordionHeader', module: 'accordion/accordion-header.js'},
              },
            ],
          },
          {
            kind: 'javascript-module',
            path: 'accordion/accordion.js',
            exports: [
              {
                kind: 'js',
                name: 'MyAccordionHeader',
                declaration: {name: 'MyAccordionHeader', module: 'accordion/accordion-header.js'},
              },
            ],
          },
        ],
      }),
      '/custom-elements.json',
      '@my/elements',
    );

    expect(schemaFor(result, 'my-accordion-header')!.instanceCheckType).toBe(
      'import("@my/elements/accordion/accordion-header.js").MyAccordionHeader',
    );
    expect(result.warnings).toEqual([]);
  });

  it('should still fail closed when exact-name exports all come from barrels, not the home module', () => {
    const result = parseCustomElementsManifest(
      JSON.stringify({
        schemaVersion: '1.0.0',
        modules: [
          {
            kind: 'javascript-module',
            path: 'internal/element.js',
            declarations: [
              {
                kind: 'class',
                name: 'MyElement',
                customElement: true,
                tagName: 'my-element',
              },
            ],
            exports: [
              {
                kind: 'custom-element-definition',
                name: 'my-element',
                declaration: {name: 'MyElement'},
              },
            ],
          },
          {
            kind: 'javascript-module',
            path: 'barrel-a.js',
            exports: [
              {
                kind: 'js',
                name: 'MyElement',
                declaration: {name: 'MyElement', module: 'internal/element.js'},
              },
            ],
          },
          {
            kind: 'javascript-module',
            path: 'barrel-b.js',
            exports: [
              {
                kind: 'js',
                name: 'MyElement',
                declaration: {name: 'MyElement', module: 'internal/element.js'},
              },
            ],
          },
        ],
      }),
      '/custom-elements.json',
      '@my/elements',
    );

    expect(schemaFor(result, 'my-element')!.instanceCheckType).toBeUndefined();
    expect(result.warnings).toEqual([
      jasmine.objectContaining({
        kind: 'unusableType',
        subject: 'internal/element.js#MyElement',
        message: jasmine.stringContaining('multiple JavaScript exports'),
      }),
    ]);
    expect(result.warnings[0].message).toContain('fall back to HTMLElement');
  });

  it('should use the exact module named by type.reference despite barrel re-exports', () => {
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
                    name: 'variant',
                    type: {
                      text: 'MyVariant',
                      references: [{name: 'MyVariant', module: 'types/variant.js'}],
                    },
                  },
                ],
              },
            ],
            exports: [
              {
                kind: 'custom-element-definition',
                name: 'my-element',
                declaration: {name: 'MyElement'},
              },
            ],
          },
          {
            kind: 'javascript-module',
            path: 'types/variant.js',
            exports: [
              {
                kind: 'js',
                name: 'MyVariant',
                declaration: {name: 'MyVariant', module: 'types/variant.js'},
              },
            ],
          },
          {
            kind: 'javascript-module',
            path: 'index.js',
            exports: [
              {
                kind: 'js',
                name: 'MyVariant',
                declaration: {name: 'MyVariant', module: 'types/variant.js'},
              },
            ],
          },
        ],
      }),
      '/custom-elements.json',
      '@my/elements',
    );

    const properties = new Map(
      result.schemas[0].properties.map((property) => [property.name, property]),
    );
    expect(properties.get('variant')!.checkType).toBe(
      'import("@my/elements/types/variant.js").MyVariant',
    );
    expect(result.warnings).toEqual([]);
  });

  it('should reject uppercase tag names instead of silently normalizing them', () => {
    const result = parse({
      schemaVersion: '1.0.0',
      modules: [
        {
          kind: 'javascript-module',
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
              events: [
                {
                  name: 'tabchange',
                  type: {
                    text: 'Event',
                    references: [{name: 'Event', package: 'global:', start: 0, end: 5}],
                  },
                },
              ],
            },
          ],
        },
      ],
    });

    expect(result.errors).toEqual([]);
    expect(result.schemas.length).toBe(1);
    const schema = result.schemas[0];
    expect(schema.tagName).toBe('my-tab');
    const properties = new Map(schema.properties.map((p) => [p.name, p.checkType]));
    expect(properties.has('selected')).toBe(false);
    expect(properties.get('label')).toBe('string');
    expect(schema.events).toEqual([{name: 'tabchange', checkType: 'Event', typeText: 'Event'}]);
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
          kind: 'javascript-module',
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
          kind: 'javascript-module',
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
    const manifest = {
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
