/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Imports
import * as validateConfig from './config';
import {parseCommitMessage} from './parse';
import {validateCommitMessage, ValidateCommitMessageResult} from './validate';

type CommitMessageConfig = validateConfig.CommitMessageConfig;


// Constants
const config: {commitMessage: CommitMessageConfig} = {
  commitMessage: {
    maxLineLength: 120,
    minBodyLength: 0,
    scopes: [
      'common',
      'compiler',
      'core',
      'packaging',
      '@angular-devkit/build-angular',
    ]
  }
};
const TYPES = Object.keys(validateConfig.COMMIT_TYPES).join(', ');
const SCOPES = config.commitMessage.scopes.join(', ');
const INVALID = false;
const VALID = true;

function expectValidationResult(
    validationResult: ValidateCommitMessageResult, valid: boolean, errors: string[] = []) {
  expect(validationResult).toEqual(jasmine.objectContaining({valid, errors}));
}

// TODO(josephperrott): Clean up tests to test script rather than for
// specific commit messages we want to use.
describe('validate-commit-message.js', () => {
  beforeEach(() => {
    spyOn(validateConfig, 'getCommitMessageConfig')
        .and.returnValue(config as ReturnType<typeof validateConfig.getCommitMessageConfig>);
  });

  describe('validateMessage()', () => {
    it('should be valid', () => {
      expectValidationResult(validateCommitMessage('feat(packaging): something'), VALID);
      expectValidationResult(validateCommitMessage('fix(packaging): something'), VALID);
      expectValidationResult(validateCommitMessage('fixup! fix(packaging): something'), VALID);
      expectValidationResult(validateCommitMessage('squash! fix(packaging): something'), VALID);
      expectValidationResult(validateCommitMessage('Revert: "fix(packaging): something"'), VALID);
    });

    it('should validate max length', () => {
      const msg =
          'fix(compiler): something super mega extra giga tera long, maybe even longer and longer and longer and longer and longer and longer...';

      expectValidationResult(validateCommitMessage(msg), INVALID, [
        `The commit message header is longer than ${config.commitMessage.maxLineLength} characters`
      ]);
    });

    it('should skip max length limit for URLs', () => {
      const msg = 'fix(compiler): this is just a usual commit message title\n\n' +
          'This is a normal commit message body which does not exceed the max length\n' +
          'limit. For more details see the following super long URL:\n\n' +
          'https://github.com/angular/components/commit/e2ace018ddfad10608e0e32932c43dcfef4095d7#diff-9879d6db96fd29134fc802214163b95a';

      expectValidationResult(validateCommitMessage(msg), VALID);
    });

    it('should validate "<type>(<scope>): <subject>" format', () => {
      const msg = 'not correct format';

      expectValidationResult(
          validateCommitMessage(msg), INVALID,
          [`The commit message header does not match the expected format.`]);
    });

    it('should fail when type is invalid', () => {
      const msg = 'weird(core): something';

      expectValidationResult(
          validateCommitMessage(msg), INVALID,
          [`'weird' is not an allowed type.\n => TYPES: ${TYPES}`]);
    });

    it('should pass when scope contains NPM scope', () => {
      expectValidationResult(
          validateCommitMessage('fix(@angular-devkit/build-angular): something'), true);
    });

    it('should fail when scope is invalid', () => {
      const errorMessageFor = (scope: string, header: string) =>
          `'${scope}' is not an allowed scope.\n => SCOPES: ${SCOPES}`;

      expectValidationResult(
          validateCommitMessage('fix(Compiler): something'), INVALID,
          [errorMessageFor('Compiler', 'fix(Compiler): something')]);

      expectValidationResult(
          validateCommitMessage('feat(bah): something'), INVALID,
          [errorMessageFor('bah', 'feat(bah): something')]);

      expectValidationResult(
          validateCommitMessage('fix(webworker): something'), INVALID,
          [errorMessageFor('webworker', 'fix(webworker): something')]);

      expectValidationResult(
          validateCommitMessage('refactor(security): something'), INVALID,
          [errorMessageFor('security', 'refactor(security): something')]);

      expectValidationResult(
          validateCommitMessage('refactor(docs): something'), INVALID,
          [errorMessageFor('docs', 'refactor(docs): something')]);

      expectValidationResult(
          validateCommitMessage('feat(angular): something'), INVALID,
          [errorMessageFor('angular', 'feat(angular): something')]);
    });

    it('should allow empty scope', () => {
      expectValidationResult(validateCommitMessage('build: blablabla'), VALID);
    });

    // We do not want to allow WIP. It is OK to fail the PR build in this case to show that there is
    // work still to be done (i.e. fixing the commit message).
    it('should not allow "WIP: ..." syntax', () => {
      const msg = 'WIP: fix: something';

      expectValidationResult(
          validateCommitMessage(msg), INVALID,
          [`'WIP' is not an allowed type.\n => TYPES: ${TYPES}`]);
    });

    describe('(revert)', () => {
      it('should allow valid "revert: ..." syntaxes', () => {
        expectValidationResult(validateCommitMessage('revert: anything'), VALID);
        expectValidationResult(validateCommitMessage('Revert: "anything"'), VALID);
        expectValidationResult(validateCommitMessage('revert anything'), VALID);
        expectValidationResult(validateCommitMessage('rEvErT anything'), VALID);
      });

      it('should not allow "revert(scope): ..." syntax', () => {
        const msg = 'revert(compiler): reduce generated code payload size by 65%';

        expectValidationResult(
            validateCommitMessage(msg), INVALID,
            [`'revert' is not an allowed type.\n => TYPES: ${TYPES}`]);
      });

      // https://github.com/angular/angular/issues/23479
      it('should allow typical Angular messages generated by git', () => {
        const msg =
            'Revert "fix(compiler): Pretty print object instead of [Object object] (#22689)" (#23442)';

        expectValidationResult(validateCommitMessage(msg), VALID);
      });
    });

    describe('(squash)', () => {
      describe('without `disallowSquash`', () => {
        it('should return commits as valid', () => {
          expectValidationResult(validateCommitMessage('squash! feat(core): add feature'), VALID);
          expectValidationResult(validateCommitMessage('squash! fix: a bug'), VALID);
          expectValidationResult(validateCommitMessage('squash! fix a typo'), VALID);
        });
      });

      describe('with `disallowSquash`', () => {
        it('should fail', () => {
          expectValidationResult(
              validateCommitMessage('fix(core): something', {disallowSquash: true}), VALID);
          expectValidationResult(
              validateCommitMessage('squash! fix(core): something', {disallowSquash: true}),
              INVALID, ['The commit must be manually squashed into the target commit']);
        });
      });
    });

    describe('(fixup)', () => {
      describe('without `nonFixupCommitHeaders`', () => {
        it('should return commits as valid', () => {
          expectValidationResult(validateCommitMessage('fixup! feat(core): add feature'), VALID);
          expectValidationResult(validateCommitMessage('fixup! fix: a bug'), VALID);
          expectValidationResult(validateCommitMessage('fixup! fixup! fix: a bug'), VALID);
        });
      });

      describe('with `nonFixupCommitHeaders`', () => {
        it('should check that the fixup commit matches a non-fixup one', () => {
          const msg = 'fixup! foo';

          expectValidationResult(
              validateCommitMessage(
                  msg, {disallowSquash: false, nonFixupCommitHeaders: ['foo', 'bar', 'baz']}),
              VALID);
          expectValidationResult(
              validateCommitMessage(
                  msg, {disallowSquash: false, nonFixupCommitHeaders: ['bar', 'baz', 'foo']}),
              VALID);
          expectValidationResult(
              validateCommitMessage(
                  msg, {disallowSquash: false, nonFixupCommitHeaders: ['baz', 'foo', 'bar']}),
              VALID);

          expectValidationResult(
              validateCommitMessage(
                  msg, {disallowSquash: false, nonFixupCommitHeaders: ['qux', 'quux', 'quuux']}),
              INVALID,
              ['Unable to find match for fixup commit among prior commits: \n' +
               '      qux\n' +
               '      quux\n' +
               '      quuux']);
        });

        it('should fail if `nonFixupCommitHeaders` is empty', () => {
          expectValidationResult(
              validateCommitMessage(
                  'refactor(core): make reactive',
                  {disallowSquash: false, nonFixupCommitHeaders: []}),
              VALID);
          expectValidationResult(
              validateCommitMessage(
                  'fixup! foo', {disallowSquash: false, nonFixupCommitHeaders: []}),
              INVALID, [`Unable to find match for fixup commit among prior commits: -`]);
        });
      });
    });

    describe('minBodyLength', () => {
      const minBodyLengthConfig: {commitMessage: CommitMessageConfig} = {
        commitMessage: {
          maxLineLength: 120,
          minBodyLength: 30,
          minBodyLengthTypeExcludes: ['docs'],
          scopes: ['core']
        }
      };

      beforeEach(() => {
        (validateConfig.getCommitMessageConfig as jasmine.Spy).and.returnValue(minBodyLengthConfig);
      });

      it('should fail validation if the body is shorter than `minBodyLength`', () => {
        expectValidationResult(
            validateCommitMessage(
                'fix(core): something\n\n Explanation of the motivation behind this change'),
            VALID);
        expectValidationResult(
            validateCommitMessage('fix(core): something\n\n too short'), INVALID,
            ['The commit message body does not meet the minimum length of 30 characters']);
        expectValidationResult(validateCommitMessage('fix(core): something'), INVALID, [

          'The commit message body does not meet the minimum length of 30 characters'
        ]);
      });

      it('should pass validation even if the total non-header content is longer than `minBodyLength`, even if the body contains a `#` reference usage',
         () => {
           expectValidationResult(
               validateCommitMessage(
                   'fix(core): something\n\n Explanation of how #123 motivated this change'),
               VALID);
         });

      it('should pass validation if the body is shorter than `minBodyLength` but the commit type is in the `minBodyLengthTypeExclusions` list',
         () => {
           expectValidationResult(validateCommitMessage('docs: just fixing a typo'), VALID);
           expectValidationResult(validateCommitMessage('docs(core): just fixing a typo'), VALID);
           expectValidationResult(
               validateCommitMessage(
                   'docs(core): just fixing a typo\n\nThis was just a silly typo.'),
               VALID);
         });
    });

    describe('deprecations', () => {
      it('should allow valid deprecation notes in commit messages', () => {
        const msgWithListOfDeprecations =
            'feat(compiler): this is just a usual commit message title\n\n' +
            'This is a normal commit message body which does not exceed the max length\n' +
            'limit. For more details see the following super long URL:\n\n' +
            'DEPRECATED:\n' +
            ' * A to be removed\n' +
            ' * B to be removed';
        expectValidationResult(validateCommitMessage(msgWithListOfDeprecations), VALID);
        expect(parseCommitMessage(msgWithListOfDeprecations).deprecations.length).toBe(1);

        const msgWithSummary = 'feat(compiler): this is just a usual commit message title\n\n' +
            'This is a normal commit message body which does not exceed the max length\n' +
            'limit. For more details see the following super long URL:\n\n' +
            'DEPRECATED: All methods in X to be removed in v12.';

        expectValidationResult(validateCommitMessage(msgWithSummary), VALID);
        expect(parseCommitMessage(msgWithSummary).deprecations.length).toBe(1);

        const msgWithSummaryAndDescription =
            'feat(compiler): this is just a usual commit message title\n\n' +
            'This is a normal commit message body which does not exceed the max length\n' +
            'limit. For more details see the following super long URL:\n\n' +
            'DEPRECATED: All methods in X to be removed in v12.\n' +
            '' +
            'This is the more detailed description about the deprecation of X.';

        expectValidationResult(validateCommitMessage(msgWithSummaryAndDescription), VALID);
        expect(parseCommitMessage(msgWithSummaryAndDescription).deprecations.length).toBe(1);

        const msgWithNoDeprecation =
            'feat(compiler): this is just a usual commit message title\n\n' +
            'This is not a\n' +
            'deprecation commit.';
        expectValidationResult(validateCommitMessage(msgWithNoDeprecation), VALID);
        expect(parseCommitMessage(msgWithNoDeprecation).deprecations.length).toBe(0);
      });

      it('should fail for non-valid deprecation notes in commit messages', () => {
        const incorrectKeyword1 = 'feat(compiler): this is just a usual commit message title\n\n' +
            'This is a normal commit message body which does not exceed the max length\n' +
            'limit. For more details see the following super long URL:\n\n' +
            'DEPRECATE:\n' +
            ' * A to be removed\n' +
            ' * B to be removed';
        expectValidationResult(
            validateCommitMessage(incorrectKeyword1), INVALID,
            ['The commit message body contains an invalid deprecation note.']);

        const incorrectKeyword2 = 'feat(compiler): this is just a usual commit message title\n\n' +
            'This is a normal commit message body which does not exceed the max length\n' +
            'limit. For more details see the following super long URL:\n\n' +
            'DEPRECATES:\n' +
            ' * A to be removed\n' +
            ' * B to be removed';
        expectValidationResult(
            validateCommitMessage(incorrectKeyword2), INVALID,
            ['The commit message body contains an invalid deprecation note.']);

        const incorrectKeyword3 = 'feat(compiler): this is just a usual commit message title\n\n' +
            'This is a normal commit message body which does not exceed the max length\n' +
            'limit. For more details see the following super long URL:\n\n' +
            'DEPRECATIONS:\n' +
            ' * A to be removed\n' +
            ' * B to be removed';
        expectValidationResult(
            validateCommitMessage(incorrectKeyword3), INVALID,
            ['The commit message body contains an invalid deprecation note.']);
      });
    });

    describe('breaking change', () => {
      it('should allow valid breaking change commit descriptions', () => {
        const msgWithSummary = 'feat(compiler): this is just a usual commit message title\n\n' +
            'This is a normal commit message body which does not exceed the max length\n' +
            'limit. For more details see the following super long URL:\n\n' +
            'BREAKING CHANGE: This is a summary of a breaking change.';
        expectValidationResult(validateCommitMessage(msgWithSummary), VALID);
        expect(parseCommitMessage(msgWithSummary).breakingChanges.length).toBe(1);

        const msgWithDescriptionDoubleLineBreakSeparator =
            'feat(compiler): this is just a usual commit message title\n\n' +
            'This is a normal commit message body which does not exceed the max length\n' +
            'limit. For more details see the following super long URL:\n\n' +
            'BREAKING CHANGE:\n\n' +
            'This is a full description of the breaking change.';
        expectValidationResult(
            validateCommitMessage(msgWithDescriptionDoubleLineBreakSeparator), VALID);
        expect(
            parseCommitMessage(msgWithDescriptionDoubleLineBreakSeparator).breakingChanges.length)
            .toBe(1);

        const msgWithDescriptionSingleLineBreakSeparator =
            'feat(compiler): this is just a usual commit message title\n\n' +
            'This is a normal commit message body which does not exceed the max length\n' +
            'limit. For more details see the following super long URL:\n\n' +
            'BREAKING CHANGE:\n' +
            'This is a full description of the breaking change.';
        expectValidationResult(
            validateCommitMessage(msgWithDescriptionSingleLineBreakSeparator), VALID);
        expect(
            parseCommitMessage(msgWithDescriptionSingleLineBreakSeparator).breakingChanges.length)
            .toBe(1);

        const msgWithSummaryAndDescription =
            'feat(compiler): this is just a usual commit message title\n\n' +
            'This is a normal commit message body which does not exceed the max length\n' +
            'limit. For more details see the following super long URL:\n\n' +
            'BREAKING CHANGE: This is a summary of a breaking change.\n\n' +
            'This is a full description of the breaking change.';
        expectValidationResult(validateCommitMessage(msgWithSummaryAndDescription), VALID);
        expect(parseCommitMessage(msgWithSummaryAndDescription).breakingChanges.length).toBe(1);

        const msgWithNonBreaking = 'feat(compiler): this is just a usual commit message title\n\n' +
            'This is not a\n' +
            'breaking change commit.';
        expectValidationResult(validateCommitMessage(msgWithNonBreaking), VALID);
        expect(parseCommitMessage(msgWithNonBreaking).breakingChanges.length).toBe(0);
      });

      it('should fail for non-valid breaking change commit descriptions', () => {
        const msgWithSummary = 'feat(compiler): this is just a usual commit message title\n\n' +
            'This is a normal commit message body which does not exceed the max length\n' +
            'limit. For more details see the following super long URL:\n\n' +
            'BREAKING CHANGE This is a summary of a breaking change.';
        expectValidationResult(
            validateCommitMessage(msgWithSummary), INVALID,
            [`The commit message body contains an invalid breaking change note.`]);

        const msgWithPlural = 'feat(compiler): this is just a usual commit message title\n\n' +
            'This is a normal commit message body which does not exceed the max length\n' +
            'limit. For more details see the following super long URL:\n\n' +
            'BREAKING CHANGES: This is a summary of a breaking change.';
        expectValidationResult(
            validateCommitMessage(msgWithPlural), INVALID,
            [`The commit message body contains an invalid breaking change note.`]);

        const msgWithWithDashedKeyword =
            'feat(compiler): this is just a usual commit message title\n\n' +
            'This is a normal commit message body which does not exceed the max length\n' +
            'limit. For more details see the following super long URL:\n\n' +
            'BREAKING-CHANGE:' +
            'This is a full description of the breaking change.';
        expectValidationResult(
            validateCommitMessage(msgWithWithDashedKeyword), INVALID,
            [`The commit message body contains an invalid breaking change note.`]);

        const msgWithSummaryAndDescription =
            'feat(compiler): this is just a usual commit message title\n\n' +
            'This is a normal commit message body which does not exceed the max length\n' +
            'limit. For more details see the following super long URL:\n\n' +
            'BREAKING CHANGE\n\n' +
            'This is a full description of the breaking change.';
        expectValidationResult(
            validateCommitMessage(msgWithSummaryAndDescription), INVALID,
            [`The commit message body contains an invalid breaking change note.`]);

        const incorrectKeyword1 = 'feat(compiler): this is just a usual commit message title\n\n' +
            'This is a normal commit message body which does not exceed the max length\n' +
            'limit. For more details see the following super long URL:\n\n' +
            'BREAKING CHANGES:\n' +
            ' * A has been removed\n';
        expectValidationResult(
            validateCommitMessage(incorrectKeyword1), INVALID,
            ['The commit message body contains an invalid breaking change note.']);

        const incorrectKeyword2 = 'feat(compiler): this is just a usual commit message title\n\n' +
            'This is a normal commit message body which does not exceed the max length\n' +
            'limit. For more details see the following super long URL:\n\n' +
            'BREAKING-CHANGE:\n' +
            ' * A has been removed\n';
        expectValidationResult(
            validateCommitMessage(incorrectKeyword2), INVALID,
            ['The commit message body contains an invalid breaking change note.']);

        const incorrectKeyword3 = 'feat(compiler): this is just a usual commit message title\n\n' +
            'This is a normal commit message body which does not exceed the max length\n' +
            'limit. For more details see the following super long URL:\n\n' +
            'BREAKING-CHANGES:\n' +
            ' * A has been removed\n';
        expectValidationResult(
            validateCommitMessage(incorrectKeyword3), INVALID,
            ['The commit message body contains an invalid breaking change note.']);
      });
    });
  });
});
