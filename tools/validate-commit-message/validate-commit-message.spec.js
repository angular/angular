/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

describe('validate-commit-message.js', function() {
  var validateMessage = require('./validate-commit-message');
  var SCOPES = validateMessage.config.scopes.join(', ');
  var TYPES = validateMessage.config.types.join(', ');
  var errors = [];
  var logs = [];

  var VALID = true;
  var INVALID = false;

  beforeEach(function() {
    errors.length = 0;
    logs.length = 0;

    spyOn(console, 'error').and.callFake(function(msg) {
      errors.push(msg.replace(/\x1B\[\d+m/g, ''));  // uncolor
    });

    spyOn(console, 'log').and.callFake(function(msg) {
      logs.push(msg.replace(/\x1B\[\d+m/g, ''));  // uncolor
    });
  });

  describe('validateMessage', function() {

    it('should be valid', function() {
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

    it('should fail when scope is invalid', function() {
      expect(validateMessage('fix(Compiler): something')).toBe(INVALID);
      expect(validateMessage('feat(bah): something')).toBe(INVALID);
      expect(validateMessage('style(webworker): something')).toBe(INVALID);
      expect(validateMessage('refactor(security): something')).toBe(INVALID);
      expect(validateMessage('refactor(docs): something')).toBe(INVALID);
      ['INVALID COMMIT MSG: "fix(Compiler): something"\n' +
           ' => ERROR: "Compiler" is not an allowed scope.\n' +
           ' => SCOPES: ' + SCOPES,
       'INVALID COMMIT MSG: "feat(bah): something"\n' +
           ' => ERROR: "bah" is not an allowed scope.\n' +
           ' => SCOPES: ' + SCOPES,
       'INVALID COMMIT MSG: "style(webworker): something"\n' +
           ' => ERROR: "webworker" is not an allowed scope.\n' +
           ' => SCOPES: ' + SCOPES,
       'INVALID COMMIT MSG: "refactor(security): something"\n' +
           ' => ERROR: "security" is not an allowed scope.\n' +
           ' => SCOPES: ' + SCOPES,
       'INVALID COMMIT MSG: "refactor(docs): something"\n' +
           ' => ERROR: "docs" is not an allowed scope.\n' +
           ' => SCOPES: ' + SCOPES,
      ].forEach((expectedErrorMessage, index) => {
        expect(expectedErrorMessage).toEqual(errors[index]);
      });
      expect(validateMessage('release(angular): something')).toBe(INVALID);
    });


    it('should validate 100 characters length', function() {
      var msg =
          'fix(compiler): something super mega extra giga tera long, maybe even longer and longer and longer and longer and longer and longer... ';

      expect(validateMessage(msg)).toBe(INVALID);
      expect(errors).toEqual([
        'INVALID COMMIT MSG: "fix(compiler): something super mega extra giga tera long, maybe even longer and longer and longer and longer and longer and longer... "\n => ERROR: The commit message is longer than 120 characters'
      ]);
    });


    it('should validate "<type>(<scope>): <subject>" format', function() {
      var msg = 'not correct format';

      expect(validateMessage(msg)).toBe(INVALID);
      expect(errors).toEqual([
        'INVALID COMMIT MSG: "not correct format"\n => ERROR: The commit message does not match the format of \'<type>(<scope>): <subject>\' OR \'Revert: "type(<scope>): <subject>"\''
      ]);
    });


    it('should support "revert: type(scope):" syntax', function() {
      const correctMsg = 'revert: fix(compiler): reduce generated code payload size by 65%';
      expect(validateMessage(correctMsg)).toBe(VALID);
    });

    it('should support reject "revert(scope):" syntax', function() {
      const incorretMsg = 'revert(compiler): reduce generated code payload size by 65%';
      expect(validateMessage(incorretMsg)).toBe(INVALID);
      expect(errors).toEqual(
          ['INVALID COMMIT MSG: "revert(compiler): reduce generated code payload size by 65%"\n' +
           ' => ERROR: revert is not an allowed type.\n' +
           ' => TYPES: ' + TYPES]);
    });

    // https://github.com/angular/angular/issues/23479
    it('should support typical Angular messages generated by git', function() {
      const correctMsg =
          'Revert "fix(compiler): Pretty print object instead of [Object object] (#22689)" (#23442)';
      expect(validateMessage(correctMsg)).toBe(VALID);
    });

    it('should validate type', function() {
      expect(validateMessage('weird($filter): something')).toBe(INVALID);
      expect(errors).toEqual(
          ['INVALID COMMIT MSG: "weird($filter): something"\n' +
           ' => ERROR: weird is not an allowed type.\n' +
           ' => TYPES: ' + TYPES]);
    });


    it('should allow empty scope',
       function() { expect(validateMessage('fix: blablabla')).toBe(VALID); });

    // we don't want to allow WIP. it's ok to fail the PR build in this case to show that there is
    // work still to be done.
    it('should not ignore msg prefixed with "WIP: "',
       function() { expect(validateMessage('WIP: bullshit')).toBe(INVALID); });
  });
});
