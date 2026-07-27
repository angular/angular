/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵCustomElementsManifestSchema as CustomElementsManifestSchema} from '@angular/compiler';

import {type CheckTypeAnalysis, type CheckTypeFailure, computeCheckType} from './check_type';
import {isObject, MAX_TYPE_TEXT_LENGTH, typeTextOf} from './type_text';

/** Parsed property metadata and its validated check type, when available. */
interface PropertyRecord {
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
  checkType?: string;
  typeText?: string;
  default?: string;
  deprecated?: true | string;
  description?: string;
}

interface TagRegistrationRecord {
  deprecated?: true | string;
  declarationName: string;
  declarationModule: string;
  registrationModule: string;
  source: 'tagName' | 'definition';
}

interface JavaScriptExport {
  name: string;
  module: string;
}

/**
 * A recoverable problem with a manifest declaration. The parser skips the affected declaration
 * or metadata and retains other entries.
 */
export interface ManifestWarning {
  kind: 'invalidTagName' | 'duplicateTag' | 'unusableType' | 'invalidStructure';
  /** A compact identity for the warning, used as the example in summarized diagnostics. */
  subject: string;
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

  /** Non-fatal problems with individual declarations or their type metadata. */
  warnings: ManifestWarning[];

  /**
   * References for each check type in `schemas`, keyed by the type text. The loader uses these
   * records to resolve type declarations.
   */
  checkTypeAnalyses: Map<string, CheckTypeAnalysis>;
}

/** State shared by the parsing passes of one manifest. */
interface ParseContext {
  /** Already-quoted display identity of the manifest used in diagnostics. */
  manifestLabel: string;
  /** The npm package the manifest belongs to, for resolving package-local type references. */
  owningPackage: string | null;
  warnings: ManifestWarning[];
  checkTypeAnalyses: Map<string, CheckTypeAnalysis>;
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
 * Checks the platform's custom element name rules. Names must start with a lowercase ASCII
 * letter, contain a hyphen, and use only `PCENChar` characters. Reserved SVG/MathML names are invalid.
 */
function isValidCustomElementName(tagName: string): boolean {
  // https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
  const pCenChar =
    /^[a-z][.0-9_a-z\-\u00b7\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u037d\u037f-\u1fff\u200c-\u200d\u203f-\u2040\u2070-\u218f\u2c00-\u2fef\u3001-\ud7ff\uf900-\ufdcf\ufdf0-\ufffd\u{10000}-\u{effff}]*$/u;
  return pCenChar.test(tagName) && tagName.includes('-') && !RESERVED_TAG_NAMES.has(tagName);
}

/** Parses the major component of a complete SemVer 2.0.0 version. */
function parseSemVerMajor(version: string): number | null {
  const identifier = String.raw`(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)`;
  const match = new RegExp(
    String.raw`^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)` +
      String.raw`(?:-${identifier}(?:\.${identifier})*)?` +
      String.raw`(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$`,
  ).exec(version);
  if (match === null) {
    return null;
  }
  const major = Number(match[1]);
  return Number.isSafeInteger(major) ? major : null;
}

/**
 * Parses a Custom Elements Manifest into schemas for `DomElementSchemaRegistry`.
 *
 * See https://github.com/webcomponents/custom-elements-manifest for the manifest format.
 *
 * Validates the CEM records used for template checking. Invalid records produce warnings and lose
 * only the affected metadata. Invalid JSON or a root that is not a manifest object produces an
 * error. This function does not validate the entire document against the CEM JSON Schema.
 *
 * Supports schema v1 and v2. An invalid or unknown version produces a warning, and parsing
 * continues for supported records. Reads field `readonly` flags and attribute, event, and export
 * `deprecated` flags when present. Mixins without tags produce no schema. Inheritance and mixin
 * references are not expanded.
 *
 * `manifestLabel` identifies the manifest in diagnostics and already includes quotes.
 */
export function parseCustomElementsManifest(
  content: string,
  manifestLabel: string,
  owningPackage: string | null = null,
): ParsedCustomElementsManifest {
  let manifest: unknown;
  try {
    manifest = JSON.parse(content) as unknown;
  } catch (e) {
    return {
      schemas: [],
      errors: [`Failed to parse ${manifestLabel} as JSON: ${(e as Error).message}`],
      warnings: [],
      checkTypeAnalyses: new Map(),
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
        `${manifestLabel} does not appear to be a Custom Elements Manifest: ` +
          `expected an object with a string "schemaVersion" and a "modules" array.`,
      ],
      warnings: [],
      checkTypeAnalyses: new Map(),
    };
  }

