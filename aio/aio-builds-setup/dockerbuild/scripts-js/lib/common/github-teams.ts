// Imports
import {assertNotMissingOrEmpty} from '../common/utils';
import {GithubApi} from './github-api';

// Interfaces - Types
interface Team {
  id: number;
  slug: string;
}

interface TeamMembership {
  state: string;
}

// Classes
export class GithubTeams extends GithubApi {
  // Constructor
  constructor(githubToken: string, protected organization: string) {
    super(githubToken);
    assertNotMissingOrEmpty('organization', organization);
  }

  // Methods - Public
  public fetchAll(): Promise<Team[]> {
    return this.getPaginated<Team>(`/orgs/${this.organization}/teams`);
  }

  public isMemberById(username: string, teamIds: number[]): Promise<boolean> {
    const getMembership = (teamId: number) =>
      this.get<TeamMembership>(`/teams/${teamId}/memberships/${username}`).
        then(membership => membership.state === 'active').
        catch(() => false);
    const reduceFn = (promise: Promise<boolean>, teamId: number) =>
      promise.then(isMember => isMember || getMembership(teamId));

    return teamIds.reduce(reduceFn, Promise.resolve(false));
  }

  public isMemberBySlug(username: string, teamSlugs: string[]): Promise<boolean> {
    return this.fetchAll().
      then(teams => teams.filter(team => teamSlugs.includes(team.slug)).map(team => team.id)).
      then(teamIds => this.isMemberById(username, teamIds)).
      catch(() => false);
  }
}
