/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {parseCommitMessage} from './parse';
import {commitMessageBuilder, CommitMessageParts} from './test-util';

const commitValues: CommitMessageParts = {
  prefix: '',
  type: 'fix',
  npmScope: '',
  scope: 'changed-area',
  summary: 'This is a short summary of the change',
  body: 'This is a longer description of the change',
  footer: 'Closes #1',
};

const buildCommitMessage = commitMessageBuilder(commitValues);


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

  it('identifies if a commit is a fixup', () => {
    const message1 = buildCommitMessage();
    expect(parseCommitMessage(message1).isFixup).toBe(false);

    const message2 = buildCommitMessage({prefix: 'fixup! '});
    expect(parseCommitMessage(message2).isFixup).toBe(true);
  });

  it('identifies if a commit is a revert', () => {
    const message1 = buildCommitMessage();
    expect(parseCommitMessage(message1).isRevert).toBe(false);

    const message2 = buildCommitMessage({prefix: 'revert: '});
    expect(parseCommitMessage(message2).isRevert).toBe(true);

    const message3 = buildCommitMessage({prefix: 'revert '});
    expect(parseCommitMessage(message3).isRevert).toBe(true);
  });

  it('identifies if a commit is a squash', () => {
    const message1 = buildCommitMessage();
    expect(parseCommitMessage(message1).isSquash).toBe(false);

    const message2 = buildCommitMessage({prefix: 'squash! '});
    expect(parseCommitMessage(message2).isSquash).toBe(true);
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
    const summary = 'This breaks things';
    const description = 'This is how it breaks things.';

    it('when only a summary is provided', () => {
      const message = buildCommitMessage({
        footer: `BREAKING CHANGE: ${summary}`,
      });
      const parsedMessage = parseCommitMessage(message);
      expect(parsedMessage.breakingChanges[0].text).toBe(summary);
      expect(parsedMessage.breakingChanges.length).toBe(1);
    });

    it('when only a description is provided', () => {
      const message = buildCommitMessage({
        footer: `BREAKING CHANGE:\n\n${description}`,
      });
      const parsedMessage = parseCommitMessage(message);
      expect(parsedMessage.breakingChanges[0].text).toBe(description);
      expect(parsedMessage.breakingChanges.length).toBe(1);
    });

    it('when a summary and description are provied', () => {
      const message = buildCommitMessage({
        footer: `BREAKING CHANGE: ${summary}\n\n${description}`,
      });
      const parsedMessage = parseCommitMessage(message);
      expect(parsedMessage.breakingChanges[0].text).toBe(`${summary}\n\n${description}`);
      expect(parsedMessage.breakingChanges.length).toBe(1);
    });

    it('only when keyword is at the beginning of a line', () => {
      const message = buildCommitMessage({
        body: 'This changes how the `BREAKING CHANGE: ` commit message note\n' +
            'keyword is detected for the changelog.',
      });
      const parsedMessage = parseCommitMessage(message);
      expect(parsedMessage.breakingChanges.length).toBe(0);
    });
  });

  describe('parses deprecation notes', () => {
    const summary = 'This will break things later';
    const description = 'This is a long winded explanation of why it \nwill break things later.';


    it('when only a summary is provided', () => {
      const message = buildCommitMessage({
        footer: `DEPRECATED: ${summary}`,
      });
      const parsedMessage = parseCommitMessage(message);
      expect(parsedMessage.deprecations[0].text).toBe(summary);
      expect(parsedMessage.deprecations.length).toBe(1);
    });

    it('when only a description is provided', () => {
      const message = buildCommitMessage({
        footer: `DEPRECATED:\n\n${description}`,
      });
      const parsedMessage = parseCommitMessage(message);
      expect(parsedMessage.deprecations[0].text).toBe(description);
      expect(parsedMessage.deprecations.length).toBe(1);
    });

    it('when a summary and description are provied', () => {
      const message = buildCommitMessage({
        footer: `DEPRECATED: ${summary}\n\n${description}`,
      });
      const parsedMessage = parseCommitMessage(message);
      expect(parsedMessage.deprecations[0].text).toBe(`${summary}\n\n${description}`);
      expect(parsedMessage.deprecations.length).toBe(1);
    });

    it('only when keyword is at the beginning of a line', () => {
      const message = buildCommitMessage({
        body: 'This changes how the `DEPRECATED: ` commit message note\n' +
            'keyword is detected for the changelog.',
      });
      const parsedMessage = parseCommitMessage(message);
      expect(parsedMessage.deprecations.length).toBe(0);
    });
  });
});
