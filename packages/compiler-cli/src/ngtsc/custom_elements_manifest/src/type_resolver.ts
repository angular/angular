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
import {ManifestLoadContext, ProgramTypeEnvironment, globalTypeIsAvailable} from './load_context';
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
 * together. A check type whose references don't resolve is dropped with a warning, so that its
 * `import()` types can't cause errors on template bindings. The member stays known, and local
 * references use `HTMLElement`. Returns results in input order.
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
  request: ManifestTypeRequest;
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
  }

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
      checkTypes,
      instanceTypes,
      replacements: replacementSpecifiers,
    },
    referencedGlobals,
    unresolvableSpecifiers,
  };
}

/** Applies validated check types to the parsed schemas of one manifest. */
function projectSchemas(
  {parsed: {schemas}, manifest: {label: manifestLabel}}: ManifestTypeInput,
  {
    request: {instanceTypes, referencedNames},
    referencedGlobals,
    unresolvableSpecifiers,
  }: ManifestTypeReferences,
  {missingExports, checkedTypes}: ManifestTypeInspection,
  load: ManifestLoadContext,
): ResolvedManifestSchemas {
  const {program, programTypeEnvironment} = load.environment;
  const {globalTypeAvailability} = load.dependencies;
  const typeChecker = program.getTypeChecker();
  const warnings: ManifestWarning[] = [];
  for (const name of referencedGlobals) {
    globalTypeAvailability.set(name, globalTypeIsAvailable(typeChecker, name));
  }
  const missingGlobals = new Set(
    Array.from(referencedGlobals).filter((name) => !globalTypeAvailability.get(name)),
  );
  const referenceResolves = (specifier: string, name: string): boolean =>
    !unresolvableSpecifiers.has(specifier) && !missingExports.get(specifier)?.has(name);

  const resolvedTypes = new Map<ManifestCheckType, ResolvedCheckType>();
  for (const {analysis, ...checked} of checkedTypes) {
    if (
      analysis.imports.some(
        (reference) => !referenceResolves(reference.specifier, reference.name),
      ) ||
      analysis.globals.some((name) => missingGlobals.has(name))
    ) {
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
        warnings.push({
          code: ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNUSABLE_TYPE,
          subject: analysis.subject,
          message: manifestMessage(
            manifestLabel,
            `the type ${JSON.stringify(analysis.originalText)} of the ${analysis.subject} ` +
              `cannot be used for type checking, because TypeScript reports: ` +
              checked.errors
                .map((error) => ts.flattenDiagnosticMessageText(error.messageText, ' '))
                .join(' ') +
              ` ${analysis.fallbackEffect}`,
          ),
        });
      }
      continue;
    }
    if (checked.elementCheckType === null) {
      warnings.push({
        code: ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNUSABLE_TYPE,
        subject: analysis.subject,
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

  function projectMember<T extends {checkType?: ManifestCheckType}>(
    member: T,
  ): Omit<T, 'checkType'> & {checkType?: string} {
    const {checkType, ...metadata} = member;
    const resolved = checkType === undefined ? undefined : resolvedTypes.get(checkType);
    return {...metadata, ...(resolved === undefined ? {} : {checkType: resolved.checkType})};
  }
  const result: CustomElementsManifestSchema[] = schemas.map(
    ({properties, attributes, events, instanceCheckType, ...metadata}) => {
      const instanceType =
        instanceCheckType === undefined ? undefined : resolvedTypes.get(instanceCheckType);
      return {
        ...metadata,
        properties: properties.map(projectMember),
        events: events.map(projectMember),
        attributes: attributes.map((attribute) => {
          const values =
            attribute.checkType === undefined
              ? undefined
              : resolvedTypes.get(attribute.checkType)?.stringLiteralValues;
          return {
            ...projectMember(attribute),
            ...(values == null || values.length === 0 ? {} : {stringLiteralValues: values}),
          };
        }),
        ...(instanceType === undefined
          ? {}
          : {instanceCheckType: instanceType.elementCheckType ?? instanceType.checkType}),
      };
    },
  );

  for (const specifier of unresolvableSpecifiers) {
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
    dependencies: {cacheDependencyPaths},
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
