import * as ts from 'typescript';
import * as Lint from 'tslint';
import * as utils from 'tsutils';
import * as path from 'path';

/**
 * Rule ensuring that deletion targets have not expired.
 * The current version is taken from the `package.json`.
 */
export class Rule extends Lint.Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    // Split it on the dash to ignore `-beta.x` suffixes.
    const packageVersion = require(path.join(process.cwd(), 'package.json')).version.split('-')[0];

    return this.applyWithFunction(sourceFile, (ctx: Lint.WalkContext<any>) => {
      utils.forEachComment(ctx.sourceFile, (file, {pos, end}) => {
        const commentText = file.substring(pos, end);
        const hasDeletionTarget = commentText.indexOf('@deletion-target') > -1;

        if (!hasDeletionTarget && commentText.indexOf('@deprecated') > -1) {
          ctx.addFailure(pos, end, '@deprecated marker has to have a @deletion-target.');
        } if (hasDeletionTarget) {
          const version = commentText.match(/\d+\.\d+\.\d+/);

          if (!version) {
            ctx.addFailure(pos, end, '@deletion-target must have a version.');
          } else if (this._hasExpired(packageVersion, version[0])) {
            ctx.addFailure(pos, end, `Deletion target at ${version[0]} is due to be deleted. ` +
                                     `Current version is ${packageVersion}.`);
          }
        }
      });
    });
  }

  /**
   * Checks whether a version has expired, based on the current version.
   * @param currentVersion Current version of the package.
   * @param deletionTarget Version that is being checked.
   */
  private _hasExpired(currentVersion: string, deletionTarget: string) {
    if (currentVersion === deletionTarget) {
      return true;
    }

    const current = this._parseVersion(currentVersion);
    const target = this._parseVersion(deletionTarget);

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
