/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ɵCustomElementsManifestPropertyType as CustomElementsManifestPropertyType,
  ɵCustomElementsManifestSchema as CustomElementsManifestSchema,
} from '@angular/compiler';
import ts from 'typescript';

import {computeCheckType} from './check_type';

/** Per-property parse result: the coarse registry tag plus, when trustworthy, a check type. */
interface PropertyRecord {
  type: CustomElementsManifestPropertyType;
  checkType?: string;
  typeText?: string;
  default?: string;
  deprecated?: true | string;
  description?: string;
}

/** Per-event parse result. */
interface EventRecord {
  checkType?: string;
  typeText?: string;
  deprecated?: true | string;
  description?: string;
}

/** Per-attribute parse result. Attributes do not themselves authorize property bindings. */
interface AttributeRecord {
  fieldName?: string;
  type?: CustomElementsManifestPropertyType;
  checkType?: string;
  typeText?: string;
  default?: string;
  deprecated?: true | string;
  description?: string;
}

interface TagRegistrationRecord {
  deprecated?: true | string;
}

/**
 * A non-fatal problem with a manifest declaration; the declaration is skipped but the rest of
 * the manifest remains usable.
 */
export interface ManifestWarning {
  kind: 'invalidTagName' | 'duplicateTag';
  message: string;
}

/**
 * The result of parsing a Custom Elements Manifest file.
 */
export interface ParsedCustomElementsManifest {
  /** Schemas of the custom elements declared in the manifest. */
  schemas: CustomElementsManifestSchema[];

  /** Human-readable descriptions of fatal problems encountered while parsing. */
  errors: string[];

  /** Non-fatal problems with individual declarations, which were skipped. */
  warnings: ManifestWarning[];
}

/**
 * Reserved hyphenated names that are not valid custom element names, per
 * https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name.
 */
const RESERVED_TAG_NAMES = new Set([
  'annotation-xml',
  'color-profile',
  'font-face',
  'font-face-src',
  'font-face-uri',
  'font-face-format',
  'font-face-name',
  'missing-glyph',
]);

/**
 * Whether `tagName` is a valid custom element name: it must start with a
 * lowercase ASCII letter and contain a hyphen — which is what reserves hyphen-free (native) tag
 * names for the platform — and must not be one of the reserved SVG/MathML names.
 * `customElements.define` throws for anything else, so declarations with such names describe
 * elements that cannot exist. The remaining characters implement the platform's `PCENChar` set.
 */
function isValidCustomElementName(tagName: string): boolean {
  // https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
  const pCenChar =
    /^[a-z][.0-9_a-z\-\u00b7\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u037d\u037f-\u1fff\u200c-\u200d\u203f-\u2040\u2070-\u218f\u2c00-\u2fef\u3001-\ud7ff\uf900-\ufdcf\ufdf0-\ufffd\u{10000}-\u{effff}]*$/u;
  return pCenChar.test(tagName) && tagName.includes('-') && !RESERVED_TAG_NAMES.has(tagName);
}

/**
 * Parses the contents of a Custom Elements Manifest (`custom-elements.json`) file into
 * `CustomElementsManifestSchema` entries suitable for registration with the `DomElementSchemaRegistry`.
 *
 * See https://github.com/webcomponents/custom-elements-manifest for the manifest format.
 *
 * Parsing is intentionally tolerant: declarations of unknown kinds, unresolvable references
 * and unexpected shapes are skipped rather than reported as errors, so that manifests produced
 * by newer versions of the format remain usable. Only fundamental problems (invalid JSON, a
 * root that is not a manifest object) are reported in `errors`.
 */
