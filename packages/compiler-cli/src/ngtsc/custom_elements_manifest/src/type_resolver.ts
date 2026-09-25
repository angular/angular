/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵCustomElementsManifestSchema as CustomElementsManifestSchema} from '@angular/compiler';
import ts from 'typescript';
import {ErrorCode, makeConfigDiagnostic} from '../../diagnostics';
import {AbsoluteFsPath, absoluteFrom, dirname, join, relative} from '../../file_system';
import {resolveResourceModule} from './module_resolution';
import {ManifestCheckType, ManifestWarning} from './schema';
import {
  ManifestLoadContext,
  ProgramTypeEnvironment,
  CustomElementsManifestsDiagnosticsMode,
  globalTypeIsAvailable,
} from './load_context';
import {
  checkTypeFallbackEffect,
  formatExamples,
  formatQuotedList,
  VERBOSE_HINT,
} from './manifest_diagnostics';
import {ParsedCustomElementsManifest} from './manifest_parser';
import {findOwningPackageJson} from './manifest_resolver';
import {inspectTypes, ResolvedCheckType} from './type_program';

const TYPESCRIPT_FILE = /\.(?:d\.)?[cm]?tsx?$/;
const TYPESCRIPT_SPECIFIER = /\.[mc]?tsx?$/;

/**
 * Validates imported types against exported TypeScript declarations and global types against the
 * consuming program. Removes check types with unresolved references and reports a configuration
 * warning. This prevents generated imports from causing errors on template bindings.
 * Affected bindings retain schema checks. Affected element references use `HTMLElement`.
 */
