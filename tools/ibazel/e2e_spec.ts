import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const BAZEL_BINARY = path.join(__dirname, 'index.js');

describe('e2e test', () => {
  let workspace: string;

  function write(fileName: string, contents: string) {
    fs.writeFileSync(path.join(workspace, fileName), contents);
  }

  function read(fileName: string): string {
    return fs.readFileSync(path.join(workspace, fileName)).toString();
  }

  beforeEach(() => {
    const tmpDir = process.env['TEST_TMPDIR'];
    expect(tmpDir).toBeTruthy();
    workspace = path.join(tmpDir, Math.round(Math.random() * 100000).toString());
    fs.mkdirSync(workspace);
    write('WORKSPACE', '');
  });

  afterEach(() => { unlinkRecursively(workspace); });

  it('performs initial and automatic build', done => {
    write('BUILD', 'genrule(name="copy", srcs=["a"], outs=["b"], cmd="cat $< > $@")');
    write('a', 'hello');

    const ibazel = new IBazelProcess(workspace, ['build', ':copy']);

    ibazel.waitForStdout('up-to-date')
        .then(() => new Promise(resolve => setTimeout(resolve, 500)))
        .then(() => {
          expect(read('bazel-genfiles/b')).toEqual('hello');
          write('a', 'world');
          return ibazel.waitForStdout('up-to-date');
        })
        .then(() => { expect(read('bazel-genfiles/b')).toEqual('world'); })
        .then(() => ibazel.stop())
        .then(done, done.fail);
  }, 10000);

  it('recognizes changing dependency graph', done => {
    write('BUILD', 'genrule(name="concat", srcs=["a"], outs=["c"], cmd="cat $< > $@")');
    write('a', 'hello');

    const ibazel = new IBazelProcess(workspace, ['build', ':concat']);

    ibazel.waitForStdout('up-to-date')
        .then(() => new Promise(resolve => setTimeout(resolve, 500)))
        .then(() => {
          expect(read('bazel-genfiles/c')).toEqual('hello');
          write(
              'BUILD',
              'genrule(name="concat", srcs=["a", "b"], outs=["c"], cmd="cat $(SRCS) > $@")');
          write('b', 'world');
          return ibazel.waitForStdout('up-to-date');
        })
        .then(() => { expect(read('bazel-genfiles/c')).toEqual('helloworld'); })
        .then(() => ibazel.stop())
        .then(done, done.fail);
  }, 10000);
});

class IBazelProcess {
  child: childProcess.ChildProcess;
  stopped: boolean;
  waiters: {keyword: string, callback: Function, active: boolean}[]

  constructor(cwd: string, argv: string[], timeout: number = 10000) {
    this.child = childProcess.spawn(
        'node', [BAZEL_BINARY, '--max_idle_secs=5'].concat(argv), {stdio: 'pipe', cwd: cwd});
    this.stopped = false;
    this.waiters = [];

    let output = '';
    let remaining = '';

    const handler = (data: Buffer | string) => {
      data = data.toString();
      output += data;
      remaining += data;
      for (const waiter of this.waiters) {
        if (waiter.active && remaining.indexOf(waiter.keyword) !== -1) {
          waiter.callback();
          waiter.active = false;
          remaining = '';
        }
      }
    };
    this.child.stdout.on('data', handler);
    this.child.stderr.on('data', handler);

    if (timeout) {
      setTimeout(() => {
        if (!this.stopped) {
          process.stdout.write(output);
        }
        this.stop();
      }, timeout);
    }
  }

  waitForStdout(keyword: string): Promise<string> {
    return new Promise(
        resolve => { this.waiters.push({keyword: keyword, callback: resolve, active: true}); });
  }

  stop(): Promise<any> {
    if (this.stopped) {
      return Promise.resolve();
    } else {
      return new Promise((resolve, reject) => {
        if (this.child.kill('SIGINT')) {
          this.stopped = true;
          resolve();
        } else {
          reject(new Error(`Cannot kill process with PID ${this.child.pid}`));
        }
      });
    }
  }
}
function ibazel(argv: string[]) {}

function unlinkRecursively(file: string) {
  const stats = fs.lstatSync(file);
  if (!stats.isSymbolicLink() && stats.isDirectory()) {
    for (const f of fs.readdirSync(file)) {
      unlinkRecursively(path.join(file, f));
    }
    fs.rmdirSync(file);
  } else {
    fs.unlinkSync(file);
  }
}
