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
import {manifestMessage} from './manifest_diagnostics';
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

  /** Problems that prevent reading the manifest, as diagnostic messages. */
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
 * Whether `tagName` is a valid custom element name: it starts with a lowercase ASCII letter,
 * contains a hyphen, uses only `PCENChar` characters, and isn't a reserved SVG or MathML name.
 */
function isValidCustomElementName(tagName: string): boolean {
  // https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
  const pCenChar =
    /^[a-z][.0-9_a-z\-\u00b7\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u037d\u037f-\u1fff\u200c-\u200d\u203f-\u2040\u2070-\u218f\u2c00-\u2fef\u3001-\ud7ff\uf900-\ufdcf\ufdf0-\ufffd\u{10000}-\u{effff}]*$/u;
  return pCenChar.test(tagName) && tagName.includes('-') && !RESERVED_TAG_NAMES.has(tagName);
}

/**
 * Parses a Custom Elements Manifest into element schemas. See
 * https://github.com/webcomponents/custom-elements-manifest for the format.
 *
 * Validates only the records used for template checking. An invalid record produces a warning and
 * loses only its own metadata. Invalid JSON, or a root that isn't an object with a string
 * `schemaVersion` and a `modules` array, produces an error.
 *
 * Reads schema versions 1 and 2. Another or an invalid `schemaVersion` produces a warning, and the
 * records Angular recognizes are still read. Mixins without a tag produce no schema, and
 * `superclass` and `mixins` references aren't followed.
 *
 * `manifestLabel` identifies the manifest in diagnostics and is already quoted.
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
      errors: [
        manifestMessage(
          manifestLabel,
          `the file is not valid JSON. The JSON parser reports: ${(e as Error).message}`,
        ),
      ],
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
        manifestMessage(
          manifestLabel,
          `the file is not a Custom Elements Manifest. A manifest is a JSON object with a string ` +
            `"schemaVersion" and a "modules" array.`,
        ),
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
  if (!/^[12]\./.test(schemaVersion)) {
    warnings.push({
      kind: 'invalidStructure',
      subject: 'schemaVersion',
      message: manifestMessage(
        manifestLabel,
        `"schemaVersion" is ${JSON.stringify(schemaVersion)}, but Angular supports schema ` +
          `versions 1.x and 2.x. Angular still reads the records it recognizes, but may ignore ` +
          `or misread records that differ in this version.`,
      ),
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
        message: manifestMessage(
          manifestLabel,
          `the module at index ${index} of "modules" is invalid. A module needs "kind": ` +
            `"javascript-module" and a string "path". Angular ignores this module and reads the ` +
            `others.`,
        ),
      });
      continue;
    }
    modules.push(module as {path: string; [key: string]: unknown});
  }

  // Index declarations by module and name so that exports can refer to them, and collect the custom
  // element classes.
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

  // Index `js` exports by the declaration they export, even if the declaration is missing. This
  // finds the public name to import an element class by. `type.references` already use public
  // names.
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
        message: manifestMessage(
          manifestLabel,
          `the class '${declaration.name}' declares the tag '${tagName}', which is not a valid ` +
            `custom element name` +
            (tagName.includes('-') ? '' : ` because it has no hyphen`) +
            `. Angular ignores this declaration.`,
        ),
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

  // A definition export whose declaration isn't in the manifest still registers its tag. The tag
  // has no members, so bindings on it are still reported. A declaration of the same tag wins.
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
        message: manifestMessage(
          manifestLabel,
          `a custom-element-definition export registers '${tagName}', which is not a valid ` +
            `custom element name` +
            (tagName.includes('-') ? '' : ` because it has no hyphen`) +
            `. Angular ignores this export.`,
        ),
      });
      continue;
    }
    warnings.push({
      kind: 'unusableType',
      subject: tagName,
      message: manifestMessage(
        manifestLabel,
        `the custom-element-definition export for '${tagName}' refers to the class ` +
          `'${registration.declarationName}' in '${registration.declarationModule}', which ` +
          `${reason}. Angular knows the tag '${tagName}' ` +
          `but none of its custom properties, so bindings to them are errors, and local ` +
          `references to the element are typed as HTMLElement.`,
      ),
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
        message: manifestMessage(
          manifestLabel,
          `the class '${declaration.name}' in '${declaration.modulePath}' has more than one ` +
            `"js" export (${formatJavaScriptExports(declarationExportCandidates)}), so Angular ` +
            `cannot tell which one to import. Local references to '${tagName}' are typed as ` +
            `HTMLElement; its properties and events are still checked.`,
        ),
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
}

/**
 * Finds the tag of each custom element declaration, from its `tagName` or a
 * `custom-element-definition` export. Also returns the tags of definition exports whose
 * declaration isn't in the manifest.
 */