export function parseCustomElementsManifest(
  content: string,
  fileName: string,
  owningPackage: string | null = null,
): ParsedCustomElementsManifest {
  let manifest: unknown;
  try {
    manifest = JSON.parse(content) as unknown;
  } catch (e) {
    return {
      schemas: [],
      errors: [`Failed to parse '${fileName}' as JSON: ${(e as Error).message}`],
      warnings: [],
    };
  }

  if (
    !isObject(manifest) ||
    typeof manifest['schemaVersion'] !== 'string' ||
    !Array.isArray(manifest['modules'])
  ) {
    return {
      schemas: [],
      errors: [
        `'${fileName}' does not appear to be a Custom Elements Manifest: ` +
          `expected an object with a string "schemaVersion" and a "modules" array.`,
      ],
      warnings: [],
    };
  }

  // First pass: collect all custom element class declarations across the manifest's modules,
  // keyed by declaration name so that `custom-element-definition` exports can reference them.
  const declarationsByName = new Map<string, CemDeclaration[]>();
  const declarationsByModuleAndName = new Map<string, CemDeclaration[]>();
  const modulePathByDeclaration = new Map<CemDeclaration, string>();
  const customElementDeclarations: CemClassDeclaration[] = [];
  for (const module of manifest['modules']) {
    if (!isObject(module) || !Array.isArray(module['declarations'])) {
      continue;
    }
    for (const declaration of module['declarations']) {
      if (!isObject(declaration) || typeof declaration['name'] !== 'string') {
        continue;
      }
      const cemDeclaration = declaration as CemDeclaration;
      if (declaration['customElement'] === true) {
        customElementDeclarations.push(cemDeclaration);
      }
      const named = declarationsByName.get(declaration['name']);
      if (named !== undefined) {
        named.push(cemDeclaration);
      } else {
        declarationsByName.set(declaration['name'], [cemDeclaration]);
      }
      if (typeof module['path'] === 'string') {
        modulePathByDeclaration.set(cemDeclaration, module['path']);
        const key = declarationKey(module['path'], declaration['name']);
        const inModule = declarationsByModuleAndName.get(key);
        if (inModule !== undefined) {
          inModule.push(cemDeclaration);
        } else {
          declarationsByModuleAndName.set(key, [cemDeclaration]);
        }
      }
    }
  }

  // Record the JavaScript export name for each declaration. A class can be exported under a
  // different name (most commonly `default`), which is the name consumers must use in an import
  // type query for local template references.
  const exportByDeclaration = new Map<CemDeclaration, {name: string; module: string | null}>();
  for (const module of manifest['modules']) {
    if (!isObject(module) || !Array.isArray(module['exports'])) {
      continue;
    }
    for (const exportEntry of module['exports']) {
      if (
        !isObject(exportEntry) ||
        exportEntry['kind'] !== 'js' ||
        typeof exportEntry['name'] !== 'string' ||
        !isObject(exportEntry['declaration']) ||
        typeof exportEntry['declaration']['name'] !== 'string' ||
        typeof exportEntry['declaration']['package'] === 'string'
      ) {
        continue;
      }
      const containingModule = typeof module['path'] === 'string' ? module['path'] : null;
      const declarationModule = exportEntry['declaration']['module'];
      const referencedModule =
        typeof declarationModule === 'string' ? declarationModule : containingModule;
      const referenced =
        referencedModule !== null
          ? declarationsByModuleAndName.get(
              declarationKey(referencedModule, exportEntry['declaration']['name']),
            )
          : uniqueDeclaration(declarationsByName.get(exportEntry['declaration']['name']));
      for (const declaration of referenced ?? []) {
        const current = exportByDeclaration.get(declaration);
        if (
          current === undefined ||
          (current.name === 'default' && exportEntry['name'] !== 'default') ||
          exportEntry['name'] === declaration['name']
        ) {
          exportByDeclaration.set(declaration, {
            name: exportEntry['name'],
            module: containingModule,
          });
        }
      }
    }
  }

  // Second pass: determine tag names. A declaration may carry its own `tagName`, or be given
  // one by a `custom-element-definition` export whose `declaration` reference names it.
  const tagsByDeclaration = new Map<CemDeclaration, Map<string, TagRegistrationRecord>>();
  for (const declaration of customElementDeclarations) {
    if (typeof declaration['tagName'] === 'string' && declaration['tagName'].length > 0) {
      tagsByDeclaration.set(declaration, new Map([[declaration['tagName'], {}]]));
    }
  }
  for (const module of manifest['modules']) {
    if (!isObject(module) || !Array.isArray(module['exports'])) {
      continue;
    }
    for (const exportEntry of module['exports']) {
      if (
        !isObject(exportEntry) ||
        exportEntry['kind'] !== 'custom-element-definition' ||
        typeof exportEntry['name'] !== 'string' ||
        !isObject(exportEntry['declaration']) ||
        typeof exportEntry['declaration']['name'] !== 'string'
      ) {
        continue;
      }
      // References to declarations in other packages cannot be resolved from this manifest
      // alone and are skipped.
      if (typeof exportEntry['declaration']['package'] === 'string') {
        continue;
      }
      const declarationModule = exportEntry['declaration']['module'];
      const containingModule = typeof module['path'] === 'string' ? module['path'] : null;
      const referencedModule =
        typeof declarationModule === 'string' ? declarationModule : containingModule;
      const referenced =
        referencedModule !== null
          ? declarationsByModuleAndName.get(
              declarationKey(referencedModule, exportEntry['declaration']['name']),
            )
          : uniqueDeclaration(declarationsByName.get(exportEntry['declaration']['name']));
      if (referenced === undefined) {
        continue;
      }
      for (const declaration of referenced) {
        let tags = tagsByDeclaration.get(declaration);
        if (tags === undefined) {
          tags = new Map();
          tagsByDeclaration.set(declaration, tags);
        }
        tags.set(exportEntry['name'], readDeprecation(exportEntry));
      }
    }
  }

  // Final pass: validate tag names and extract properties and events. Mirroring runtime
  // `customElements.define` semantics, the first declaration of a tag wins; later declarations
  // of the same tag are skipped with a warning, as are declarations whose tag name is not a
  // valid custom element name (e.g. native, hyphen-free tags, which cannot be registered).
  const warnings: ManifestWarning[] = [];
  const byTag = new Map<
    string,
    {
      declaration: CemDeclaration;
      registration: TagRegistrationRecord;
      properties: Map<string, PropertyRecord>;
      attributes: Map<string, AttributeRecord>;
      events: Map<string, EventRecord>;
    }
  >();
  for (const [declaration, tags] of tagsByDeclaration) {
    for (const [tag, registration] of tags) {
      const tagName = tag;
      if (!isValidCustomElementName(tagName)) {
        warnings.push({
          kind: 'invalidTagName',
          message:
            `'${fileName}' declares a custom element '${declaration['name']}' with the tag ` +
            `name '${tagName}', which is not a valid custom element name` +
            (tagName.includes('-')
              ? ''
              : ` (custom element names must contain a hyphen; hyphen-free names are ` +
                `reserved for native elements)`) +
            `. The declaration is ignored.`,
        });
        continue;
      }
      if (byTag.has(tagName)) {
        warnings.push({
          kind: 'duplicateTag',
          message:
            `'${fileName}' declares the custom element tag '${tagName}' more than once ` +
            `('${declaration['name']}'). A tag can only be registered once, so the first ` +
            `declaration is used and this one is ignored.`,
        });
        continue;
      }
      const entry = {
        declaration,
        registration,
        properties: new Map<string, PropertyRecord>(),
        attributes: new Map<string, AttributeRecord>(),
        events: new Map<string, EventRecord>(),
      };
      byTag.set(tagName, entry);
      extractDeclarationSchema(
        declaration,
        entry.properties,
        entry.attributes,
        entry.events,
        owningPackage,
        modulePathByDeclaration.get(declaration) ?? null,
      );
    }
  }

  const schemas: CustomElementsManifestSchema[] = [];
  for (const [tagName, {declaration, registration, properties, attributes, events}] of byTag) {
    const declarationDocs = readDocs(declaration);
    schemas.push({
      tagName,
      properties: Array.from(properties, ([name, record]) => ({name, ...record})),
      attributes: Array.from(attributes, ([name, record]) => ({name, ...record})),
      events: Array.from(events, ([name, record]) => ({name, ...record})),
      ...instanceCheckType(
        declaration,
        exportByDeclaration.get(declaration)?.module ?? modulePathByDeclaration.get(declaration),
        owningPackage,
        exportByDeclaration.get(declaration)?.name,
      ),
      ...declarationDocs,
      ...(registration.deprecated !== undefined ? {deprecated: registration.deprecated} : {}),
    });
  }
  return {schemas, errors: [], warnings};
}

