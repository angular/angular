const child = require('child_process');
const Dgeni = require('dgeni');
const semver = require('semver');

const basePackage = require('../index');

describe('getPreviousMajorVersions', () => {
  let getPreviousMajorVersions;

  beforeEach(() => {
    const mockPackage = new Dgeni.Package('mock-package', [basePackage])
                            .factory('versionInfo', mockVersionInfo)
                            .factory('packageInfo', mockPackageInfo);
    const dgeni = new Dgeni([mockPackage]);
    const injector = dgeni.configureInjector();
    getPreviousMajorVersions = injector.get('getPreviousMajorVersions');
  });

  it('should spawn a child process to git', () => {
    spyOn(child, 'spawnSync').and.returnValue({status: 0, stdout: ''});
    getPreviousMajorVersions();
    expect(child.spawnSync).toHaveBeenCalledWith('git', ['ls-remote', '--tags', 'SOME_GIT_URL'], {
      encoding: 'utf8'
    });
  });

  it('should return an empty list for a failed git command', () => {
    spyOn(child, 'spawnSync').and.returnValue({status: 1});
    expect(getPreviousMajorVersions()).toEqual([]);
  });

  it('should return an empty list for no tags', () => {
    spyOn(child, 'spawnSync').and.returnValue({status: 0, stdout: ''});
    expect(getPreviousMajorVersions()).toEqual([]);
  });

  it('should return an array of latest major versions with major greater than current', () => {
    spyOn(child, 'spawnSync').and.returnValue({
      status: 0,
      stdout: `
    refs/pull/655
    refs/tags/some-tag
    refs/tags/3.8.1
    refs/tags/4.2.9
    refs/tags/4.2.10
    refs/tags/5.6.1
    refs/tags/6.1.1
    `
    });
    expect(getPreviousMajorVersions()).toEqual([
      semver('4.2.10'),
      semver('3.8.1'),
    ]);
  });
});

function mockVersionInfo() {
  return {currentVersion: new semver('5.1.0')};
}

function mockPackageInfo() {
  return {repository: {url: 'SOME_GIT_URL'}};
}
