/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BoundTarget, MatchSource, TcbDirectiveMetadata} from '@angular/compiler';

import {makeClassKey} from './compiler-utils.js';
import type * as nga from './types.js';

/**
 * A template dependency as a component's emitted output refers to it: ngtsc's
 * `SemanticReference` together with the facts its `isPublicApiAffected` compares.
 */
interface UsedDeclaration {
  /** Declaring file and class name, ngtsc's symbol identity (`path` and `identifier`). */
  readonly identity: string;
  /** How the output imports the dependency (`SemanticReference.importPath`); `null` if bound locally. */
  readonly importPath: string | null;
  /** Everything a change to which forces dependents to be re-emitted (`isPublicApiAffected`). */
  readonly publicApi: string;
}

/** ngtsc's `ComponentSymbol`, restricted to what `isEmitAffected` reads. */
interface ComponentSemantics {
  readonly usedDirectives: readonly UsedDeclaration[];
  readonly usedPipes: readonly UsedDeclaration[];
  readonly isRemotelyScoped: boolean;
  /** Key of the NgModule declaring the component, if any (`filePath#symbolId`). */
  readonly declaringNgModule: string | null;
}

/** What one processed file contributes to the decision of which files to re-emit. */
interface FileSemantics {
  /**
   * Files this file depends on. ngtsc records a dependency on each file the partial evaluator
   * visits while analyzing this file's decorators (`FileDependencyGraph`); the static import
   * edges the analyzer resolved stand in for those.
   *
   * TODO(parity): record the files the analyzer's evaluator actually visits. Import edges also
   * cover imports used for other purposes (e.g. constructor parameter types), so a change to such
   * an import re-emits its importers where ngtsc would not.
   */
  readonly dependencies: readonly string[];
  /** External templates and stylesheets the file's components use. */
  readonly resources: readonly string[];
  /** Components declared in the file, keyed by class name. */
  readonly components: ReadonlyMap<string, ComponentSemantics>;
  /**
   * The injector imports of each NgModule declared in the file, keyed by class name. Which
   * standalone components appear there depends on whether anything they import transitively
   * provides, so these change without the file changing.
   */
  readonly ngModuleInjectorImports: ReadonlyMap<string, string>;
}

/**
 * Decides which files an incremental build has to re-emit, mirroring ngtsc's
 * `IncrementalCompilation` and `SemanticDepGraphUpdater`.
 *
 * Files are compared against the state of the last build whose output was emitted (the
 * *baseline*), not against the previous build, so changes made while the program was broken are
 * still emitted once it is fixed. A file is re-emitted when:
 *
 * - it changed since the baseline, or one of its dependencies or resources did
 *   (ngtsc: logically changed files);
 * - it is a component whose template dependencies, or their public API, changed, or which
 *   entered or left remote scoping (`ComponentSymbol.isEmitAffected`);
 * - it declares an NgModule whose set of remotely scoped components, or their dependencies,
 *   changed (`NgModuleSymbol.isEmitAffected`);
 * - it has not been emitted since the baseline (ngtsc's `priorState.emitted`).
 */
export class IncrementalEmitTracker {
  /** Semantics of every file as last processed. */
  private readonly current = new Map<string, FileSemantics>();
  /** `current` as of the last successful emit; `null` until then, or after a full invalidation. */
  private baseline: ReadonlyMap<string, FileSemantics> | null = null;
  /** Files whose output is up to date as of the baseline. */
  private readonly emitted = new Set<string>();
  /** Source files and resources changed or deleted since the baseline. */
  private readonly changedSinceBaseline = new Set<string>();

  /**
   * Records that `paths` changed or were deleted. A change is a change even when the content is
   * identical, as with ngtsc, which compares source file identity rather than content.
   */
  recordChanges(changed: Iterable<string>, deleted: Iterable<string> = []): void {
    for (const path of changed) {
      this.recordChange(path);
    }
    for (const path of deleted) {
      this.recordChange(path);
      this.current.delete(path);
      this.emitted.delete(path);
    }
  }

