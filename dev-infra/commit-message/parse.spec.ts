/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getHeaderWithoutFixup, isFixup, isRevert, isSquash, parseCommitMessage} from './parse';


const commitValues = {
  prefix: '',
  type: 'fix',
  scope: 'changed-area',
  summary: 'This is a short summary of the change',
  body: 'This is a longer description of the change',
  footer: 'Closes #1',
};

function buildCommitMessage(params = {}) {
  const {prefix, type, scope, summary, body, footer} = {...commitValues, ...params};
  return `${prefix}${type}${scope ? '(' + scope + ')' : ''}: ${summary}\n${body}\n${footer}`;
}


describe('commit message parsing:', () => {
  it('parses the scope', () => {
    const message = buildCommitMessage();
    expect(parseCommitMessage(message).scope).toBe(commitValues.scope);
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

  describe('parsed commit message utils', () => {
    it('identifies if a commit is a fixup', () => {
      const commit1 = parseCommitMessage(buildCommitMessage());
      expect(isFixup(commit1)).toBe(false);

      const commit2 = parseCommitMessage(buildCommitMessage({prefix: 'fixup! '}));
      expect(isFixup(commit2)).toBe(true);
    });

    it('extracts the header from a fixup commit', () => {
      const commit = parseCommitMessage(buildCommitMessage({prefix: 'fixup! '}));
      expect(getHeaderWithoutFixup(commit))
          .toBe(`${commitValues.type}(${commitValues.scope}): ${commitValues.summary}`);
    });

    it('identifies if a commit is a revert', () => {
      const message1 = parseCommitMessage(buildCommitMessage());
      expect(isRevert(message1)).toBe(false);

      const message2 = parseCommitMessage(buildCommitMessage({prefix: 'revert: '}));
      expect(isRevert(message2)).toBe(true);

      const message3 = parseCommitMessage(buildCommitMessage({prefix: 'revert '}));
      expect(isRevert(message3)).toBe(true);
    });

    it('identifies if a commit is a squash', () => {
      const message1 = parseCommitMessage(buildCommitMessage());
      expect(isSquash(message1)).toBe(false);

      const message2 = parseCommitMessage(buildCommitMessage({prefix: 'squash! '}));
      expect(isSquash(message2)).toBe(true);
    });
  });
});
