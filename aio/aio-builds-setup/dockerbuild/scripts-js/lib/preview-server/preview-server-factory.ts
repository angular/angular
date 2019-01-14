// Imports
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as http from 'http';
import {AddressInfo} from 'net';
import {CircleCiApi} from '../common/circle-ci-api';
import {GithubApi} from '../common/github-api';
import {GithubPullRequests} from '../common/github-pull-requests';
import {GithubTeams} from '../common/github-teams';
import {assert, assertNotMissingOrEmpty, computeShortSha, Logger} from '../common/utils';
import {BuildCreator} from './build-creator';
import {ChangedPrVisibilityEvent, CreatedBuildEvent} from './build-events';
import {BuildRetriever} from './build-retriever';
import {BuildVerifier} from './build-verifier';
import {respondWithError, throwRequestError} from './utils';

const AIO_PREVIEW_JOB = 'aio_preview';

// Interfaces - Types
export interface PreviewServerConfig {
  downloadsDir: string;
  downloadSizeLimit: number;
  buildArtifactPath: string;
  buildsDir: string;
  domainName: string;
  githubOrg: string;
  githubRepo: string;
  githubTeamSlugs: string[];
  circleCiToken: string;
  githubToken: string;
  significantFilesPattern: string;
  trustedPrLabel: string;
}

const logger = new Logger('PreviewServer');

// Classes
export class PreviewServerFactory {
  // Methods - Public
  public static create(cfg: PreviewServerConfig): http.Server {
    assertNotMissingOrEmpty('domainName', cfg.domainName);

    const circleCiApi = new CircleCiApi(cfg.githubOrg, cfg.githubRepo, cfg.circleCiToken);
    const githubApi = new GithubApi(cfg.githubToken);
    const prs = new GithubPullRequests(githubApi, cfg.githubOrg, cfg.githubRepo);
    const teams = new GithubTeams(githubApi, cfg.githubOrg);

    const buildRetriever = new BuildRetriever(circleCiApi, cfg.downloadSizeLimit, cfg.downloadsDir);
    const buildVerifier = new BuildVerifier(prs, teams, cfg.githubTeamSlugs, cfg.trustedPrLabel);
    const buildCreator = PreviewServerFactory.createBuildCreator(prs, cfg.buildsDir, cfg.domainName);

    const middleware = PreviewServerFactory.createMiddleware(buildRetriever, buildVerifier, buildCreator, cfg);
    const httpServer = http.createServer(middleware as any);

    httpServer.on('listening', () => {
      const info = httpServer.address() as AddressInfo;
      logger.info(`Up and running (and listening on ${info.address}:${info.port})...`);
    });

    return httpServer;
  }

