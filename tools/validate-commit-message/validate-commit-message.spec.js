/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Imports
const validateMessage = require('./validate-commit-message');

// Constants
const TYPES = validateMessage.config.types.join(', ');
const SCOPES = validateMessage.config.scopes.join(', ');

const INVALID = false;
const VALID = true;


describe('validate-commit-message.js', () => {
  let errors = [];
  let logs = [];

  // Helpers
  const stripColor = msg => msg.replace(/\x1B\[\d+m/g, '');

  beforeEach(() => {
    errors = [];
    logs = [];

    spyOn(console, 'error').and.callFake(msg => errors.push(stripColor(msg)));
    spyOn(console, 'log').and.callFake(msg => logs.push(stripColor(msg)));
  });

  describe('validateMessage()', () => {

    it('should be valid', () => {
      expect(validateMessage('fix(core): something')).toBe(VALID);
      expect(validateMessage('feat(common): something')).toBe(VALID);
      expect(validateMessage('docs(compiler): something')).toBe(VALID);
      expect(validateMessage('style(http): something')).toBe(VALID);
      expect(validateMessage('refactor(platform-webworker): something')).toBe(VALID);
      expect(validateMessage('test(language-service): something')).toBe(VALID);
      expect(validateMessage('test(packaging): something')).toBe(VALID);
      expect(validateMessage('release: something')).toBe(VALID);
      expect(validateMessage('release(packaging): something')).toBe(VALID);
      expect(validateMessage('release(packaging): something')).toBe(VALID);
      expect(validateMessage('fixup! release(packaging): something')).toBe(VALID);
      expect(validateMessage('squash! release(packaging): something')).toBe(VALID);
      expect(validateMessage('Revert: "release(packaging): something"')).toBe(VALID);
      expect(validateMessage('Revert "release(packaging): something"')).toBe(VALID);
      expect(errors).toEqual([]);
    });

    it('should validate max length', () => {
      var msg =
          'fix(compiler): something super mega extra giga tera long, maybe even longer and longer and longer and longer and longer and longer...';

      expect(validateMessage(msg)).toBe(INVALID);
      expect(errors).toEqual([
        `INVALID COMMIT MSG: ${msg}\n => ERROR: The commit message header is longer than 120 characters`
      ]);
    });

    it('should validate "<type>(<scope>): <subject>" format', () => {
      const msg = 'not correct format';

      expect(validateMessage(msg)).toBe(INVALID);
      expect(errors).toEqual([
        `INVALID COMMIT MSG: ${msg}\n => ERROR: The commit message header does not match the format of '<type>(<scope>): <subject>' or 'Revert: "<type>(<scope>): <subject>"'`,
      ]);
    });

    it('should fail when type is invalid', () => {
      const msg = 'weird(common): something';

      expect(validateMessage(msg)).toBe(INVALID);
      expect(errors).toEqual([
        `INVALID COMMIT MSG: ${msg}\n => ERROR: 'weird' is not an allowed type.\n => TYPES: ${TYPES}`,
      ]);
    });

    it('should fail when scope is invalid', () => {
      const errorMessageFor = (scope, header) =>
          `INVALID COMMIT MSG: ${header}\n => ERROR: '${scope}' is not an allowed scope.\n => SCOPES: ${SCOPES}`;

      expect(validateMessage('fix(Compiler): something')).toBe(INVALID);
      expect(validateMessage('feat(bah): something')).toBe(INVALID);
      expect(validateMessage('style(webworker): something')).toBe(INVALID);
      expect(validateMessage('refactor(security): something')).toBe(INVALID);
      expect(validateMessage('refactor(docs): something')).toBe(INVALID);
      expect(validateMessage('release(angular): something')).toBe(INVALID);
      expect(errors).toEqual([
        errorMessageFor('Compiler', 'fix(Compiler): something'),
        errorMessageFor('bah', 'feat(bah): something'),
        errorMessageFor('webworker', 'style(webworker): something'),
        errorMessageFor('security', 'refactor(security): something'),
        errorMessageFor('docs', 'refactor(docs): something'),
        errorMessageFor('angular', 'release(angular): something'),
      ]);
    });

    it('should allow empty scope', () => {
      expect(validateMessage('fix: blablabla')).toBe(VALID);
      expect(errors).toEqual([]);
    });

    // We do not want to allow WIP. It is OK to fail the PR build in this case to show that there is
    // work still to be done (i.e. fixing the commit message).
    it('should not allow "WIP: ..." syntax', () => {
      const msg = 'WIP: fix: something';

      expect(validateMessage(msg)).toBe(INVALID);
      expect(errors).toEqual([
        `INVALID COMMIT MSG: ${msg}\n => ERROR: 'WIP' is not an allowed type.\n => TYPES: ${TYPES}`,
      ]);
    });

    describe('(revert)', () => {

      it('should allow valid "revert: ..." syntaxes', () => {
        expect(validateMessage('revert: anything')).toBe(VALID);
        expect(validateMessage('Revert: "anything"')).toBe(VALID);
        expect(validateMessage('revert anything')).toBe(VALID);
        expect(validateMessage('rEvErT anything')).toBe(VALID);
        expect(errors).toEqual([]);
      });

      it('should not allow "revert(scope): ..." syntax', () => {
        const msg = 'revert(compiler): reduce generated code payload size by 65%';

        expect(validateMessage(msg)).toBe(INVALID);
        expect(errors).toEqual([
          `INVALID COMMIT MSG: ${msg}\n => ERROR: 'revert' is not an allowed type.\n => TYPES: ${TYPES}`,
        ]);
      });

      // https://github.com/angular/angular/issues/23479
      it('should allow typical Angular messages generated by git', () => {
        const msg =
            'Revert "fix(compiler): Pretty print object instead of [Object object] (#22689)" (#23442)';

        expect(validateMessage(msg)).toBe(VALID);
        expect(errors).toEqual([]);
      });
    });

    describe('(squash)', () => {

      it('should strip the `squash! ` prefix and validate the rest', () => {
        const errorMessageFor = header =>
            `INVALID COMMIT MSG: ${header}\n => ERROR: The commit message header does not match the format of ` +
            '\'<type>(<scope>): <subject>\' or \'Revert: "<type>(<scope>): <subject>"\'';

        // Valid messages.
        expect(validateMessage('squash! feat(core): add feature')).toBe(VALID);
        expect(validateMessage('squash! fix: a bug', false)).toBe(VALID);

        // Invalid messages.
        expect(validateMessage('squash! fix a typo', false)).toBe(INVALID);
        expect(validateMessage('squash! squash! fix: a bug')).toBe(INVALID);
        expect(errors).toEqual([
          errorMessageFor('squash! fix a typo'),
          errorMessageFor('squash! squash! fix: a bug'),
        ]);
      });

      describe('with `disallowSquash`', () => {

        it('should fail', () => {
          expect(validateMessage('fix: something', true)).toBe(VALID);
          expect(validateMessage('squash! fix: something', true)).toBe(INVALID);
          expect(errors).toEqual([
            'INVALID COMMIT MSG: squash! fix: something\n' +
                ' => ERROR: The commit must be manually squashed into the target commit',
          ]);
        });
      });
    });

    describe('(fixup)', () => {

      describe('without `nonFixupCommitHeaders`', () => {

        it('should strip the `fixup! ` prefix and validate the rest', () => {
          const errorMessageFor = header =>
              `INVALID COMMIT MSG: ${header}\n => ERROR: The commit message header does not match the format of ` +
              '\'<type>(<scope>): <subject>\' or \'Revert: "<type>(<scope>): <subject>"\'';

          // Valid messages.
          expect(validateMessage('fixup! feat(core): add feature')).toBe(VALID);
          expect(validateMessage('fixup! fix: a bug')).toBe(VALID);

          // Invalid messages.
          expect(validateMessage('fixup! fix a typo')).toBe(INVALID);
          expect(validateMessage('fixup! fixup! fix: a bug')).toBe(INVALID);
          expect(errors).toEqual([
            errorMessageFor('fixup! fix a typo'),
            errorMessageFor('fixup! fixup! fix: a bug'),
          ]);
        });
      });

      describe('with `nonFixupCommitHeaders`', () => {

        it('should check that the fixup commit matches a non-fixup one', () => {
          const msg = 'fixup! foo';

          expect(validateMessage(msg, false, ['foo', 'bar', 'baz'])).toBe(VALID);
          expect(validateMessage(msg, false, ['bar', 'baz', 'foo'])).toBe(VALID);
          expect(validateMessage(msg, false, ['baz', 'foo', 'bar'])).toBe(VALID);

          expect(validateMessage(msg, false, ['qux', 'quux', 'quuux'])).toBe(INVALID);
          expect(errors).toEqual([
            `INVALID COMMIT MSG: ${msg}\n` +
                ' => ERROR: Unable to find match for fixup commit among prior commits: \n' +
                '      qux\n' +
                '      quux\n' +
                '      quuux',
          ]);
        });

        it('should fail if `nonFixupCommitHeaders` is empty', () => {
          expect(validateMessage('refactor(router): make reactive', false, [])).toBe(VALID);
          expect(validateMessage('fixup! foo', false, [])).toBe(INVALID);
          expect(errors).toEqual([
            'INVALID COMMIT MSG: fixup! foo\n' +
                ' => ERROR: Unable to find match for fixup commit among prior commits: -',
          ]);
        });
      });
    });
  });
});
