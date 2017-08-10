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

// Enums
export enum BUILD_VERIFICATION_STATUS {
  verifiedAndTrusted,
  verifiedNotTrusted,
}

// Classes
export class BuildVerifier {
  // Properties - Protected
  protected githubPullRequests: GithubPullRequests;
  protected githubTeams: GithubTeams;

  // Constructor
  constructor(protected secret: string, githubToken: string, protected repoSlug: string, organization: string,
              protected allowedTeamSlugs: string[], protected trustedPrLabel: string) {
    assertNotMissingOrEmpty('secret', secret);
    assertNotMissingOrEmpty('githubToken', githubToken);
    assertNotMissingOrEmpty('repoSlug', repoSlug);
    assertNotMissingOrEmpty('organization', organization);
    assertNotMissingOrEmpty('allowedTeamSlugs', allowedTeamSlugs && allowedTeamSlugs.join(''));
    assertNotMissingOrEmpty('trustedPrLabel', trustedPrLabel);

    this.githubPullRequests = new GithubPullRequests(githubToken, repoSlug);
    this.githubTeams = new GithubTeams(githubToken, organization);
  }

  // Methods - Public
  public getPrIsTrusted(pr: number): Promise<boolean> {
    return Promise.resolve().
      then(() => this.githubPullRequests.fetch(pr)).
      then(prInfo => this.hasLabel(prInfo, this.trustedPrLabel) ||
                     this.githubTeams.isMemberBySlug(prInfo.user.login, this.allowedTeamSlugs));
  }

  public verify(expectedPr: number, authHeader: string): Promise<BUILD_VERIFICATION_STATUS> {
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

  protected hasLabel(prInfo: PullRequest, label: string) {
    return prInfo.labels.some(labelObj => labelObj.name === label);
  }

  protected verifyJwt(expectedPr: number, token: string): Promise<JwtPayload> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, this.secret, {issuer: 'Travis CI, GmbH'}, (err, payload: JwtPayload) => {
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

  protected verifyPr(pr: number): Promise<BUILD_VERIFICATION_STATUS> {
    return this.getPrIsTrusted(pr).
      then(isTrusted => Promise.resolve(isTrusted ?
          BUILD_VERIFICATION_STATUS.verifiedAndTrusted :
          BUILD_VERIFICATION_STATUS.verifiedNotTrusted));
  }
}
