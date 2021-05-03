/* tslint:disable:max-line-length */
import * as nock from 'nock';
import * as tar from 'tar-stream';
import {gzipSync} from 'zlib';
import {getEnvVar, Logger} from '../common/utils';
import {BuildNums, PrNums, SHA} from './constants';

// We are using the `nock` library to fake responses from REST requests, when testing.
// This is necessary, because the test preview-server runs as a separate node process to
// the test harness, so we do not have direct access to the code (e.g. for mocking).
// (See also 'lib/verify-setup/start-test-preview-server.ts'.)

// Each of the potential requests to an external API (e.g. Github or CircleCI) are mocked
// below and return a suitable response. This is quite complicated to setup since the
// response from, say, CircleCI will affect what request is made to, say, Github.

const logger = new Logger('mock-external-apis');

const AIO_CIRCLE_CI_TOKEN = getEnvVar('AIO_CIRCLE_CI_TOKEN');
const AIO_GITHUB_TOKEN = getEnvVar('AIO_GITHUB_TOKEN');

const AIO_ARTIFACT_PATH = getEnvVar('AIO_ARTIFACT_PATH');
const AIO_GITHUB_ORGANIZATION = getEnvVar('AIO_GITHUB_ORGANIZATION');
const AIO_GITHUB_REPO = getEnvVar('AIO_GITHUB_REPO');
const AIO_TRUSTED_PR_LABEL = getEnvVar('AIO_TRUSTED_PR_LABEL');
const AIO_GITHUB_TEAM_SLUGS = getEnvVar('AIO_GITHUB_TEAM_SLUGS').split(',');

const ACTIVE_TRUSTED_USER = 'active-trusted-user';
const INACTIVE_TRUSTED_USER = 'inactive-trusted-user';
const UNTRUSTED_USER = 'untrusted-user';

const BASIC_BUILD_INFO = {
  branch: `pull/${PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER}`,
  failed: false,
  reponame: AIO_GITHUB_REPO,
  username: AIO_GITHUB_ORGANIZATION,
  vcs_revision: SHA,
};

const ISSUE_INFO_TRUSTED_LABEL = { labels: [{ name: AIO_TRUSTED_PR_LABEL }], user: { login: UNTRUSTED_USER } };
const ISSUE_INFO_ACTIVE_TRUSTED_USER = { labels: [], user: { login: ACTIVE_TRUSTED_USER } };
const ISSUE_INFO_INACTIVE_TRUSTED_USER = { labels: [], user: { login: INACTIVE_TRUSTED_USER } };
const ISSUE_INFO_UNTRUSTED = { labels: [], user: { login: UNTRUSTED_USER } };
const ACTIVE_STATE = { state: 'active' };
const INACTIVE_STATE = { state: 'inactive' };

const TEST_TEAM_INFO = AIO_GITHUB_TEAM_SLUGS.map((slug, index) => ({ slug, id: index }));

const CIRCLE_CI_API_HOST = 'https://circleci.com';
const CIRCLE_CI_TOKEN_PARAM = `circle-token=${AIO_CIRCLE_CI_TOKEN}`;
const ARTIFACT_1 = { path: 'artifact-1', url: `${CIRCLE_CI_API_HOST}/artifacts/artifact-1`, _urlPath: '/artifacts/artifact-1' };
const ARTIFACT_2 = { path: 'artifact-2', url: `${CIRCLE_CI_API_HOST}/artifacts/artifact-2`, _urlPath: '/artifacts/artifact-2' };
const ARTIFACT_3 = { path: 'artifact-3', url: `${CIRCLE_CI_API_HOST}/artifacts/artifact-3`, _urlPath: '/artifacts/artifact-3' };
const ARTIFACT_ERROR = { path: AIO_ARTIFACT_PATH, url: `${CIRCLE_CI_API_HOST}/artifacts/error`, _urlPath: '/artifacts/error' };
const ARTIFACT_404 = { path: AIO_ARTIFACT_PATH, url: `${CIRCLE_CI_API_HOST}/artifacts/404`, _urlPath: '/artifacts/404' };
const ARTIFACT_VALID_TRUSTED_USER = { path: AIO_ARTIFACT_PATH, url: `${CIRCLE_CI_API_HOST}/artifacts/valid/user`, _urlPath: '/artifacts/valid/user' };
const ARTIFACT_VALID_TRUSTED_LABEL = { path: AIO_ARTIFACT_PATH, url: `${CIRCLE_CI_API_HOST}/artifacts/valid/label`, _urlPath: '/artifacts/valid/label' };
const ARTIFACT_VALID_UNTRUSTED = { path: AIO_ARTIFACT_PATH, url: `${CIRCLE_CI_API_HOST}/artifacts/valid/untrusted`, _urlPath: '/artifacts/valid/untrusted' };

