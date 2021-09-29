/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AotCompiler, CompileDirectiveMetadata, CompileMetadataResolver, CompileNgModuleMetadata, CompileStylesheetMetadata, ElementAst, EmbeddedTemplateAst, NgAnalyzedModules, QueryMatch, StaticSymbol, TemplateAst} from '@angular/compiler';
import {createProgram, Diagnostic, readConfiguration} from '@angular/compiler-cli';
import {resolve} from 'path';
import * as ts from 'typescript';

import {ClassMetadataMap} from '../../angular/ng_query_visitor';
import {NgQueryDefinition, QueryTiming, QueryType} from '../../angular/query-definition';
import {TimingResult, TimingStrategy} from '../timing-strategy';

const QUERY_NOT_DECLARED_IN_COMPONENT_MESSAGE = 'Timing could not be determined. This happens ' +
    'if the query is not declared in any component.';

export class QueryTemplateStrategy implements TimingStrategy {
  private compiler: AotCompiler|null = null;
  private metadataResolver: CompileMetadataResolver|null = null;
  private analyzedQueries = new Map<string, QueryTiming>();

  constructor(
      private projectPath: string, private classMetadata: ClassMetadataMap,
      private host: ts.CompilerHost) {}

  /**
   * Sets up the template strategy by creating the AngularCompilerProgram. Returns false if
   * the AOT compiler program could not be created due to failure diagnostics.
   */
  setup() {
    const {rootNames, options} = readConfiguration(this.projectPath);

    // https://github.com/angular/angular/commit/ec4381dd401f03bded652665b047b6b90f2b425f made Ivy
    // the default. This breaks the assumption that "createProgram" from compiler-cli returns the
    // NGC program. In order to ensure that the migration runs properly, we set "enableIvy" to
    // false.
    options.enableIvy = false;

    const aotProgram = createProgram({rootNames, options, host: this.host});

    // The "AngularCompilerProgram" does not expose the "AotCompiler" instance, nor does it
    // expose the logic that is necessary to analyze the determined modules. We work around
    // this by just accessing the necessary private properties using the bracket notation.
    this.compiler = (aotProgram as any)['compiler'];
    this.metadataResolver = this.compiler!['_metadataResolver'];

    // Modify the "DirectiveNormalizer" to not normalize any referenced external stylesheets.
    // This is necessary because in CLI projects preprocessor files are commonly referenced
    // and we don't want to parse them in order to extract relative style references. This
    // breaks the analysis of the project because we instantiate a standalone AOT compiler
    // program which does not contain the custom logic by the Angular CLI Webpack compiler plugin.
    const directiveNormalizer = this.metadataResolver!['_directiveNormalizer'];
    directiveNormalizer['_normalizeStylesheet'] = function(metadata: CompileStylesheetMetadata) {
      return new CompileStylesheetMetadata(
          {styles: metadata.styles, styleUrls: [], moduleUrl: metadata.moduleUrl!});
    };

    // Retrieves the analyzed modules of the current program. This data can be
    // used to determine the timing for registered queries.
    const analyzedModules = (aotProgram as any)['analyzedModules'] as NgAnalyzedModules;

    const ngStructuralDiagnostics = aotProgram.getNgStructuralDiagnostics();
    if (ngStructuralDiagnostics.length) {
      throw this._createDiagnosticsError(ngStructuralDiagnostics);
    }

    analyzedModules.files.forEach(file => {
      file.directives.forEach(directive => this._analyzeDirective(directive, analyzedModules));
    });
  }

  /** Analyzes a given directive by determining the timing of all matched view queries. */
  private _analyzeDirective(symbol: StaticSymbol, analyzedModules: NgAnalyzedModules) {
    const metadata = this.metadataResolver!.getDirectiveMetadata(symbol);
    const ngModule = analyzedModules.ngModuleByPipeOrDirective.get(symbol);

    if (!metadata.isComponent || !ngModule) {
      return;
    }

    const parsedTemplate = this._parseTemplate(metadata, ngModule);
    const queryTimingMap = findStaticQueryIds(parsedTemplate);
    const {staticQueryIds} = staticViewQueryIds(queryTimingMap);

    metadata.viewQueries.forEach((query, index) => {
      // Query ids are computed by adding "one" to the index. This is done within
      // the "view_compiler.ts" in order to support using a bloom filter for queries.
      const queryId = index + 1;
      const queryKey =
          this._getViewQueryUniqueKey(symbol.filePath, symbol.name, query.propertyName);
      this.analyzedQueries.set(
          queryKey, staticQueryIds.has(queryId) ? QueryTiming.STATIC : QueryTiming.DYNAMIC);
    });
  }