function instanceCheckType(
  declaration: CemClassDeclaration,
  modulePath: string | undefined,
  owningPackage: string | null,
  exportName: string | undefined,
): {instanceCheckType?: string} {
  if (
    owningPackage === null ||
    modulePath === undefined ||
    typeof declaration['name'] !== 'string'
  ) {
    return {};
  }
  const importedName = exportName ?? declaration['name'];
  const checkType = computeCheckType(
    {
      text: importedName,
      references: [{name: importedName, module: modulePath}],
    },
    owningPackage,
  );
  return checkType === null ? {} : {instanceCheckType: checkType};
}

/** Minimal typing for a CEM class declaration; all fields are validated before use. */
interface CemDeclaration {
  [key: string]: unknown;
}

type CemClassDeclaration = CemDeclaration;

function extractDeclarationSchema(
  declaration: CemClassDeclaration,
  properties: Map<string, PropertyRecord>,
  attributes: Map<string, AttributeRecord>,
  events: Map<string, EventRecord>,
  owningPackage: string | null,
  containingModule: string | null,
): void {
  if (Array.isArray(declaration['members'])) {
    for (const member of declaration['members']) {
      if (!isObject(member) || member['kind'] !== 'field' || typeof member['name'] !== 'string') {
        continue;
      }
      if (typeof member['attribute'] === 'string' && member['attribute'].length > 0) {
        const typeInfo = toTypeRecord(member, owningPackage, containingModule);
        attributes.set(member['attribute'], {
          fieldName: member['name'],
          ...typeInfo,
          ...readDocs(member),
        });
      }
      if (
        member['static'] === true ||
        member['privacy'] === 'private' ||
        member['privacy'] === 'protected' ||
        // Readonly properties cannot be assigned, so a property binding on them can never
        // work at runtime; skipping them makes such bindings unknown-property errors.
        member['readonly'] === true
      ) {
        continue;
      }
      properties.set(member['name'], toPropertyRecord(member, owningPackage, containingModule));
    }
  }

  if (Array.isArray(declaration['attributes'])) {
    for (const attribute of declaration['attributes']) {
      if (!isObject(attribute) || typeof attribute['name'] !== 'string') {
        continue;
      }
      const fieldName =
        typeof attribute['fieldName'] === 'string' && attribute['fieldName'].length > 0
          ? attribute['fieldName']
          : undefined;
      attributes.set(attribute['name'], {
        ...attributes.get(attribute['name']),
        ...(fieldName !== undefined ? {fieldName} : {}),
        ...toTypeRecord(attribute, owningPackage, containingModule),
        ...readDocs(attribute),
      });
    }
  }

  if (Array.isArray(declaration['events'])) {
    for (const event of declaration['events']) {
      if (!isObject(event) || typeof event['name'] !== 'string') {
        continue;
      }
      const checkType = computeCheckType(event['type'], owningPackage, containingModule);
      events.set(event['name'], {
        ...(checkType !== null ? {checkType} : {}),
        ...readTypeText(event['type']),
        ...readDocs(event),
      });
    }
  }
}

