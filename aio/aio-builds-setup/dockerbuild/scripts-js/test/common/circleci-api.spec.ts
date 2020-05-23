import * as nock from 'nock';
import {CircleCiApi} from '../../lib/common/circle-ci-api';

const ORG = 'testorg';
const REPO = 'testrepo';
const TOKEN = 'xxxx';
const BASE_URL = `https://circleci.com/api/v1.1/project/github/${ORG}/${REPO}`;

describe('CircleCIApi', () => {
  describe('constructor()', () => {
    it('should throw if \'githubOrg\' is missing or empty', () => {
      expect(() => new CircleCiApi('', REPO, TOKEN)).
        toThrowError('Missing or empty required parameter \'githubOrg\'!');
    });

    it('should throw if \'githubRepo\' is missing or empty', () => {
      expect(() => new CircleCiApi(ORG, '', TOKEN)).
        toThrowError('Missing or empty required parameter \'githubRepo\'!');
    });

    it('should throw if \'circleCiToken\' is missing or empty', () => {
      expect(() => new CircleCiApi(ORG, REPO, '')).
        toThrowError('Missing or empty required parameter \'circleCiToken\'!');
    });
  });

  describe('getBuildInfo', () => {
    it('should make a request to the CircleCI API for the given build number', async () => {
      const api = new CircleCiApi(ORG, REPO, TOKEN);
      const buildNum = 12345;
      const expectedBuildInfo: any = { org: ORG, repo: REPO, build_num: buildNum };

      const request = nock(BASE_URL)
        .get(`/${buildNum}?circle-token=${TOKEN}`)
        .reply(200, expectedBuildInfo);

      const buildInfo = await api.getBuildInfo(buildNum);
      expect(buildInfo).toEqual(expectedBuildInfo);
      request.done();
    });

    it('should throw an error if the request fails', async () => {
      const api = new CircleCiApi(ORG, REPO, TOKEN);
      const buildNum = 12345;
      const errorMessage = 'Invalid request';
      const request = nock(BASE_URL).get(`/${buildNum}?circle-token=${TOKEN}`);

      request.replyWithError(errorMessage);
      await expectAsync(api.getBuildInfo(buildNum)).toBeRejectedWithError(
          `CircleCI build info request failed ` +
          `(request to ${BASE_URL}/${buildNum}?circle-token=${TOKEN} failed, reason: ${errorMessage})`);

      request.reply(404, errorMessage);
      await expectAsync(api.getBuildInfo(buildNum)).toBeRejectedWithError(
          `CircleCI build info request failed ` +
          `(request to ${BASE_URL}/${buildNum}?circle-token=${TOKEN} failed, reason: ${errorMessage})`);
    });
  });

  describe('getBuildArtifactUrl', () => {
    it('should make a request to the CircleCI API for the given build number', async () => {
      const api = new CircleCiApi(ORG, REPO, TOKEN);
      const buildNum = 12345;
      const artifact0: any = { path: 'some/path/0', url: 'https://url/0' };
      const artifact1: any = { path: 'some/path/1', url: 'https://url/1' };
      const artifact2: any = { path: 'some/path/2', url: 'https://url/2' };
      const request = nock(BASE_URL)
        .get(`/${buildNum}/artifacts?circle-token=${TOKEN}`)
        .reply(200, [artifact0, artifact1, artifact2]);

      await expectAsync(api.getBuildArtifactUrl(buildNum, 'some/path/1')).toBeResolvedTo('https://url/1');
      request.done();
    });


    it('should throw an error if the request fails', async () => {
      const api = new CircleCiApi(ORG, REPO, TOKEN);
      const buildNum = 12345;
      const errorMessage = 'Invalid request';
      const request = nock(BASE_URL).get(`/${buildNum}/artifacts?circle-token=${TOKEN}`);

      request.replyWithError(errorMessage);
      await expectAsync(api.getBuildArtifactUrl(buildNum, 'some/path/1')).toBeRejectedWithError(
          `CircleCI artifact URL request failed ` +
          `(request to ${BASE_URL}/${buildNum}/artifacts?circle-token=${TOKEN} failed, reason: ${errorMessage})`);

      request.reply(404, errorMessage);
      await expectAsync(api.getBuildArtifactUrl(buildNum, 'some/path/1')).toBeRejectedWithError(
          `CircleCI artifact URL request failed ` +
          `(request to ${BASE_URL}/${buildNum}/artifacts?circle-token=${TOKEN} failed, reason: ${errorMessage})`);
    });

    it('should throw an error if the response does not contain the specified artifact', async () => {
      const api = new CircleCiApi(ORG, REPO, TOKEN);
      const buildNum = 12345;
      const artifact0: any = { path: 'some/path/0', url: 'https://url/0' };
      const artifact1: any = { path: 'some/path/1', url: 'https://url/1' };
      const artifact2: any = { path: 'some/path/2', url: 'https://url/2' };
      nock(BASE_URL)
        .get(`/${buildNum}/artifacts?circle-token=${TOKEN}`)
        .reply(200, [artifact0, artifact1, artifact2]);

      await expectAsync(api.getBuildArtifactUrl(buildNum, 'some/path/3')).toBeRejectedWithError(
          `CircleCI artifact URL request failed ` +
          `(Missing artifact (some/path/3) for CircleCI build: ${buildNum})`);
    });
  });
});