  private recordChange(path: string): void {
    // ngtsc starts a fresh compilation whenever a declaration file changes, as the change may
    // affect anything that consumes it (`IncrementalCompilation.incremental`).
    if (path.endsWith('.d.ts')) {
      this.baseline = null;
      this.emitted.clear();
    }
    this.changedSinceBaseline.add(path);
  }

  /** Records the semantics of `result` as just processed, replacing what was recorded before. */
  recordFile(
    result: nga.AnalysisResult,
    boundTargets: ReadonlyMap<string, BoundTarget<TcbDirectiveMetadata>> | undefined,
    remoteScopedClasses: ReadonlySet<string> | undefined,
    extraResources?: Iterable<string>,
  ): void {
    const filePath = result.filePath;
    const previousFile = this.current.get(filePath);
    const resources: string[] = extraResources ? Array.from(extraResources) : [];
    const components = new Map<string, ComponentSemantics>();
    const ngModuleInjectorImports = new Map<string, string>();
    for (const classMeta of result.classes) {
      if (classMeta.ngModule && classMeta.className) {
        // `ɵinj.imports` interleaves the resolved imports with elements kept verbatim, which an
        // element is when every reference in it survives, so a change can show in either.
        const {injectorImports, injectorImportRawSpans} = classMeta.ngModule;
        ngModuleInjectorImports.set(
          classMeta.className,
          JSON.stringify([injectorImports ?? null, injectorImportRawSpans ?? null]),
        );
      }
      const component = classMeta.component;
      if (!component || !classMeta.className) {
        continue;
      }
      if (component.templateUrl) {
        resources.push(component.templateUrl.resolvedPath);
      }
      for (const styleUrl of component.styleUrls ?? []) {
        resources.push(styleUrl.resolvedPath);
      }
      const bound = boundTargets?.get(makeClassKey(classMeta.className, classMeta.span.start));
      const priorComponent = previousFile?.components.get(classMeta.className);
      const declarations = component.resolvedDeclarations ?? [];
      components.set(classMeta.className, {
        usedDirectives: bound
          ? usedDirectivesOf(bound, declarations, filePath)
          : (priorComponent?.usedDirectives ?? []),
        usedPipes: bound
          ? usedPipesOf(bound, declarations, filePath)
          : (priorComponent?.usedPipes ?? []),
        isRemotelyScoped: remoteScopedClasses?.has(`${filePath}#${classMeta.className}`) ?? false,
        declaringNgModule: component.declaringNgModule
          ? `${component.declaringNgModule.filePath}#${component.declaringNgModule.symbolId}`
          : null,
      });
    }
    this.current.set(filePath, {
      dependencies: result.staticDependencies ?? [],
      resources,
      components,
      ngModuleInjectorImports,
    });
  }

  /**
   * Returns whether `filePath` has to be emitted by the current build. Only meaningful once every
   * file of the build has been recorded with `recordFile`.
   */
  createEmitFilter(): (filePath: string) => boolean {
    const baseline = this.baseline;
    if (baseline === null) {
      return () => true;
    }
    const needsEmit = this.determineFilesToReEmit(baseline);
    return (filePath) => !this.emitted.has(filePath) || needsEmit.has(filePath);
  }

  /**
   * Records that the current build's output was emitted, `emittedFiles` being the files written,
   * which makes the current state the baseline of the next build.
   */
  recordSuccessfulEmit(emittedFiles: Iterable<string>): void {
    for (const filePath of emittedFiles) {
      this.emitted.add(filePath);
    }
    this.baseline = new Map(this.current);
    this.changedSinceBaseline.clear();
  }