function declarationKey(modulePath: string, name: string): string {
  return `${modulePath.replace(/^\.\//, '')}\0${name}`;
}

function uniqueDeclaration(
  declarations: CemDeclaration[] | undefined,
): CemDeclaration[] | undefined {
  return declarations?.length === 1 ? declarations : undefined;
}

/** Builds the property record for a CEM member or attribute entry. */
function toPropertyRecord(
  entry: {[key: string]: unknown},
  owningPackage: string | null,
  containingModule: string | null,
): PropertyRecord {
  return {
    type: cemTypeToPropertyType(entry['type']),
    ...toTypeRecord(entry, owningPackage, containingModule),
    ...readDocs(entry),
  };
}

/** Extracts the validated and display-oriented portions of a CEM typed declaration. */
function toTypeRecord(
  entry: {[key: string]: unknown},
  owningPackage: string | null,
  containingModule: string | null,
): {
  type?: CustomElementsManifestPropertyType;
  checkType?: string;
  typeText?: string;
  default?: string;
} {
  const type = entry['type'];
  const checkType = computeCheckType(type, owningPackage, containingModule);
  const defaultValue = entry['default'];
  return {
    ...(isObject(type) && typeof type['text'] === 'string'
      ? {type: cemTypeToPropertyType(type)}
      : {}),
    ...(checkType !== null ? {checkType} : {}),
    ...readTypeText(type),
    ...(typeof defaultValue === 'string' ? {default: defaultValue} : {}),
  };
}