  const warnings: ManifestWarning[] = [];
  const context: ParseContext = {
    manifestLabel,
    owningPackage,
    warnings,
    checkTypeAnalyses: new Map(),
  };
  const schemaVersion = manifest['schemaVersion'];
  const schemaMajor = parseSemVerMajor(schemaVersion);
  if (schemaMajor === null || (schemaMajor !== 1 && schemaMajor !== 2)) {
    warnings.push({
      kind: 'invalidStructure',
      subject: 'schemaVersion',
      message:
        `${manifestLabel} declares the Custom Elements Manifest schemaVersion ` +
        `${JSON.stringify(schemaVersion)}, but Angular supports semantic versions with major ` +
        `version 1 or 2. Angular continues by reading its known CEM projection best-effort; ` +
        `metadata whose meaning changed in another version may be ignored.`,
    });
  }
  // Validate modules once so later passes can use their paths without checking again.
  const modules: Array<{path: string; [key: string]: unknown}> = [];
  for (const [index, module] of manifest['modules'].entries()) {
    if (
      !isObject(module) ||
      module['kind'] !== 'javascript-module' ||
      typeof module['path'] !== 'string'
    ) {
      warnings.push({
        kind: 'invalidStructure',
        subject: `module[${index}]`,
        message:
          `${manifestLabel} contains an invalid module at index ${index}: Angular requires ` +
          `kind "javascript-module" and a string path. The module is ignored; other valid ` +
          `modules remain available.`,
      });
      continue;
    }
    modules.push(module as {path: string; [key: string]: unknown});
  }

  // First pass: collect all custom element class declarations across the manifest's modules,
  // keyed by declaration name so that `custom-element-definition` exports can reference them.
  const declarationsByModuleAndName = new Map<string, CemDeclaration[]>();
  const customElementDeclarations: CemDeclaration[] = [];
  for (const module of modules) {
    if (!Array.isArray(module['declarations'])) {
      continue;
    }
    for (const node of module['declarations']) {
      if (!isObject(node) || typeof node['name'] !== 'string') {
        continue;
      }
      const declaration: CemDeclaration = {name: node['name'], modulePath: module.path, node};
      if (node['customElement'] === true) {
        customElementDeclarations.push(declaration);
      }
      const key = declarationKey(module.path, declaration.name);
      const inModule = declarationsByModuleAndName.get(key);
      if (inModule !== undefined) {
        inModule.push(declaration);
      } else {
        declarationsByModuleAndName.set(key, [declaration]);
      }
    }
  }

  // Index JavaScript exports by their declaration references, including missing declarations.
  // Element instance types use this map to find public exports. `type.references` already name
  // public exports and do not use this mapping.
  const exportsByDeclarationIdentity = new Map<string, JavaScriptExport[]>();
  for (const module of modules) {
    if (!Array.isArray(module['exports'])) {
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
      const declarationModule = exportEntry['declaration']['module'];
      const referencedModule =
        typeof declarationModule === 'string' ? declarationModule : module.path;
      const key = declarationKey(referencedModule, exportEntry['declaration']['name']);
      const candidate = {name: exportEntry['name'], module: module.path};
      const candidates = exportsByDeclarationIdentity.get(key);
      if (candidates === undefined) {
        exportsByDeclarationIdentity.set(key, [candidate]);
      } else if (
        !candidates.some(
          (existing) => existing.name === candidate.name && existing.module === candidate.module,
        )
      ) {
        candidates.push(candidate);
      }
    }
  }

