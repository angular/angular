import * as fs from 'fs';
import * as nock from 'nock';
import {resolve as resolvePath} from 'path';
import {BuildInfo, CircleCiApi} from '../../lib/common/circle-ci-api';
import {Logger} from '../../lib/common/utils';
import {BuildRetriever} from '../../lib/preview-server/build-retriever';

describe('BuildRetriever', () => {
  const MAX_DOWNLOAD_SIZE = 10000;
  const DOWNLOAD_DIR = resolvePath('/DOWNLOAD/DIR');
  const BASE_URL = 'http://test.com';
  const ARTIFACT_PATH = '/some/path/build.zip';

  let api: CircleCiApi;
  let BUILD_INFO: BuildInfo;
  let WRITEFILE_RESULT: any;
  let writeFileSpy: jasmine.Spy;
  let EXISTS_RESULT: boolean;
  let existsSpy: jasmine.Spy;
  let getBuildArtifactUrlSpy: jasmine.Spy;

  beforeEach(() => {
    BUILD_INFO = {
      branch: 'pull/777',
      build_num: 12345,
      failed: false,
      has_artifacts: true,
      outcome: 'success',
      reponame: 'REPO',
      username: 'ORG',
      vcs_revision: 'COMMIT',
    };

    api = new CircleCiApi('ORG', 'REPO', 'TOKEN');
    spyOn(api, 'getBuildInfo').and.resolveTo(BUILD_INFO);
    getBuildArtifactUrlSpy = spyOn(api, 'getBuildArtifactUrl').and.resolveTo(BASE_URL + ARTIFACT_PATH);

    WRITEFILE_RESULT = undefined;
    writeFileSpy = spyOn(fs, 'writeFile').and.callFake(
      ((_path: string, _buffer: Buffer, callback: fs.NoParamCallback) =>
        callback(WRITEFILE_RESULT)) as typeof fs.writeFile,
    );

    EXISTS_RESULT = false;
    existsSpy = spyOn(fs, 'exists').and.callFake(
      ((_path, callback) => callback(EXISTS_RESULT)) as typeof fs.exists,
    );
  });

  describe('constructor', () => {
    it('should fail if the "downloadSizeLimit" is invalid', () => {
      expect(() => new BuildRetriever(api, NaN, DOWNLOAD_DIR))
        .toThrowError(`Invalid parameter "downloadSizeLimit" should be a number greater than 0.`);
      expect(() => new BuildRetriever(api, 0, DOWNLOAD_DIR))
        .toThrowError(`Invalid parameter "downloadSizeLimit" should be a number greater than 0.`);
      expect(() => new BuildRetriever(api, -1, DOWNLOAD_DIR))
        .toThrowError(`Invalid parameter "downloadSizeLimit" should be a number greater than 0.`);
    });

    it('should fail if the "downloadDir" is missing', () => {
      expect(() => new BuildRetriever(api, MAX_DOWNLOAD_SIZE, ''))
        .toThrowError(`Missing or empty required parameter 'downloadDir'!`);
    });
  });


  describe('getGithubInfo', () => {
    it('should request the info from CircleCI', async () => {
      const retriever = new BuildRetriever(api, MAX_DOWNLOAD_SIZE, DOWNLOAD_DIR);
      const info = await retriever.getGithubInfo(12345);
      expect(api.getBuildInfo).toHaveBeenCalledWith(12345);
      expect(info).toEqual({org: 'ORG', pr: 777, repo: 'REPO', sha: 'COMMIT', success: true});
    });

    it('should error if it is not possible to extract the PR number from the branch', async () => {
      BUILD_INFO.branch = 'master';
      const retriever = new BuildRetriever(api, MAX_DOWNLOAD_SIZE, DOWNLOAD_DIR);

      await expectAsync(retriever.getGithubInfo(12345)).toBeRejectedWithError('No PR found in branch field: master');
    });
  });


  describe('downloadBuildArtifact', () => {
    const ARTIFACT_CONTENTS = 'ARTIFACT CONTENTS';
    let retriever: BuildRetriever;

    beforeEach(() => {
      spyOn(Logger.prototype, 'warn');
      retriever = new BuildRetriever(api, MAX_DOWNLOAD_SIZE, DOWNLOAD_DIR);
    });

    it('should get the artifact URL from the CircleCI API', async () => {
      const artifactRequest = nock(BASE_URL).get(ARTIFACT_PATH).reply(200, ARTIFACT_CONTENTS);
      await retriever.downloadBuildArtifact(12345, 777, 'COMMIT', ARTIFACT_PATH);
      expect(api.getBuildArtifactUrl).toHaveBeenCalledWith(12345, ARTIFACT_PATH);
      artifactRequest.done();
    });

    it('should download the artifact from its URL', async () => {
      const artifactRequest = nock(BASE_URL).get(ARTIFACT_PATH).reply(200, ARTIFACT_CONTENTS);
      await retriever.downloadBuildArtifact(12345, 777, 'COMMIT', ARTIFACT_PATH);
      // The following line proves that the artifact URL fetch occurred.
      artifactRequest.done();
    });

    it('should fail if the artifact is too large', async () => {
      const artifactRequest = nock(BASE_URL).get(ARTIFACT_PATH).reply(200, ARTIFACT_CONTENTS);
      retriever = new BuildRetriever(api, 10, DOWNLOAD_DIR);

      await expectAsync(retriever.downloadBuildArtifact(12345, 777, 'COMMIT', ARTIFACT_PATH)).
        toBeRejectedWith(jasmine.objectContaining({status: 413}));

      artifactRequest.done();
    });

    it('should not download the artifact if it already exists', async () => {
      const artifactRequestInterceptor = nock(BASE_URL).get(ARTIFACT_PATH);
      const artifactRequest = artifactRequestInterceptor.reply(200, ARTIFACT_CONTENTS);
      EXISTS_RESULT = true;
      await retriever.downloadBuildArtifact(12345, 777, 'COMMIT', ARTIFACT_PATH);
      expect(existsSpy).toHaveBeenCalled();
      expect(getBuildArtifactUrlSpy).not.toHaveBeenCalled();
      expect(artifactRequest.isDone()).toEqual(false);
      nock.removeInterceptor(artifactRequestInterceptor);
    });

    it('should write the artifact file to disk', async () => {
      const artifactRequest = nock(BASE_URL).get(ARTIFACT_PATH).reply(200, ARTIFACT_CONTENTS);
      const downloadPath = resolvePath(`${DOWNLOAD_DIR}/777-COMMIT-build.zip`);

      await retriever.downloadBuildArtifact(12345, 777, 'COMMIT', ARTIFACT_PATH);
      expect(writeFileSpy).toHaveBeenCalledWith(downloadPath, jasmine.any(Buffer), jasmine.any(Function));

      const buffer: Buffer = writeFileSpy.calls.mostRecent().args[1];
      expect(buffer.toString()).toEqual(ARTIFACT_CONTENTS);

      artifactRequest.done();
    });

    it('should fail if the CircleCI API fails', async () => {
      getBuildArtifactUrlSpy.and.rejectWith('getBuildArtifactUrl failed');
      await expectAsync(retriever.downloadBuildArtifact(12345, 777, 'COMMIT', ARTIFACT_PATH)).
        toBeRejectedWithError('CircleCI artifact download failed (getBuildArtifactUrl failed)');
    });

    it('should fail if the URL fetch errors', async () => {
      // create a new handler that errors
      const artifactRequest = nock(BASE_URL).get(ARTIFACT_PATH).replyWithError('Artifact Request Failed');

      await expectAsync(retriever.downloadBuildArtifact(12345, 777, 'COMMIT', ARTIFACT_PATH)).toBeRejectedWithError(
          'CircleCI artifact download failed ' +
          '(request to http://test.com/some/path/build.zip failed, reason: Artifact Request Failed)');

      artifactRequest.done();
    });

    it('should fail if the URL fetch 404s', async () => {
      // create a new handler that errors
      const artifactRequest = nock(BASE_URL).get(ARTIFACT_PATH).reply(404, 'No such artifact');

      await expectAsync(retriever.downloadBuildArtifact(12345, 777, 'COMMIT', ARTIFACT_PATH)).
        toBeRejectedWithError('CircleCI artifact download failed (Error 404 - Not Found)');

      artifactRequest.done();
    });

    it('should fail if file write fails', async () => {
      const artifactRequest = nock(BASE_URL).get(ARTIFACT_PATH).reply(200, ARTIFACT_CONTENTS);
      WRITEFILE_RESULT = 'Test Error';

      await expectAsync(retriever.downloadBuildArtifact(12345, 777, 'COMMIT', ARTIFACT_PATH)).
        toBeRejectedWithError('CircleCI artifact download failed (Test Error)');

      artifactRequest.done();
    });
  });
});
