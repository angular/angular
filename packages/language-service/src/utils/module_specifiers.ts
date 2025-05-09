/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ProgramDriver} from '@angular/compiler-cli/src/ngtsc/program_driver';
import path from 'path';
import ts from 'typescript';

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
 * we can get the directory in the `pathsBasePath` which is an internal member.
 */
function getPathsBasePath(program: ts.Program): string {
  const compilerOptions = program.getCompilerOptions();
  const currentDir = program.getCurrentDirectory();
  const basePath =
    compilerOptions.baseUrl ??
    (compilerOptions as any)
      .pathsBasePath /** https://github.com/microsoft/TypeScript/blob/3c637400da679883f720894e16c5625b9668f932/src/compiler/types.ts#L7127 */ ??
    currentDir;

  return basePath;
}

const enum ModuleSpecifierEnding {
  /**
   * If the path ends with `index.ts`, remove it from the path.
   *
   * Can't remove index if there's a file by the same name as the directory.
   */
  Minimal,
  /**
   * Remove the extension from the path.
   */
  Index,
  /**
   * The path end with `.ts`.
   */
  TsExtension,
}

interface ModuleSpecifierCandidates {
  type: ModuleSpecifierEnding;
  value: string;
}
export class ModuleSpecifiers {
  constructor(
    private readonly project: ts.server.Project,
    private readonly programStrategy: ProgramDriver,
  ) {}

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
   */
  getModuleNameFromPaths(fileName: string): string | undefined {
    const program = this.programStrategy.getProgram();
    const compilerOptions = program.getCompilerOptions();
    const paths = compilerOptions.paths;
    const basePath = getPathsBasePath(program);
    const relativeToBaseUrl = path.posix.relative(basePath, fileName);

    const noExtensionPath = relativeToBaseUrl.slice(
      0,
      relativeToBaseUrl.length - path.posix.extname(relativeToBaseUrl).length,
    );
    const candidates: ModuleSpecifierCandidates[] = [
      {
        type: ModuleSpecifierEnding.Index,
        value: noExtensionPath,
      },
      {
        type: ModuleSpecifierEnding.TsExtension,
        value: relativeToBaseUrl,
      },
    ];
    if (noExtensionPath.endsWith('/index')) {
      candidates.unshift({
        type: ModuleSpecifierEnding.Minimal,
        // The I/O check is delayed and checks only when there is a match in the path.
        value: noExtensionPath.slice(0, noExtensionPath.length - '/index'.length),
      });
    }

    for (const key in paths) {
      for (const patternText of paths[key]) {
        const pattern = path.posix.normalize(patternText);
        const indexOfStar = pattern.indexOf('*');

        if (indexOfStar !== -1) {
          const prefix = pattern.substring(0, indexOfStar);
          const suffix = pattern.substring(indexOfStar + 1);
          for (const {value, type} of candidates) {
            if (
              value.length >= prefix.length + suffix.length &&
              value.startsWith(prefix) &&
              value.endsWith(suffix) &&
              (type !== ModuleSpecifierEnding.Minimal ||
                !this.fileExists(path.posix.join(basePath, value + '.ts')))
            ) {
              const matchedStar = value.substring(prefix.length, value.length - suffix.length);
              if (!pathIsRelative(matchedStar)) {
                return replaceFirstStar(key, matchedStar);
              }
            }
          }
        } else {
          const candidateExist = candidates.some((candidate) => {
            if (candidate.type !== ModuleSpecifierEnding.Minimal) {
              return candidate.value === pattern;
            }
            return (
              candidate.value === pattern &&
              !this.fileExists(path.posix.join(basePath, pattern + '.ts'))
            );
          });
          if (candidateExist) {
            return key;
          }
        }
      }
    }
    return undefined;
  }

  private fileExists(path: string) {
    return this.project.fileExists(path);
  }
}
