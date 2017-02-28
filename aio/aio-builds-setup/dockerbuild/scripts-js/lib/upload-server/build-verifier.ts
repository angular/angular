// Imports
import * as jwt from 'jsonwebtoken';
import {GithubPullRequests, PullRequest} from '../common/github-pull-requests';
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
  public verify(pr: number, authHeader: string): Promise<void> {
    return Promise.resolve().
      then(() => this.extractJwtString(authHeader)).
      then(jwtString => this.verifyJwt(pr, jwtString)).
      then(jwtPayload => this.fetchPr(jwtPayload['pull-request'])).
      then(prInfo => this.verifyPr(prInfo.user.login)).
      catch(err => { throw new UploadError(403, `Error while verifying upload for PR ${pr}: ${err}`); });
  }

  // Methods - Protected
  protected extractJwtString(input: string): string {
    return input.replace(/^token +/i, '');
  }

  protected fetchPr(pr: number): Promise<PullRequest> {
    return this.githubPullRequests.fetch(pr);
  }

  protected verifyJwt(pr: number, token: string): Promise<JwtPayload> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.secret, {issuer: 'Travis CI, GmbH'}, (err, payload) => {
        if (err) {
          reject(err.message || err);
        } else if (payload.slug !== this.repoSlug) {
          reject(`jwt slug invalid. expected: ${this.repoSlug}`);
        } else if (payload['pull-request'] !== pr) {
          reject(`jwt pull-request invalid. expected: ${pr}`);
        } else {
          resolve(payload);
        }
      });
    });
  }

  protected verifyPr(username: string): Promise<void> {
    const errorMessage = `User '${username}' is not an active member of any of: ` +
                         `${this.allowedTeamSlugs.join(', ')}`;

    return this.githubTeams.isMemberBySlug(username, this.allowedTeamSlugs).
      then(isMember => isMember ? Promise.resolve() : Promise.reject(errorMessage));
  }
}