export function resolveManifestSchemas(
  {schemas}: ParsedCustomElementsManifest,
  {
    path: manifestPath,
    label: manifestLabel,
    packageName,
    diagnosticsMode,
  }: {
    path: AbsoluteFsPath;
    label: string;
    packageName: string | null;
    diagnosticsMode: CustomElementsManifestsDiagnosticsMode;
  },
  load: ManifestLoadContext,
): {
  schemas: CustomElementsManifestSchema[];
  warnings: ManifestWarning[];
  diagnostics: ts.Diagnostic[];
} {
  const {basePath, program, programTypeEnvironment} = load.environment;
  const {globalTypeAvailability} = load.dependencies;
  const typeChecker = program.getTypeChecker();
  const warnings: ManifestWarning[] = [];
  const diagnostics: ts.Diagnostic[] = [];
  const containingFile = join(basePath, 'index.ts');
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

  const {missingExports, checkedTypes} = inspectTypes(
    resolvedFiles,
    referencedNames,
    checkTypes,
    replacementSpecifiers,
    load,
  );
  for (const name of referencedGlobals) {
    globalTypeAvailability.set(name, globalTypeIsAvailable(typeChecker, name));
  }
  const missingGlobals = new Set(
    Array.from(referencedGlobals).filter((name) => !globalTypeAvailability.get(name)),
  );
  const referenceResolves = (specifier: string, name: string): boolean =>
    !unresolvableSpecifiers.has(specifier) && !missingExports.get(specifier)?.has(name);
  const genericInstanceTypes = new Set<string>();

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
        genericInstanceTypes.add(analysis.checkType);
      } else {
        warnings.push({
          kind: 'unusableType',
          subject: analysis.subject,
          message:
            `The Custom Elements Manifest ${manifestLabel} declares type text ` +
            `${JSON.stringify(analysis.originalText)} for ${analysis.subject} that TypeScript cannot use: ` +
            checked.errors
              .map((error) => ts.flattenDiagnosticMessageText(error.messageText, ' '))
              .join(' ') +
            ` Affected checks use a safe fallback; other checks are unaffected.`,
        });
      }
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
        ...(instanceType === undefined ? {} : {instanceCheckType: instanceType.checkType}),
      };
    },
  );

  if (genericInstanceTypes.size > 0) {
    diagnostics.push(
      makeConfigDiagnostic(
        ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNRESOLVABLE_TYPE_REFERENCE,
        `The Custom Elements Manifest ${manifestLabel} references element instance types ` +
          `${formatQuotedList(genericInstanceTypes)} that require type arguments. ` +
          `Affected local references fall back to HTMLElement; other checks are unaffected.`,
        ts.DiagnosticCategory.Warning,
      ),
    );
  }

  // Group problems by unresolved module, module with missing exports, or missing globals.
  // Keep the detailed message for one group. Summarize multiple groups per manifest.
  const groupCount =
    unresolvableSpecifiers.size + missingExports.size + (missingGlobals.size > 0 ? 1 : 0);
  if (diagnosticsMode === 'summary' && groupCount > 1) {
    const parts: string[] = [];
    if (unresolvableSpecifiers.size > 0) {
      parts.push(
        `${unresolvableSpecifiers.size} module specifier${
          unresolvableSpecifiers.size === 1 ? '' : 's'
        } that do not resolve to TypeScript declarations`,
      );
    }
    if (missingExports.size > 0) {
      parts.push(
        `${missingExports.size} module${
          missingExports.size === 1 ? '' : 's'
        } whose declarations are missing referenced types`,
      );
    }
    if (missingGlobals.size > 0) {
      parts.push(
        `${missingGlobals.size} global type name${
          missingGlobals.size === 1 ? '' : 's'
        } not declared by the consuming program`,
      );
    }
    const examples = [...unresolvableSpecifiers, ...missingExports.keys(), ...missingGlobals];
    diagnostics.push(
      makeConfigDiagnostic(
        ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNRESOLVABLE_TYPE_REFERENCE,
        `The Custom Elements Manifest ${manifestLabel} has unusable type references: ` +
          `${parts.join(', ')} (e.g. ${formatExamples(examples)}).` +
          missingGlobalProgramHint(missingGlobals, programTypeEnvironment) +
          ` ` +
          checkTypeFallbackEffect(/* affectsLocalReferences */ true) +
          ` ` +
          VERBOSE_HINT,
        ts.DiagnosticCategory.Warning,
      ),
    );
    return {schemas: result, warnings, diagnostics};
  }

  for (const specifier of unresolvableSpecifiers) {
    diagnostics.push(
      makeConfigDiagnostic(
        ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNRESOLVABLE_TYPE_REFERENCE,
        `The Custom Elements Manifest ${manifestLabel} references types in '${specifier}', ` +
          `which does not resolve to TypeScript declarations. ` +
          checkTypeFallbackEffect(/* affectsLocalReferences */ true),
        ts.DiagnosticCategory.Warning,
      ),
    );
  }
  for (const [specifier, names] of missingExports) {
    diagnostics.push(
      makeConfigDiagnostic(
        ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNRESOLVABLE_TYPE_REFERENCE,
        `The Custom Elements Manifest ${manifestLabel} references ${formatQuotedList(names)} ` +
          `from '${specifier}', but its TypeScript declarations do not export ` +
          `${
            names.size === 1 ? 'a usable type with that name' : 'usable types with those names'
          }. ` +
          checkTypeFallbackEffect(/* affectsLocalReferences */ true),
        ts.DiagnosticCategory.Warning,
      ),
    );
  }
  if (missingGlobals.size > 0) {
    diagnostics.push(
      makeConfigDiagnostic(
        ErrorCode.CONFIG_CUSTOM_ELEMENTS_MANIFEST_UNRESOLVABLE_TYPE_REFERENCE,
        `The Custom Elements Manifest ${manifestLabel} references ${formatQuotedList(
          missingGlobals,
        )} from 'global:', but the consuming TypeScript program does not declare ${
          missingGlobals.size === 1
            ? 'a usable global type with that name'
            : 'usable global types with those names'
        }.` +
          missingGlobalProgramHint(missingGlobals, programTypeEnvironment) +
          ` ` +
          // Global type references do not affect element instance types.
          checkTypeFallbackEffect(/* affectsLocalReferences */ false),
        ts.DiagnosticCategory.Warning,
      ),
    );
  }
  return {schemas: result, warnings, diagnostics};
}

/**
 * Explains missing globals using the program structure. Recommends an application tsconfig for
 * solution-style roots and checking library options for programs without default libraries.
 */
function missingGlobalProgramHint(
  missingGlobals: ReadonlySet<string>,
  environment: ProgramTypeEnvironment,
): string {
  if (missingGlobals.size === 0) {
    return '';
  }
  if (environment.isSolutionStyleRoot) {
    return SOLUTION_STYLE_PROGRAM_HINT;
  }
  if (!environment.hasDefaultLibrary) {
    return NO_DEFAULT_LIBRARY_PROGRAM_HINT;
  }
  return '';
}

const SOLUTION_STYLE_PROGRAM_HINT =
  ` The compiler is analyzing a solution-style tsconfig with no root files. Build with the ` +
  `application tsconfig (for example tsconfig.app.json, as 'ng build' does) instead.`;

const NO_DEFAULT_LIBRARY_PROGRAM_HINT =
  ` No TypeScript default library files are loaded in this program. Verify that its "lib" and ` +
  `"noLib" compiler options are intentional.`;

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
 * Resolves module paths relative to the manifest directory after resolution from the package
 * root has failed.
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
