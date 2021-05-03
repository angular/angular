import {GithubApi} from '../../lib/common/github-api';
import {GithubTeams, Team} from '../../lib/common/github-teams';

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


    it('should forward the value returned by \'getPaginated()\'', async () => {
      const mockTeams: Team[] = [
        {id: 1, slug: 'foo'},
        {id: 2, slug: 'bar'},
      ];

      githubApi.getPaginated.and.resolveTo(mockTeams);
      expect(await teams.fetchAll()).toBe(mockTeams);
    });

  });


  describe('isMemberById()', () => {
    let teams: GithubTeams;

    beforeEach(() => {
      teams = new GithubTeams(githubApi, 'foo');
    });


    it('should return a promise', () => {
      githubApi.get.and.resolveTo();
      const promise = teams.isMemberById('user', [1]);
      expect(promise).toBeInstanceOf(Promise);
    });


    it('should resolve with false if called with an empty array', async () => {
      await expectAsync(teams.isMemberById('user', [])).toBeResolvedTo(false);
      expect(githubApi.get).not.toHaveBeenCalled();
    });


    it('should call \'get()\' with the correct pathname', async () => {
      githubApi.get.and.resolveTo();
      await teams.isMemberById('user', [1]);

      expect(githubApi.get).toHaveBeenCalledWith('/teams/1/memberships/user');
    });


    it('should resolve with false if \'get()\' rejects', async () => {
      githubApi.get.and.rejectWith(null);

      await expectAsync(teams.isMemberById('user', [1])).toBeResolvedTo(false);
      expect(githubApi.get).toHaveBeenCalled();
    });


    it('should resolve with false if the membership is not active', async () => {
      githubApi.get.and.resolveTo({state: 'pending'});

      await expectAsync(teams.isMemberById('user', [1])).toBeResolvedTo(false);
      expect(githubApi.get).toHaveBeenCalled();
    });


    it('should resolve with true if the membership is active', async () => {
      githubApi.get.and.resolveTo({state: 'active'});
      await expectAsync(teams.isMemberById('user', [1])).toBeResolvedTo(true);
    });


    it('should sequentially call \'get()\' until an active membership is found', async () => {
      githubApi.get.
        withArgs('/teams/1/memberships/user').and.resolveTo({state: 'pending'}).
        withArgs('/teams/2/memberships/user').and.rejectWith(null).
        withArgs('/teams/3/memberships/user').and.resolveTo({state: 'active'});

      await expectAsync(teams.isMemberById('user', [1, 2, 3, 4])).toBeResolvedTo(true);

      expect(githubApi.get).toHaveBeenCalledTimes(3);
      expect(githubApi.get.calls.argsFor(0)[0]).toBe('/teams/1/memberships/user');
      expect(githubApi.get.calls.argsFor(1)[0]).toBe('/teams/2/memberships/user');
      expect(githubApi.get.calls.argsFor(2)[0]).toBe('/teams/3/memberships/user');
    });


    it('should resolve with false if no active membership is found', async () => {
      githubApi.get.
        withArgs('/teams/1/memberships/user').and.resolveTo({state: 'pending'}).
        withArgs('/teams/2/memberships/user').and.rejectWith(null).
        withArgs('/teams/3/memberships/user').and.resolveTo({state: 'not active'}).
        withArgs('/teams/4/memberships/user').and.rejectWith(null);

      await expectAsync(teams.isMemberById('user', [1, 2, 3, 4])).toBeResolvedTo(false);

      expect(githubApi.get).toHaveBeenCalledTimes(4);
      expect(githubApi.get.calls.argsFor(0)[0]).toBe('/teams/1/memberships/user');
      expect(githubApi.get.calls.argsFor(1)[0]).toBe('/teams/2/memberships/user');
      expect(githubApi.get.calls.argsFor(2)[0]).toBe('/teams/3/memberships/user');
      expect(githubApi.get.calls.argsFor(3)[0]).toBe('/teams/4/memberships/user');
    });

  });


  describe('isMemberBySlug()', () => {
    let teams: GithubTeams;
    let teamsFetchAllSpy: jasmine.Spy;
    let teamsIsMemberByIdSpy: jasmine.Spy;

    beforeEach(() => {
      teams = new GithubTeams(githubApi, 'foo');

      teamsFetchAllSpy = spyOn(teams, 'fetchAll').and.resolveTo([{id: 1, slug: 'team1'}, {id: 2, slug: 'team2'}]);
      teamsIsMemberByIdSpy = spyOn(teams, 'isMemberById');
    });


    it('should return a promise', () => {
      expect(teams.isMemberBySlug('user', ['team-slug'])).toBeInstanceOf(Promise);
    });


    it('should call \'fetchAll()\'', () => {
      teams.isMemberBySlug('user', ['team-slug']);
      expect(teamsFetchAllSpy).toHaveBeenCalled();
    });


    it('should resolve with false if \'fetchAll()\' rejects', async () => {
      teamsFetchAllSpy.and.rejectWith(null);
      await expectAsync(teams.isMemberBySlug('user', ['team-slug'])).toBeResolvedTo(false);
    });


    it('should call \'isMemberById()\' with the correct params if no team is found', async () => {
      await teams.isMemberBySlug('user', ['no-match']);
      expect(teamsIsMemberByIdSpy).toHaveBeenCalledWith('user', []);
    });


    it('should call \'isMemberById()\' with the correct params if teams are found', async () => {
      await teams.isMemberBySlug('userA', ['team1']);
      expect(teamsIsMemberByIdSpy).toHaveBeenCalledWith('userA', [1]);

      await teams.isMemberBySlug('userB', ['team2']);
      expect(teamsIsMemberByIdSpy).toHaveBeenCalledWith('userB', [2]);

      await teams.isMemberBySlug('userC', ['team1', 'team2']);
      expect(teamsIsMemberByIdSpy).toHaveBeenCalledWith('userC', [1, 2]);
    });


    it('should resolve with false if \'isMemberById()\' rejects', async () => {
      teamsIsMemberByIdSpy.and.rejectWith(null);

      await expectAsync(teams.isMemberBySlug('user', ['team1'])).toBeResolvedTo(false);
      expect(teamsIsMemberByIdSpy).toHaveBeenCalled();
    });


    it('should resolve with the value \'isMemberById()\' resolves with', async () => {
      teamsIsMemberByIdSpy.and.resolveTo(true);
      await expectAsync(teams.isMemberBySlug('userA', ['team1'])).toBeResolvedTo(true);
      expect(teamsIsMemberByIdSpy).toHaveBeenCalledWith('userA', [1]);

      teamsIsMemberByIdSpy.and.resolveTo(false);
      await expectAsync(teams.isMemberBySlug('userB', ['team1'])).toBeResolvedTo(false);
      expect(teamsIsMemberByIdSpy).toHaveBeenCalledWith('userB', [1]);
    });

  });

});