  private determineFilesToReEmit(baseline: ReadonlyMap<string, FileSemantics>): Set<string> {
    const changed = this.changedSinceBaseline;
    const needsEmit = new Set<string>();
    for (const [filePath, semantics] of this.current) {
      const previous = baseline.get(filePath);
      if (
        changed.has(filePath) ||
        semantics.dependencies.some((dep) => changed.has(dep)) ||
        (previous?.dependencies.some((dep) => changed.has(dep)) ?? false) ||
        semantics.resources.some((resource) => changed.has(resource)) ||
        (previous?.resources.some((resource) => changed.has(resource)) ?? false) ||
        isAnyComponentEmitAffected(semantics, previous) ||
        isAnyNgModuleEmitAffected(semantics, previous)
      ) {
        needsEmit.add(filePath);
      }
    }

    const currentScopes = remoteScopesByNgModule(this.current);
    const previousScopes = remoteScopesByNgModule(baseline);
    for (const ngModule of new Set([...currentScopes.keys(), ...previousScopes.keys()])) {
      if (!isRemoteScopeEqual(currentScopes.get(ngModule), previousScopes.get(ngModule))) {
        needsEmit.add(ngModuleFile(ngModule));
      }
    }
    return needsEmit;
  }
}

/**
 * The directives `bound`'s template matches by selector, in scope order. Host directives and the
 * component's own host-element entry are left out: ngtsc reaches host directives through their
 * host, and a component is only in its own `usedDirectives` when its template matches its own
 * selector recursively.
 */
function usedDirectivesOf(
  bound: BoundTarget<TcbDirectiveMetadata>,
  declarations: readonly nga.DeclarationMetadata[],
  consumerPath: string,
): UsedDeclaration[] {
  const templateDirectives =
    (
      bound as BoundTarget<TcbDirectiveMetadata> & {
        getTemplateUsedDirectives?: () => TcbDirectiveMetadata[];
      }
    ).getTemplateUsedDirectives?.() ?? bound.getUsedDirectives();
  const used = new Set(
    templateDirectives
      .filter((dir) => dir.matchSource === MatchSource.Selector)
      .map((dir) => `${dir.ref.nodeFilePath ?? consumerPath}#${dir.name}`),
  );
  if (used.size === 0) {
    return [];
  }
  return declarations
    .filter(
      (decl) =>
        (decl.declarationType === 'directive' || decl.declarationType === 'component') &&
        used.has(`${decl.filePath ?? consumerPath}#${decl.name}`),
    )
    .map((decl) => toUsedDeclaration(decl, consumerPath));
}

/** The pipes `bound`'s template uses, in scope order. */
function usedPipesOf(
  bound: BoundTarget<TcbDirectiveMetadata>,
  declarations: readonly nga.DeclarationMetadata[],
  consumerPath: string,
): UsedDeclaration[] {
  const used = new Set(bound.getUsedPipes());
  if (used.size === 0) {
    return [];
  }
  return declarations
    .filter((decl) => decl.declarationType === 'pipe' && !!decl.pipeName && used.has(decl.pipeName))
    .map((decl) => toUsedDeclaration(decl, consumerPath));
}

function toUsedDeclaration(decl: nga.DeclarationMetadata, consumerPath: string): UsedDeclaration {
  const consumerImport = decl.ref.consumerImport;
  return {
    identity: `${decl.filePath ?? consumerPath}#${decl.name}`,
    importPath: consumerImport ? `${consumerImport.specifier}$${consumerImport.symbol}` : null,
    publicApi: publicApiOf(decl),
  };
}

/**
 * The parts of a declaration whose change requires the components using it to be re-emitted,
 * mirroring `DirectiveSymbol.isPublicApiAffected` and `PipeSymbol.isPublicApiAffected`.
 *
 * A directive and a component share a public API (ngtsc lets one turn into the other without
 * affecting it), and neither whether an input is required, whether it is a signal, nor the class
 * property behind a binding is part of it: those only affect type-checking.
 */
