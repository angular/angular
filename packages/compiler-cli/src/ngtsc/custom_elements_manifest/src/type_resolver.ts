/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CustomElementsManifestSchema} from '@angular/compiler';
import ts from 'typescript';
import {ErrorCode} from '../../diagnostics';
import {AbsoluteFsPath, absoluteFrom, dirname, join, relative} from '../../file_system';
import {resolveResourceModule} from './module_resolution';
import {ManifestCheckType, ManifestWarning} from './schema';
import {
  ManifestLoadContext,
  ProgramTypeEnvironment,
  globalTypeIsAvailable,
  libraryTypeIsAvailable,
} from './load_context';
import {
  checkTypeFallbackEffect,
  formatQuotedList,
  manifestMessage,
  typeFallbackEffect,
} from './manifest_diagnostics';
import {ParsedCustomElementsManifest} from './manifest_parser';
import {findOwningPackageJson} from './manifest_resolver';
import {
  inspectTypes,
  ManifestTypeInspection,
  ManifestTypeRequest,
  ResolvedCheckType,
} from './type_program';

const TYPESCRIPT_FILE = /\.(?:d\.)?[cm]?tsx?$/;
const TYPESCRIPT_SPECIFIER = /\.[mc]?tsx?$/;

/** A parsed manifest and the identity used to resolve its type references. */
export interface ManifestTypeInput {
  parsed: ParsedCustomElementsManifest;
  manifest: {
    path: AbsoluteFsPath;
    label: string;
    packageName: string | null;
  };
}

/** Schemas of one manifest with validated check types and the problems found validating them. */
export interface ResolvedManifestSchemas {
  schemas: CustomElementsManifestSchema[];
  warnings: ManifestWarning[];
}

/**
 * Resolves each manifest's type references and type-checks the check types of all manifests
 * together. A check type whose references don't resolve is dropped, so that its `import()` types
 * can't cause errors on template bindings. A property is then checked against the element class,
 * when the class resolves and declares it, and the class also adds the bindable properties that
 * the manifest omits. A member that still has no type stays known and produces a warning, and
 * local references to an element without a usable class use `HTMLElement`. Returns results in
 * input order.
 */
export function resolveManifestSchemas(
  manifests: readonly ManifestTypeInput[],
  load: ManifestLoadContext,
): ResolvedManifestSchemas[] {
  const references = manifests.map((manifest) => resolveTypeReferences(manifest, load));
  const inspections = inspectTypes(
    references.map(({request}) => request),
    load,
  );
  return manifests.map((manifest, index) =>
    projectSchemas(manifest, references[index], inspections[index], load),
  );
}

/** Module resolution results for the type references of one manifest. */
interface ManifestTypeReferences {
  /** The types to validate: those of `checkTypes` whose global names all exist. */
  request: ManifestTypeRequest;
  /** Every check type of the manifest. */
  checkTypes: ReadonlySet<ManifestCheckType>;
  referencedGlobals: Set<string>;
  unresolvableSpecifiers: Set<string>;
}

