/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as config from '../utils/config';
import * as console from '../utils/console';

import {buildCommitMessage} from './builder';


describe('commit message building:', () => {
  beforeEach(() => {
    // stub logging calls to prevent noise in test log
    spyOn(console, 'info').and.stub();
    // provide a configuration for DevInfra when loaded
    spyOn(config, 'getConfig').and.returnValue({
      commitMessage: {
        scopes: ['core'],
      }
    } as any);
  });

  it('creates a commit message with a scope', async () => {
    buildPromptResponseSpies('fix', 'core', 'This is a summary');

    expect(await buildCommitMessage()).toMatch(/^fix\(core\): This is a summary/);
  });

  it('creates a commit message without a scope', async () => {
    buildPromptResponseSpies('build', false, 'This is a summary');

    expect(await buildCommitMessage()).toMatch(/^build: This is a summary/);
  });
});


/** Create spies to return the mocked selections from prompts. */
function buildPromptResponseSpies(type: string, scope: string|false, summary: string) {
  spyOn(console, 'promptAutocomplete')
      .and.returnValues(Promise.resolve(type), Promise.resolve(scope));
  spyOn(console, 'promptInput').and.returnValue(Promise.resolve(summary));
}