function resolveRegistrations(
  modules: Array<{path: string; [key: string]: unknown}>,
  customElementDeclarations: CemDeclaration[],
  declarationsByModuleAndName: Map<string, CemDeclaration[]>,
  {manifestLabel, warnings}: ParseContext,
) {
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
      // A declaration in another package isn't in this manifest, but the definition still registers
      // the tag.
      if (typeof exportEntry['declaration']['package'] === 'string') {
        recordDefinitionOnly(
          `is in another package, '${exportEntry['declaration']['package']}'`,
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
        recordDefinitionOnly('is not in the manifest', referencedModule);
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
          tag = {tagName: definitionTagName, registration};
          tagsByDeclaration.set(declaration, tag);
        } else {
          const {tagName: winningTagName, registration: winner} = tag;
          if (winningTagName !== definitionTagName) {
            warnings.push({
              kind: 'invalidStructure',
              subject: `${definitionDeclarationName}#${definitionTagName}`,
              message: manifestMessage(
                manifestLabel,
                `the class '${definitionDeclarationName}' in '${declarationHomeModule}' is ` +
                  `registered with two tags: ` +
                  (formatRegistrationSource(winner) === formatRegistrationSource(registration)
                    ? `'${winningTagName}' and '${definitionTagName}', both by ` +
                      `custom-element-definition exports in '${containingModule}'`
                    : `'${winningTagName}' by ${formatRegistrationSource(winner)}, and ` +
                      `'${definitionTagName}' by ${formatRegistrationSource(registration)}`) +
                  `. A class can have only one tag, so Angular uses '${winningTagName}' and ` +
                  `ignores '${definitionTagName}'.`,
              ),
            });
          } else if (winner.source === 'tagName' && containingModule === declarationHomeModule) {
            // The declaration's `tagName` already registered this tag. CEM expects one matching
            // definition export in the same module; use it for registration details such as
            // `deprecated`. Later definitions are duplicates.
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
      }
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
 * Picks the export to import a declaration by, regardless of manifest order: the declared name
 * (from `homeModule` if several modules export it), else the only non-default export, else the
 * only default export. Returns `undefined` if there are no exports, or `null` if no single export
 * qualifies.
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

/** Describes what registers a tag: a class's `tagName` or a definition export. */
function formatRegistrationSource(registration: TagRegistrationRecord): string {
  return registration.source === 'tagName'
    ? `its "tagName"`
    : `the custom-element-definition export in '${registration.registrationModule}'`;
}

function formatClass(registration: TagRegistrationRecord): string {
  return `the class '${registration.declarationName}' in '${registration.declarationModule}'`;
}

function duplicateRegistrationMessage(
  manifestLabel: string,
  tagName: string,
  winner: TagRegistrationRecord,
  loser: TagRegistrationRecord,
): string {
  const winnerSource = formatRegistrationSource(winner);
  const loserSource = formatRegistrationSource(loser);
  let text: string;
  if (formatClass(winner) !== formatClass(loser)) {
    text =
      `the tag '${tagName}' is registered for two classes: '${winner.declarationName}' in ` +
      `'${winner.declarationModule}' and '${loser.declarationName}' in ` +
      `'${loser.declarationModule}'. Angular uses '${winner.declarationName}' and ignores ` +
      `'${loser.declarationName}', as the browser keeps the first customElements.define() call ` +
      `for a tag.`;
  } else if (winnerSource !== loserSource) {
    text =
      `the tag '${tagName}' is registered for ${formatClass(winner)} both by ${winnerSource} and ` +
      `by ${loserSource}. Angular uses the first registration.`;
  } else {
    text =
      `the tag '${tagName}' is registered more than once for ${formatClass(winner)}, each time ` +
      `by ${winnerSource}. Angular uses the first registration.`;
  }
  return manifestMessage(manifestLabel, text);
}
