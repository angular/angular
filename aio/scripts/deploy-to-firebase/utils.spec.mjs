import fs from 'fs';
import sh from 'shelljs';
import u from './utils.mjs';


describe('deploy-to-firebase/utils:', () => {
  beforeEach(() => {
    // Clear the `getRemoteRefs()` cache before each test to prevent previous executions from
    // affecting subsequent tests.
    u._GIT_REMOTE_REFS_CACHE.clear();
  });

  describe('computeMajorVersion()', () => {
    it('should extract the major version from a branch name', () => {
      expect(u.computeMajorVersion('1.2.3')).toBe(1);
      expect(u.computeMajorVersion('4.5.6-rc.7')).toBe(4);
      expect(u.computeMajorVersion('89.0')).toBe(89);
    });
  });

  describe('getDirname()', () => {
    it('should return the directory path given a file URL', () => {
      expect(u.getDirname(import.meta.url)).toMatch(/aio[\\/]scripts[\\/]deploy-to-firebase$/);
      expect(u.getDirname('file:///C:/foo/bar/baz.ext'))
          .toBe((process.platform === 'win32') ? 'C:\\foo\\bar' : '/C:/foo/bar');
    });
  });

  describe('getLatestCommit()', () => {
    let getRemoteRefsSpy;

    beforeEach(() => {
      getRemoteRefsSpy = spyOn(u, 'getRemoteRefs').and.returnValue([
        '1aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa40        refs/heads/3.0.x',
      ]);
    });

    it('should return the latest commit of a branch', () => {
      expect(u.getLatestCommit('3.0.x')).toBe('1aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa40');
      expect(getRemoteRefsSpy).toHaveBeenCalledWith('3.0.x', undefined);
    });

    it('should pass any options to `getRemoteRefs()`', () => {
      const opts = {custom: true};
      expect(u.getLatestCommit('3.0.x', opts)).toBe('1aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa40');
      expect(getRemoteRefsSpy).toHaveBeenCalledWith('3.0.x', opts);
    });
  });

  describe('getMostRecentMinorBranch()', () => {
    let getRemoteRefsSpy;

    beforeEach(() => {
      const mockRefs3 = [
        '1aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa40        refs/heads/3.1.x',
        '1ccccccccccccccccccccccccccccccccccccc40        refs/heads/3.3.x',
        '1bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb40        refs/heads/3.2.x',
      ];
      const mockRefs4 = [
        '1ddddddddddddddddddddddddddddddddddddd40        refs/heads/4.5.x',
        '1eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee40        refs/heads/4.6.x',
      ];
      const mockRefsAll = [
        ...mockRefs3,
        ...mockRefs4,
        '1fffffffffffffffffffffffffffffffffffff40        refs/heads/5.0.x',
      ];

      getRemoteRefsSpy = spyOn(u, 'getRemoteRefs')
          .withArgs('refs/heads/3.*.x', undefined).and.returnValue(mockRefs3)
          .withArgs('refs/heads/3.*.x', jasmine.anything()).and.returnValue(mockRefs3)
          .withArgs('refs/heads/4.*.x', undefined).and.returnValue(mockRefs4)
          .withArgs('refs/heads/4.*.x', jasmine.anything()).and.returnValue(mockRefs4)
          .withArgs('refs/heads/*.*.x', undefined).and.returnValue(mockRefsAll)
          .withArgs('refs/heads/*.*.x', jasmine.anything()).and.returnValue(mockRefsAll);
    });

    it('should get all minor branches for the specified major version', () => {
      u.getMostRecentMinorBranch('3');
      expect(getRemoteRefsSpy).toHaveBeenCalledWith('refs/heads/3.*.x', undefined);

      u.getMostRecentMinorBranch('4');
      expect(getRemoteRefsSpy).toHaveBeenCalledWith('refs/heads/4.*.x', undefined);
    });

    it('should get all minor branches when no major version is specified', () => {
      u.getMostRecentMinorBranch();
      expect(getRemoteRefsSpy).toHaveBeenCalledWith('refs/heads/*.*.x', undefined);

      u.getMostRecentMinorBranch(undefined);
      expect(getRemoteRefsSpy).toHaveBeenCalledWith('refs/heads/*.*.x', undefined);
    });

    it('should pass any options to `getRemoteRefs()`', () => {
      u.getMostRecentMinorBranch();
      expect(getRemoteRefsSpy).toHaveBeenCalledWith('refs/heads/*.*.x', undefined);

      u.getMostRecentMinorBranch('3');
      expect(getRemoteRefsSpy).toHaveBeenCalledWith('refs/heads/3.*.x', undefined);

      u.getMostRecentMinorBranch(undefined, {custom: 1});
      expect(getRemoteRefsSpy).toHaveBeenCalledWith('refs/heads/*.*.x', {custom: 1});

      u.getMostRecentMinorBranch('4', {custom: 2});
      expect(getRemoteRefsSpy).toHaveBeenCalledWith('refs/heads/4.*.x', {custom: 2});
    });

    it('should return the most recent branch', () => {
      expect(u.getMostRecentMinorBranch('3')).toBe('3.3.x');
      expect(u.getMostRecentMinorBranch('4')).toBe('4.6.x');
      expect(u.getMostRecentMinorBranch()).toBe('5.0.x');
    });

    it('should ignore branches that do not match the expected pattern', () => {
      getRemoteRefsSpy.withArgs('refs/heads/*.*.x', undefined).and.returnValue([
        '1aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa40        refs/heads/6.0.x',
        '1bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb40        refs/heads/6.1.x',
        '1ccccccccccccccccccccccccccccccccccccc40        refs/heads/6.2.z',
        '1ddddddddddddddddddddddddddddddddddddd40        refs/heads/7.3.x-rc.0',
      ]);

      expect(u.getMostRecentMinorBranch()).toBe('6.1.x');
    });
  });

  describe('getRemoteRefs()', () => {
    let execSpy;

    beforeEach(() => {
      execSpy = spyOn(sh, 'exec').and.callFake(() => ([
        '     ',
        '1aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa40        refs/heads/3.1.x',
        '1ccccccccccccccccccccccccccccccccccccc40        refs/heads/3.3.x',
        '1bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb40        refs/heads/3.2.x',
        '1ddddddddddddddddddddddddddddddddddddd40        refs/heads/4.5.x',
        '1eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee40        refs/heads/4.6.x',
        '1fffffffffffffffffffffffffffffffffffff40        refs/heads/5.0.x',
        '     ',
      ].join('\n')));
    });

    it('should retrieve the remote refs based on the speficied pattern/remote', () => {
      u.getRemoteRefs('some-pattern', {remote: 'https://example.com/repo.git'});
      expect(execSpy).toHaveBeenCalledWith(
          'git ls-remote https://example.com/repo.git some-pattern', jasmine.anything());
    });

    it('should use the `angular/angular` repo if not remote is specified', () => {
      u.getRemoteRefs('some-pattern');
      expect(execSpy).toHaveBeenCalledWith(
          `git ls-remote ${u.NG_REMOTE_URL} some-pattern`, jasmine.anything());

      u.getRemoteRefs('other-pattern', {other: 'option'});
      expect(execSpy).toHaveBeenCalledWith(
          `git ls-remote ${u.NG_REMOTE_URL} other-pattern`, jasmine.anything());
    });

    it('should run the git command in silent mode', () => {
      u.getRemoteRefs('some-pattern');
      expect(execSpy).toHaveBeenCalledWith(jasmine.any(String), {silent: true});
    });

    it('should return a list of refs', () => {
      expect(u.getRemoteRefs('some-pattern')).toEqual([
        '1aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa40        refs/heads/3.1.x',
        '1ccccccccccccccccccccccccccccccccccccc40        refs/heads/3.3.x',
        '1bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb40        refs/heads/3.2.x',
        '1ddddddddddddddddddddddddddddddddddddd40        refs/heads/4.5.x',
        '1eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee40        refs/heads/4.6.x',
        '1fffffffffffffffffffffffffffffffffffff40        refs/heads/5.0.x',
      ]);
    });

    it('should retrieve results from the cache (if available)', () => {
      // Initially, retrieve results by executing the command.
      const results1 = u.getRemoteRefs('some-pattern');
      expect(execSpy).toHaveBeenCalledTimes(1);

      // On subsequent calls with the same command, retrieve results from the cache.
      expect(u.getRemoteRefs('some-pattern')).toBe(results1);
      expect(u.getRemoteRefs('some-pattern', {remote: u.NG_REMOTE_URL})).toBe(results1);
      expect(execSpy).toHaveBeenCalledTimes(1);

      // Retrieve results for different command (different remote) by executing the command.
      const results2 = u.getRemoteRefs('some-pattern', {remote: 'other-remote'});
      expect(results2).not.toBe(results1);
      expect(execSpy).toHaveBeenCalledTimes(2);

      // Retrieve results for different command (different pattern) by executing the command.
      const results3 = u.getRemoteRefs('other-pattern');
      expect(results3).not.toBe(results1);
      expect(results3).not.toBe(results2);
      expect(execSpy).toHaveBeenCalledTimes(3);

      // Retrieve results from the cache once available.
      expect(u.getRemoteRefs('other-pattern', {remote: u.NG_REMOTE_URL})).toBe(results3);
      expect(execSpy).toHaveBeenCalledTimes(3);
    });

    it('should not retrieve results from the cache with `retrieveFromCache: false`', () => {
      // Initial call to retrieve and cache the results.
      const results1 = u.getRemoteRefs('some-pattern');
      expect(execSpy).toHaveBeenCalledTimes(1);

      // Do not use cached results with `retrieveFromCache: false`.
      const results2 = u.getRemoteRefs('some-pattern', {retrieveFromCache: false});
      expect(results2).not.toBe(results1);
      expect(execSpy).toHaveBeenCalledTimes(2);

      const results3 = u.getRemoteRefs(
          'some-pattern', {remote: u.NG_REMOTE_URL, retrieveFromCache: false});
      expect(results3).not.toBe(results1);
      expect(results3).not.toBe(results2);
      expect(execSpy).toHaveBeenCalledTimes(3);
    });

    it('should cache the results for future use even with `retrieveFromCache: false`', () => {
      // Initial call with `retrieveFromCache: false` (should still cache the results).
      const results = u.getRemoteRefs('some-pattern', {retrieveFromCache: false});
      expect(execSpy).toHaveBeenCalledTimes(1);

      // Subsequent call uses the cached results.
      expect(u.getRemoteRefs('some-pattern')).toBe(results);
      expect(u.getRemoteRefs('some-pattern', {other: 'option'})).toBe(results);
      expect(u.getRemoteRefs('some-pattern', {retrieveFromCache: true})).toBe(results);
      expect(execSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('loadJson()', () => {
    let readFileSyncSpy;

    beforeEach(() => readFileSyncSpy = spyOn(fs, 'readFileSync'));

    it('should load and parse a JSON file', () => {
      readFileSyncSpy.withArgs('/foo/bar.json', 'utf8').and.returnValue('{"foo": "bar"}');
      expect(u.loadJson('/foo/bar.json')).toEqual({foo: 'bar'});
    });
  });

  describe('logSectionHeader()', () => {
    let logSpy;

    beforeEach(() => logSpy = spyOn(console, 'log'));

    it('should log a section header', () => {
      u.logSectionHeader('Foo header');
      expect(logSpy).toHaveBeenCalledWith('\n\n\n==== Foo header ====\n');
    });
  });

  describe('nameFunction()', () => {
    it('should overwrite a function\'s name', () => {
      function foo() {}
      const bar = () => {};
      const baz = ({baz() {}}).baz;

      expect(foo.name).toBe('foo');
      expect(bar.name).toBe('bar');
      expect(baz.name).toBe('baz');

      u.nameFunction('foo2', foo);
      u.nameFunction('bar2', bar);
      u.nameFunction('baz2', baz);

      expect(foo.name).toBe('foo2');
      expect(bar.name).toBe('bar2');
      expect(baz.name).toBe('baz2');
    });

    it('should return the function', () => {
      function foo() {}
      const bar = () => {};
      const baz = ({baz() {}}).baz;

      expect(u.nameFunction('foo2', foo)).toBe(foo);
      expect(u.nameFunction('bar2', bar)).toBe(bar);
      expect(u.nameFunction('baz2', baz)).toBe(baz);
    });
  });

  describe('yarn()', () => {
    let execSpy;

    beforeEach(() => execSpy = spyOn(sh, 'exec'));

    it('should execute yarn in silent mode', () => {
      u.yarn('foo --bar');

      const cmd = execSpy.calls.argsFor(0)[0];
      expect(cmd.endsWith('--silent foo --bar')).toEqual(true);
    });

    it('should return the output from the command\'s execution', () => {
      execSpy.and.returnValue('command output\n');
      expect(u.yarn('foo --bar')).toBe('command output\n');
    });
  });
});
