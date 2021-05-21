/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommitFromGitLog, parseCommitFromGitLog} from '../../../../commit-message/parse';
import {commitMessageBuilder} from '../../../../commit-message/test-util';
import {RenderContext, RenderContextData,} from '../../../notes/context';

const defaultContextData: RenderContextData = {
  commits: [],
  github: {
    name: 'repoName',
    owner: 'repoOwner',
  },
  title: false,
  version: '1.2.3',
};

describe('RenderContext', () => {
  beforeAll(() => {
    jasmine.clock().install();
  });

  it('contains a date stamp using the current date by default', async () => {
    jasmine.clock().mockDate(new Date(1996, 11, 11));
    const renderContext = new RenderContext(defaultContextData);
    expect(renderContext.dateStamp).toBe('1996-12-11');
  });

  it('contains a date stamp using a provided date', async () => {
    const data = {...defaultContextData, date: new Date(2000, 0, 20)};
    const renderContext = new RenderContext(data);
    expect(renderContext.dateStamp).toBe('2000-01-20');
  });

  it('filters to include only commits which have specified field', () => {
    const renderContext = new RenderContext(defaultContextData);
    const matchingCommits = commitsFromList(2, 15);
    expect(commits.filter(renderContext.contains('breakingChanges'))).toEqual(matchingCommits);
  });

  it('filters to include only the first commit discovered with a unique value for a specified field',
     () => {
       const renderContext = new RenderContext(defaultContextData);
       const matchingCommits = commitsFromList(0, 1, 2, 3, 4, 7, 12);
       expect(commits.filter(renderContext.unique('type'))).toEqual(matchingCommits);
     });


  describe('filters to include commits which are to be included in the release notes', () => {
    it('including all scopes by default', () => {
      const renderContext = new RenderContext(defaultContextData);
      const matchingCommits = commitsFromList(0, 2, 5, 6, 8, 10, 11, 12, 15, 16);
      expect(commits.filter(renderContext.includeInReleaseNotes())).toEqual(matchingCommits);
    });

    it('excluding hidden scopes defined in the config', () => {
      const renderContext = new RenderContext({...defaultContextData, hiddenScopes: ['core']});
      const matchingCommits = commitsFromList(0, 2, 6, 8, 10, 11, 15, 16);
      expect(commits.filter(renderContext.includeInReleaseNotes())).toEqual(matchingCommits);
    });
  });

  describe('organized lists of commits into groups', () => {
    let devInfraCommits: CommitFromGitLog[];
    let coreCommits: CommitFromGitLog[];
    let compilerCommits: CommitFromGitLog[];
    let unorganizedCommits: CommitFromGitLog[];
    function assertOrganizedGroupsMatch(
        generatedGroups: {title: string, commits: CommitFromGitLog[]}[],
        providedGroups: {title: string, commits: CommitFromGitLog[]}[]) {
      expect(generatedGroups.length).toBe(providedGroups.length);
      generatedGroups.forEach(({title, commits}, idx) => {
        expect(title).toBe(providedGroups[idx].title);
        expect(commits).toEqual(jasmine.arrayWithExactContents(providedGroups[idx].commits));
      });
    }

    beforeEach(() => {
      devInfraCommits = commits.filter(c => c.scope === 'dev-infra');
      coreCommits = commits.filter(c => c.scope === 'core');
      compilerCommits = commits.filter(c => c.scope === 'compiler');
      unorganizedCommits =
          [...devInfraCommits, ...coreCommits, ...compilerCommits].sort(() => Math.random() - 0.5);
    });



    it('with default sorting', () => {
      const renderContext = new RenderContext(defaultContextData);
      const organizedCommits = renderContext.asCommitGroups(unorganizedCommits);

      assertOrganizedGroupsMatch(organizedCommits, [
        {title: 'compiler', commits: compilerCommits},
        {title: 'core', commits: coreCommits},
        {title: 'dev-infra', commits: devInfraCommits},
      ]);
    });

    it('sorted by the provided order in the config', () => {
      const renderContext =
          new RenderContext({...defaultContextData, groupOrder: ['core', 'dev-infra']});
      const organizedCommits = renderContext.asCommitGroups(unorganizedCommits);

      assertOrganizedGroupsMatch(organizedCommits, [
        {title: 'core', commits: coreCommits},
        {title: 'dev-infra', commits: devInfraCommits},
        {title: 'compiler', commits: compilerCommits},
      ]);
    });
  });

  afterAll(() => {
    jasmine.clock().uninstall();
  });
});



const buildCommitMessage = commitMessageBuilder({
  prefix: '',
  type: '',
  npmScope: '',
  scope: '',
  summary: 'This is a short summary of the change',
  body: 'This is a longer description of the change',
  footer: '',
});

function buildCommit(type: string, scope: string, withBreakingChange = false) {
  const footer = withBreakingChange ? 'BREAKING CHANGE: something is broken now' : '';
  const parts = {type, scope, footer};
  return parseCommitFromGitLog(Buffer.from(buildCommitMessage(parts)));
}


function commitsFromList(...indexes: number[]) {
  const output: CommitFromGitLog[] = [];
  for (const i of indexes) {
    output.push(commits[i]);
  }
  return output;
}


const commits: CommitFromGitLog[] = [
  buildCommit('fix', 'platform-browser'),
  buildCommit('test', 'dev-infra'),
  buildCommit('feat', 'dev-infra', true),
  buildCommit('build', 'docs-infra'),
  buildCommit('docs', 'router'),
  buildCommit('feat', 'core'),
  buildCommit('feat', 'common'),
  buildCommit('refactor', 'compiler'),
  buildCommit('fix', 'docs-infra'),
  buildCommit('test', 'core'),
  buildCommit('feat', 'compiler-cli'),
  buildCommit('fix', 'dev-infra'),
  buildCommit('perf', 'core'),
  buildCommit('docs', 'forms'),
  buildCommit('refactor', 'dev-infra'),
  buildCommit('feat', 'docs-infra', true),
  buildCommit('fix', 'compiler'),
];
