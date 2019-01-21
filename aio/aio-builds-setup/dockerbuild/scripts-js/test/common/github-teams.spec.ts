import {GithubApi} from '../../lib/common/github-api';
import {GithubTeams} from '../../lib/common/github-teams';

// Tests
describe('GithubTeams', () => {

  let githubApi: jasmine.SpyObj<GithubApi>;

  beforeEach(() => {
    githubApi = jasmine.createSpyObj('githubApi', ['post', 'get', 'getPaginated']);
  });

  describe('constructor()', () => {

    it('should throw if \'githubOrg\' is missing or empty', () => {
      expect(() => new GithubTeams(githubApi, '')).
        toThrowError('Missing or empty required parameter \'githubOrg\'!');
    });
  });


  describe('fetchAll()', () => {
    let teams: GithubTeams;

    beforeEach(() => {
      teams = new GithubTeams(githubApi, 'foo');
    });


    it('should call \'getPaginated()\' with the correct pathname and params', () => {
      teams.fetchAll();
      expect(githubApi.getPaginated).toHaveBeenCalledWith('/orgs/foo/teams');
    });


    it('should forward the value returned by \'getPaginated()\'', () => {
      githubApi.getPaginated.and.returnValue('Test');
      expect(teams.fetchAll() as any).toBe('Test');
    });

  });


  describe('isMemberById()', () => {
    let teams: GithubTeams;

    beforeEach(() => {
      teams = new GithubTeams(githubApi, 'foo');
    });


    it('should return a promise', () => {
      githubApi.get.and.callFake(() => Promise.resolve());
      const promise = teams.isMemberById('user', [1]);
      expect(promise).toEqual(jasmine.any(Promise));
    });


    it('should resolve with false if called with an empty array', done => {
      teams.isMemberById('user', []).then(isMember => {
        expect(isMember).toBe(false);
        expect(githubApi.get).not.toHaveBeenCalled();
        done();
      });
    });


    it('should call \'get()\' with the correct pathname', done => {
      githubApi.get.and.callFake(() => Promise.resolve());
      teams.isMemberById('user', [1]).then(() => {
        expect(githubApi.get).toHaveBeenCalledWith('/teams/1/memberships/user');
        done();
      });
    });


    it('should resolve with false if \'get()\' rejects', done => {
      githubApi.get.and.callFake(() => Promise.reject(null));
      teams.isMemberById('user', [1]).then(isMember => {
        expect(isMember).toBe(false);
        expect(githubApi.get).toHaveBeenCalled();
        done();
      });
    });


    it('should resolve with false if the membership is not active', done => {
      githubApi.get.and.callFake(() => Promise.resolve({state: 'pending'}));
      teams.isMemberById('user', [1]).then(isMember => {
        expect(isMember).toBe(false);
        expect(githubApi.get).toHaveBeenCalled();
        done();
      });
    });


    it('should resolve with true if the membership is active', done => {
      githubApi.get.and.callFake(() => Promise.resolve({state: 'active'}));
      teams.isMemberById('user', [1]).then(isMember => {
        expect(isMember).toBe(true);
        done();
      });
    });


    it('should sequentially call \'get()\' until an active membership is found', done => {
      const trainedResponses: {[pathname: string]: Promise<{state: string}>} = {
        '/teams/1/memberships/user': Promise.resolve({state: 'pending'}),
        '/teams/2/memberships/user': Promise.reject(null),
        '/teams/3/memberships/user': Promise.resolve({state: 'active'}),
      };
      githubApi.get.and.callFake((pathname: string) => trainedResponses[pathname]);

      teams.isMemberById('user', [1, 2, 3, 4]).then(isMember => {
        expect(isMember).toBe(true);

        expect(githubApi.get).toHaveBeenCalledTimes(3);
        expect(githubApi.get.calls.argsFor(0)[0]).toBe('/teams/1/memberships/user');
        expect(githubApi.get.calls.argsFor(1)[0]).toBe('/teams/2/memberships/user');
        expect(githubApi.get.calls.argsFor(2)[0]).toBe('/teams/3/memberships/user');

        done();
      });
    });


    it('should resolve with false if no active membership is found', done => {
      const trainedResponses: {[pathname: string]: Promise<{state: string}>} = {
        '/teams/1/memberships/user': Promise.resolve({state: 'pending'}),
        '/teams/2/memberships/user':  Promise.reject(null),
        '/teams/3/memberships/user': Promise.resolve({state: 'not active'}),
        '/teams/4/memberships/user':  Promise.reject(null),
      };
      githubApi.get.and.callFake((pathname: string) => trainedResponses[pathname]);

      teams.isMemberById('user', [1, 2, 3, 4]).then(isMember => {
        expect(isMember).toBe(false);

        expect(githubApi.get).toHaveBeenCalledTimes(4);
        expect(githubApi.get.calls.argsFor(0)[0]).toBe('/teams/1/memberships/user');
        expect(githubApi.get.calls.argsFor(1)[0]).toBe('/teams/2/memberships/user');
        expect(githubApi.get.calls.argsFor(2)[0]).toBe('/teams/3/memberships/user');
        expect(githubApi.get.calls.argsFor(3)[0]).toBe('/teams/4/memberships/user');

        done();
      });
    });

  });


  describe('isMemberBySlug()', () => {
    let teams: GithubTeams;
    let teamsFetchAllSpy: jasmine.Spy;
    let teamsIsMemberByIdSpy: jasmine.Spy;

    beforeEach(() => {
      teams = new GithubTeams(githubApi, 'foo');

      const mockResponse = Promise.resolve([{id: 1, slug: 'team1'}, {id: 2, slug: 'team2'}]);
      teamsFetchAllSpy = spyOn(teams, 'fetchAll').and.returnValue(mockResponse);
      teamsIsMemberByIdSpy = spyOn(teams, 'isMemberById');
    });


    it('should return a promise', () => {
      expect(teams.isMemberBySlug('user', ['team-slug'])).toEqual(jasmine.any(Promise));
    });


    it('should call \'fetchAll()\'', () => {
      teams.isMemberBySlug('user', ['team-slug']);
      expect(teamsFetchAllSpy).toHaveBeenCalled();
    });


    it('should resolve with false if \'fetchAll()\' rejects', done => {
      teamsFetchAllSpy.and.callFake(() => Promise.reject(null));
      teams.isMemberBySlug('user', ['team-slug']).then(isMember => {
        expect(isMember).toBe(false);
        done();
      });
    });


    it('should call \'isMemberById()\' with the correct params if no team is found', done => {
      teams.isMemberBySlug('user', ['no-match']).then(() => {
        expect(teamsIsMemberByIdSpy).toHaveBeenCalledWith('user', []);
        done();
      });
    });


    it('should call \'isMemberById()\' with the correct params if teams are found', done => {
      const spy = teamsIsMemberByIdSpy;

      Promise.all([
        teams.isMemberBySlug('user', ['team1']).then(() => expect(spy).toHaveBeenCalledWith('user', [1])),
        teams.isMemberBySlug('user', ['team2']).then(() => expect(spy).toHaveBeenCalledWith('user', [2])),
        teams.isMemberBySlug('user', ['team1', 'team2']).then(() => expect(spy).toHaveBeenCalledWith('user', [1, 2])),
      ]).then(done);
    });


    it('should resolve with false if \'isMemberById()\' rejects', done => {
      teamsIsMemberByIdSpy.and.callFake(() => Promise.reject(null));
      teams.isMemberBySlug('user', ['team1']).then(isMember => {
        expect(isMember).toBe(false);
        expect(teamsIsMemberByIdSpy).toHaveBeenCalled();
        done();
      });
    });


    it('should resolve with the value \'isMemberById()\' resolves with', async () => {

      teamsIsMemberByIdSpy.and.callFake(() => Promise.resolve(true));
      const isMember1 = await teams.isMemberBySlug('user', ['team1']);
      expect(isMember1).toBe(true);
      expect(teamsIsMemberByIdSpy).toHaveBeenCalledWith('user', [1]);

      teamsIsMemberByIdSpy.and.callFake(() => Promise.resolve(false));
      const isMember2 = await teams.isMemberBySlug('user', ['team1']);
      expect(isMember2).toBe(false);
      expect(teamsIsMemberByIdSpy).toHaveBeenCalledWith('user', [1]);
    });

  });

});