  // Read tag names from declarations and `custom-element-definition` exports. An export with an
  // unresolved declaration still registers the tag, with no custom members in its schema.
  const tagsByDeclaration = new Map<CemDeclaration, Map<string, TagRegistrationRecord>>();
  const homeDefinitionTagsByDeclaration = new Map<CemDeclaration, Set<string>>();
  const definitionOnlyTags = new Map<
    string,
    {registration: TagRegistrationRecord; reason: string}
  >();
  for (const declaration of customElementDeclarations) {
    const tagName = declaration.node['tagName'];
    if (typeof tagName === 'string' && tagName.length > 0) {
      tagsByDeclaration.set(
        declaration,
        new Map([
          [
            tagName,
            tagRegistration(
              declaration.node,
              declaration.name,
              declaration.modulePath,
              declaration.modulePath,
              'tagName',
            ),
          ],
        ]),
      );
    }
  }
  for (const module of modules) {
    if (!Array.isArray(module['exports'])) {
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
      const definitionTagName = exportEntry['name'];
      const definitionDeclarationName = exportEntry['declaration']['name'];
      const containingModule = module.path;
      const recordDefinitionOnly = (reason: string, declarationModule: string): void => {
        const registration = tagRegistration(
          exportEntry,
          definitionDeclarationName,
          declarationModule,
          containingModule,
          'definition',
        );
        const winner = definitionOnlyTags.get(definitionTagName);
        if (winner === undefined) {
          definitionOnlyTags.set(definitionTagName, {registration, reason});
        } else {
          warnings.push({
            kind: 'duplicateTag',
            subject: definitionTagName,
            message: duplicateRegistrationMessage(
              manifestLabel,
              definitionTagName,
              winner.registration,
              registration,
            ),
          });
        }
      };
      // External declarations are unavailable in this manifest. The definition still registers the tag.
      if (typeof exportEntry['declaration']['package'] === 'string') {
        recordDefinitionOnly(
          `is declared in another package ('${exportEntry['declaration']['package']}')`,
          typeof exportEntry['declaration']['module'] === 'string'
            ? exportEntry['declaration']['module']
            : containingModule,
        );
        continue;
      }
      const declarationModule = exportEntry['declaration']['module'];
      const referencedModule =
        typeof declarationModule === 'string' ? declarationModule : containingModule;
      const referenced = declarationsByModuleAndName.get(
        declarationKey(referencedModule, exportEntry['declaration']['name']),
      );
      if (referenced === undefined) {
        recordDefinitionOnly('cannot be found in the manifest', referencedModule);
        continue;
      }
      for (const declaration of referenced) {
        const declarationHomeModule = declaration.modulePath;
        const registration = tagRegistration(
          exportEntry,
          definitionDeclarationName,
          declarationHomeModule,
          containingModule,
          'definition',
        );
        let tags = tagsByDeclaration.get(declaration);
        if (tags === undefined) {
          tags = new Map();
          tagsByDeclaration.set(declaration, tags);
        }
        const firstTag = tags.entries().next().value as [string, TagRegistrationRecord] | undefined;
        if (firstTag === undefined) {
          tags.set(definitionTagName, registration);
        } else {
          const [winningTagName, winner] = firstTag;
          if (winningTagName !== definitionTagName) {
            warnings.push({
              kind: 'invalidStructure',
              subject: `${definitionDeclarationName}#${definitionTagName}`,
              message:
                `${manifestLabel} associates ${formatTagRegistration(winner)} with the tag ` +
                `'${winningTagName}', but ${formatTagRegistration(registration)} attempts to ` +
                `register the same declaration as '${definitionTagName}'. A custom element ` +
                `declaration can have only one tag, so the first registration is retained and ` +
                `the conflicting registration is ignored.`,
            });
          } else if (winner.source === 'tagName' && containingModule === declarationHomeModule) {
            // A declaration's tagName registers the tag. One matching definition export in the same
            // module adds registration metadata. Further definitions count as duplicates.
            tags.set(definitionTagName, registration);
          } else {
            warnings.push({
              kind: 'duplicateTag',
              subject: definitionTagName,
              message: duplicateRegistrationMessage(
                manifestLabel,
                definitionTagName,
                winner,
                registration,
              ),
            });
          }
        }
        if (containingModule === declarationHomeModule) {
          let definitionTags = homeDefinitionTagsByDeclaration.get(declaration);
          if (definitionTags === undefined) {
            definitionTags = new Set();
            homeDefinitionTagsByDeclaration.set(declaration, definitionTags);
          }
          definitionTags.add(exportEntry['name']);
        }
      }
    }
  }

