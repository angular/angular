// Imports
import {GithubTeams} from '../../lib/common/github-teams';

// Tests
describe('GithubTeams', () => {

  describe('constructor()', () => {

    it('should throw if \'githubToken\' is missing or empty', () => {
      expect(() => new GithubTeams('', 'org')).
        toThrowError('Missing or empty required parameter \'githubToken\'!');
    });


    it('should throw if \'organization\' is missing or empty', () => {
      expect(() => new GithubTeams('12345', '')).
        toThrowError('Missing or empty required parameter \'organization\'!');
    });

  });


  describe('fetchAll()', () => {
    let teams: GithubTeams;
    let teamsGetPaginatedSpy: jasmine.Spy;

    beforeEach(() => {
      teams = new GithubTeams('12345', 'foo');
      teamsGetPaginatedSpy = spyOn(teams as any, 'getPaginated');
    });


    it('should call \'getPaginated()\' with the correct pathname and params', () => {
      teams.fetchAll();
      expect(teamsGetPaginatedSpy).toHaveBeenCalledWith('/orgs/foo/teams');
    });


    it('should forward the value returned by \'getPaginated()\'', () => {
      teamsGetPaginatedSpy.and.returnValue('Test');
      expect(teams.fetchAll()).toBe('Test');
    });

  });


  describe('isMemberById()', () => {
    let teams: GithubTeams;
    let teamsGetSpy: jasmine.Spy;

    beforeEach(() => {
      teams = new GithubTeams('12345', 'foo');
      teamsGetSpy = spyOn(teams, 'get');
    });


    it('should return a promise', () => {
      expect(teams.isMemberById('user', [1])).toEqual(jasmine.any(Promise));
    });


    it('should resolve with false if called with an empty array', done => {
      teams.isMemberById('user', []).then(isMember => {
        expect(isMember).toBe(false);
        expect(teamsGetSpy).not.toHaveBeenCalled();
        done();
      });
    });


    it('should call \'get()\' with the correct pathname', done => {
      teamsGetSpy.and.returnValue(Promise.resolve(null));
      teams.isMemberById('user', [1]).then(() => {
        expect(teamsGetSpy).toHaveBeenCalledWith('/teams/1/memberships/user');
        done();
      });
    });


    it('should resolve with false if \'get()\' rejects', done => {
      teamsGetSpy.and.returnValue(Promise.reject(null));
      teams.isMemberById('user', [1]).then(isMember => {
        expect(isMember).toBe(false);
        expect(teamsGetSpy).toHaveBeenCalled();
        done();
      });
    });


    it('should resolve with false if the membership is not active', done => {
      teamsGetSpy.and.returnValue(Promise.resolve({state: 'pending'}));
      teams.isMemberById('user', [1]).then(isMember => {
        expect(isMember).toBe(false);
        expect(teamsGetSpy).toHaveBeenCalled();
        done();
      });
    });


    it('should resolve with true if the membership is active', done => {
      teamsGetSpy.and.returnValue(Promise.resolve({state: 'active'}));
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
      teamsGetSpy.and.callFake((pathname: string) => trainedResponses[pathname]);

      teams.isMemberById('user', [1, 2, 3, 4]).then(isMember => {
        expect(isMember).toBe(true);

        expect(teamsGetSpy).toHaveBeenCalledTimes(3);
        expect(teamsGetSpy.calls.argsFor(0)[0]).toBe('/teams/1/memberships/user');
        expect(teamsGetSpy.calls.argsFor(1)[0]).toBe('/teams/2/memberships/user');
        expect(teamsGetSpy.calls.argsFor(2)[0]).toBe('/teams/3/memberships/user');

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
      teamsGetSpy.and.callFake((pathname: string) => trainedResponses[pathname]);

      teams.isMemberById('user', [1, 2, 3, 4]).then(isMember => {
        expect(isMember).toBe(false);

        expect(teamsGetSpy).toHaveBeenCalledTimes(4);
        expect(teamsGetSpy.calls.argsFor(0)[0]).toBe('/teams/1/memberships/user');
        expect(teamsGetSpy.calls.argsFor(1)[0]).toBe('/teams/2/memberships/user');
        expect(teamsGetSpy.calls.argsFor(2)[0]).toBe('/teams/3/memberships/user');
        expect(teamsGetSpy.calls.argsFor(3)[0]).toBe('/teams/4/memberships/user');

        done();
      });
    });

  });


  describe('isMemberBySlug()', () => {
    let teams: GithubTeams;
    let teamsFetchAllSpy: jasmine.Spy;
    let teamsIsMemberByIdSpy: jasmine.Spy;

    beforeEach(() => {
      teams = new GithubTeams('12345', 'foo');

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
      teamsFetchAllSpy.and.returnValue(Promise.reject(null));
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
      teamsIsMemberByIdSpy.and.returnValue(Promise.reject(null));
      teams.isMemberBySlug('user', ['team1']).then(isMember => {
        expect(isMember).toBe(false);
        expect(teamsIsMemberByIdSpy).toHaveBeenCalled();
        done();
      });
    });


    it('should resolve with the value \'isMemberById()\' resolves with', done => {
      teamsIsMemberByIdSpy.and.returnValues(Promise.resolve(false), Promise.resolve(true));

      Promise.all([
        teams.isMemberBySlug('user', ['team1']).then(isMember => expect(isMember).toBe(false)),
        teams.isMemberBySlug('user', ['team1']).then(isMember => expect(isMember).toBe(true)),
      ]).then(() => {
        expect(teamsIsMemberByIdSpy).toHaveBeenCalledTimes(2);
        done();
      });
    });

  });

});