const CIRCLE_CI_BUILD_INFO_URL = `/api/v1.1/project/github/${AIO_GITHUB_ORGANIZATION}/${AIO_GITHUB_REPO}`;

const buildInfoUrl = (buildNum: number) => `${CIRCLE_CI_BUILD_INFO_URL}/${buildNum}?${CIRCLE_CI_TOKEN_PARAM}`;
const buildArtifactsUrl = (buildNum: number) => `${CIRCLE_CI_BUILD_INFO_URL}/${buildNum}/artifacts?${CIRCLE_CI_TOKEN_PARAM}`;
const buildInfo = (prNum: number) => ({ ...BASIC_BUILD_INFO, branch: `pull/${prNum}` });

const GITHUB_API_HOST = 'https://api.github.com';
const GITHUB_ISSUES_URL = `/repos/${AIO_GITHUB_ORGANIZATION}/${AIO_GITHUB_REPO}/issues`;
const GITHUB_PULLS_URL = `/repos/${AIO_GITHUB_ORGANIZATION}/${AIO_GITHUB_REPO}/pulls`;
const GITHUB_TEAMS_URL = `/orgs/${AIO_GITHUB_ORGANIZATION}/teams`;

const getIssueUrl = (prNum: number) => `${GITHUB_ISSUES_URL}/${prNum}`;
const getFilesUrl = (prNum: number, pageNum = 1) => `${GITHUB_PULLS_URL}/${prNum}/files?page=${pageNum}&per_page=100`;
const getCommentUrl = (prNum: number) => `${getIssueUrl(prNum)}/comments`;
const getTeamMembershipUrl = (teamId: number, username: string) => `/teams/${teamId}/memberships/${username}`;

const createArchive = (buildNum: number, prNum: number, sha: string) => {
  logger.log('createArchive', buildNum, prNum, sha);
  const pack = tar.pack();
  pack.entry({name: 'index.html'}, `BUILD: ${buildNum} | PR: ${prNum} | SHA: ${sha} | File: /index.html`);
  pack.entry({name: 'foo/bar.js'}, `BUILD: ${buildNum} | PR: ${prNum} | SHA: ${sha} | File: /foo/bar.js`);
  pack.finalize();
  const zip = gzipSync(pack.read());
  return zip;
};

// Create request scopes
const circleCiApi = nock(CIRCLE_CI_API_HOST).persist();
const githubApi = nock(GITHUB_API_HOST).persist().matchHeader('Authorization', `token ${AIO_GITHUB_TOKEN}`);

//////////////////////////////

// GENERAL responses
githubApi.get(GITHUB_TEAMS_URL + '?page=1&per_page=100').reply(200, TEST_TEAM_INFO);
githubApi.post(getCommentUrl(PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER)).reply(200);

// BUILD_INFO errors
circleCiApi.get(buildInfoUrl(BuildNums.BUILD_INFO_ERROR)).replyWithError('BUILD_INFO_ERROR');
circleCiApi.get(buildInfoUrl(BuildNums.BUILD_INFO_404)).reply(404, 'BUILD_INFO_404');
circleCiApi.get(buildInfoUrl(BuildNums.BUILD_INFO_BUILD_FAILED)).reply(200, { ...BASIC_BUILD_INFO, failed: true });
circleCiApi.get(buildInfoUrl(BuildNums.BUILD_INFO_INVALID_GH_ORG)).reply(200, { ...BASIC_BUILD_INFO, username: 'bad' });
circleCiApi.get(buildInfoUrl(BuildNums.BUILD_INFO_INVALID_GH_REPO)).reply(200, { ...BASIC_BUILD_INFO, reponame: 'bad' });

