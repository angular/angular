import ts from 'typescript';
import minimatch from 'minimatch';

import {existsSync} from 'fs';
import {dirname, join, normalize, relative, resolve} from 'path';
import * as Lint from 'tslint';

const BUILD_BAZEL_FILE = 'BUILD.bazel';

/**
 * Rule that enforces that imports or exports with relative paths do not resolve to
 * source files outside of the current Bazel package. This enforcement is necessary
 * because relative cross entry-point imports/exports can cause code being inlined
 * unintentionally and could break module resolution since the folder structure
 * changes in the Angular Package release output.
 */
export class Rule extends Lint.Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithFunction(sourceFile, checkSourceFile, this.getOptions().ruleArguments);
  }
}

/**
 * Rule walker function that checks the source file for imports/exports
 * with relative cross entry-point references.
 */
function checkSourceFile(ctx: Lint.WalkContext<string[]>) {
  const filePath = ctx.sourceFile.fileName;
  const relativeFilePath = relative(process.cwd(), filePath);

  if (!ctx.options.every(o => minimatch(relativeFilePath, o))) {
    return;
  }

  (function visitNode(node: ts.Node) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      if (
        !node.moduleSpecifier ||
        !ts.isStringLiteralLike(node.moduleSpecifier) ||
        !node.moduleSpecifier.text.startsWith('.')
      ) {
        return;
      }

      const modulePath = node.moduleSpecifier.text;
      const basePath = dirname(filePath);
      const currentPackage = findClosestBazelPackage(basePath);
      const resolvedPackage = findClosestBazelPackage(resolve(basePath, modulePath));

      if (
        currentPackage &&
        resolvedPackage &&
        normalize(currentPackage) !== normalize(resolvedPackage)
      ) {
        const humanizedType = ts.isImportDeclaration(node) ? 'Import' : 'Export';
        ctx.addFailureAtNode(
          node,
          `${humanizedType} resolves to a different Bazel build package through a relative ` +
            `path. This is not allowed and can be fixed by using the actual module import.`,
        );
      }
      return;
    }
    ts.forEachChild(node, visitNode);
  })(ctx.sourceFile);
}

/** Finds the closest Bazel build package for the given path. */
function findClosestBazelPackage(startPath: string): string | null {
  let currentPath = startPath;
  while (!hasBuildFile(currentPath)) {
    const parentPath = dirname(currentPath);
    if (parentPath === currentPath) {
      return null;
    }
    currentPath = parentPath;
  }
  return currentPath;
}

/** Checks whether the given directory has a Bazel build file. */
function hasBuildFile(dirPath: string): boolean {
  return existsSync(join(dirPath, BUILD_BAZEL_FILE));
}