function resolveTypeReferences(
  {parsed: {schemas}, manifest: {path: manifestPath, packageName}}: ManifestTypeInput,
  load: ManifestLoadContext,
): ManifestTypeReferences {
  const containingFile = join(load.environment.basePath, 'index.ts');
  const checkTypes = new Set<ManifestCheckType>();
  const instanceTypes = new Set<ManifestCheckType>();
  for (const schema of schemas) {
    for (const member of [...schema.properties, ...schema.attributes, ...schema.events]) {
      if (member.checkType !== undefined) {
        checkTypes.add(member.checkType);
      }
    }
    if (schema.instanceCheckType !== undefined) {
      checkTypes.add(schema.instanceCheckType);
      instanceTypes.add(schema.instanceCheckType);
    }
  }
  const referencedNames = new Map<string, Set<string>>();
  const referencedGlobals = new Set<string>();
  const referencedLibraryTypes = new Set<string>();
  for (const analysis of checkTypes) {
    for (const reference of analysis.imports) {
      let names = referencedNames.get(reference.specifier);
      if (names === undefined) {
        names = new Set();
        referencedNames.set(reference.specifier, names);
      }
      names.add(reference.name);
    }
    for (const name of analysis.globals) {
      referencedGlobals.add(name);
    }
    for (const name of analysis.libraryTypes) {
      referencedLibraryTypes.add(name);
    }
  }

  const {program} = load.environment;
  const {globalTypeAvailability, libraryTypeAvailability} = load.dependencies;
  const typeChecker = program.getTypeChecker();
  for (const name of referencedGlobals) {
    globalTypeAvailability.set(name, globalTypeIsAvailable(typeChecker, name));
  }
  for (const name of referencedLibraryTypes) {
    libraryTypeAvailability.set(name, libraryTypeIsAvailable(program, typeChecker, name));
  }
  // A type that names a missing global is unusable, so it isn't validated. Validating it would
  // also be slow: for each `globalThis.<Name>` that doesn't exist, TypeScript searches all global
  // names for a spelling suggestion.
  const validatedTypes = new Set(
    Array.from(checkTypes).filter(
      (analysis) =>
        analysis.globals.every((name) => globalTypeAvailability.get(name)) &&
        analysis.libraryTypes.every((name) => libraryTypeAvailability.get(name)),
    ),
  );

  const resolvedFiles = new Map<string, string>();
  const replacementSpecifiers = new Map<string, string>();
  const unresolvableSpecifiers = new Set<string>();
  for (const specifier of referencedNames.keys()) {
    // Reject TypeScript source specifiers because libraries may not publish those files,
    // even when the consuming program allows TypeScript extensions in imports.
    if (TYPESCRIPT_SPECIFIER.test(specifier)) {
      unresolvableSpecifiers.add(specifier);
      continue;
    }
    let resolved = resolveTypeReferenceModuleName(specifier, containingFile, load);
    if (resolved === undefined) {
      const manifestRelativeSpecifier = manifestRelativeModuleSpecifier(
        specifier,
        manifestPath,
        packageName,
        load,
      );
      if (manifestRelativeSpecifier !== null) {
        resolved = resolveTypeReferenceModuleName(manifestRelativeSpecifier, containingFile, load);
        if (resolved !== undefined) {
          replacementSpecifiers.set(specifier, manifestRelativeSpecifier);
        }
      }
    }
    // The generated `import()` type requires TypeScript declarations. JavaScript alone is insufficient.
    if (resolved === undefined || !TYPESCRIPT_FILE.test(resolved.resolvedFileName)) {
      unresolvableSpecifiers.add(specifier);
    } else {
      resolvedFiles.set(specifier, resolved.resolvedFileName);
    }
  }
  return {
    request: {
      resolvedFiles,
      referencedNames,
      checkTypes: validatedTypes,
      instanceTypes,
      replacements: replacementSpecifiers,
    },
    checkTypes,
    referencedGlobals,
    unresolvableSpecifiers,
  };
}

/**
 * Applies validated check types to the parsed schemas of one manifest, and fills in members and
 * types from the element classes that resolve.
 */