/** Retains bounded CEM type text for display only; it is never emitted into generated code. */
function readTypeText(type: unknown): {typeText?: string} {
  if (!isObject(type) || typeof type['text'] !== 'string') {
    return {};
  }
  const text = type['text'].trim();
  return text.length > 0 && text.length <= 512 ? {typeText: text} : {};
}

function readDeprecation(entry: {[key: string]: unknown}): TagRegistrationRecord {
  const deprecated = entry['deprecated'];
  return deprecated === true || (typeof deprecated === 'string' && deprecated.length > 0)
    ? {deprecated}
    : {};
}

/**
 * Reads the documentation-oriented CEM fields shared by declarations, members, attributes and
 * events: `deprecated` (`true` or a reason string) and `description` (falling back to the
 * short-form `summary`).
 */
function readDocs(entry: {[key: string]: unknown}): {
  deprecated?: true | string;
  description?: string;
} {
  const docs: {deprecated?: true | string; description?: string} = {};
  const deprecated = entry['deprecated'];
  if (deprecated === true || (typeof deprecated === 'string' && deprecated.length > 0)) {
    docs.deprecated = deprecated;
  }
  const description = entry['description'];
  const summary = entry['summary'];
  if (typeof description === 'string' && description.trim().length > 0) {
    docs.description = description;
  } else if (typeof summary === 'string' && summary.trim().length > 0) {
    docs.description = summary;
  }
  return docs;
}

/**
 * Maps a CEM type expression (e.g. `{"text": "boolean"}`) onto the coarse property type tags
 * used by the `DomElementSchemaRegistry`. The mapping is heuristic; existence checks do not
 * depend on it.
 */
function cemTypeToPropertyType(type: unknown): CustomElementsManifestPropertyType {
  if (!isObject(type) || typeof type['text'] !== 'string') {
    return 'object';
  }
  const source = ts.createSourceFile(
    'custom-elements-manifest-property-type.ts',
    `type __CustomElementsManifestPropertyType = (${type['text']});`,
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS,
  );
  const declaration = source.statements[0];
  if (!ts.isTypeAliasDeclaration(declaration)) {
    return 'object';
  }
  const categories = new Set<CustomElementsManifestPropertyType>();
  collectSerializationCategories(declaration.type, categories);
  return categories.size === 1 ? categories.values().next().value! : 'object';
}

/** Conservatively identifies primitive serialization categories in a TypeScript type. */
function collectSerializationCategories(
  type: ts.TypeNode,
  categories: Set<CustomElementsManifestPropertyType>,
): void {
  if (ts.isParenthesizedTypeNode(type)) {
    collectSerializationCategories(type.type, categories);
  } else if (ts.isUnionTypeNode(type) || ts.isIntersectionTypeNode(type)) {
    for (const member of type.types) {
      collectSerializationCategories(member, categories);
    }
  } else if (type.kind === ts.SyntaxKind.StringKeyword) {
    categories.add('string');
  } else if (type.kind === ts.SyntaxKind.NumberKeyword) {
    categories.add('number');
  } else if (type.kind === ts.SyntaxKind.BooleanKeyword) {
    categories.add('boolean');
  } else if (ts.isLiteralTypeNode(type)) {
    if (ts.isStringLiteral(type.literal)) {
      categories.add('string');
    } else if (
      ts.isNumericLiteral(type.literal) ||
      (ts.isPrefixUnaryExpression(type.literal) && ts.isNumericLiteral(type.literal.operand))
    ) {
      categories.add('number');
    } else if (
      type.literal.kind === ts.SyntaxKind.TrueKeyword ||
      type.literal.kind === ts.SyntaxKind.FalseKeyword
    ) {
      categories.add('boolean');
    } else if (type.literal.kind !== ts.SyntaxKind.NullKeyword) {
      categories.add('object');
    }
  } else if (
    type.kind !== ts.SyntaxKind.UndefinedKeyword &&
    type.kind !== ts.SyntaxKind.NeverKeyword &&
    type.kind !== ts.SyntaxKind.VoidKeyword
  ) {
    categories.add('object');
  }
}

function isObject(value: unknown): value is {[key: string]: unknown} {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
