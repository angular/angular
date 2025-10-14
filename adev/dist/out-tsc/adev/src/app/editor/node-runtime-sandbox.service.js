/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {DestroyRef, effect, inject, Injectable, signal} from '@angular/core';
import {WebContainer} from '@webcontainer/api';
import {BehaviorSubject, filter, map, Subject} from 'rxjs';
import {checkFilesInDirectory} from '@angular/docs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {AlertManager} from './alert-manager.service';
import {EmbeddedTutorialManager} from './embedded-tutorial-manager.service';
import {LoadingStep} from './enums/loading-steps';
import {ErrorType, NodeRuntimeState} from './node-runtime-state.service';
import {TerminalHandler} from './terminal/terminal-handler.service';
import {TypingsLoader} from './typings-loader.service';
import {DEV_SERVER_READY_MSG, OUT_OF_MEMORY_MSG} from './node-runtime-errors';
export const PACKAGE_MANAGER = 'npm';
/**
 * This service is responsible for handling the WebContainer instance, which
 * allows running a Node.js environment in the browser. It is used by the
 * embedded editor to run an executable Angular project in the browser.
 *
 * It boots the WebContainer, loads the project files into the WebContainer
 * filesystem, install the project dependencies and starts the dev server.
 */
let NodeRuntimeSandbox = (() => {
  let _classDecorators = [Injectable({providedIn: 'root'})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var NodeRuntimeSandbox = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      NodeRuntimeSandbox = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    _createdFile$ = new Subject();
    createdFile$ = this._createdFile$.asObservable();
    _createdFiles = signal(new Set());
    interactiveShellProcess;
    interactiveShellWriter;
    destroyRef = inject(DestroyRef);
    alertManager = inject(AlertManager);
    terminalHandler = inject(TerminalHandler);
    embeddedTutorialManager = inject(EmbeddedTutorialManager);
    nodeRuntimeState = inject(NodeRuntimeState);
    typingsLoader = inject(TypingsLoader);
    _isProjectInitialized = signal(false);
    _isAngularCliInitialized = signal(false);
    urlToPreview$ = new BehaviorSubject('');
    _previewUrl$ = this.urlToPreview$.asObservable();
    processes = new Set();
    devServerProcess;
    webContainerPromise;
    constructor() {
      effect(() => {
        const terminal = this.terminalHandler.interactiveTerminalInstance();
        terminal.onData((data) => {
          this.interactiveShellWriter?.write(data);
        });
        terminal.breakProcess$.subscribe(() => {
          // Write CTRL + C into shell to break active process
          this.interactiveShellWriter?.write('\x03');
        });
      });
    }
    get previewUrl$() {
      return this._previewUrl$;
    }
    async init() {
      // Note: the error state can already be set when loading the NodeRuntimeSandbox
      // in an unsupported environment.
      if (this.nodeRuntimeState.error()) {
        return;
      }
      try {
        if (!this.embeddedTutorialManager.type())
          throw Error("Tutorial type isn't available, can not initialize the NodeRuntimeSandbox");
        console.time('Load time');
        let webContainer;
        if (this.nodeRuntimeState.loadingStep() === LoadingStep.NOT_STARTED) {
          this.alertManager.init();
          webContainer = await this.boot();
          await this.handleWebcontainerErrors();
        } else {
          webContainer = await this.webContainerPromise;
        }
        await this.startInteractiveTerminal(webContainer);
        this.terminalHandler.clearTerminals();
        const startDevServer = this.embeddedTutorialManager.type() !== 'cli'; /* TutorialType.CLI */
        await this.initProject(startDevServer);
        console.timeEnd('Load time');
      } catch (error) {
        // If we're already in an error state, throw away the most recent error which may have happened because
        // we were in the error state already and tried to do more things after terminating.
        const message = this.nodeRuntimeState.error()?.message ?? error.message;
        this.setErrorState(message);
      }
    }
    async reset() {
      // if a reset is running, don't allow another to start
      if (this.nodeRuntimeState.isResetting()) {
        return;
      }
      this.nodeRuntimeState.setIsResetting(true);
      if (this.nodeRuntimeState.loadingStep() === LoadingStep.READY) {
        await this.restartDevServer();
      } else {
        await this.cleanup();
        this.setLoading(LoadingStep.BOOT);
        // force re-initialization
        this._isProjectInitialized.set(false);
        await this.init();
      }
      this.nodeRuntimeState.setIsResetting(false);
    }
    async restartDevServer() {
      this.devServerProcess?.kill();
      await this.startDevServer();
    }
    async getSolutionFiles() {
      const webContainer = await this.webContainerPromise;
      const excludeFromRoot = [
        'node_modules',
        '.angular',
        'dist',
        'BUILD.bazel',
        'idx',
        'package.json.template',
        'config.json',
      ];
      return await checkFilesInDirectory(
        '',
        webContainer.fs,
        (path) => !excludeFromRoot.includes(path),
      );
    }
    /**
     * Initialize the WebContainer for an Angular project
     */
    async initProject(startDevServer) {
      // prevent re-initialization
      if (this._isProjectInitialized()) return;
      // clean up the sandbox if it was initialized before so that the CLI can
      // be initialized without conflicts
      if (this._isAngularCliInitialized()) {
        await this.cleanup();
        this._isAngularCliInitialized.set(false);
      }
      this._isProjectInitialized.set(true);
      await this.mountProjectFiles();
      this.handleProjectChanges();
      const exitCode = await this.installDependencies();
      if (
        ![143 /* PROCESS_EXIT_CODE.SIGTERM */, 0 /* PROCESS_EXIT_CODE.SUCCESS */].includes(exitCode)
      )
        throw new Error('Installation failed');
      await Promise.all([
        this.loadTypes(),
        startDevServer ? this.startDevServer() : Promise.resolve(),
      ]);
      this.setLoading(LoadingStep.READY);
    }
    handleProjectChanges() {
      this.embeddedTutorialManager.tutorialChanged$
        .pipe(
          map((tutorialChanged) => ({
            tutorialChanged,
            tutorialFiles: this.embeddedTutorialManager.tutorialFiles(),
          })),
          filter(
            ({tutorialChanged, tutorialFiles}) =>
              tutorialChanged && Object.keys(tutorialFiles).length > 0,
          ),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe(async () => {
          await Promise.all([this.mountProjectFiles(), this.handleFilesToDeleteOnProjectChange()]);
          if (this.embeddedTutorialManager.shouldReInstallDependencies()) {
            await this.handleInstallDependenciesOnProjectChange();
          }
        });
    }
    async handleFilesToDeleteOnProjectChange() {
      const filesToDelete = Array.from(
        new Set([
          ...this.embeddedTutorialManager.filesToDeleteFromPreviousProject(),
          ...Array.from(this._createdFiles()),
        ]),
      );
      if (filesToDelete.length) {
        await Promise.all(filesToDelete.map((file) => this.deleteFile(file)));
      }
      // reset created files
      this._createdFiles.set(new Set());
    }
    async handleInstallDependenciesOnProjectChange() {
      // Note: restartDevServer is not used here because we need to kill
      // the dev server process before installing dependencies to avoid
      // errors in the console
      this.devServerProcess?.kill();
      await this.installDependencies();
      await Promise.all([this.loadTypes(), this.startDevServer()]);
    }
    async writeFile(path, content) {
      const webContainer = await this.webContainerPromise;
      try {
        await webContainer.fs.writeFile(path, content);
      } catch (err) {
        if (err.message.startsWith('ENOENT')) {
          const directory = path.split('/').slice(0, -1).join('/');
          await webContainer.fs.mkdir(directory, {
            recursive: true,
          });
          await webContainer.fs.writeFile(path, content);
        } else {
          throw err;
        }
      }
    }
    async renameFile(oldPath, newPath) {
      const webContainer = await this.webContainerPromise;
      try {
        await webContainer.fs.rename(oldPath, newPath);
      } catch (err) {
        throw err;
      }
    }
    async readFile(filePath) {
      const webContainer = await this.webContainerPromise;
      return webContainer.fs.readFile(filePath, 'utf-8');
    }
    async deleteFile(filepath) {
      const webContainer = await this.webContainerPromise;
      return webContainer.fs.rm(filepath);
    }
    /**
     * Implemented based on:
     * https://webcontainers.io/tutorial/7-add-interactivity#_2-start-the-shell
     */
    async startInteractiveTerminal(webContainer) {
      // return existing shell process if it's already running
      if (this.interactiveShellProcess) return this.interactiveShellProcess;
      // use WebContainer spawn directly so that the process isn't killed on
      // cleanup
      const shellProcess = await webContainer.spawn('bash');
      this.interactiveShellProcess = shellProcess;
      // keep the regex out of the write stream to avoid recreating on every write
      const ngGenerateTerminalOutputRegex = /(\u001b\[\d+m)?([^\s]+)(\u001b\[\d+m)?/g;
      shellProcess.output.pipeTo(
        new WritableStream({
          write: (data) => {
            this.checkForOutOfMemoryError(data.toString());
            this.terminalHandler.interactiveTerminalInstance().write(data);
            if (data.includes('CREATE') && data.endsWith('\r\n')) {
              const match = data.match(ngGenerateTerminalOutputRegex);
              const filename = match?.[1];
              if (filename) {
                this._createdFile$.next(filename);
                this._createdFiles.update((files) => files.add(filename));
              }
            }
          },
        }),
      );
      this.interactiveShellWriter = shellProcess.input.getWriter();
      return shellProcess;
    }
    async mountProjectFiles() {
      if (!this.embeddedTutorialManager.tutorialFilesystemTree()) {
        return;
      }
      // The files are mounted on init and when the project changes. If the loading step is ready,
      // the project changed, so we don't need to change the loading step.
      if (this.nodeRuntimeState.loadingStep() !== LoadingStep.READY) {
        this.setLoading(LoadingStep.LOAD_FILES);
      }
      const tutorialHasFiles =
        Object.keys(this.embeddedTutorialManager.tutorialFilesystemTree()).length > 0;
      if (tutorialHasFiles) {
        await Promise.all([
          this.mountFiles(this.embeddedTutorialManager.commonFilesystemTree()),
          this.mountFiles(this.embeddedTutorialManager.tutorialFilesystemTree()),
        ]);
      }
    }
    setLoading(loading) {
      this.nodeRuntimeState.setLoadingStep(loading);
    }
    async mountFiles(fileSystemTree) {
      const webContainer = await this.webContainerPromise;
      await webContainer.mount(fileSystemTree);
    }
    async boot() {
      this.setLoading(LoadingStep.BOOT);
      if (!this.webContainerPromise) {
        this.webContainerPromise = WebContainer.boot({
          workdirName: 'angular',
        });
      }
      return await this.webContainerPromise;
    }
    terminate(webContainer) {
      webContainer?.teardown();
      this.webContainerPromise = undefined;
    }
    async handleWebcontainerErrors() {
      const webContainer = await this.webContainerPromise;
      webContainer.on('error', ({message}) => {
        if (this.checkForOutOfMemoryError(message)) return;
        this.setErrorState(message, ErrorType.UNKNOWN);
      });
    }
    checkForOutOfMemoryError(message) {
      if (message.toLowerCase().includes(OUT_OF_MEMORY_MSG.toLowerCase())) {
        this.setErrorState(message, ErrorType.OUT_OF_MEMORY);
        return true;
      }
      return false;
    }
    setErrorState(message, type) {
      this.nodeRuntimeState.setError({message, type});
      this.nodeRuntimeState.setLoadingStep(LoadingStep.ERROR);
      this.terminate();
    }
    async installDependencies() {
      this.setLoading(LoadingStep.INSTALL);
      const installProcess = await this.spawn(PACKAGE_MANAGER, ['install']);
      installProcess.output.pipeTo(
        new WritableStream({
          write: (data) => {
            this.terminalHandler.readonlyTerminalInstance().write(data);
            this.terminalHandler.interactiveTerminalInstance().write(data);
          },
        }),
      );
      // wait for install command to exit
      const code = await installProcess.exit;
      // Simulate pressing `Enter` in shell
      this.interactiveShellWriter?.write('\x0D');
      return code;
    }
    async loadTypes() {
      const webContainer = await this.webContainerPromise;
      await this.typingsLoader.retrieveTypeDefinitions(webContainer);
    }
    async startDevServer() {
      const webContainer = await this.webContainerPromise;
      this.setLoading(LoadingStep.START_DEV_SERVER);
      this.devServerProcess = await this.spawn(PACKAGE_MANAGER, ['run', 'start']);
      // wait for `server-ready` event, forward the dev server url
      webContainer.on('server-ready', (port, url) => {
        this.urlToPreview$.next(url);
      });
      // wait until the dev server finishes the first compilation
      await new Promise((resolve, reject) => {
        if (!this.devServerProcess) {
          reject('dev server is not running');
          return;
        }
        this.devServerProcess.output.pipeTo(
          new WritableStream({
            write: (data) => {
              this.terminalHandler.readonlyTerminalInstance().write(data);
              if (this.checkForOutOfMemoryError(data.toString())) {
                reject(new Error(data.toString()));
                return;
              }
              if (
                this.nodeRuntimeState.loadingStep() !== LoadingStep.READY &&
                data.toString().includes(DEV_SERVER_READY_MSG)
              ) {
                resolve();
                this.setLoading(LoadingStep.READY);
              }
            },
          }),
        );
      });
    }
    /**
     * Spawn a process in the WebContainer and store the process in the service.
     * Later on the stored process can be used to kill the process on `cleanup`
     */
    async spawn(command, args = []) {
      const webContainer = await this.webContainerPromise;
      const process = await webContainer.spawn(command, args);
      const transformStream = new TransformStream({
        transform: (chunk, controller) => {
          this.checkForOutOfMemoryError(chunk.toString());
          controller.enqueue(chunk);
        },
      });
      process.output = process.output.pipeThrough(transformStream);
      this.processes.add(process);
      return process;
    }
    /**
     * Kill existing processes and remove files from the WebContainer
     * when switching tutorials that have different requirements
     */
    async cleanup() {
      // await the process to be killed before removing the files because
      // a process can create files during the promise
      await this.killExistingProcesses();
      await this.removeFiles();
    }
    async killExistingProcesses() {
      await Promise.all(Array.from(this.processes).map((process) => process.kill()));
      this.processes.clear();
    }
    async removeFiles() {
      const webcontainer = await this.webContainerPromise;
      await webcontainer.spawn('rm', ['-rf', './**']);
    }
  };
  return (NodeRuntimeSandbox = _classThis);
})();
export {NodeRuntimeSandbox};
//# sourceMappingURL=node-runtime-sandbox.service.js.map