  /** Detects the timing of the query definition. */
  detectTiming(query: NgQueryDefinition): TimingResult {
    if (query.type === QueryType.ContentChild) {
      return {timing: null, message: 'Content queries cannot be migrated automatically.'};
    } else if (!query.name) {
      // In case the query property name is not statically analyzable, we mark this
      // query as unresolved. NGC currently skips these view queries as well.
      return {timing: null, message: 'Query is not statically analyzable.'};
    }

    const propertyName = query.name;
    const classMetadata = this.classMetadata.get(query.container);

    // In case there is no class metadata or there are no derived classes that
    // could access the current query, we just look for the query analysis of
    // the class that declares the query. e.g. only the template of the class
    // that declares the view query affects the query timing.
    if (!classMetadata || !classMetadata.derivedClasses.length) {
      const timing = this._getQueryTimingFromClass(query.container, propertyName);

      if (timing === null) {
        return {timing: null, message: QUERY_NOT_DECLARED_IN_COMPONENT_MESSAGE};
      }

      return {timing};
    }

    let resolvedTiming: QueryTiming|null = null;
    let timingMismatch = false;

    // In case there are multiple components that use the same query (e.g. through inheritance),
    // we need to check if all components use the query with the same timing. If that is not
    // the case, the query timing is ambiguous and the developer needs to fix the query manually.
    [query.container, ...classMetadata.derivedClasses].forEach(classDecl => {
      const classTiming = this._getQueryTimingFromClass(classDecl, propertyName);

      if (classTiming === null) {
        return;
      }

      // In case there is no resolved timing yet, save the new timing. Timings from other
      // components that use the query with a different timing, cause the timing to be
      // mismatched. In that case we can't detect a working timing for all components.
      if (resolvedTiming === null) {
        resolvedTiming = classTiming;
      } else if (resolvedTiming !== classTiming) {
        timingMismatch = true;
      }
    });

    if (resolvedTiming === null) {
      return {timing: QueryTiming.DYNAMIC, message: QUERY_NOT_DECLARED_IN_COMPONENT_MESSAGE};
    } else if (timingMismatch) {
      return {timing: null, message: 'Multiple components use the query with different timings.'};
    }
    return {timing: resolvedTiming};
  }

  /**
   * Gets the timing that has been resolved for a given query when it's used within the
   * specified class declaration. e.g. queries from an inherited class can be used.
   */
  private _getQueryTimingFromClass(classDecl: ts.ClassDeclaration, queryName: string): QueryTiming
      |null {
    if (!classDecl.name) {
      return null;
    }
    const filePath = classDecl.getSourceFile().fileName;
    const queryKey = this._getViewQueryUniqueKey(filePath, classDecl.name.text, queryName);

    if (this.analyzedQueries.has(queryKey)) {
      return this.analyzedQueries.get(queryKey)!;
    }
    return null;
  }

  private _parseTemplate(component: CompileDirectiveMetadata, ngModule: CompileNgModuleMetadata):
      TemplateAst[] {
    return this
        .compiler!['_parseTemplate'](component, ngModule, ngModule.transitiveModule.directives)
        .template;
  }

  private _createDiagnosticsError(diagnostics: ReadonlyArray<Diagnostic>) {
    return new Error(ts.formatDiagnostics(diagnostics as ts.Diagnostic[], this.host));
  }

  private _getViewQueryUniqueKey(filePath: string, className: string, propName: string) {
    return `${resolve(filePath)}#${className}-${propName}`;
  }
}

interface StaticAndDynamicQueryIds {
  staticQueryIds: Set<number>;
  dynamicQueryIds: Set<number>;
}

/** Figures out which queries are static and which ones are dynamic. */
function findStaticQueryIds(
    nodes: TemplateAst[], result = new Map<TemplateAst, StaticAndDynamicQueryIds>()):
    Map<TemplateAst, StaticAndDynamicQueryIds> {
  nodes.forEach((node) => {
    const staticQueryIds = new Set<number>();
    const dynamicQueryIds = new Set<number>();
    let queryMatches: QueryMatch[] = undefined!;
    if (node instanceof ElementAst) {
      findStaticQueryIds(node.children, result);
      node.children.forEach((child) => {
        const childData = result.get(child)!;
        childData.staticQueryIds.forEach(queryId => staticQueryIds.add(queryId));
        childData.dynamicQueryIds.forEach(queryId => dynamicQueryIds.add(queryId));
      });
      queryMatches = node.queryMatches;
    } else if (node instanceof EmbeddedTemplateAst) {
      findStaticQueryIds(node.children, result);
      node.children.forEach((child) => {
        const childData = result.get(child)!;
        childData.staticQueryIds.forEach(queryId => dynamicQueryIds.add(queryId));
        childData.dynamicQueryIds.forEach(queryId => dynamicQueryIds.add(queryId));
      });
      queryMatches = node.queryMatches;
    }
    if (queryMatches) {
      queryMatches.forEach((match) => staticQueryIds.add(match.queryId));
    }
    dynamicQueryIds.forEach(queryId => staticQueryIds.delete(queryId));
    result.set(node, {staticQueryIds, dynamicQueryIds});
  });
  return result;
}

/** Splits queries into static and dynamic. */
function staticViewQueryIds(nodeStaticQueryIds: Map<TemplateAst, StaticAndDynamicQueryIds>):
    StaticAndDynamicQueryIds {
  const staticQueryIds = new Set<number>();
  const dynamicQueryIds = new Set<number>();
  Array.from(nodeStaticQueryIds.values()).forEach((entry) => {
    entry.staticQueryIds.forEach(queryId => staticQueryIds.add(queryId));
    entry.dynamicQueryIds.forEach(queryId => dynamicQueryIds.add(queryId));
  });
  dynamicQueryIds.forEach(queryId => staticQueryIds.delete(queryId));
  return {staticQueryIds, dynamicQueryIds};
}
