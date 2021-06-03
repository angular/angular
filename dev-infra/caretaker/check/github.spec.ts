
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as console from '../../utils/console';
import {AuthenticatedGithubClient, GithubClient} from '../../utils/git/github';
import {installVirtualGitClientSpies, mockNgDevConfig} from '../../utils/testing';

import {GithubQueriesModule} from './github';

describe('GithubQueriesModule', () => {
  let githubApiSpy: jasmine.Spy;
  let infoSpy: jasmine.Spy;
  let infoGroupSpy: jasmine.Spy;

  beforeEach(() => {
    githubApiSpy = spyOn(AuthenticatedGithubClient.prototype, 'graphql')
                       .and.throwError(
                           'The graphql query response must always be manually defined in a test.');
    installVirtualGitClientSpies();
    infoGroupSpy = spyOn(console.info, 'group');
    infoSpy = spyOn(console, 'info');
  });

  describe('gathering stats', () => {
    it('unless githubQueries are `undefined`', async () => {
      const module =
          new GithubQueriesModule({...mockNgDevConfig, caretaker: {githubQueries: undefined}});

      expect(await module.data).toBe(undefined);
    });

    it('unless githubQueries are an empty array', async () => {
      const module = new GithubQueriesModule({...mockNgDevConfig, caretaker: {githubQueries: []}});

      expect(await module.data).toBe(undefined);
    });

    it('for the requested Github queries', async () => {
      githubApiSpy.and.returnValue({
        'keynamewithspaces': {issueCount: 1, nodes: [{url: 'http://github.com/owner/name/issue/1'}]}
      });
      const module = new GithubQueriesModule({
        ...mockNgDevConfig,
        caretaker: {githubQueries: [{name: 'key name with spaces', query: 'issue: yes'}]}
      });

      expect(await module.data).toEqual([{
        queryName: 'key name with spaces',
        count: 1,
        queryUrl: 'https://github.com/owner/name/issues?q=issue:%20yes',
        matchedUrls: ['http://github.com/owner/name/issue/1'],
      }]);
    });
  });

  describe('printing the data retrieved', () => {
    it('if there are no matches of the query', async () => {
      const fakeData = Promise.resolve([
        {
          queryName: 'query1',
          count: 0,
          queryUrl: 'https://github.com/owner/name/issues?q=issue:%20no',
          matchedUrls: [],
        },
        {
          queryName: 'query2',
          count: 0,
          queryUrl: 'https://github.com/owner/name/issues?q=something',
          matchedUrls: [],
        },
      ]);


      const module = new GithubQueriesModule({caretaker: {}, ...mockNgDevConfig});
      Object.defineProperty(module, 'data', {value: fakeData});

      await module.printToTerminal();


      expect(infoGroupSpy).toHaveBeenCalledWith('Github Tasks');
      expect(infoSpy).toHaveBeenCalledWith('query1  0');
      expect(infoSpy).toHaveBeenCalledWith('query2  0');
    });

    it('if there are maches of the query', async () => {
      const fakeData = Promise.resolve([
        {
          queryName: 'query1',
          count: 1,
          queryUrl: 'https://github.com/owner/name/issues?q=issue:%20yes',
          matchedUrls: ['http://github.com/owner/name/issue/1'],
        },
        {
          queryName: 'query2',
          count: 0,
          queryUrl: 'https://github.com/owner/name/issues?q=something',
          matchedUrls: [],
        },
      ]);

      const module = new GithubQueriesModule({caretaker: {}, ...mockNgDevConfig});
      Object.defineProperty(module, 'data', {value: fakeData});

      await module.printToTerminal();

      expect(infoGroupSpy).toHaveBeenCalledWith('Github Tasks');
      expect(infoSpy).toHaveBeenCalledWith('query1  1');
      expect(infoGroupSpy)
          .toHaveBeenCalledWith('https://github.com/owner/name/issues?q=issue:%20yes');
      expect(infoSpy).toHaveBeenCalledWith('- http://github.com/owner/name/issue/1');
      expect(infoSpy).toHaveBeenCalledWith('query2  0');
    });
  });
});
