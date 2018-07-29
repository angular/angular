import * as ts from 'typescript';
import * as Lint from 'tslint';
import * as utils from 'tsutils';
import * as path from 'path';

/** Doc tag that can be used to indicate a breaking change. */
const BREAKING_CHANGE = '@breaking-change';

/** Name of the old doc tag that was being used to indicate a breaking change. */
const DELETION_TARGET = '@deletion-target';

/**
 * Rule ensuring that breaking changes have not expired.
 * The current version is taken from the `package.json`.
 */
export class Rule extends Lint.Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    // Split it on the dash to ignore `-beta.x` suffixes.
    const packageVersion = require(path.join(process.cwd(), 'package.json')).version.split('-')[0];

    return this.applyWithFunction(sourceFile, (ctx: Lint.WalkContext<any>) => {
      utils.forEachComment(ctx.sourceFile, (file, {pos, end}) => {
        const commentText = file.substring(pos, end);

        // TODO(crisbeto): remove this check once most of the pending
        // PRs start using `breaking-change`.
        if (commentText.indexOf(DELETION_TARGET) > -1) {
          ctx.addFailure(pos, end, `${DELETION_TARGET} has been replaced with ${BREAKING_CHANGE}.`);
          return;
        }

        const hasBreakingChange = commentText.indexOf(BREAKING_CHANGE) > -1;

        if (!hasBreakingChange && commentText.indexOf('@deprecated') > -1) {
          ctx.addFailure(pos, end, `@deprecated marker has to have a ${BREAKING_CHANGE}.`);
        } if (hasBreakingChange) {
          const version = commentText.match(/\d+\.\d+\.\d+/);

          if (!version) {
            ctx.addFailure(pos, end, `${BREAKING_CHANGE} must have a version.`);
          } else if (this._hasExpired(packageVersion, version[0])) {
            ctx.addFailure(pos, end, `Breaking change at ${version[0]} is due to be deleted. ` +
                                     `Current version is ${packageVersion}.`);
          }
        }
      });
    });
  }

  /**
   * Checks whether a version has expired, based on the current version.
   * @param currentVersion Current version of the package.
   * @param breakingChange Version that is being checked.
   */
  private _hasExpired(currentVersion: string, breakingChange: string) {
    if (currentVersion === breakingChange) {
      return true;
    }

    const current = this._parseVersion(currentVersion);
    const target = this._parseVersion(breakingChange);

    return target.major < current.major ||
          (target.major === current.major && target.minor < current.minor) ||
          (
            target.major === current.major &&
            target.minor === current.minor &&
            target.patch < current.patch
          );
  }

  /** Converts a version string into an object. */
  private _parseVersion(version: string) {
    const [major = 0, minor = 0, patch = 0] = version.split('.').map(segment => parseInt(segment));
    return {major, minor, patch};
  }
}
