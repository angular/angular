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

import {type CheckTypeFailure, computeCheckType} from './check_type';
import {analyzeTypeText} from './type_text';

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
 * A non-fatal problem with a manifest declaration; the declaration is skipped but the rest of
 * the manifest remains usable.
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
 * Parses the contents of a Custom Elements Manifest (`custom-elements.json`) file into
 * `CustomElementsManifestSchema` entries suitable for registration with the `DomElementSchemaRegistry`.
 *
 * See https://github.com/webcomponents/custom-elements-manifest for the manifest format.
 *
 * Angular is a projection reader rather than a whole-document schema validator: it consumes the
 * subset of CEM records used for template checking and strictly validates those records without
 * asserting that the complete document conforms to the CEM JSON Schema. Malformed consumed
 * entries are skipped or lose only the metadata that depends on them, while unrelated
 * declarations remain usable. These recoverable structural inconsistencies are reported as
 * warnings. Only fundamental problems (invalid JSON, a root that is not a manifest object) are
 * reported in `errors`.
 *
 * Schema v1 and v2 manifests are supported. An unparseable version or an unknown major is
 * reported, then the known projection is applied best-effort so compatible records remain useful.
 * The v2 additions that matter here (`readonly` on class fields, `deprecated` on
 * attributes/events/exports) are consumed when present, v2 custom-element mixin declarations are
 * tolerated (a tagless mixin produces no schema), and mixin/inheritance references are not
 * expanded.
 *
 * `manifestLabel` is the already-quoted display identity of the manifest used in error and
 * warning text — typically the configured option entry with the resolved path in parentheses.
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
    };
  }

  const warnings: ManifestWarning[] = [];
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
  const modules: Array<{[key: string]: unknown}> = [];
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
    modules.push(module);
  }

  // First pass: collect all custom element class declarations across the manifest's modules,
  // keyed by declaration name so that `custom-element-definition` exports can reference them.
  const declarationsByModuleAndName = new Map<string, CemDeclaration[]>();
  const modulePathByDeclaration = new Map<CemDeclaration, string>();
  const customElementDeclarations: CemClassDeclaration[] = [];
  for (const module of modules) {
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

  // Record every JavaScript export by the identity named in its declaration reference. This also
  // works when a producer (such as UI5) omits the declaration object itself but retains the export
  // record. Element instance types use this map to select the declaration's actual public export;
  // `type.references` already name public exports and are not reinterpreted.
  const exportsByDeclarationIdentity = new Map<string, JavaScriptExport[]>();
  for (const module of modules) {
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
      if (containingModule === null || referencedModule === null) {
        continue;
      }
      const key = declarationKey(referencedModule, exportEntry['declaration']['name']);
      const candidate = {name: exportEntry['name'], module: containingModule};
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

  // Second pass: determine tag names. A declaration may carry its own `tagName`, or be given
  // one by a `custom-element-definition` export whose `declaration` reference names it. A
  // definition whose declaration cannot be resolved still registers its tag: the element exists
  // at runtime, so the tag becomes an existence-only schema with no declared custom members.
  const tagsByDeclaration = new Map<CemDeclaration, Map<string, TagRegistrationRecord>>();
  const homeDefinitionTagsByDeclaration = new Map<CemDeclaration, Set<string>>();
  const definitionOnlyTags = new Map<
    string,
    {registration: TagRegistrationRecord; declarationName: string; reason: string}
  >();
  for (const declaration of customElementDeclarations) {
    if (typeof declaration['tagName'] === 'string' && declaration['tagName'].length > 0) {
      const declarationModule = modulePathByDeclaration.get(declaration)!;
      tagsByDeclaration.set(
        declaration,
        new Map([
          [
            declaration['tagName'],
            tagRegistration(
              declaration,
              declaration['name'] as string,
              declarationModule,
              declarationModule,
              'tagName',
            ),
          ],
        ]),
      );
    }
  }
  for (const module of modules) {
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
      const definitionTagName = exportEntry['name'];
      const definitionDeclarationName = exportEntry['declaration']['name'];
      const containingModule = module['path'] as string;
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
          definitionOnlyTags.set(definitionTagName, {
            registration,
            declarationName: definitionDeclarationName,
            reason,
          });
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
      // References to declarations in other packages cannot be resolved from this manifest
      // alone; the definition still registers the tag.
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
        const declarationHomeModule = modulePathByDeclaration.get(declaration)!;
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
            // A declaration's tagName is a bare self-registration seed. Its one matching
            // home-module definition export supplies registration metadata without constituting
            // a duplicate. Every later definition remains a duplicate of this refined record.
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
    const tagName = declaration['tagName'];
    // The CEM schema reserves `tagName` for self-registering declarations and requires their
    // module to contain the matching definition export. When registration lives in a separate
    // module, the declaration remains a custom element but omits `tagName`; the definition export
    // supplies the tag through `tagsByDeclaration` above.
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

  // Final pass: validate tag names and extract properties and events. Mirroring runtime
  // `customElements.define` semantics, the first declaration of a tag wins; later declarations
  // of the same tag are skipped with a warning, as are declarations whose tag name is not a
  // valid custom element name (e.g. native, hyphen-free tags, which cannot be registered).
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
    for (const [tag, registration] of tags) {
      const tagName = tag;
      if (!isValidCustomElementName(tagName)) {
        warnings.push({
          kind: 'invalidTagName',
          subject: tagName,
          message:
            `${manifestLabel} declares a custom element '${declaration['name']}' with the tag ` +
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
        const winner = byTag.get(tagName)!;
        const loser = registration;
        warnings.push({
          kind: 'duplicateTag',
          subject: tagName,
          message: duplicateRegistrationMessage(manifestLabel, tagName, winner.registration, loser),
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
        tagName,
        entry.properties,
        entry.attributes,
        entry.events,
        owningPackage,
        modulePathByDeclaration.get(declaration) ?? null,
        manifestLabel,
        warnings,
      );
    }
  }

  // Definition-only tags: the tag is registered at runtime, but with no resolvable declaration
  // there is nothing to check members against. Emit a closed, empty-member schema: the tag is
  // recognized (no NG8001), while unknown bindings still receive normal schema diagnostics. A
  // resolvable declaration of the same tag always wins.
  const definitionOnlySchemas: CustomElementsManifestSchema[] = [];
  for (const [tagName, {registration, declarationName, reason}] of definitionOnlyTags) {
    if (byTag.has(tagName)) {
      // The tag is fully covered by a resolvable declaration; nothing is lost.
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
        `custom-element-definition export whose declaration '${declarationName}' ${reason}. ` +
        `The tag is recognized, but no custom member metadata is available: unknown bindings ` +
        `remain errors, and local references fall back to HTMLElement.`,
    });
    definitionOnlySchemas.push({
      tagName,
      properties: [],
      events: [],
      ...(registration.deprecated !== undefined ? {deprecated: registration.deprecated} : {}),
    });
  }

  const schemas: CustomElementsManifestSchema[] = [];
  for (const [tagName, {declaration, registration, properties, attributes, events}] of byTag) {
    const declarationDocs = readDocs(declaration);
    const declarationModule = modulePathByDeclaration.get(declaration);
    const declarationName =
      typeof declaration['name'] === 'string' ? declaration['name'] : undefined;
    const declarationIdentity =
      declarationModule === undefined || declarationName === undefined
        ? undefined
        : declarationKey(declarationModule, declarationName);
    const declarationExportCandidates =
      declarationIdentity === undefined
        ? undefined
        : exportsByDeclarationIdentity.get(declarationIdentity);
    const declarationExport =
      declarationModule === undefined || declarationName === undefined
        ? undefined
        : selectJavaScriptExport(declarationExportCandidates, declarationName, declarationModule);
    if (
      declarationExport === null &&
      declarationIdentity !== undefined &&
      declarationModule !== undefined &&
      declarationName !== undefined &&
      !reportedAmbiguousExports.has(declarationIdentity)
    ) {
      reportedAmbiguousExports.add(declarationIdentity);
      warnings.push({
        kind: 'unusableType',
        subject: ambiguousExportSubject(declarationModule, declarationName),
        message:
          `${manifestLabel} maps the custom element declaration '${declarationName}' in ` +
          `'${declarationModule}' to multiple JavaScript exports ` +
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
            declaration,
            declarationExport?.module ?? declarationModule,
            owningPackage,
            declarationExport?.name,
          );
    schemas.push({
      tagName,
      properties: Array.from(properties, ([name, record]) => ({name, ...record})),
      attributes: Array.from(attributes, ([name, record]) => ({name, ...record})),
      events: Array.from(events, ([name, record]) => ({name, ...record})),
      ...instanceType,
      ...declarationDocs,
      ...(registration.deprecated !== undefined ? {deprecated: registration.deprecated} : {}),
    });
  }
  schemas.push(...definitionOnlySchemas);
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
  tagName: string,
  properties: Map<string, PropertyRecord>,
  attributes: Map<string, AttributeRecord>,
  events: Map<string, EventRecord>,
  owningPackage: string | null,
  containingModule: string | null,
  manifestLabel: string,
  warnings: ManifestWarning[],
): void {
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
        (typeRecord ??= toTypeRecord(member, owningPackage, containingModule, {
          manifestLabel,
          tagName,
          declarationKind: 'member',
          declarationName: memberName,
          warnings,
        }));
      if (typeof member['attribute'] === 'string' && member['attribute'].length > 0) {
        if (declaredAttributeNames.has(member['attribute'])) {
          attributes.set(member['attribute'], {
            fieldName: memberName,
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
        // Readonly properties cannot be assigned, so a property binding on them can never
        // work at runtime; skipping them makes such bindings unknown-property errors.
        member['readonly'] === true
      ) {
        continue;
      }
      properties.set(memberName, {
        type: cemTypeToPropertyType(member['type']),
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
      const fieldName =
        requestedFieldName !== undefined && hasValidFieldRelationship
          ? requestedFieldName
          : undefined;
      attributes.set(attribute['name'], {
        ...(hasValidFieldRelationship
          ? hasExplicitType
            ? inheritedWithoutType
            : inheritedAttribute
          : undefined),
        ...(fieldName !== undefined ? {fieldName} : {}),
        ...toTypeRecord(attribute, owningPackage, containingModule, {
          manifestLabel,
          tagName,
          declarationKind: 'attribute',
          declarationName: attribute['name'],
          warnings,
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
      if (!isObject(event['type']) || typeof event['type']['text'] !== 'string') {
        warnings.push({
          kind: 'invalidStructure',
          subject: `${tagName}.${event['name']}`,
          message:
            `${manifestLabel} declares the event '${event['name']}' on '${tagName}' without ` +
            `the required type metadata. The event remains available and uses the normal Event ` +
            `fallback.`,
        });
      }
      const checkTypeResult = computeManifestCheckType(
        event['type'],
        owningPackage,
        containingModule,
      );
      reportUnusableType(event['type'], checkTypeResult, {
        manifestLabel,
        tagName,
        declarationKind: 'event',
        declarationName: event['name'],
        warnings,
      });
      events.set(event['name'], {
        ...(checkTypeResult.checkType !== null ? {checkType: checkTypeResult.checkType} : {}),
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

/** Extracts the validated and display-oriented portions of a CEM typed declaration. */
function toTypeRecord(
  entry: {[key: string]: unknown},
  owningPackage: string | null,
  containingModule: string | null,
  warningContext: TypeWarningContext,
): {
  checkType?: string;
  typeText?: string;
  default?: string;
} {
  const type = entry['type'];
  const checkTypeResult = computeManifestCheckType(type, owningPackage, containingModule);
  reportUnusableType(
    type,
    checkTypeResult,
    warningContext,
    Object.prototype.hasOwnProperty.call(entry, 'type'),
  );
  const defaultValue = entry['default'];
  return {
    ...(checkTypeResult.checkType !== null ? {checkType: checkTypeResult.checkType} : {}),
    ...readTypeText(type),
    ...(typeof defaultValue === 'string' ? {default: defaultValue} : {}),
  };
}

interface ManifestCheckTypeResult {
  checkType: string | null;
  failure: CheckTypeFailure | null;
}

interface TypeWarningContext {
  manifestLabel: string;
  tagName: string;
  declarationKind: 'member' | 'attribute' | 'event';
  declarationName: string;
  warnings: ManifestWarning[];
}

function computeManifestCheckType(
  type: unknown,
  owningPackage: string | null,
  containingModule: string | null,
): ManifestCheckTypeResult {
  let failure: CheckTypeFailure | null = null;
  const checkType = computeCheckType(type, owningPackage, containingModule, (reportedFailure) => {
    failure = reportedFailure;
  });
  return {checkType, failure};
}

function reportUnusableType(
  type: unknown,
  result: ManifestCheckTypeResult,
  context: TypeWarningContext,
  explicitlyDeclared = false,
): void {
  if (
    result.checkType !== null ||
    (!explicitlyDeclared && (!isObject(type) || typeof type['text'] !== 'string'))
  ) {
    return;
  }
  const kindLabel = context.declarationKind;
  const typeDescription =
    isObject(type) && typeof type['text'] === 'string'
      ? formatTypeText(type['text'])
      : `type metadata without the required string "text" field`;
  context.warnings.push({
    kind: 'unusableType',
    subject: `${context.tagName}.${context.declarationName}`,
    message:
      `${context.manifestLabel} declares ${typeDescription} for the ${kindLabel} ` +
      `'${context.declarationName}' on '${context.tagName}', but ` +
      `${checkTypeFailureReason(result.failure)}. The declaration remains available, but template ` +
      `checks that depend on this type use a safe fallback; other checks are unaffected.`,
  });
}

function checkTypeFailureReason(failure: CheckTypeFailure | null): string {
  switch (failure) {
    case 'emptyTypeText':
      return `the declared type text is empty`;
    case 'typeTextTooLong':
      return `the declared type text exceeds Angular's 512-character safety limit`;
    case 'unusableTypeReference':
      return `one or more named type occurrences do not have usable type.references metadata`;
    case 'unsupportedTypeText':
      return `the type uses syntax or characters outside Angular's supported safe subset`;
    case null:
      return `the type text or its references are not in a form Angular can safely use`;
  }
}

function ambiguousExportSubject(modulePath: string, declarationName: string): string {
  return `${modulePath}#${declarationName}`;
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
 * Selects the importable JavaScript name for a declaration without depending on manifest order.
 * Exact-name exports win, followed by one unambiguous non-default alias, then a sole default.
 * Multiple viable aliases fail closed.
 *
 * When several exact-name exports exist, they are a re-export of the same declaration from more
 * than one module (e.g. an element re-exported from a sibling barrel). The declaration's own
 * `homeModule` is the authoritative import location, so an exact-name export from it is preferred
 * deterministically. This is a re-export tiebreak, not a guess among aliases: every candidate names
 * the same declaration identity. If no exact-name export comes from the home module, selection
 * still fails closed.
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
    // `exportsByDeclarationIdentity` dedups by (name, module), so at most one exact-name export
    // can come from the home module.
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

/** Retains bounded CEM type text for display only; it is never emitted into generated code. */
function readTypeText(type: unknown): {typeText?: string} {
  if (!isObject(type) || typeof type['text'] !== 'string') {
    return {};
  }
  const text = type['text'].trim();
  return text.length > 0 && text.length <= 512 ? {typeText: text} : {};
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
  return analyzeTypeText(type['text']).type;
}

function isObject(value: unknown): value is {[key: string]: unknown} {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