  public static createMiddleware(buildRetriever: BuildRetriever, buildVerifier: BuildVerifier,
                                 buildCreator: BuildCreator, cfg: PreviewServerConfig): express.Express {
    const middleware = express();
    const jsonParser = bodyParser.json();
    const significantFilesRe = new RegExp(cfg.significantFilesPattern);

    // RESPOND TO IS-ALIVE PING
    middleware.get(/^\/health-check\/?$/, (_req, res) => res.sendStatus(200));

    // RESPOND TO CAN-HAVE-PUBLIC-PREVIEW CHECK
    const canHavePublicPreviewRe = /^\/can-have-public-preview\/(\d+)\/?$/;
    middleware.get(canHavePublicPreviewRe, async (req, res) => {
      try {
        const pr = +canHavePublicPreviewRe.exec(req.url)![1];

        if (!await buildVerifier.getSignificantFilesChanged(pr, significantFilesRe)) {
          // Cannot have preview: PR did not touch relevant files: `aio/` or `packages/` (except for spec files).
          res.send({canHavePublicPreview: false, reason: 'No significant files touched.'});
          logger.log(`PR:${pr} - Cannot have a public preview, because it did not touch any significant files.`);
        } else if (!await buildVerifier.getPrIsTrusted(pr)) {
          // Cannot have preview: PR not automatically verifiable as "trusted".
          res.send({canHavePublicPreview: false, reason: 'Not automatically verifiable as "trusted".'});
          logger.log(`PR:${pr} - Cannot have a public preview, because not automatically verifiable as "trusted".`);
        } else {
          // Can have preview.
          res.send({canHavePublicPreview: true, reason: null});
          logger.log(`PR:${pr} - Can have a public preview.`);
        }
      } catch (err) {
        logger.error('Previewability check error', err);
        respondWithError(res, err);
      }
    });

    // CIRCLE_CI BUILD COMPLETE WEBHOOK
    middleware.post(/^\/circle-build\/?$/, jsonParser, async (req, res) => {
      try {
        if (!(
          req.is('json') &&
          req.body &&
          req.body.payload &&
          req.body.payload.build_num > 0 &&
          req.body.payload.build_parameters &&
          req.body.payload.build_parameters.CIRCLE_JOB
        )) {
          throwRequestError(400, `Incorrect body content. Expected JSON`, req);
        }

        const job = req.body.payload.build_parameters.CIRCLE_JOB;
        const buildNum = req.body.payload.build_num;

        logger.log(`Build:${buildNum}, Job:${job} - processing web-hook trigger`);

        if (job !== AIO_PREVIEW_JOB) {
          res.sendStatus(204);
          logger.log(`Build:${buildNum}, Job:${job} -`,
                     `Skipping preview processing because this is not the "${AIO_PREVIEW_JOB}" job.`);
          return;
        }

        const { pr, sha, org, repo, success } = await buildRetriever.getGithubInfo(buildNum);

        if (!success) {
          res.sendStatus(204);
          logger.log(`PR:${pr}, Build:${buildNum} - Skipping preview processing because this build did not succeed.`);
          return;
        }

        assert(cfg.githubOrg === org,
          `Invalid webhook: expected "githubOrg" property to equal "${cfg.githubOrg}" but got "${org}".`);
        assert(cfg.githubRepo === repo,
          `Invalid webhook: expected "githubRepo" property to equal "${cfg.githubRepo}" but got "${repo}".`);

        // Do not deploy unless this PR has touched relevant files: `aio/` or `packages/` (except for spec files)
        if (!await buildVerifier.getSignificantFilesChanged(pr, significantFilesRe)) {
          res.sendStatus(204);
          logger.log(`PR:${pr}, Build:${buildNum} - ` +
                     `Skipping preview processing because this PR did not touch any significant files.`);
          return;
        }

        const artifactPath = await buildRetriever.downloadBuildArtifact(buildNum, pr, sha, cfg.buildArtifactPath);
        const isPublic = await buildVerifier.getPrIsTrusted(pr);
        await buildCreator.create(pr, sha, artifactPath, isPublic);

        res.sendStatus(isPublic ? 201 : 202);
        logger.log(`PR:${pr}, SHA:${computeShortSha(sha)}, Build:${buildNum} - ` +
                   `Successfully created ${isPublic ? 'public' : 'non-public'} preview.`);
      } catch (err) {
        logger.error('CircleCI webhook error', err);
        respondWithError(res, err);
      }
    });

    // GITHUB PR UPDATED WEBHOOK
    middleware.post(/^\/pr-updated\/?$/, jsonParser, async (req, res) => {
      const { action, number: prNo }: { action?: string, number?: number } = req.body;
      const visMayHaveChanged = !action || (action === 'labeled') || (action === 'unlabeled');

      try {
        if (!visMayHaveChanged) {
          res.sendStatus(200);
        } else if (!prNo) {
          throwRequestError(400, `Missing or empty 'number' field`, req);
        } else {
          const isPublic = await buildVerifier.getPrIsTrusted(prNo);
          await buildCreator.updatePrVisibility(prNo, isPublic);
          res.sendStatus(200);
        }
      } catch (err) {
        logger.error('PR update hook error', err);
        respondWithError(res, err);
      }
    });

    // ALL OTHER REQUESTS
    middleware.all('*', req => throwRequestError(404, 'Unknown resource', req));
    middleware.use((err: any, _req: any, res: express.Response, _next: any) => {
      const statusText = http.STATUS_CODES[err.status] || '???';
      logger.error(`Preview server error: ${err.status} - ${statusText}:`, err.message);
      respondWithError(res, err);
    });

    return middleware;
  }

  public static createBuildCreator(prs: GithubPullRequests, buildsDir: string, domainName: string): BuildCreator {
    const buildCreator = new BuildCreator(buildsDir);
    const postPreviewsComment = (pr: number, shas: string[]) => {
      const body = shas.
        map(sha => `You can preview ${sha} at https://pr${pr}-${sha}.${domainName}/.`).
        join('\n');

      return prs.addComment(pr, body);
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
}
