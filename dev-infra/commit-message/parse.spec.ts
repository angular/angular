/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {parseCommitMessage} from './parse';


const commitValues = {
  prefix: '',
  type: 'fix',
  npmScope: '',
  scope: 'changed-area',
  summary: 'This is a short summary of the change',
  body: 'This is a longer description of the change',
  footer: 'Closes #1',
};

function buildCommitMessage(params: Partial<typeof commitValues> = {}) {
  const {prefix, npmScope, type, scope, summary, body, footer} = {...commitValues, ...params};
  const scopeSlug = npmScope ? `${npmScope}/${scope}` : scope;
  return `${prefix}${type}${scopeSlug ? '(' + scopeSlug + ')' : ''}: ${summary}\n\n${body}\n\n${
      footer}`;
}


describe('commit message parsing:', () => {
  describe('parses the scope', () => {
    it('when only a scope is defined', () => {
      const message = buildCommitMessage();
      expect(parseCommitMessage(message).scope).toBe(commitValues.scope);
      expect(parseCommitMessage(message).npmScope).toBe('');
    });

    it('when an npmScope and scope are defined', () => {
      const message = buildCommitMessage({npmScope: 'myNpmPackage'});
      expect(parseCommitMessage(message).scope).toBe(commitValues.scope);
      expect(parseCommitMessage(message).npmScope).toBe('myNpmPackage');
    });
  });

  it('parses the type', () => {
    const message = buildCommitMessage();
    expect(parseCommitMessage(message).type).toBe(commitValues.type);
  });

  it('parses the header', () => {
    const message = buildCommitMessage();
    expect(parseCommitMessage(message).header)
        .toBe(`${commitValues.type}(${commitValues.scope}): ${commitValues.summary}`);
  });

  it('parses the body', () => {
    const message = buildCommitMessage();
    expect(parseCommitMessage(message).body).toBe(commitValues.body);
  });

  it('parses the subject', () => {
    const message = buildCommitMessage();
    expect(parseCommitMessage(message).subject).toBe(commitValues.summary);
  });

  it('ignores comment lines', () => {
    const message = buildCommitMessage({
      prefix: '# This is a comment line before the header.\n' +
          '## This is another comment line before the headers.\n',
      body: '# This is a comment line befor the body.\n' +
          'This is line 1 of the actual body.\n' +
          '## This is another comment line inside the body.\n' +
          'This is line 2 of the actual body (and it also contains a # but it not a comment).\n' +
          '### This is yet another comment line after the body.\n',
    });
    const parsedMessage = parseCommitMessage(message);

    expect(parsedMessage.header)
        .toBe(`${commitValues.type}(${commitValues.scope}): ${commitValues.summary}`);
    expect(parsedMessage.body)
        .toBe(
            'This is line 1 of the actual body.\n' +
            'This is line 2 of the actual body (and it also contains a # but it not a comment).');
  });

  describe('parses breaking change notes', () => {
    const breakingChangeText = 'This break things';

    it('when multiple new lines are used as a separator', () => {
      const message = buildCommitMessage({
        footer: `BREAKING CHANGE:\n\n${breakingChangeText}`,
      });
      const parsedMessage = parseCommitMessage(message);
      expect(parsedMessage.breakingChanges[0].text).toBe(breakingChangeText);
      expect(parsedMessage.breakingChanges.length).toBe(1);
    });

    it('when a single space is used as a separator', () => {
      const message = buildCommitMessage({
        footer: `BREAKING CHANGE: ${breakingChangeText}`,
      });
      const parsedMessage = parseCommitMessage(message);
      expect(parsedMessage.breakingChanges[0].text).toBe(breakingChangeText);
      expect(parsedMessage.breakingChanges.length).toBe(1);
    });
  });

  describe('parses deprecation notes', () => {
    const deprecationsText = 'This will break things later';

    it('when multiple new lines are used as a separator', () => {
      const message = buildCommitMessage({
        footer: `DEPRECATED:\n\n${deprecationsText}`,
      });
      const parsedMessage = parseCommitMessage(message);
      expect(parsedMessage.deprecations[0].text).toBe(deprecationsText);
      expect(parsedMessage.deprecations.length).toBe(1);
    });

    it('when a single space is used as a separator', () => {
      const message = buildCommitMessage({
        footer: `DEPRECATED: ${deprecationsText}`,
      });
      const parsedMessage = parseCommitMessage(message);
      expect(parsedMessage.deprecations[0].text).toBe(deprecationsText);
      expect(parsedMessage.deprecations.length).toBe(1);
    });
  });
});
