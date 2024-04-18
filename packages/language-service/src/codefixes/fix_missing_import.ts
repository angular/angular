/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ASTWithName, TmplAstElement} from '@angular/compiler';
import {ErrorCode as NgCompilerErrorCode, ngErrorCode} from '@angular/compiler-cli/src/ngtsc/diagnostics/index';
import {PotentialDirective, PotentialImportMode, PotentialPipe} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import path from 'path';
import ts from 'typescript';

import {getTargetAtPosition, TargetNodeKind} from '../template_target';
import {standaloneTraitOrNgModule, updateImportsForAngularTrait, updateImportsForTypescriptFile} from '../ts_utils';
import {getDirectiveMatchesForElementTag} from '../utils';

import {CodeActionContext, CodeActionMeta, FixIdForCodeFixesAll} from './utils';

const errorCodes: number[] = [
  ngErrorCode(NgCompilerErrorCode.SCHEMA_INVALID_ELEMENT),
  ngErrorCode(NgCompilerErrorCode.MISSING_PIPE),
];

/**
 * This code action will generate a new import for an unknown selector.
 */
export const missingImportMeta: CodeActionMeta = {
  errorCodes,
  getCodeActions,
  fixIds: [FixIdForCodeFixesAll.FIX_MISSING_IMPORT],
  // TODO(dylhunn): implement "Fix All"
  getAllCodeActions: ({tsLs, scope, fixId, formatOptions, preferences, compiler, diagnostics}) => {
    return {
      changes: [],
    };
  }
};

const stringReplace = String.prototype.replace as any;
function replaceFirstStar(s: string, replacement: string): string {
  // `s.replace("*", replacement)` triggers CodeQL as they think it's a potentially incorrect string
  // escaping. See:
  // https://codeql.github.com/codeql-query-help/javascript/js-incomplete-sanitization/ But, we
  // really do want to replace only the first star. Attempt to defeat this analysis by indirectly
  // calling the method.
  return stringReplace.call(s, '*', replacement);
}

/**
 * Determines whether a path starts with a relative path component (i.e. `.` or `..`).
 */
function pathIsRelative(path: string): boolean {
  return /^\.\.?($|[\\/])/.test(path);
}

/**
 * Get the basePath of the paths in the tsconfig.
 *
 * If we end up needing to resolve relative paths from 'paths' relative to
 * the config file location, we'll need to know where that config file was.
 * Since 'paths' can be inherited from an extended config in another directory,
 * we wouldn't know which directory to use unless we store it here.
 */
function getPathsBasePath(program: ts.Program) {
  const compilerOptions = program.getCompilerOptions();
  const currentDir = program.getCurrentDirectory();
  const basePath = compilerOptions.baseUrl ??
      (compilerOptions as any)
          /**
            https://github.com/microsoft/TypeScript/blob/3c637400da679883f720894e16c5625b9668f932/src/compiler/types.ts#L7127
          */
          .pathsBasePath ??
      currentDir;

  return basePath;
}

/**
 * https://github.com/microsoft/TypeScript/blob/3c637400da679883f720894e16c5625b9668f932/src/compiler/moduleSpecifiers.ts#L773
 *
 * This algorithm is copied from the typescript and only picks the part of it. The assumption here
 * is that the component/directive imported is located in the ts files.
 *
 * For example:
 *
 * `src/bar.component.ts <- [src/bar.component, src/bar.component.ts] <-
 * "@app/*": ["./src/*.ts"] <- (none)||@app/bar.component`
 *
 * The module specifier is always the file that declares the component, the compiler doesn't know
 * the file that re-exported the component now, so the index file is not considered in the
 * algorithm.
 *
 * For example:
 *
 * For the path `"@app/bar": ["./src/index.ts"]`. If the `index.ts` re-export the
 * `BarComponent`, the module specifier should be `./src/bar.component.ts` and `./src/index.ts`.
 *
 */
