/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {extractDeclarationSchema, instanceCheckType, readDocs} from './manifest_members';
import {
  AttributeRecord,
  CemDeclaration,
  EventRecord,
  ManifestWarning,
  ParseContext,
  ParsedCustomElementSchema,
  PropertyRecord,
} from './schema';
import {isObject} from './type_text';

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
 * The result of parsing a Custom Elements Manifest file.
 */
export interface ParsedCustomElementsManifest {
  /** Schemas of the custom elements declared in the manifest. */
  schemas: ParsedCustomElementSchema[];

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
  const context: ParseContext = {
    manifestLabel,
    owningPackage,
    warnings,
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

  const {tagsByDeclaration, definitionOnlyTags} = resolveRegistrations(
    modules,
    customElementDeclarations,
    declarationsByModuleAndName,
    context,
  );

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
  for (const [declaration, {tagName, registration}] of tagsByDeclaration) {
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

  // Tags with unresolved declarations have no custom members. Recognize the tag but continue
  // reporting unknown bindings. Prefer a resolved declaration of the same tag when available.
  const definitionOnlySchemas: ParsedCustomElementSchema[] = [];
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

  const schemas: ParsedCustomElementSchema[] = [];
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
  return {schemas, errors: [], warnings};
}

interface DeclarationRegistration {
  tagName: string;
  registration: TagRegistrationRecord;
  hasHomeDefinition: boolean;
}

/** Resolves tag registrations separately from projecting declaration members. */
function resolveRegistrations(
  modules: Array<{path: string; [key: string]: unknown}>,
  customElementDeclarations: CemDeclaration[],
  declarationsByModuleAndName: Map<string, CemDeclaration[]>,
  {manifestLabel, warnings}: ParseContext,
) {
  // Read tag names from declarations and `custom-element-definition` exports. An export with an
  // unresolved declaration still registers the tag, with no custom members in its schema.
  const tagsByDeclaration = new Map<CemDeclaration, DeclarationRegistration>();
  const definitionOnlyTags = new Map<
    string,
    {registration: TagRegistrationRecord; reason: string}
  >();
  for (const declaration of customElementDeclarations) {
    const tagName = declaration.node['tagName'];
    if (typeof tagName === 'string' && tagName.length > 0) {
      tagsByDeclaration.set(declaration, {
        tagName,
        registration: tagRegistration(
          declaration.node,
          declaration.name,
          declaration.modulePath,
          declaration.modulePath,
          'tagName',
        ),
        hasHomeDefinition: false,
      });
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
        let tag = tagsByDeclaration.get(declaration);
        if (tag === undefined) {
          tag = {tagName: definitionTagName, registration, hasHomeDefinition: false};
          tagsByDeclaration.set(declaration, tag);
        } else {
          const {tagName: winningTagName, registration: winner} = tag;
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
            tag.registration = registration;
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
        if (containingModule === declarationHomeModule && tag.tagName === definitionTagName) {
          tag.hasHomeDefinition = true;
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
      !tagsByDeclaration.get(declaration)?.hasHomeDefinition
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

  return {tagsByDeclaration, definitionOnlyTags};
}

function declarationKey(modulePath: string, name: string): string {
  return `${modulePath.replace(/^\.\//, '')}\0${name}`;
}

function formatJavaScriptExports(candidates: JavaScriptExport[] | undefined): string {
  return (candidates ?? [])
    .slice(0, 3)
    .map((candidate) => `'${candidate.name}' from '${candidate.module}'`)
    .join(', ');
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