  for (const declaration of customElementDeclarations) {
    const tagName = declaration.node['tagName'];
    // CEM requires a matching definition export in the same module as a declaration with `tagName`.
    // Registrations in other modules provide the tag through `tagsByDeclaration` instead.
    if (
      typeof tagName === 'string' &&
      tagName.length > 0 &&
      isValidCustomElementName(tagName) &&
      !homeDefinitionTagsByDeclaration.get(declaration)?.has(tagName)
    ) {
      warnings.push({
        kind: 'invalidStructure',
        subject: tagName,
        message:
          `${manifestLabel} declares the self-registering custom element '${tagName}', but its ` +
          `module has no matching custom-element-definition export. The declaration remains ` +
          `available, but the manifest should include the required definition export.`,
      });
    }
  }

  // Validate tag names and extract members. Keep the first declaration of each tag.
  // Invalid names and duplicate tags produce warnings and are skipped.
  const reportedAmbiguousExports = new Set<string>();
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
    for (const [tagName, registration] of tags) {
      if (!isValidCustomElementName(tagName)) {
        warnings.push({
          kind: 'invalidTagName',
          subject: tagName,
          message:
            `${manifestLabel} declares a custom element '${declaration.name}' with the tag ` +
            `name '${tagName}', which is not a valid custom element name` +
            (tagName.includes('-')
              ? ''
              : ` (custom element names must contain a hyphen; hyphen-free names are ` +
                `reserved for native elements)`) +
            `. The declaration is ignored.`,
        });
        continue;
      }
      const winner = byTag.get(tagName);
      if (winner !== undefined) {
        warnings.push({
          kind: 'duplicateTag',
          subject: tagName,
          message: duplicateRegistrationMessage(
            manifestLabel,
            tagName,
            winner.registration,
            registration,
          ),
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
      extractDeclarationSchema(declaration, tagName, entry, context);
    }
  }

  // Tags with unresolved declarations have no custom members. Recognize the tag but continue
  // reporting unknown bindings. Prefer a resolved declaration of the same tag when available.
  const definitionOnlySchemas: CustomElementsManifestSchema[] = [];
  for (const [tagName, {registration, reason}] of definitionOnlyTags) {
    if (byTag.has(tagName)) {
      // A resolved declaration already provides this tag's schema.
      continue;
    }
    if (!isValidCustomElementName(tagName)) {
      warnings.push({
        kind: 'invalidTagName',
        subject: tagName,
        message:
          `${manifestLabel} contains a custom-element-definition export for the tag name ` +
          `'${tagName}', which is not a valid custom element name` +
          (tagName.includes('-')
            ? ''
            : ` (custom element names must contain a hyphen; hyphen-free names are ` +
              `reserved for native elements)`) +
          `. The definition is ignored.`,
      });
      continue;
    }
    warnings.push({
      kind: 'unusableType',
      subject: tagName,
      message:
        `${manifestLabel} registers the custom element tag '${tagName}' through a ` +
        `custom-element-definition export whose declaration '${registration.declarationName}' ${reason}. ` +
        `The tag is recognized, but no custom member metadata is available: unknown bindings ` +
        `remain errors, and local references fall back to HTMLElement.`,
    });
    definitionOnlySchemas.push({
      tagName,
      properties: [],
      attributes: [],
      events: [],
      ...(registration.deprecated !== undefined ? {deprecated: registration.deprecated} : {}),
    });
  }

  const schemas: CustomElementsManifestSchema[] = [];
  for (const [tagName, {declaration, registration, properties, attributes, events}] of byTag) {
    const declarationIdentity = declarationKey(declaration.modulePath, declaration.name);
    const declarationExportCandidates = exportsByDeclarationIdentity.get(declarationIdentity);
    const declarationExport = selectJavaScriptExport(
      declarationExportCandidates,
      declaration.name,
      declaration.modulePath,
    );
    if (declarationExport === null && !reportedAmbiguousExports.has(declarationIdentity)) {
      reportedAmbiguousExports.add(declarationIdentity);
      warnings.push({
        kind: 'unusableType',
        subject: `${declaration.modulePath}#${declaration.name}`,
        message:
          `${manifestLabel} maps the custom element declaration '${declaration.name}' in ` +
          `'${declaration.modulePath}' to multiple JavaScript exports ` +
          `(${formatJavaScriptExports(declarationExportCandidates)}), so Angular cannot select ` +
          `a trustworthy element instance type for '${tagName}'. The element schema remains ` +
          `available, but local template references to this element fall back to HTMLElement; ` +
          `other checks are unaffected.`,
      });
    }
    const instanceType =
      declarationExport === null
        ? {}
        : instanceCheckType(
            declarationExport?.name ?? declaration.name,
            declarationExport?.module ?? declaration.modulePath,
            context,
          );
    schemas.push({
      tagName,
      properties: Array.from(properties, ([name, record]) => ({name, ...record})),
      attributes: Array.from(attributes, ([name, record]) => ({name, ...record})),
      events: Array.from(events, ([name, record]) => ({name, ...record})),
      ...instanceType,
      ...readDocs(declaration.node),
      ...(registration.deprecated !== undefined ? {deprecated: registration.deprecated} : {}),
    });
  }
  schemas.push(...definitionOnlySchemas);
  return {schemas, errors: [], warnings, checkTypeAnalyses: context.checkTypeAnalyses};
}

/**
 * The validated element instance type for a declaration exported as `importedName` from
 * `modulePath` of the owning package, when the manifest identifies its package.
 */
function instanceCheckType(
  importedName: string,
  modulePath: string,
  context: ParseContext,
): {instanceCheckType?: string} {
  if (context.owningPackage === null) {
    return {};
  }
  const result = computeCheckType(
    {text: importedName, references: [{name: importedName, module: modulePath}]},
    context.owningPackage,
  );
  if (result.checkType === null) {
    return {};
  }
  context.checkTypeAnalyses.set(result.checkType, {
    imports: result.imports,
    globals: result.globals,
  });
  return {instanceCheckType: result.checkType};
}

/** A named CEM declaration and its module. Other fields require validation before use. */
interface CemDeclaration {
  name: string;
  modulePath: string;
  node: {[key: string]: unknown};
}

function extractDeclarationSchema(
  {node: declaration, modulePath: containingModule}: CemDeclaration,
  tagName: string,
  {
    properties,
    attributes,
    events,
  }: {
    properties: Map<string, PropertyRecord>;
    attributes: Map<string, AttributeRecord>;
    events: Map<string, EventRecord>;
  },
  context: ParseContext,
): void {
  const {manifestLabel, warnings} = context;
  const membersByName = new Map<string, {[key: string]: unknown}>();
  if (Array.isArray(declaration['members'])) {
    for (const member of declaration['members']) {
      if (isObject(member) && member['kind'] === 'field' && typeof member['name'] === 'string') {
        membersByName.set(member['name'], member);
      }
    }
  }
  const declaredAttributeNames = new Set(
    Array.isArray(declaration['attributes'])
      ? declaration['attributes']
          .filter((attribute): attribute is {[key: string]: unknown} => isObject(attribute))
          .map((attribute) => attribute['name'])
          .filter((name): name is string => typeof name === 'string')
      : [],
  );
  if (Array.isArray(declaration['members'])) {
    for (const member of declaration['members']) {
      if (!isObject(member) || member['kind'] !== 'field' || typeof member['name'] !== 'string') {
        continue;
      }
      const memberName = member['name'];
      const invalidModifier = invalidFieldModifier(member);
      if (invalidModifier !== null) {
        warnings.push({
          kind: 'invalidStructure',
          subject: `${tagName}.${memberName}`,
          message:
            `${manifestLabel} declares the member '${memberName}' on '${tagName}' with invalid ` +
            `${invalidModifier.name} metadata (${JSON.stringify(invalidModifier.value)}). The ` +
            `member is excluded from Angular's property projection so malformed metadata cannot ` +
            `authorize a property binding.`,
        });
        continue;
      }
      let typeRecord: ReturnType<typeof toTypeRecord> | null = null;
      const getTypeRecord = (): ReturnType<typeof toTypeRecord> =>
        (typeRecord ??= toTypeRecord(member, containingModule, {
          context,
          tagName,
          declarationKind: 'member',
          declarationName: memberName,
        }));
      if (typeof member['attribute'] === 'string' && member['attribute'].length > 0) {
        if (declaredAttributeNames.has(member['attribute'])) {
          attributes.set(member['attribute'], {
            ...getTypeRecord(),
            ...readDocs(member),
          });
        } else {
          warnings.push({
            kind: 'invalidStructure',
            subject: `${tagName}.${memberName}`,
            message:
              `${manifestLabel} associates the member '${memberName}' on '${tagName}' with the ` +
              `attribute '${member['attribute']}', but that attribute is missing from the ` +
              `declaration's attributes array. The member remains available, but Angular does ` +
              `not synthesize the missing attribute declaration.`,
          });
        }
      }
      if (
        member['reflects'] === true &&
        (typeof member['attribute'] !== 'string' || member['attribute'].length === 0)
      ) {
        warnings.push({
          kind: 'invalidStructure',
          subject: `${tagName}.${memberName}`,
          message:
            `${manifestLabel} declares the member '${memberName}' on '${tagName}' with ` +
            `reflects: true but without the required attribute relationship. The member remains ` +
            `available as a property, but Angular does not synthesize an attribute.`,
        });
      }
      if (
        member['static'] === true ||
        member['privacy'] === 'private' ||
        member['privacy'] === 'protected' ||
        // Exclude readonly fields so the schema checker rejects bindings that assign to them.
        member['readonly'] === true
      ) {
        continue;
      }
      properties.set(memberName, {
        ...getTypeRecord(),
        ...readDocs(member),
      });
    }
  }

  if (Array.isArray(declaration['attributes'])) {
    for (const attribute of declaration['attributes']) {
      if (!isObject(attribute) || typeof attribute['name'] !== 'string') {
        continue;
      }
      const inheritedAttribute = attributes.get(attribute['name']);
      const hasExplicitType = Object.prototype.hasOwnProperty.call(attribute, 'type');
      const requestedFieldName =
        typeof attribute['fieldName'] === 'string' && attribute['fieldName'].length > 0
          ? attribute['fieldName']
          : undefined;
      const relatedMember =
        requestedFieldName === undefined ? undefined : membersByName.get(requestedFieldName);
      const hasValidFieldRelationship =
        requestedFieldName === undefined || relatedMember !== undefined;
      if (!hasValidFieldRelationship) {
        warnings.push({
          kind: 'invalidStructure',
          subject: `${tagName}.${attribute['name']}`,
          message:
            `${manifestLabel} associates the attribute '${attribute['name']}' on '${tagName}' ` +
            `with the field '${requestedFieldName}', but that field is missing from the ` +
            `declaration. The attribute remains available, but the invalid field relationship ` +
            `and any inherited member type are ignored.`,
        });
      }
      const inheritedWithoutType =
        inheritedAttribute === undefined
          ? undefined
          : (({checkType: _checkType, typeText: _typeText, ...rest}) => rest)(inheritedAttribute);
      attributes.set(attribute['name'], {
        ...(hasValidFieldRelationship
          ? hasExplicitType
            ? inheritedWithoutType
            : inheritedAttribute
          : undefined),
        ...toTypeRecord(attribute, containingModule, {
          context,
          tagName,
          declarationKind: 'attribute',
          declarationName: attribute['name'],
        }),
        ...readDocs(attribute),
      });
    }
  }

  if (Array.isArray(declaration['events'])) {
    for (const event of declaration['events']) {
      if (!isObject(event) || typeof event['name'] !== 'string') {
        continue;
      }
      if (typeTextOf(event['type']) === undefined) {
        warnings.push({
          kind: 'invalidStructure',
          subject: `${tagName}.${event['name']}`,
          message:
            `${manifestLabel} declares the event '${event['name']}' on '${tagName}' without ` +
            `the required type metadata. The event remains available and uses the normal Event ` +
            `fallback.`,
        });
      }
      const checkType = validateManifestType(event['type'], containingModule, {
        context,
        tagName,
        declarationKind: 'event',
        declarationName: event['name'],
      });
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

function invalidFieldModifier(member: {
  [key: string]: unknown;
}): {name: 'privacy' | 'static' | 'readonly'; value: unknown} | null {
  const privacy = member['privacy'];
  if (
    privacy !== undefined &&
    privacy !== 'public' &&
    privacy !== 'private' &&
    privacy !== 'protected'
  ) {
    return {name: 'privacy', value: privacy};
  }
  const isStatic = member['static'];
  if (isStatic !== undefined && typeof isStatic !== 'boolean') {
    return {name: 'static', value: isStatic};
  }
  const readonly = member['readonly'];
  if (readonly !== undefined && typeof readonly !== 'boolean') {
    return {name: 'readonly', value: readonly};
  }
  return null;
}

/** Extracts a declaration's check type and display metadata. */
function toTypeRecord(
  entry: {[key: string]: unknown},
  containingModule: string | null,
  warningContext: TypeWarningContext,
): {
  checkType?: string;
  typeText?: string;
  default?: string;
} {
  const type = entry['type'];
  const checkType = validateManifestType(
    type,
    containingModule,
    warningContext,
    Object.prototype.hasOwnProperty.call(entry, 'type'),
  );
  const defaultValue = entry['default'];
  return {
    ...(checkType !== null ? {checkType} : {}),
    ...readTypeText(type),
    ...(typeof defaultValue === 'string' ? {default: defaultValue} : {}),
  };
}

interface TypeWarningContext {
  context: ParseContext;
  tagName: string;
  declarationKind: 'member' | 'attribute' | 'event';
  declarationName: string;
}

/**
 * Validates a CEM type and records its references for the loader. Rejected types produce an
 * `unusableType` warning. Missing type metadata produces a warning only for an explicit `type` field.
 */
function validateManifestType(
  type: unknown,
  containingModule: string | null,
  {context, tagName, declarationKind, declarationName}: TypeWarningContext,
  explicitlyDeclared = false,
): string | null {
  const result = computeCheckType(type, context.owningPackage, containingModule);
  if (result.checkType !== null) {
    context.checkTypeAnalyses.set(result.checkType, {
      imports: result.imports,
      globals: result.globals,
    });
    return result.checkType;
  }
  if (result.failure === 'missingTypeText' && !explicitlyDeclared) {
    return null;
  }
  const text = typeTextOf(type);
  const typeDescription =
    text !== undefined
      ? formatTypeText(text)
      : `type metadata without the required string "text" field`;
  context.warnings.push({
    kind: 'unusableType',
    subject: `${tagName}.${declarationName}`,
    message:
      `${context.manifestLabel} declares ${typeDescription} for the ${declarationKind} ` +
      `'${declarationName}' on '${tagName}', but ` +
      `${checkTypeFailureReason(result.failure)}. The declaration remains available, but template ` +
      `checks that depend on this type use a safe fallback; other checks are unaffected.`,
  });
  return null;
}

function checkTypeFailureReason(failure: CheckTypeFailure): string {
  switch (failure) {
    case 'emptyTypeText':
      return `the declared type text is empty`;
    case 'typeTextTooLong':
      return `the declared type text exceeds Angular's ${MAX_TYPE_TEXT_LENGTH}-character safety limit`;
    case 'unusableTypeReference':
      return `one or more named type occurrences do not have usable type.references metadata`;
    case 'unsupportedTypeText':
      return `the type uses syntax or characters outside Angular's supported safe subset`;
    case 'missingTypeText':
      return `the type text or its references are not in a form Angular can safely use`;
  }
}

function formatJavaScriptExports(candidates: JavaScriptExport[] | undefined): string {
  return (candidates ?? [])
    .slice(0, 3)
    .map((candidate) => `'${candidate.name}' from '${candidate.module}'`)
    .join(', ');
}

function formatTypeText(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return 'empty type text';
  }
  const bounded = trimmed.length <= 100 ? trimmed : `${trimmed.slice(0, 99)}…`;
  return `type text ${JSON.stringify(bounded)}`;
}

/**
 * Selects a declaration's JavaScript export without depending on manifest order. Prefers the
 * declared name, then a single non-default alias, then a sole default export.
 * For multiple exports of the declared name, selects the one from `homeModule`.
 * Returns `null` when the exports do not identify a unique choice.
 */
function selectJavaScriptExport(
  candidates: JavaScriptExport[] | undefined,
  declarationName: string,
  homeModule: string,
): JavaScriptExport | null | undefined {
  if (candidates === undefined || candidates.length === 0) {
    return undefined;
  }
  const exact = candidates.filter((candidate) => candidate.name === declarationName);
  if (exact.length === 1) {
    return exact[0];
  }
  if (exact.length > 1) {
    // The export index deduplicates name/module pairs, so at most one match comes from homeModule.
    const home = exact.filter((candidate) => candidate.module === homeModule);
    return home.length === 1 ? home[0] : null;
  }
  const nonDefault = candidates.filter((candidate) => candidate.name !== 'default');
  if (nonDefault.length === 1) {
    return nonDefault[0];
  }
  if (nonDefault.length > 1) {
    return null;
  }
  const defaults = candidates.filter((candidate) => candidate.name === 'default');
  return defaults.length === 1 ? defaults[0] : null;
}

/** Retains type text within the size limit for display. The compiler does not emit this text. */
function readTypeText(type: unknown): {typeText?: string} {
  const text = typeTextOf(type)?.trim();
  return text !== undefined && text.length > 0 && text.length <= MAX_TYPE_TEXT_LENGTH
    ? {typeText: text}
    : {};
}

function tagRegistration(
  entry: {[key: string]: unknown},
  declarationName: string,
  declarationModule: string,
  registrationModule: string,
  source: TagRegistrationRecord['source'],
): TagRegistrationRecord {
  const deprecated = entry['deprecated'];
  return {
    declarationName,
    declarationModule,
    registrationModule,
    source,
    ...(deprecated === true || (typeof deprecated === 'string' && deprecated.length > 0)
      ? {deprecated}
      : {}),
  };
}

function formatTagRegistration(registration: TagRegistrationRecord): string {
  const origin =
    registration.source === 'tagName'
      ? `its tagName in module '${registration.registrationModule}'`
      : `a definition export in module '${registration.registrationModule}'`;
  return (
    `declaration '${registration.declarationName}' in module ` +
    `'${registration.declarationModule}' through ${origin}`
  );
}

function duplicateRegistrationMessage(
  manifestLabel: string,
  tagName: string,
  winner: TagRegistrationRecord,
  loser: TagRegistrationRecord,
): string {
  return (
    `${manifestLabel} registers the custom element tag '${tagName}' more than once: ` +
    `${formatTagRegistration(winner)} is retained, while ${formatTagRegistration(loser)} is ` +
    `ignored. A tag can only be registered once, so the first registration wins.`
  );
}

/**
 * Reads `deprecated` and `description` from declarations, members, attributes, and events.
 * Deprecation may be `true` or a reason string. Uses `summary` when no description is present.
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
