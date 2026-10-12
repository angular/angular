/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as ts from 'typescript/lib/tsserverlibrary';
import * as lsp from 'vscode-languageserver/node';

import {ResourceWatchers} from '../resource_watchers';
import {ServerHost} from '../server_host';

interface TestProject {
  project: ts.server.Project;
  scripts: Map<string, ts.ScriptKind>;
  roots: Set<string>;
  close(): void;
  disable(): void;
}

function createProject(): TestProject {
  const scripts = new Map<string, ts.ScriptKind>();
  const roots = new Set<string>();
  let closed = false;
  const project = {
    languageServiceEnabled: true,
    isClosed: () => closed,
    isRoot: (scriptInfo: {fileName: string}) => roots.has(scriptInfo.fileName),
    getScriptInfo: (file: string) => {
      const scriptKind = scripts.get(file);
      return scriptKind === undefined ? undefined : {fileName: file, scriptKind};
    },
  };
  return {
    project: project as unknown as ts.server.Project,
    scripts,
    roots,
    close: () => (closed = true),
    disable: () => (project.languageServiceEnabled = false),
  };
}

// Registration updates are deliberately queued, and may enqueue further promise continuations.
async function flushRegistrations(): Promise<void> {
  await new Promise<void>((resolve) => setImmediate(resolve));
}

function getRegistrations(registration: lsp.BulkRegistration): lsp.Registration[] {
  // The connection consumes this method internally, but it is absent from the public interface.
  return (
    registration as lsp.BulkRegistration & {
      asRegistrationParams(): lsp.RegistrationParams;
    }
  ).asRegistrationParams().registrations;
}

