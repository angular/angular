// Imports
import * as jwt from 'jsonwebtoken';
import {GithubPullRequests} from '../common/github-pull-requests';
import {GithubTeams} from '../common/github-teams';
import {assertNotMissingOrEmpty} from '../common/utils';
import {UploadError} from './upload-error';

// Interfaces - Types
interface JwtPayload {
  slug: string;
  'pull-request': number;
}

// Classes
export class BuildVerifier {
  // Properties - Protected
  protected githubPullRequests: GithubPullRequests;
  protected githubTeams: GithubTeams;

  // Constructor
  constructor(protected secret: string, githubToken: string, protected repoSlug: string, organization: string,
              protected allowedTeamSlugs: string[]) {
    assertNotMissingOrEmpty('secret', secret);
    assertNotMissingOrEmpty('githubToken', githubToken);
    assertNotMissingOrEmpty('repoSlug', repoSlug);
    assertNotMissingOrEmpty('organization', organization);
    assertNotMissingOrEmpty('allowedTeamSlugs', allowedTeamSlugs && allowedTeamSlugs.join(''));

    this.githubPullRequests = new GithubPullRequests(githubToken, repoSlug);
    this.githubTeams = new GithubTeams(githubToken, organization);
  }

  // Methods - Public
  public getPrAuthorTeamMembership(pr: number): Promise<{author: string, isMember: boolean}> {
    return Promise.resolve().
      then(() => this.githubPullRequests.fetch(pr)).
      then(prInfo => prInfo.user.login).
      then(author => this.githubTeams.isMemberBySlug(author, this.allowedTeamSlugs).
        then(isMember => ({author, isMember})));
  }

  public verify(expectedPr: number, authHeader: string): Promise<void> {
    return Promise.resolve().
      then(() => this.extractJwtString(authHeader)).
      then(jwtString => this.verifyJwt(expectedPr, jwtString)).
      then(jwtPayload => this.verifyPr(jwtPayload['pull-request'])).
      catch(err => { throw new UploadError(403, `Error while verifying upload for PR ${expectedPr}: ${err}`); });
  }

  // Methods - Protected
  protected extractJwtString(input: string): string {
    return input.replace(/^token +/i, '');
  }

  protected verifyJwt(expectedPr: number, token: string): Promise<JwtPayload> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.secret, {issuer: 'Travis CI, GmbH'}, (err, payload) => {
        if (err) {
          reject(err.message || err);
        } else if (payload.slug !== this.repoSlug) {
          reject(`jwt slug invalid. expected: ${this.repoSlug}`);
        } else if (payload['pull-request'] !== expectedPr) {
          reject(`jwt pull-request invalid. expected: ${expectedPr}`);
        } else {
          resolve(payload);
        }
      });
    });
  }

  protected verifyPr(pr: number): Promise<void> {
    return this.getPrAuthorTeamMembership(pr).
      then(({author, isMember}) => isMember ? Promise.resolve() : Promise.reject(
        `User '${author}' is not an active member of any of the following teams: ` +
        `${this.allowedTeamSlugs.join(', ')}`,
      ));
  }
}