function projectSchemas(
  {parsed: {schemas}, manifest: {label: manifestLabel}}: ManifestTypeInput,
  {
    request: {checkTypes: validatedTypes, instanceTypes, referencedNames},
    checkTypes,
    referencedGlobals,
    unresolvableSpecifiers,
  }: ManifestTypeReferences,
  {missingExports, checkedTypes}: ManifestTypeInspection,
  load: ManifestLoadContext,
): ResolvedManifestSchemas {
  const {programTypeEnvironment} = load.environment;
  const {globalTypeAvailability, libraryTypeAvailability} = load.dependencies;
  const warnings: ManifestWarning[] = [];
  const missingGlobals = new Set(
    Array.from(referencedGlobals).filter((name) => !globalTypeAvailability.get(name)),
  );
  const referenceResolves = (specifier: string, name: string): boolean =>
    !unresolvableSpecifiers.has(specifier) && !missingExports.get(specifier)?.has(name);

  const resolvedTypes = new Map<ManifestCheckType, ResolvedCheckType>();
  /** Why a check type is unusable, when the reason is specific to that type. */
  const typeWarnings = new Map<ManifestCheckType, ManifestWarning>();
  /** Check types that are unusable and that no element class replaced. */
  const unusedTypes = new Set<ManifestCheckType>();
  // The types that were not validated name a global type that doesn't exist.
  for (const analysis of checkTypes) {
    if (validatedTypes.has(analysis)) {
      continue;
    }
    const unknownNames = new Set(
      analysis.libraryTypes.filter((name) => !libraryTypeAvailability.get(name)),
    );
    // A missing `global:` reference is reported once for each reference below.
    if (unknownNames.size > 0) {
      typeWarnings.set(analysis, {
        code: ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNUSABLE_TYPE,
        subject: analysis.warningSubject,
        message: manifestMessage(
          manifestLabel,
          `the type ${JSON.stringify(analysis.originalText)} of the ${analysis.subject} cannot ` +
            `be used for type checking: ${formatQuotedList(unknownNames)} ` +
            (unknownNames.size === 1
              ? `has no "type.references" entry and is not a type`
              : `have no "type.references" entries and are not types`) +
            ` of TypeScript's standard library. ${analysis.fallbackEffect}`,
        ),
      });
    }
  }
  for (const {analysis, ...checked} of checkedTypes) {
    if (
      analysis.imports.some((reference) => !referenceResolves(reference.specifier, reference.name))
    ) {
      // Reported once for each reference below.
      if (instanceTypes.has(analysis)) {
        unusedTypes.add(analysis);
      }
      continue;
    }
    if (checked.errors.length > 0) {
      if (
        instanceTypes.has(analysis) &&
        checked.errors.some(
          (error) =>
            error.code === GENERIC_TYPE_REQUIRES_ARGUMENTS ||
            error.code === GENERIC_TYPE_REQUIRES_ARGUMENT_RANGE,
        )
      ) {
        warnings.push({
          code: ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNRESOLVABLE_TYPE_REFERENCE,
          subject: analysis.originalText,
          message: manifestMessage(
            manifestLabel,
            `the ${analysis.subject} requires type arguments, which a local reference cannot ` +
              `provide. ${typeFallbackEffect('element')}`,
          ),
        });
      } else {
        const warning: ManifestWarning = {
          code: ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNUSABLE_TYPE,
          subject: analysis.warningSubject,
          message: manifestMessage(
            manifestLabel,
            `the type ${JSON.stringify(analysis.originalText)} of the ${analysis.subject} ` +
              `cannot be used for type checking, because TypeScript reports: ` +
              checked.errors
                .map((error) => ts.flattenDiagnosticMessageText(error.messageText, ' '))
                .join(' ') +
              ` ${analysis.fallbackEffect}`,
          ),
        };
        if (instanceTypes.has(analysis)) {
          warnings.push(warning);
        } else {
          typeWarnings.set(analysis, warning);
        }
      }
      continue;
    }
    if (checked.elementCheckType === null) {
      warnings.push({
        code: ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNUSABLE_TYPE,
        subject: analysis.warningSubject,
        message: manifestMessage(
          manifestLabel,
          `the ${analysis.subject} has no addEventListener method, and its members conflict ` +
            `with HTMLElement, so Angular cannot use it as the element's type. ` +
            typeFallbackEffect('element'),
        ),
      });
      continue;
    }
    resolvedTypes.set(analysis, checked);
  }

  /** Type warnings to report. A property and its attribute can share one. */
  const reportedTypeWarnings = new Set<ManifestWarning>();
  const result: CustomElementsManifestSchema[] = schemas.map(
    ({properties, attributes, events, instanceCheckType, unbindableProperties, ...metadata}) => {
      const instanceType =
        instanceCheckType === undefined ? undefined : resolvedTypes.get(instanceCheckType);
      const classMembers = instanceType?.classMembers ?? null;
      type TypedMember = {checkType?: ManifestCheckType; typeWarning?: ManifestWarning};

      /** The manifest's type of a member, if it is usable. */
      const manifestType = ({checkType}: TypedMember): ResolvedCheckType | undefined =>
        checkType === undefined ? undefined : resolvedTypes.get(checkType);

      /** Whether the element class declares `name` with a type that TypeScript resolves. */
      const classTypes = (name: string | undefined): boolean =>
        name !== undefined && classMembers?.get(name)?.hasCheckType === true;

      /** Reports why a member has no type, when neither the manifest nor the class gives one. */
      const withoutType = ({checkType, typeWarning}: TypedMember): {} => {
        const warning =
          typeWarning ?? (checkType === undefined ? undefined : typeWarnings.get(checkType));
        if (warning !== undefined) {
          reportedTypeWarnings.add(warning);
        }
        if (checkType !== undefined) {
          unusedTypes.add(checkType);
        }
        return {};
      };

      /** A property takes the manifest's type if it is usable, else the element class's. */
      const propertyType = (
        member: TypedMember,
        name: string,
      ): {checkType?: string; classCheckType?: string} => {
        const resolved = manifestType(member);
        if (resolved !== undefined) {
          return {checkType: resolved.checkType};
        }
        return classTypes(name) ? {classCheckType: instanceType!.checkType} : withoutType(member);
      };

      /**
       * An attribute takes the manifest's type if it is usable, else the values that the class
       * accepts for the property that the attribute sets. Only unions of string literals are
       * checked, so the values are also the check type.
       */
      const attributeType = (
        member: TypedMember,
        property: string | undefined,
      ): {checkType?: string; stringLiteralValues?: string[]} => {
        const resolved = manifestType(member);
        if (resolved === undefined && !classTypes(property)) {
          return withoutType(member);
        }
        const values =
          resolved !== undefined
            ? resolved.stringLiteralValues
            : classMembers!.stringLiteralValues(property!);
        const hasValues = values !== null && values.length > 0;
        const checkType =
          resolved?.checkType ??
          (hasValues ? values.map((value) => JSON.stringify(value)).join(' | ') : undefined);
        return {
          ...(checkType === undefined ? {} : {checkType}),
          ...(hasValues ? {stringLiteralValues: values} : {}),
        };
      };

      const declaredProperties = new Set([
        ...properties.map(({name}) => name),
        ...unbindableProperties,
      ]);
      const classOnlyProperties = (classMembers?.ownNames() ?? [])
        .filter((name) => !declaredProperties.has(name))
        .map((name) => ({
          name,
          ...(classTypes(name) ? {classCheckType: instanceType!.checkType} : {}),
          fromElementClass: true as const,
        }));
      return {
        ...metadata,
        properties: [
          ...properties.map(({checkType, typeWarning, ...property}) => ({
            ...property,
            ...propertyType({checkType, typeWarning}, property.name),
          })),
          ...classOnlyProperties,
        ],
        events: events.map(({checkType, typeWarning, ...event}) => {
          const resolved = manifestType({checkType});
          return {
            ...event,
            ...(resolved === undefined
              ? withoutType({checkType, typeWarning})
              : {checkType: resolved.checkType}),
          };
        }),
        attributes: attributes.map(({checkType, typeWarning, property, ...attribute}) => ({
          ...attribute,
          ...attributeType({checkType, typeWarning}, property),
        })),
        ...(instanceType === undefined
          ? {}
          : {instanceCheckType: instanceType.elementCheckType ?? instanceType.checkType}),
      };
    },
  );
  warnings.push(...reportedTypeWarnings);

  // Report an unresolved reference only if a type that uses it was left without a replacement.
  const isUsedBy = (uses: (analysis: ManifestCheckType) => boolean): boolean =>
    Array.from(unusedTypes).some(uses);
  for (const specifier of unresolvableSpecifiers) {
    if (!isUsedBy(({imports}) => imports.some((reference) => reference.specifier === specifier))) {
      continue;
    }
    const names = referencedNames.get(specifier) ?? new Set<string>();
    warnings.push({
      code: ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNRESOLVABLE_TYPE_REFERENCE,
      subject: specifier,
      message: manifestMessage(
        manifestLabel,
        `${formatQuotedList(names)} ${names.size === 1 ? 'is' : 'are'} referenced from ` +
          `'${specifier}', which does not resolve to TypeScript declarations, for example ` +
          `because the package does not publish that file or has no types. ` +
          checkTypeFallbackEffect(/* affectsLocalReferences */ true),
      ),
    });
  }
  for (const [specifier, names] of missingExports) {
    if (
      !isUsedBy(({imports}) =>
        imports.some((reference) => reference.specifier === specifier && names.has(reference.name)),
      )
    ) {
      continue;
    }
    warnings.push({
      code: ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNRESOLVABLE_TYPE_REFERENCE,
      subject: specifier,
      message: manifestMessage(
        manifestLabel,
        `${formatQuotedList(names)} ${names.size === 1 ? 'is' : 'are'} referenced from ` +
          `'${specifier}', but its TypeScript declarations do not export ` +
          `${names.size === 1 ? 'that name as a type' : 'those names as types'}. ` +
          checkTypeFallbackEffect(/* affectsLocalReferences */ true),
      ),
    });
  }
  const programHint = missingGlobalProgramHint(programTypeEnvironment);
  for (const name of missingGlobals) {
    if (!isUsedBy(({globals}) => globals.includes(name))) {
      continue;
    }
    warnings.push({
      code: ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNRESOLVABLE_TYPE_REFERENCE,
      subject: name,
      message: manifestMessage(
        manifestLabel,
        `'${name}' is referenced with "package": "global:", but the TypeScript program does not ` +
          `declare that global type.` +
          (programHint === null ? '' : ` ${programHint}`) +
          ` ` +
          // Global type references do not affect element instance types.
          checkTypeFallbackEffect(/* affectsLocalReferences */ false),
      ),
      ...(programHint === null ? {} : {note: programHint}),
    });
  }
  return {schemas: result, warnings};
}

