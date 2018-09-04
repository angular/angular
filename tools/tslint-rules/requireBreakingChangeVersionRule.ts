import * as ts from 'typescript';
import * as Lint from 'tslint';
import * as utils from 'tsutils';

/** Doc tag that can be used to indicate a breaking change. */
const BREAKING_CHANGE = '@breaking-change';

/** Name of the old doc tag that was being used to indicate a breaking change. */
const DELETION_TARGET = '@deletion-target';

/**
 * Rule that ensures that comments, indicating a deprecation
 * or a breaking change, have a valid version.
 */
export class Rule extends Lint.Rules.AbstractRule {
  apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
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
        } if (hasBreakingChange && !/\d+\.\d+\.\d+/.test(commentText)) {
          ctx.addFailure(pos, end, `${BREAKING_CHANGE} must have a version.`);
        }
      });
    });
  }
}