function publicApiOf(decl: nga.DeclarationMetadata): string {
  if (decl.declarationType === 'pipe') {
    return JSON.stringify(['pipe', decl.pipeName ?? null]);
  }
  const inputs = new Set<string>();
  const outputs = new Set<string>();
  for (const field of decl.flattenedFields ?? decl.fields ?? []) {
    if (field.input) {
      inputs.add(field.input.alias || field.input.name);
    }
    if (field.output) {
      outputs.add(field.output.alias || field.output.name);
    }
  }
  return JSON.stringify([
    'directive',
    decl.selector ?? null,
    Array.from(inputs),
    Array.from(outputs),
    decl.exportAs ?? null,
  ]);
}

/** `ComponentSymbol.isEmitAffected` for every component in a file. */
function isAnyComponentEmitAffected(
  semantics: FileSemantics,
  previous: FileSemantics | undefined,
): boolean {
  for (const [className, component] of semantics.components) {
    const prior = previous?.components.get(className);
    if (
      prior === undefined ||
      component.isRemotelyScoped !== prior.isRemotelyScoped ||
      !areUsedDeclarationsEqual(component.usedDirectives, prior.usedDirectives) ||
      !areUsedDeclarationsEqual(component.usedPipes, prior.usedPipes)
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Whether an NgModule in the file has to be re-emitted because its injector imports changed. ngtsc
 * re-emits an NgModule when the provider status of anything its imported standalone components
 * bring in changes (`transitiveImportsFromStandaloneComponents` in `NgModuleSymbol`), as that
 * decides which of them its injector imports. The analyzer resolves those imports, so this
 * compares the outcome rather than the inputs.
 */
function isAnyNgModuleEmitAffected(
  semantics: FileSemantics,
  previous: FileSemantics | undefined,
): boolean {
  for (const [className, injectorImports] of semantics.ngModuleInjectorImports) {
    if (previous?.ngModuleInjectorImports.get(className) !== injectorImports) {
      return true;
    }
  }
  return false;
}

/**
 * Order matters, as it may affect directive instantiation order. A dependency whose public API
 * changed counts as changed (ngtsc's `isSymbolUnaffected`).
 */
function areUsedDeclarationsEqual(
  current: readonly UsedDeclaration[],
  previous: readonly UsedDeclaration[],
): boolean {
  return (
    current.length === previous.length &&
    current.every(
      (decl, i) =>
        decl.identity === previous[i].identity &&
        decl.importPath === previous[i].importPath &&
        decl.publicApi === previous[i].publicApi,
    )
  );
}

/**
 * For each NgModule, the dependencies of the components it remotely scopes, keyed by component.
 * Mirrors `NgModuleSymbol.remotelyScopedComponents`, which records references only: an NgModule
 * names its components' dependencies but emits nothing that depends on their public API.
 */
function remoteScopesByNgModule(
  files: ReadonlyMap<string, FileSemantics>,
): Map<string, Map<string, string>> {
  const scopes = new Map<string, Map<string, string>>();
  for (const [filePath, semantics] of files) {
    for (const [className, component] of semantics.components) {
      if (!component.isRemotelyScoped || component.declaringNgModule === null) {
        continue;
      }
      let scope = scopes.get(component.declaringNgModule);
      if (scope === undefined) {
        scope = new Map();
        scopes.set(component.declaringNgModule, scope);
      }
      const references = (decls: readonly UsedDeclaration[]) =>
        decls.map((decl) => [decl.identity, decl.importPath]);
      scope.set(
        `${filePath}#${className}`,
        JSON.stringify([references(component.usedDirectives), references(component.usedPipes)]),
      );
    }
  }
  return scopes;
}

function isRemoteScopeEqual(
  current: ReadonlyMap<string, string> | undefined,
  previous: ReadonlyMap<string, string> | undefined,
): boolean {
  if (current === undefined || previous === undefined) {
    return current === previous;
  }
  if (current.size !== previous.size) {
    return false;
  }
  for (const [component, dependencies] of current) {
    if (previous.get(component) !== dependencies) {
      return false;
    }
  }
  return true;
}

/** The file declaring the NgModule a `filePath#symbolId` key refers to. */
function ngModuleFile(ngModuleKey: string): string {
  return ngModuleKey.slice(0, ngModuleKey.lastIndexOf('#'));
}
