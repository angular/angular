// Imports
import * as express from 'express';
import * as http from 'http';
import {GithubPullRequests} from '../common/github-pull-requests';
import {assertNotMissingOrEmpty} from '../common/utils';
import {BuildCreator} from './build-creator';
import {CreatedBuildEvent} from './build-events';
import {BuildVerifier} from './build-verifier';
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
  }: UploadServerConfig): http.Server {
    assertNotMissingOrEmpty('domainName', domainName);

    const buildVerifier = new BuildVerifier(secret, githubToken, repoSlug, githubOrganization, githubTeamSlugs);
    const buildCreator = this.createBuildCreator(buildsDir, githubToken, repoSlug, domainName);

    const middleware = this.createMiddleware(buildVerifier, buildCreator);
    const httpServer = http.createServer(middleware);

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

    buildCreator.on(CreatedBuildEvent.type, ({pr, sha}: CreatedBuildEvent) => {
      const body = `The angular.io preview for ${sha} is available [here][1].\n\n` +
                   `[1]: https://pr${pr}-${sha}.${domainName}/`;

      githubPullRequests.addComment(pr, body);
    });

    return buildCreator;
  }

  protected createMiddleware(buildVerifier: BuildVerifier, buildCreator: BuildCreator): express.Express {
    const middleware = express();

    middleware.get(/^\/create-build\/([1-9][0-9]*)\/([0-9a-f]{40})\/?$/, (req, res) => {
      const pr = req.params[0];
      const sha = req.params[1];
      const archive = req.header(X_FILE_HEADER);
      const authHeader = req.header(AUTHORIZATION_HEADER);

      if (!authHeader) {
        this.throwRequestError(401, `Missing or empty '${AUTHORIZATION_HEADER}' header`, req);
      } else if (!archive) {
        this.throwRequestError(400, `Missing or empty '${X_FILE_HEADER}' header`, req);
      }

      buildVerifier.
        verify(+pr, authHeader).
        then(() => buildCreator.create(pr, sha, archive)).
        then(() => res.sendStatus(201)).
        catch(err => this.respondWithError(res, err));
    });
    middleware.get(/^\/health-check\/?$/, (_req, res) => res.sendStatus(200));
    middleware.get('*', req => this.throwRequestError(404, 'Unknown resource', req));
    middleware.all('*', req => this.throwRequestError(405, 'Unsupported method', req));
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
    throw new UploadError(status, `${error} in request: ${req.method} ${req.originalUrl}`);
  }
}

// Exports
export const uploadServerFactory = new UploadServerFactory();