function getModuleNameFromPaths(
    relativeToBaseUrl: string, paths: ts.MapLike<readonly string[]>): string|undefined {
  for (const key in paths) {
    for (const patternText of paths[key]) {
      const pattern = path.posix.normalize(patternText);
      const indexOfStar = pattern.indexOf('*');

      const candidates = [
        relativeToBaseUrl.slice(
            0, relativeToBaseUrl.length - path.posix.extname(relativeToBaseUrl).length),
        relativeToBaseUrl
      ];

      if (indexOfStar !== -1) {
        const prefix = pattern.substring(0, indexOfStar);
        const suffix = pattern.substring(indexOfStar + 1);
        for (const value of candidates) {
          if (value.length >= prefix.length + suffix.length && value.startsWith(prefix) &&
              value.endsWith(suffix)) {
            const matchedStar = value.substring(prefix.length, value.length - suffix.length);
            if (!pathIsRelative(matchedStar)) {
              return replaceFirstStar(key, matchedStar);
            }
          }
        }
      } else if (candidates.some(candidate => candidate === pattern)) {
        return key;
      }
    }
  }
  return undefined;
}

function getCodeActions(
    {templateInfo, start, compiler, formatOptions, preferences, errorCode, tsLs}:
        CodeActionContext) {
  let codeActions: ts.CodeFixAction[] = [];
  const checker = compiler.getTemplateTypeChecker();
  const tsChecker = compiler.programDriver.getProgram().getTypeChecker();

  const target = getTargetAtPosition(templateInfo.template, start);
  if (target === null) {
    return [];
  }

  let matches: Set<PotentialDirective>|Set<PotentialPipe>;
  if (target.context.kind === TargetNodeKind.ElementInTagContext &&
      target.context.node instanceof TmplAstElement) {
    const allPossibleDirectives = checker.getPotentialTemplateDirectives(templateInfo.component);
    matches = getDirectiveMatchesForElementTag(target.context.node, allPossibleDirectives);
  } else if (
      target.context.kind === TargetNodeKind.RawExpression &&
      target.context.node instanceof ASTWithName) {
    const name = (target.context.node as any).name;
    const allPossiblePipes = checker.getPotentialPipes(templateInfo.component);
    matches = new Set(allPossiblePipes.filter(p => p.name === name));
  } else {
    return [];
  }

  // Find all possible importable directives with a matching selector.
  const importOn = standaloneTraitOrNgModule(checker, templateInfo.component);
  if (importOn === null) {
    return [];
  }
  for (const currMatch of matches.values()) {
    const currMatchSymbol = currMatch.tsSymbol.valueDeclaration!;
    const potentialImports =
        checker.getPotentialImportsFor(currMatch.ref, importOn, PotentialImportMode.Normal);

    const compilerOptions = compiler.programDriver.getProgram().getCompilerOptions();
    const basePath = getPathsBasePath(compiler.programDriver.getProgram());
    const relativePath = path.posix.relative(basePath, currMatchSymbol.getSourceFile().fileName);
    const moduleNameFromPath = getModuleNameFromPaths(relativePath, compilerOptions.paths ?? {});

    for (const potentialImport of potentialImports) {
      const fileImportChanges: ts.TextChange[] = [];
      let importName: string;
      let forwardRefName: string|null = null;

      if (potentialImport.moduleSpecifier) {
        const [importChanges, generatedImportName] = updateImportsForTypescriptFile(
            tsChecker, importOn.getSourceFile(), potentialImport.symbolName,
            moduleNameFromPath ?? potentialImport.moduleSpecifier, currMatchSymbol.getSourceFile());
        importName = generatedImportName;
        fileImportChanges.push(...importChanges);
      } else {
        if (potentialImport.isForwardReference) {
          // Note that we pass the `importOn` file twice since we know that the potential import
          // is within the same file, because it doesn't have a `moduleSpecifier`.
          const [forwardRefImports, generatedForwardRefName] = updateImportsForTypescriptFile(
              tsChecker, importOn.getSourceFile(), 'forwardRef', '@angular/core',
              importOn.getSourceFile());
          fileImportChanges.push(...forwardRefImports);
          forwardRefName = generatedForwardRefName;
        }
        importName = potentialImport.symbolName;
      }

      // Always update the trait import, although the TS import might already be present.
      const traitImportChanges =
          updateImportsForAngularTrait(checker, importOn, importName, forwardRefName);
      if (traitImportChanges.length === 0) continue;

      let description = `Import ${importName}`;
      if (potentialImport.moduleSpecifier !== undefined) {
        description += ` from '${moduleNameFromPath ?? potentialImport.moduleSpecifier}' on ${
            importOn.name!.text}`;
      }
      codeActions.push({
        fixName: FixIdForCodeFixesAll.FIX_MISSING_IMPORT,
        description,
        changes: [{
          fileName: importOn.getSourceFile().fileName,
          textChanges: [...fileImportChanges, ...traitImportChanges],
        }]
      });
    }
  }

  return codeActions;
}