describe('ResourceWatchers', () => {
  let host: ServerHost;
  let watchers: ResourceWatchers;
  let capabilities: lsp.ClientCapabilities;
  let registrations: lsp.Registration[][];
  let disposals: jasmine.Spy[];
  let register: jasmine.Spy;
  let onChange: jasmine.Spy;
  let logError: jasmine.Spy;

  beforeEach(() => {
    host = new ServerHost(false, true);
    // The test paths don't exist on disk. Treat their directories as existing unless a test says
    // otherwise.
    spyOn(host, 'directoryExists').and.returnValue(true);
    capabilities = {
      workspace: {
        didChangeWatchedFiles: {dynamicRegistration: true, relativePatternSupport: true},
      },
      textDocument: {synchronization: {dynamicRegistration: true}},
    };
    registrations = [];
    disposals = [];
    register = jasmine.createSpy('register').and.callFake((registration: lsp.BulkRegistration) => {
      registrations.push(getRegistrations(registration));
      const dispose = jasmine.createSpy('dispose');
      disposals.push(dispose);
      return Promise.resolve({dispose});
    });
    onChange = jasmine.createSpy('onChange');
    logError = jasmine.createSpy('logError');
    const connection = {
      client: {register},
      console: {error: logError},
    } as unknown as lsp.Connection;
    watchers = new ResourceWatchers(host, connection, () => capabilities, onChange);
  });

  function lastOptions<T>(method: string): T {
    const registration = [...registrations]
      .reverse()
      .flat()
      .find((entry) => entry.method === method);
    expect(registration).toBeDefined();
    return registration!.registerOptions as T;
  }

  it('watches exact arbitrary resources outside the workspace and inside node_modules', async () => {
    const owner = createProject();
    const files = [
      '/workspace/app/element-metadata',
      '/outside/shared/metadata.json',
      '/workspace/app/node_modules/widgets/arbitrary-name.json',
    ];
    const watchFile = spyOn(host, 'watchFile').and.callThrough();

    watchers.update(owner.project, files);
    await flushRegistrations();

    expect(watchFile.calls.allArgs().map(([file]) => file)).toEqual(files);
    expect(
      lastOptions<lsp.DidChangeWatchedFilesRegistrationOptions>(
        lsp.DidChangeWatchedFilesNotification.type.method,
      ).watchers,
    ).toEqual([
      {globPattern: {baseUri: 'file:///outside/shared', pattern: 'metadata.json'}},
      {globPattern: {baseUri: 'file:///workspace/app', pattern: 'element-metadata'}},
      {
        globPattern: {
          baseUri: 'file:///workspace/app/node_modules/widgets',
          pattern: 'arbitrary-name.json',
        },
      },
    ]);
  });

  it('watches a missing resource without requiring or synchronizing a ScriptInfo', async () => {
    const owner = createProject();
    const file = '/workspace/app/not-created-yet.json';

    watchers.update(owner.project, [file]);
    await flushRegistrations();
    host.notifyFileChange(file, lsp.FileChangeType.Created);

    expect(onChange).toHaveBeenCalledOnceWith(file);
    expect(registrations[0].map(({method}) => method)).toEqual([
      lsp.DidChangeWatchedFilesNotification.type.method,
    ]);
  });

  it('watches the first missing directory until the directories of a manifest exist', async () => {
    const owner = createProject();
    const parent = '/outside/new-parent';
    const nested = '/outside/new-parent/nested';
    const file = '/outside/new-parent/nested/catalog.json';
    const directories = new Set(['/outside']);
    const files = new Set<string>();
    (host.directoryExists as jasmine.Spy).and.callFake((directory: string) =>
      directories.has(directory),
    );
    spyOn(host, 'fileExists').and.callFake((fileName: string) => files.has(fileName));
    const watchedPattern = () =>
      lastOptions<lsp.DidChangeWatchedFilesRegistrationOptions>(
        lsp.DidChangeWatchedFilesNotification.type.method,
      ).watchers.map(({globPattern}) => globPattern);

    watchers.update(owner.project, [file]);
    await flushRegistrations();
    expect(watchedPattern()).toEqual([{baseUri: 'file:///outside', pattern: 'new-parent'}]);

    directories.add(parent);
    host.notifyFileChange(parent, lsp.FileChangeType.Created);
    await flushRegistrations();
    expect(watchedPattern()).toEqual([{baseUri: 'file:///outside/new-parent', pattern: 'nested'}]);
    expect(onChange).not.toHaveBeenCalled();

    directories.add(nested);
    files.add(file);
    host.notifyFileChange(nested, lsp.FileChangeType.Created);
    await flushRegistrations();
    expect(watchedPattern()).toEqual([{baseUri: `file://${nested}`, pattern: 'catalog.json'}]);
    expect(onChange).toHaveBeenCalledOnceWith(file);

    onChange.calls.reset();
    host.notifyFileChange(parent, lsp.FileChangeType.Created);
    host.notifyFileChange(file, lsp.FileChangeType.Changed);
    expect(onChange).toHaveBeenCalledOnceWith(file);
  });

  it('reports a manifest written together with its missing directories', async () => {
    const owner = createProject();
    const file = '/outside/new-parent/nested/catalog.json';
    const directories = new Set(['/outside']);
    (host.directoryExists as jasmine.Spy).and.callFake((directory: string) =>
      directories.has(directory),
    );
    spyOn(host, 'fileExists').and.callFake((fileName: string) => fileName === file);
    watchers.update(owner.project, [file, '/outside/other/catalog.json']);
    await flushRegistrations();

    // Directories and the file are created before the first directory event is handled.
    directories.add('/outside/new-parent');
    directories.add('/outside/new-parent/nested');
    host.notifyFileChange('/outside/new-parent', lsp.FileChangeType.Created);
    await flushRegistrations();

    expect(onChange).toHaveBeenCalledOnceWith(file);
  });

  it('synchronizes manifest roots without adding resolution metadata', async () => {
    const owner = createProject();
    const file = '/workspace/app/metadata.json';
    owner.scripts.set(file, ts.ScriptKind.Unknown);
    owner.roots.add(file);
    owner.scripts.set('/workspace/app/package.json', ts.ScriptKind.JSON);
    const files = [...owner.scripts.keys(), '/workspace/app/missing.json'];

    watchers.update(owner.project, files);
    await flushRegistrations();

    expect(registrations.map((batch) => batch.map(({method}) => method))).toEqual([
      [lsp.DidChangeWatchedFilesNotification.type.method],
      [
        lsp.DidOpenTextDocumentNotification.type.method,
        lsp.DidChangeTextDocumentNotification.type.method,
        lsp.DidCloseTextDocumentNotification.type.method,
      ],
    ]);
    const documentSelector = [{scheme: 'file', pattern: file}];
    expect(
      lastOptions<lsp.TextDocumentRegistrationOptions>(
        lsp.DidOpenTextDocumentNotification.type.method,
      ).documentSelector,
    ).toEqual(documentSelector);
    expect(
      lastOptions<lsp.TextDocumentChangeRegistrationOptions>(
        lsp.DidChangeTextDocumentNotification.type.method,
      ),
    ).toEqual({documentSelector, syncKind: lsp.TextDocumentSyncKind.Incremental});
    expect(
      lastOptions<lsp.TextDocumentRegistrationOptions>(
        lsp.DidCloseTextDocumentNotification.type.method,
      ).documentSelector,
    ).toEqual(documentSelector);
  });

  it('synchronizes JSON manifest roots even when TypeScript inferred their ScriptKind', async () => {
    const owner = createProject();
    const file = '/workspace/app/manifest.json';
    // ScriptKind.Unknown is zero. TypeScript infers JSON when constructing this ScriptInfo,
    // even though Angular requested Unknown when reading the manifest resource.
    owner.scripts.set(file, ts.ScriptKind.JSON);
    owner.roots.add(file);

    watchers.update(owner.project, [file]);
    await flushRegistrations();

    for (const method of [
      lsp.DidOpenTextDocumentNotification.type.method,
      lsp.DidChangeTextDocumentNotification.type.method,
      lsp.DidCloseTextDocumentNotification.type.method,
    ]) {
      expect(lastOptions<lsp.TextDocumentRegistrationOptions>(method).documentSelector).toEqual([
        {scheme: 'file', pattern: file},
      ]);
    }
  });

  it('adds synchronization when a previously missing dependency becomes a resource', async () => {
    const owner = createProject();
    const file = '/workspace/app/manifest.json';
    watchers.update(owner.project, [file]);
    await flushRegistrations();

    owner.scripts.set(file, ts.ScriptKind.Unknown);
    owner.roots.add(file);
    watchers.update(owner.project, [file]);
    await flushRegistrations();

    expect(register).toHaveBeenCalledTimes(2);
    expect(disposals[0]).not.toHaveBeenCalled();
    expect(
      lastOptions<lsp.TextDocumentRegistrationOptions>(
        lsp.DidOpenTextDocumentNotification.type.method,
      ).documentSelector,
    ).toEqual([{scheme: 'file', pattern: file}]);
  });

  it('deduplicates shared resources and retains them until the last project releases them', async () => {
    const first = createProject();
    const second = createProject();
    const file = '/outside/shared/manifest.json';
    first.scripts.set(file, ts.ScriptKind.Unknown);
    first.roots.add(file);
    second.scripts.set(file, ts.ScriptKind.Unknown);
    second.roots.add(file);
    const watchFile = spyOn(host, 'watchFile').and.callThrough();

    watchers.update(first.project, [file, file]);
    watchers.update(second.project, [file]);
    await flushRegistrations();
    expect(watchFile).toHaveBeenCalledTimes(1);
    expect(register).toHaveBeenCalledTimes(2);

    watchers.update(first.project, []);
    await flushRegistrations();
    host.notifyFileChange(file, lsp.FileChangeType.Changed);
    expect(onChange).toHaveBeenCalledOnceWith(file);
    expect(disposals[0]).not.toHaveBeenCalled();
    expect(disposals[1]).not.toHaveBeenCalled();

    watchers.update(second.project, []);
    await flushRegistrations();
    onChange.calls.reset();
    host.notifyFileChange(file, lsp.FileChangeType.Changed);
    expect(onChange).not.toHaveBeenCalled();
    expect(disposals[0]).toHaveBeenCalledTimes(1);
    expect(disposals[1]).toHaveBeenCalledTimes(1);
  });

  it('retains existing document registrations when another resource is added or removed', async () => {
    const owner = createProject();
    const firstFile = '/workspace/app/first.json';
    const secondFile = '/workspace/app/second.json';
    const thirdFile = '/workspace/app/third.json';
    for (const file of [firstFile, secondFile, thirdFile]) {
      owner.scripts.set(file, ts.ScriptKind.JSON);
      owner.roots.add(file);
    }

    function documentRegistration(file: string): number {
      const matchingIndexes = registrations.flatMap((batch, index) => {
        const open = batch.find(
          ({method}) => method === lsp.DidOpenTextDocumentNotification.type.method,
        );
        const options = open?.registerOptions as lsp.TextDocumentRegistrationOptions | undefined;
        return options?.documentSelector?.some(
          (selector) =>
            typeof selector !== 'string' && 'pattern' in selector && selector.pattern === file,
        )
          ? [index]
          : [];
      });
      expect(matchingIndexes.length).toBe(1);
      const index = matchingIndexes[0];
      expect(registrations[index].map(({method}) => method)).toEqual([
        lsp.DidOpenTextDocumentNotification.type.method,
        lsp.DidChangeTextDocumentNotification.type.method,
        lsp.DidCloseTextDocumentNotification.type.method,
      ]);
      for (const registration of registrations[index]) {
        expect(registration.registerOptions.documentSelector).toEqual([
          {scheme: 'file', pattern: file},
        ]);
      }
      return index;
    }

    watchers.update(owner.project, [firstFile, secondFile]);
    await flushRegistrations();
    const first = documentRegistration(firstFile);
    const second = documentRegistration(secondFile);

    // Replacing an aggregate synchronization registration can cause a language client to send
    // didClose for retained buffers. Keep each file's registration unchanged as resources grow.
    watchers.update(owner.project, [firstFile, secondFile, thirdFile]);
    await flushRegistrations();
    expect(documentRegistration(firstFile)).toBe(first);
    expect(documentRegistration(secondFile)).toBe(second);
    const third = documentRegistration(thirdFile);
    expect(disposals[first]).not.toHaveBeenCalled();
    expect(disposals[second]).not.toHaveBeenCalled();

    watchers.update(owner.project, [firstFile, thirdFile]);
    await flushRegistrations();
    expect(documentRegistration(firstFile)).toBe(first);
    expect(documentRegistration(thirdFile)).toBe(third);
    expect(disposals[first]).not.toHaveBeenCalled();
    expect(disposals[second]).toHaveBeenCalledTimes(1);
    expect(disposals[third]).not.toHaveBeenCalled();
  });

  it('releases obsolete resource paths when a project is updated', async () => {
    const owner = createProject();
    const oldFile = '/workspace/app/old-manifest.json';
    const newFile = '/workspace/app/new-manifest.json';
    watchers.update(owner.project, [oldFile]);
    await flushRegistrations();

    watchers.update(owner.project, [newFile]);
    await flushRegistrations();
    host.notifyFileChange(oldFile, lsp.FileChangeType.Changed);
    host.notifyFileChange(newFile, lsp.FileChangeType.Changed);

    expect(onChange).toHaveBeenCalledOnceWith(newFile);
    expect(disposals[0]).toHaveBeenCalledTimes(1);
    expect(
      lastOptions<lsp.DidChangeWatchedFilesRegistrationOptions>(
        lsp.DidChangeWatchedFilesNotification.type.method,
      ).watchers,
    ).toEqual([{globPattern: {baseUri: 'file:///workspace/app', pattern: 'new-manifest.json'}}]);
  });

  for (const deactivate of ['close', 'disable'] as const) {
    it(`releases resource watches when a project is ${deactivate}d`, async () => {
      const owner = createProject();
      const file = '/workspace/app/manifest.json';
      watchers.update(owner.project, [file]);
      await flushRegistrations();

      owner[deactivate]();
      watchers.update();
      await flushRegistrations();
      host.notifyFileChange(file, lsp.FileChangeType.Changed);

      expect(onChange).not.toHaveBeenCalled();
      expect(disposals[0]).toHaveBeenCalledTimes(1);
    });
  }

  it('serializes slow registrations so a newer resource set wins', async () => {
    const owner = createProject();
    const firstFile = '/workspace/app/first.json';
    const secondFile = '/workspace/app/second.json';
    let finishFirst!: (disposable: lsp.Disposable) => void;
    const firstDispose = jasmine.createSpy('firstDispose');
    register.and.callFake((registration: lsp.BulkRegistration) => {
      registrations.push(getRegistrations(registration));
      if (registrations.length === 1) {
        return new Promise<lsp.Disposable>((resolve) => (finishFirst = resolve));
      }
      return Promise.resolve({dispose: jasmine.createSpy('secondDispose')});
    });

    watchers.update(owner.project, [firstFile]);
    await flushRegistrations();
    watchers.update(owner.project, [secondFile]);
    await flushRegistrations();
    expect(register).toHaveBeenCalledTimes(1);

    finishFirst({dispose: firstDispose});
    await flushRegistrations();

    expect(register).toHaveBeenCalledTimes(2);
    expect(firstDispose).toHaveBeenCalledTimes(1);
    expect(
      lastOptions<lsp.DidChangeWatchedFilesRegistrationOptions>(
        lsp.DidChangeWatchedFilesNotification.type.method,
      ).watchers,
    ).toEqual([{globPattern: {baseUri: 'file:///workspace/app', pattern: 'second.json'}}]);
    host.notifyFileChange(firstFile, lsp.FileChangeType.Changed);
    host.notifyFileChange(secondFile, lsp.FileChangeType.Changed);
    expect(onChange).toHaveBeenCalledOnceWith(secondFile);
  });

  it('escapes glob metacharacters in both watch and document patterns', async () => {
    const owner = createProject();
    const file = '/workspace/[app]/{manifest}*?.json';
    owner.scripts.set(file, ts.ScriptKind.Unknown);
    owner.roots.add(file);

    watchers.update(owner.project, [file]);
    await flushRegistrations();

    expect(
      lastOptions<lsp.DidChangeWatchedFilesRegistrationOptions>(
        lsp.DidChangeWatchedFilesNotification.type.method,
      ).watchers,
    ).toEqual([
      {
        globPattern: {
          baseUri: 'file:///workspace/%5Bapp%5D',
          pattern: '[{]manifest[}][*][?].json',
        },
      },
    ]);
    expect(
      lastOptions<lsp.TextDocumentRegistrationOptions>(
        lsp.DidOpenTextDocumentNotification.type.method,
      ).documentSelector,
    ).toEqual([{scheme: 'file', pattern: '/workspace/[[]app[]]/[{]manifest[}][*][?].json'}]);
  });

  it('does not register capabilities the client does not support', async () => {
    const owner = createProject();
    const file = '/workspace/app/manifest.json';
    owner.scripts.set(file, ts.ScriptKind.Unknown);
    owner.roots.add(file);
    capabilities = {};

    watchers.update(owner.project, [file]);
    await flushRegistrations();

    expect(register).not.toHaveBeenCalled();
    expect(logError).not.toHaveBeenCalled();
  });

  it('requires relative-pattern support for client-side resource watches', async () => {
    const owner = createProject();
    const file = '/workspace/app/manifest.json';
    owner.scripts.set(file, ts.ScriptKind.Unknown);
    owner.roots.add(file);
    capabilities.workspace!.didChangeWatchedFiles!.relativePatternSupport = false;

    watchers.update(owner.project, [file]);
    await flushRegistrations();

    expect(registrations[0].map(({method}) => method)).toEqual([
      lsp.DidOpenTextDocumentNotification.type.method,
      lsp.DidChangeTextDocumentNotification.type.method,
      lsp.DidCloseTextDocumentNotification.type.method,
    ]);
  });

  it('still synchronizes resource buffers when disk watching is server-side', async () => {
    const nativeHost = new ServerHost(false, false);
    const watchFile = spyOn(nativeHost, 'watchFile').and.returnValue({close() {}});
    const connection = {
      client: {register},
      console: {error: logError},
    } as unknown as lsp.Connection;
    watchers = new ResourceWatchers(nativeHost, connection, () => capabilities, onChange);
    const owner = createProject();
    const file = '/outside/shared/manifest.json';
    owner.scripts.set(file, ts.ScriptKind.Unknown);
    owner.roots.add(file);

    watchers.update(owner.project, [file]);
    await flushRegistrations();

    expect(watchFile).toHaveBeenCalledOnceWith(file, jasmine.any(Function));
    expect(registrations[0].map(({method}) => method)).toEqual([
      lsp.DidOpenTextDocumentNotification.type.method,
      lsp.DidChangeTextDocumentNotification.type.method,
      lsp.DidCloseTextDocumentNotification.type.method,
    ]);
  });

  it('recovers after a failed registration instead of blocking later updates', async () => {
    const owner = createProject();
    register.and.rejectWith(new Error('registration failed'));
    watchers.update(owner.project, ['/workspace/app/first.json']);
    await flushRegistrations();
    expect(logError).toHaveBeenCalledTimes(1);

    register.and.resolveTo({dispose: jasmine.createSpy('dispose')});
    watchers.update(owner.project, ['/workspace/app/second.json']);
    await flushRegistrations();

    expect(register).toHaveBeenCalledTimes(2);
    expect(logError).toHaveBeenCalledTimes(1);
  });
});

describe('ServerHost resource file events', () => {
  it('preserves Created, Changed, and Deleted events from the client', () => {
    const host = new ServerHost(false, true);
    const file = '/outside/shared/manifest.json';
    const callback = jasmine.createSpy('callback');
    const watcher = host.watchFile(file, callback);

    host.notifyFileChange(file, lsp.FileChangeType.Created);
    host.notifyFileChange(file, lsp.FileChangeType.Changed);
    host.notifyFileChange(file, lsp.FileChangeType.Deleted);

    expect(callback.calls.allArgs()).toEqual([
      [file, ts.FileWatcherEventKind.Created],
      [file, ts.FileWatcherEventKind.Changed],
      [file, ts.FileWatcherEventKind.Deleted],
    ]);
    watcher.close();
    callback.calls.reset();
    host.notifyFileChange(file, lsp.FileChangeType.Created);
    expect(callback).not.toHaveBeenCalled();
  });
});
