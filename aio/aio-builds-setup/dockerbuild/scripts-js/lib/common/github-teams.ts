import {GithubApi} from './github-api';
import {assertNotMissingOrEmpty} from './utils';

export interface Team {
  id: number;
  slug: string;
}

export interface TeamMembership {
  state: string;
}

export class GithubTeams {
  /**
   * Create an instance of this helper
   * @param api An instance of the Github API helper.
   * @param githubOrg The organisation on GitHub whose repo we will interrogate.
   */
  constructor(private api: GithubApi, protected githubOrg: string) {
    assertNotMissingOrEmpty('githubOrg', githubOrg);
  }

  /**
   * Request information about all the organisation's teams in GitHub.
   * @returns A promise that is resolved with information about the teams.
   */
  public fetchAll(): Promise<Team[]> {
    return this.api.getPaginated<Team>(`/orgs/${this.githubOrg}/teams`);
  }

  /**
   * Check whether the specified username is a member of the specified team.
   * @param username The usernane to check for in the team.
   * @param teamIds The team to check for the username.
   * @returns a Promise that resolves to `true` if the username is a member of the team.
   */
  public async isMemberById(username: string, teamIds: number[]): Promise<boolean> {

    const getMembership = async (teamId: number) => {
      try {
        const {state} = await this.api.get<TeamMembership>(`/teams/${teamId}/memberships/${username}`);
        return state === 'active';
      } catch (error) {
        return false;
      }
    };

    for (const teamId of teamIds) {
      if (await getMembership(teamId)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check whether the given username is a member of the teams specified by the team slugs.
   * @param username The username to check for in the teams.
   * @param teamSlugs A collection of slugs that represent the teams to check for the username.
   * @returns a Promise that resolves to `true` if the usernane is a member of at least one of the specified teams.
   */
  public async isMemberBySlug(username: string, teamSlugs: string[]): Promise<boolean> {
    try {
      const teams = await this.fetchAll();
      const teamIds = teams.filter(team => teamSlugs.includes(team.slug)).map(team => team.id);
      return await this.isMemberById(username, teamIds);
    } catch (error) {
      return false;
    }
  }
}
