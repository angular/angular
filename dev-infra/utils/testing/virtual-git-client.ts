/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SpawnSyncOptions, SpawnSyncReturns} from 'child_process';
import * as parseArgs from 'minimist';

import {NgDevConfig} from '../config';
import {GitClient} from '../git/index';

/**
 * Temporary directory which will be used as project directory in tests. Note that
 * this environment variable is automatically set by Bazel for tests.
 */
export const testTmpDir: string = process.env['TEST_TMPDIR']!;


/** A mock instance of a configuration for the ng-dev toolset for default testing. */
export const mockNgDevConfig: NgDevConfig = {
  github: {
    name: 'name',
    owner: 'owner',
  }
};


/** Type describing a Git head. */
interface GitHead {
  /** Name of the head. Not defined in a detached state. */
  branch?: string;
  /** Ref associated with this head. i.e. the remote base of this head. */
  ref?: RemoteRef;
  /** List of commits added to this head (on top of the ref's base). */
  newCommits: Commit[];
}

/** Type describing a remote Git ref. */
export interface RemoteRef {
  /** Name of the reference. */
  name: string;
  /** Repository containing this ref. */
  repoUrl: string;
}

/** Type describing a Git commit. */
export interface Commit {
  /** Commit message. */
  message: string;
  /** List of files included in this commit. */
  files: string[];
}

/**
 * Virtual git client that mocks Git commands and keeps track of the repository state
 * in memory. This allows for convenient test assertions with Git interactions.
 */
export class VirtualGitClient extends GitClient {
  /** Current Git HEAD that has been previously fetched. */
  fetchHeadRef: RemoteRef|null = null;
  /** List of known branches in the repository. */
  branches: {[branchName: string]: GitHead} = {master: {branch: 'master', newCommits: []}};
  /** Current checked out HEAD in the repository. */
  head: GitHead = this.branches['master'];
  /** List of pushed heads to a given remote ref. */
  pushed: {remote: RemoteRef, head: GitHead}[] = [];

  /** Override for the actual Git client command execution. */
  runGraceful(args: string[], options: SpawnSyncOptions = {}): SpawnSyncReturns<string> {
    const [command, ...rawArgs] = args;
    switch (command) {
      case 'push':
        this._push(rawArgs);
        break;
      case 'fetch':
        this._fetch(rawArgs);
        break;
      case 'checkout':
        this._checkout(rawArgs);
        break;
      case 'commit':
        this._commit(rawArgs);
        break;
    }

    // Return a fake spawn sync return value. We error non-gracefully if any command fails
    // in the tests, so we always return success and stub out the `SpawnSyncReturns` type.
    return {status: 0, stderr: '', output: [], pid: -1, signal: null, stdout: ''};
  }

  /** Handler for the `git push` command. */
  private _push(args: string[]) {
    const [repoUrl, refspec] = parseArgs(args)._;
    const ref = this._unwrapRefspec(refspec);
    const name = ref.destination || ref.source;
    const existingPush =
        this.pushed.find(({remote}) => remote.repoUrl === repoUrl && remote.name === name);
    const pushedHead = this._cloneHead(this.head);

    // Either, update a previously pushed branch, or keep track of a newly
    // performed branch push. We don't respect the `--force` flag.
    if (existingPush !== undefined) {
      existingPush.head = pushedHead;
    } else {
      this.pushed.push({remote: {repoUrl, name}, head: pushedHead});
    }
  }

  /** Handler for the `git commit` command. */
  private _commit(rawArgs: string[]) {
    const args = parseArgs(rawArgs, {string: ['m', 'message']});
    const message = args['m'] || args['message'];
    const files = args._;
    if (!message) {
      throw Error('No commit message has been specified.');
    }
    this.head.newCommits.push({message, files});
  }

  /** Handler for the `git fetch` command. */
  private _fetch(rawArgs: string[]) {
    const args = parseArgs(rawArgs, {boolean: ['f', 'force', 'q', 'quiet']});
    const [repoUrl, refspec] = args._;
    const force = args['f'] || args['force'];
    const ref = this._unwrapRefspec(refspec);

    // Keep track of the fetch head, so that it can be checked out
    // later in a detached state.
    this.fetchHeadRef = {name: ref.source, repoUrl};

    // If a destination has been specified in the ref spec, add it to the
    // list of available local branches.
    if (ref.destination) {
      if (this.branches[ref.destination] && !force) {
        throw Error('Cannot override existing local branch when fetching.');
      }
      this.branches[ref.destination] = {
        branch: ref.destination,
        ref: this.fetchHeadRef,
        newCommits: [],
      };
    }
  }

  /** Handler for the `git checkout` command. */
  private _checkout(rawArgs: string[]) {
    const args = parseArgs(rawArgs, {boolean: ['detach', 'B']});
    const createBranch = args['B'];
    const detached = args['detach'];
    const [target] = args._;

    if (target === 'FETCH_HEAD') {
      if (this.fetchHeadRef === null) {
        throw Error('Unexpectedly trying to check out "FETCH_HEAD". Not fetch head set.');
      }
      this.head = {ref: this.fetchHeadRef, newCommits: []};
    } else if (this.branches[target]) {
      this.head = this._cloneHead(this.branches[target], detached);
    } else if (createBranch) {
      this.head = this.branches[target] = {branch: target, ...this._cloneHead(this.head, detached)};
    } else {
      throw Error(`Unexpected branch checked out: ${target}`);
    }
  }

  /**
   * Unwraps a refspec into the base and target ref names.
   * https://git-scm.com/docs/git-fetch#Documentation/git-fetch.txt-ltrefspecgt.
   */
  private _unwrapRefspec(refspec: string): {source: string, destination?: string} {
    const [source, destination] = refspec.split(':');
    if (!destination) {
      return {source};
    } else {
      return {source, destination};
    }
  }

  /** Clones the specified Git head with respect to the detached flag. */
  private _cloneHead(head: GitHead, detached = false): GitHead {
    return {
      branch: detached ? undefined : head.branch,
      ref: head.ref,
      newCommits: [...head.newCommits],
    };
  }
}


/**
 * Builds a Virtual Git Client instance with the provided config and set the temporary test
 * directory.
 */
export function buildVirtualGitClient(config = mockNgDevConfig, tmpDir = testTmpDir) {
  return (new VirtualGitClient(undefined, config, tmpDir));
}