// CHANGED FILE errors
circleCiApi.get(buildInfoUrl(BuildNums.CHANGED_FILES_ERROR)).reply(200, buildInfo(PrNums.CHANGED_FILES_ERROR));
githubApi.get(getFilesUrl(PrNums.CHANGED_FILES_ERROR)).replyWithError('CHANGED_FILES_ERROR');
circleCiApi.get(buildInfoUrl(BuildNums.CHANGED_FILES_404)).reply(200, buildInfo(PrNums.CHANGED_FILES_404));
githubApi.get(getFilesUrl(PrNums.CHANGED_FILES_404)).reply(404, 'CHANGED_FILES_404');
circleCiApi.get(buildInfoUrl(BuildNums.CHANGED_FILES_NONE)).reply(200, buildInfo(PrNums.CHANGED_FILES_NONE));
githubApi.get(getFilesUrl(PrNums.CHANGED_FILES_NONE)).reply(200, []);

// ARTIFACT URL errors
circleCiApi.get(buildInfoUrl(BuildNums.BUILD_ARTIFACTS_ERROR)).reply(200, buildInfo(PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER));
circleCiApi.get(buildArtifactsUrl(BuildNums.BUILD_ARTIFACTS_ERROR)).replyWithError('BUILD_ARTIFACTS_ERROR');
circleCiApi.get(buildInfoUrl(BuildNums.BUILD_ARTIFACTS_404)).reply(200, buildInfo(PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER));
circleCiApi.get(buildArtifactsUrl(BuildNums.BUILD_ARTIFACTS_404)).reply(404, 'BUILD_ARTIFACTS_ERROR');
circleCiApi.get(buildInfoUrl(BuildNums.BUILD_ARTIFACTS_EMPTY)).reply(200, buildInfo(PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER));
circleCiApi.get(buildArtifactsUrl(BuildNums.BUILD_ARTIFACTS_EMPTY)).reply(200, []);
circleCiApi.get(buildInfoUrl(BuildNums.BUILD_ARTIFACTS_MISSING)).reply(200, buildInfo(PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER));
circleCiApi.get(buildArtifactsUrl(BuildNums.BUILD_ARTIFACTS_MISSING)).reply(200, [ARTIFACT_1, ARTIFACT_2, ARTIFACT_3]);

// ARTIFACT DOWNLOAD errors
circleCiApi.get(buildInfoUrl(BuildNums.DOWNLOAD_ARTIFACT_ERROR)).reply(200, buildInfo(PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER));
circleCiApi.get(buildArtifactsUrl(BuildNums.DOWNLOAD_ARTIFACT_ERROR)).reply(200, [ARTIFACT_ERROR]);
circleCiApi.get(ARTIFACT_ERROR._urlPath).replyWithError(ARTIFACT_ERROR._urlPath);
circleCiApi.get(buildInfoUrl(BuildNums.DOWNLOAD_ARTIFACT_404)).reply(200, buildInfo(PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER));
circleCiApi.get(buildArtifactsUrl(BuildNums.DOWNLOAD_ARTIFACT_404)).reply(200, [ARTIFACT_404]);
circleCiApi.get(ARTIFACT_ERROR._urlPath).reply(404, ARTIFACT_ERROR._urlPath);

// TRUST CHECK errors
circleCiApi.get(buildInfoUrl(BuildNums.TRUST_CHECK_ERROR)).reply(200, buildInfo(PrNums.TRUST_CHECK_ERROR));
githubApi.get(getFilesUrl(PrNums.TRUST_CHECK_ERROR)).reply(200, [{ filename: 'aio/a' }]);
circleCiApi.get(buildArtifactsUrl(BuildNums.TRUST_CHECK_ERROR)).reply(200, [ARTIFACT_VALID_TRUSTED_USER]);
githubApi.get(getIssueUrl(PrNums.TRUST_CHECK_ERROR)).replyWithError('TRUST_CHECK_ERROR');