/**
 * Explains missing globals using the program structure. Recommends an application tsconfig for
 * solution-style roots and checking library options for programs without default libraries.
 */
function missingGlobalProgramHint(environment: ProgramTypeEnvironment): string | null {
  if (environment.isSolutionStyleRoot) {
    return (
      `The compiled tsconfig has only project references and no files of its own. Compile the ` +
      `application's tsconfig, such as tsconfig.app.json, instead.`
    );
  }
  if (!environment.hasDefaultLibrary) {
    return `The program loads no TypeScript library files. Check its "lib" and "noLib" compiler options.`;
  }
  return null;
}

// TypeScript diagnostics for a generic type with omitted required arguments.
const GENERIC_TYPE_REQUIRES_ARGUMENTS = 2314;
const GENERIC_TYPE_REQUIRES_ARGUMENT_RANGE = 2707;

/** Resolves a check-type import and records the file lookups that affect resolution. */
function resolveTypeReferenceModuleName(
  moduleName: string,
  containingFile: string,
  {
    environment: {adapter, options, moduleResolutionCache},
    dependencies: {cacheDependencyPaths, knownContents},
  }: ManifestLoadContext,
): ts.ResolvedModule | undefined {
  const resolution = resolveResourceModule(
    moduleName,
    containingFile,
    options,
    adapter,
    moduleResolutionCache,
  );
  for (const path of resolution.affectingLocations ?? []) {
    cacheDependencyPaths.add(absoluteFrom(path));
  }
  for (const path of resolution.failedLookupLocations ?? []) {
    cacheDependencyPaths.add(absoluteFrom(path));
    knownContents.set(absoluteFrom(path), null);
  }
  if (resolution.resolvedModule !== undefined) {
    cacheDependencyPaths.add(absoluteFrom(resolution.resolvedModule.resolvedFileName));
  }
  return resolution.resolvedModule;
}

/**
 * Returns a specifier that resolves a same-package module path from the manifest's directory, for
 * use after resolving it from the package root fails.
 */
function manifestRelativeModuleSpecifier(
  specifier: string,
  manifestPath: AbsoluteFsPath,
  packageName: string | null,
  {environment: {adapter}, dependencies: {cacheDependencyPaths}}: ManifestLoadContext,
): string | null {
  if (
    packageName === null ||
    (specifier !== packageName && !specifier.startsWith(`${packageName}/`))
  ) {
    return null;
  }
  const packageJsonPath = findOwningPackageJson(
    dirname(manifestPath),
    packageName,
    adapter,
    cacheDependencyPaths,
  );
  if (packageJsonPath === null) {
    return null;
  }
  const manifestDirectory = relative(dirname(packageJsonPath), dirname(manifestPath));
  if (manifestDirectory.length === 0) {
    return null;
  }
  return `${packageName}/${manifestDirectory}${specifier.slice(packageName.length)}`;
}
