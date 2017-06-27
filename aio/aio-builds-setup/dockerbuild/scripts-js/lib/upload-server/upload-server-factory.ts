// Imports
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as http from 'http';
import {GithubPullRequests} from '../common/github-pull-requests';
import {assertNotMissingOrEmpty} from '../common/utils';
import {BuildCreator} from './build-creator';
import {ChangedPrVisibilityEvent, CreatedBuildEvent} from './build-events';
import {BUILD_VERIFICATION_STATUS, BuildVerifier} from './build-verifier';
import {UploadError} from './upload-error';

// Constants
const AUTHORIZATION_HEADER = 'AUTHORIZATION';
const X_FILE_HEADER = 'X-FILE';

// Interfaces - Types
interface UploadServerConfig {
  buildsDir: string;
  domainName: string;
  githubOrganization: string;
  githubTeamSlugs: string[];
  githubToken: string;
  repoSlug: string;
  secret: string;
  trustedPrLabel: string;
}

// Classes
class UploadServerFactory {
  // Methods - Public
  public create({
    buildsDir,
    domainName,
    githubOrganization,
    githubTeamSlugs,
    githubToken,
    repoSlug,
    secret,
    trustedPrLabel,
  }: UploadServerConfig): http.Server {
    assertNotMissingOrEmpty('domainName', domainName);

    const buildVerifier = new BuildVerifier(secret, githubToken, repoSlug, githubOrganization, githubTeamSlugs,
                                            trustedPrLabel);
    const buildCreator = this.createBuildCreator(buildsDir, githubToken, repoSlug, domainName);

    const middleware = this.createMiddleware(buildVerifier, buildCreator);
    const httpServer = http.createServer(middleware as any);

    httpServer.on('listening', () => {
      const info = httpServer.address();
      console.info(`Up and running (and listening on ${info.address}:${info.port})...`);
    });

    return httpServer;
  }

  // Methods - Protected
  protected createBuildCreator(buildsDir: string, githubToken: string, repoSlug: string,
                               domainName: string): BuildCreator {
    const buildCreator = new BuildCreator(buildsDir);
    const githubPullRequests = new GithubPullRequests(githubToken, repoSlug);
    const postPreviewsComment = (pr: number, shas: string[]) => {
      const body = shas.
        map(sha => `You can preview ${sha} at https://pr${pr}-${sha}.${domainName}/.`).
        join('\n');

      return githubPullRequests.addComment(pr, body);
    };

    buildCreator.on(CreatedBuildEvent.type, ({pr, sha, isPublic}: CreatedBuildEvent) => {
      if (isPublic) {
        postPreviewsComment(pr, [sha]);
      }
    });

    buildCreator.on(ChangedPrVisibilityEvent.type, ({pr, shas, isPublic}: ChangedPrVisibilityEvent) => {
      if (isPublic && shas.length) {
        postPreviewsComment(pr, shas);
      }
    });

    return buildCreator;
  }

  protected createMiddleware(buildVerifier: BuildVerifier, buildCreator: BuildCreator): express.Express {
    const middleware = express();
    const jsonParser = bodyParser.json();

    middleware.get(/^\/create-build\/([1-9][0-9]*)\/([0-9a-f]{40})\/?$/, (req, res) => {
      const pr = req.params[0];
      const sha = req.params[1];
      const archive = req.header(X_FILE_HEADER);
      const authHeader = req.header(AUTHORIZATION_HEADER);

      if (!authHeader) {
        this.throwRequestError(401, `Missing or empty '${AUTHORIZATION_HEADER}' header`, req);
      } else if (!archive) {
        this.throwRequestError(400, `Missing or empty '${X_FILE_HEADER}' header`, req);
      } else {
        Promise.resolve().
          then(() => buildVerifier.verify(+pr, authHeader)).
          then(verStatus => verStatus === BUILD_VERIFICATION_STATUS.verifiedAndTrusted).
          then(isPublic => buildCreator.create(pr, sha, archive, isPublic).
            then(() => res.sendStatus(isPublic ? 201 : 202))).
          catch(err => this.respondWithError(res, err));
      }
    });
    middleware.get(/^\/health-check\/?$/, (_req, res) => res.sendStatus(200));
    middleware.post(/^\/pr-updated\/?$/, jsonParser, (req, res) => {
      const {action, number: prNo}: {action?: string, number?: number} = req.body;
      const visMayHaveChanged = !action || (action === 'labeled') || (action === 'unlabeled');

      if (!visMayHaveChanged) {
        res.sendStatus(200);
      } else if (!prNo) {
        this.throwRequestError(400, `Missing or empty 'number' field`, req);
      } else {
        Promise.resolve().
          then(() => buildVerifier.getPrIsTrusted(prNo)).
          then(isPublic => buildCreator.updatePrVisibility(String(prNo), isPublic)).
          then(() => res.sendStatus(200)).
          catch(err => this.respondWithError(res, err));
      }
    });
    middleware.all('*', req => this.throwRequestError(404, 'Unknown resource', req));
    middleware.use((err: any, _req: any, res: express.Response, _next: any) => this.respondWithError(res, err));

    return middleware;
  }

  protected respondWithError(res: express.Response, err: any) {
    if (!(err instanceof UploadError)) {
      err = new UploadError(500, String((err && err.message) || err));
    }

    const statusText = http.STATUS_CODES[err.status] || '???';
    console.error(`Upload error: ${err.status} - ${statusText}`);
    console.error(err.message);

    res.status(err.status).end(err.message);
  }

  protected throwRequestError(status: number, error: string, req: express.Request) {
    const message = `${error} in request: ${req.method} ${req.originalUrl}` +
                    (!req.body ? '' : ` ${JSON.stringify(req.body)}`);

    throw new UploadError(status, message);
  }
}

// Exports
export const uploadServerFactory = new UploadServerFactory();