// ACTIVE TRUSTED USER response
circleCiApi.get(buildInfoUrl(BuildNums.TRUST_CHECK_ACTIVE_TRUSTED_USER)).reply(200, BASIC_BUILD_INFO);
githubApi.get(getFilesUrl(PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER)).reply(200, [{ filename: 'aio/a' }]);
circleCiApi.get(buildArtifactsUrl(BuildNums.TRUST_CHECK_ACTIVE_TRUSTED_USER)).reply(200, [ARTIFACT_VALID_TRUSTED_USER]);
circleCiApi.get(ARTIFACT_VALID_TRUSTED_USER._urlPath).reply(200, createArchive(BuildNums.TRUST_CHECK_ACTIVE_TRUSTED_USER, PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER, SHA));
githubApi.get(getIssueUrl(PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER)).reply(200, ISSUE_INFO_ACTIVE_TRUSTED_USER);
githubApi.get(getTeamMembershipUrl(0, ACTIVE_TRUSTED_USER)).reply(200, ACTIVE_STATE);

// TRUSTED LABEL response
circleCiApi.get(buildInfoUrl(BuildNums.TRUST_CHECK_TRUSTED_LABEL)).reply(200, BASIC_BUILD_INFO);
githubApi.get(getFilesUrl(PrNums.TRUST_CHECK_TRUSTED_LABEL)).reply(200, [{ filename: 'aio/a' }]);
circleCiApi.get(buildArtifactsUrl(BuildNums.TRUST_CHECK_TRUSTED_LABEL)).reply(200, [ARTIFACT_VALID_TRUSTED_LABEL]);
circleCiApi.get(ARTIFACT_VALID_TRUSTED_LABEL._urlPath).reply(200, createArchive(BuildNums.TRUST_CHECK_TRUSTED_LABEL, PrNums.TRUST_CHECK_TRUSTED_LABEL, SHA));
githubApi.get(getIssueUrl(PrNums.TRUST_CHECK_TRUSTED_LABEL)).reply(200, ISSUE_INFO_TRUSTED_LABEL);
githubApi.get(getTeamMembershipUrl(0, ACTIVE_TRUSTED_USER)).reply(200, ACTIVE_STATE);

// INACTIVE TRUSTED USER response
circleCiApi.get(buildInfoUrl(BuildNums.TRUST_CHECK_INACTIVE_TRUSTED_USER)).reply(200, BASIC_BUILD_INFO);
githubApi.get(getFilesUrl(PrNums.TRUST_CHECK_INACTIVE_TRUSTED_USER)).reply(200, [{ filename: 'aio/a' }]);
circleCiApi.get(buildArtifactsUrl(BuildNums.TRUST_CHECK_INACTIVE_TRUSTED_USER)).reply(200, [ARTIFACT_VALID_TRUSTED_USER]);
githubApi.get(getIssueUrl(PrNums.TRUST_CHECK_INACTIVE_TRUSTED_USER)).reply(200, ISSUE_INFO_INACTIVE_TRUSTED_USER);
githubApi.get(getTeamMembershipUrl(0, INACTIVE_TRUSTED_USER)).reply(200, INACTIVE_STATE);

// UNTRUSTED reponse
circleCiApi.get(buildInfoUrl(BuildNums.TRUST_CHECK_UNTRUSTED)).reply(200, buildInfo(PrNums.TRUST_CHECK_UNTRUSTED));
githubApi.get(getFilesUrl(PrNums.TRUST_CHECK_UNTRUSTED)).reply(200, [{ filename: 'aio/a' }]);
circleCiApi.get(buildArtifactsUrl(BuildNums.TRUST_CHECK_UNTRUSTED)).reply(200, [ARTIFACT_VALID_UNTRUSTED]);
circleCiApi.get(ARTIFACT_VALID_UNTRUSTED._urlPath).reply(200, createArchive(BuildNums.TRUST_CHECK_UNTRUSTED, PrNums.TRUST_CHECK_UNTRUSTED, SHA));
githubApi.get(getIssueUrl(PrNums.TRUST_CHECK_UNTRUSTED)).reply(200, ISSUE_INFO_UNTRUSTED);
githubApi.get(getTeamMembershipUrl(0, UNTRUSTED_USER)).reply(404);
