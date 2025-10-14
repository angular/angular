/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {DestroyRef, Injectable, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Subject, debounceTime, filter, map} from 'rxjs';
import {EditorState} from '@codemirror/state';
import {EditorView, placeholder as placeholderExtension} from '@codemirror/view';
import {EmbeddedTutorialManager} from '../embedded-tutorial-manager.service';
import {NodeRuntimeSandbox} from '../node-runtime-sandbox.service';
import {TypingsLoader} from '../typings-loader.service';
import {CODE_EDITOR_EXTENSIONS} from './constants/code-editor-extensions';
import {LANGUAGES} from './constants/code-editor-languages';
import {getAutocompleteExtension} from './extensions/autocomplete';
import {getDiagnosticsExtension} from './extensions/diagnostics';
import {getTooltipExtension} from './extensions/tooltip';
import {DiagnosticsState} from './services/diagnostics-state.service';
import {NodeRuntimeState} from '../node-runtime-state.service';
/**
 * The delay between the last typed character and the actual file save.
 * This is used to prevent saving the file on every keystroke.
 *
 * Important! this value is intentionally set a bit higher than it needs to be, because sending
 * changes too frequently to the web container appears to put it in a state where it stops picking
 * up changes. See issue #691 for context.
 */
export const EDITOR_CONTENT_CHANGE_DELAY_MILLIES = 500;
const INITIAL_STATES = {
  _editorView: null,
  files: [],
  currentFile: {
    filename: '',
    content: '',
    language: LANGUAGES['ts'],
  },
  contentChangeListenerSubscription$: undefined,
  tutorialChangeListener$: undefined,
  createdFile$: undefined,
};
let CodeMirrorEditor = (() => {
  let _classDecorators = [Injectable({providedIn: 'root'})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var CodeMirrorEditor = class {
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
      CodeMirrorEditor = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    // TODO: handle files created by the user, e.g. after running `ng generate component`
    files = signal(INITIAL_STATES.files);
    openFiles = signal(INITIAL_STATES.files);
    currentFile = signal(INITIAL_STATES.currentFile);
    // An instance of web worker used to run virtual TypeScript environment in the browser.
    // It allows to enrich CodeMirror UX for TypeScript files.
    tsVfsWorker = null;
    // EventManager gives ability to communicate between tsVfsWorker and CodeMirror instance
    eventManager$ = new Subject();
    nodeRuntimeSandbox = inject(NodeRuntimeSandbox);
    nodeRuntimeState = inject(NodeRuntimeState);
    embeddedTutorialManager = inject(EmbeddedTutorialManager);
    typingsLoader = inject(TypingsLoader);
    destroyRef = inject(DestroyRef);
    diagnosticsState = inject(DiagnosticsState);
    _editorView = INITIAL_STATES._editorView;
    _editorStates = new Map();
    contentChanged$ = new Subject();
    contentChangeListener$ = this.contentChanged$.asObservable();
    contentChangeListenerSubscription$ = INITIAL_STATES.contentChangeListenerSubscription$;
    tutorialChangeListener$ = INITIAL_STATES.tutorialChangeListener$;
    createdFileListener$ = INITIAL_STATES.createdFile$;
    init(parentElement) {
      if (this._editorView) return;
      if (!this.nodeRuntimeState.error()) {
        this.initTypescriptVfsWorker();
        this.saveLibrariesTypes();
      }
      this._editorView = new EditorView({
        parent: parentElement,
        state: this.createEditorState(),
        dispatchTransactions: (transactions, view) => {
          view.update(transactions);
          for (const transaction of transactions) {
            if (transaction.docChanged && this.currentFile().filename) {
              this.contentChanged$.next(transaction.state.doc.toString());
              this.changeFileContentsOnRealTime(transaction);
            }
          }
        },
      });
      this.listenToProjectChanges();
      this.contentChangeListenerSubscription$ = this.contentChangeListener$
        .pipe(
          debounceTime(EDITOR_CONTENT_CHANGE_DELAY_MILLIES),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe(async (fileContents) => {
          await this.changeFileContentsScheduled(fileContents);
        });
      this.createdFileListener$ = this.nodeRuntimeSandbox.createdFile$.subscribe(
        async (createdFile) => {
          await this.addCreatedFileToCodeEditor(createdFile);
        },
      );
      // Create TypeScript virtual filesystem when default files map is created
      // and files are set
      this.eventManager$
        .pipe(
          filter(
            (event) =>
              event.action ===
                'default-fs-ready' /* TsVfsWorkerActions.INIT_DEFAULT_FILE_SYSTEM_MAP */ &&
              this.files().length > 0,
          ),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe(() => {
          this.createVfsEnv();
        });
    }
    disable() {
      this._editorView?.destroy();
      this._editorView = null;
      this._editorView = INITIAL_STATES._editorView;
      this.files.set(INITIAL_STATES.files);
      this.currentFile.set(INITIAL_STATES.currentFile);
      this._editorStates.clear();
      this.contentChangeListenerSubscription$?.unsubscribe();
      this.contentChangeListenerSubscription$ = INITIAL_STATES.contentChangeListenerSubscription$;
      this.tutorialChangeListener$?.unsubscribe();
      this.tutorialChangeListener$ = INITIAL_STATES.tutorialChangeListener$;
      this.createdFileListener$?.unsubscribe();
      this.createdFileListener$ = INITIAL_STATES.createdFile$;
    }
    changeCurrentFile(fileName) {
      if (!this._editorView) return;
      const newFile = this.files().find((file) => file.filename === fileName);
      if (!newFile) throw new Error(`File '${fileName}' not found`);
      this.currentFile.set(newFile);
      const editorState = this._editorStates.get(newFile.filename) ?? this.createEditorState();
      this._editorView.setState(editorState);
    }
    initTypescriptVfsWorker() {
      if (this.tsVfsWorker) {
        return;
      }
      this.tsVfsWorker = new Worker(new URL('./workers/typescript-vfs.worker', import.meta.url), {
        type: 'module',
      });
      this.tsVfsWorker.addEventListener('message', ({data}) => {
        this.eventManager$.next(data);
      });
    }
    saveLibrariesTypes() {
      this.typingsLoader.typings$
        .pipe(
          filter((typings) => typings.length > 0),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe((typings) => {
          this.sendRequestToTsVfs({
            action: 'define-types-request' /* TsVfsWorkerActions.DEFINE_TYPES_REQUEST */,
            data: typings,
          });
          // Reset current file to trigger diagnostics after preload @angular libraries.
          this._editorView?.setState(this._editorStates.get(this.currentFile().filename));
        });
    }
    // Method is responsible for sending request to Typescript VFS worker.
    sendRequestToTsVfs = (request) => {
      if (!this.tsVfsWorker) return;
      // Send message to tsVfsWorker only when current file is TypeScript file.
      if (!this.currentFile().filename.endsWith('.ts')) return;
      this.tsVfsWorker.postMessage(request);
    };
    getVfsEnvFileSystemMap() {
      const fileSystemMap = new Map();
      for (const file of this.files().filter((file) => file.filename.endsWith('.ts'))) {
        fileSystemMap.set(`/${file.filename}`, file.content);
      }
      return fileSystemMap;
    }
    /**
     * Create virtual environment for TypeScript files
     */
    createVfsEnv() {
      this.sendRequestToTsVfs({
        action: 'create-vfs-env-request' /* TsVfsWorkerActions.CREATE_VFS_ENV_REQUEST */,
        data: this.getVfsEnvFileSystemMap(),
      });
    }
    /**
     * Update virtual TypeScript file system with current code editor files
     */
    updateVfsEnv() {
      this.sendRequestToTsVfs({
        action: 'update-vfs-env-request' /* TsVfsWorkerActions.UPDATE_VFS_ENV_REQUEST */,
        data: this.getVfsEnvFileSystemMap(),
      });
    }
    listenToProjectChanges() {
      this.tutorialChangeListener$ = this.embeddedTutorialManager.tutorialChanged$
        .pipe(
          map(() => this.embeddedTutorialManager.tutorialFiles()),
          filter((tutorialFiles) => Object.keys(tutorialFiles).length > 0),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe(() => {
          this.changeProject();
        });
    }
    changeProject() {
      this.setProjectFiles();
      this._editorStates.clear();
      this.changeCurrentFile(this.currentFile().filename);
      this.updateVfsEnv();
    }
    setProjectFiles() {
      const tutorialFiles = this.getTutorialFiles(this.embeddedTutorialManager.tutorialFiles());
      const openFiles = [];
      // iterate openFiles to keep files order
      for (const openFileName of this.embeddedTutorialManager.openFiles()) {
        const openFile = tutorialFiles.find(({filename}) => filename === openFileName);
        if (openFile) {
          openFiles.push(openFile);
        }
      }
      this.files.set(tutorialFiles);
      this.openFiles.set(openFiles);
      this.changeCurrentFile(openFiles[0].filename);
    }
    /**
     * Update the code editor files when files are created
     */
    async addCreatedFileToCodeEditor(createdFile) {
      const fileContents = await this.nodeRuntimeSandbox.readFile(createdFile);
      this.embeddedTutorialManager.tutorialFiles.update((files) => ({
        ...files,
        [createdFile]: fileContents,
      }));
      this.embeddedTutorialManager.openFiles.update((files) => [...files, createdFile]);
      this.setProjectFiles();
      this.updateVfsEnv();
      this.saveLibrariesTypes();
    }
    async createFile(filename) {
      // if file already exists, use its content
      const content = await this.nodeRuntimeSandbox.readFile(filename).catch((error) => {
        // empty content if file does not exist
        if (error.message.includes('ENOENT')) return '';
        else throw error;
      });
      await this.nodeRuntimeSandbox.writeFile(filename, content);
      this.embeddedTutorialManager.tutorialFiles.update((files) => ({
        ...files,
        [filename]: content,
      }));
      this.embeddedTutorialManager.openFiles.update((files) => [...files, filename]);
      this.setProjectFiles();
      this.updateVfsEnv();
      this.saveLibrariesTypes();
      this.changeCurrentFile(filename);
    }
    async renameFile(oldPath, newPath) {
      const content = await this.nodeRuntimeSandbox.readFile(oldPath).catch((error) => {
        // empty content if file does not exist
        if (error.message.includes('ENOENT')) return '';
        else throw error;
      });
      await this.nodeRuntimeSandbox.renameFile(oldPath, newPath).catch((error) => {
        throw error;
      });
      this.embeddedTutorialManager.tutorialFiles.update((files) => {
        delete files[oldPath];
        files[newPath] = content;
        return files;
      });
      this.embeddedTutorialManager.openFiles.update((files) => [
        ...files.filter((file) => file !== oldPath),
        newPath,
      ]);
      this.setProjectFiles();
      this.updateVfsEnv();
      this.saveLibrariesTypes();
      this.changeCurrentFile(newPath);
    }
    async deleteFile(deletedFile) {
      await this.nodeRuntimeSandbox.deleteFile(deletedFile);
      this.embeddedTutorialManager.tutorialFiles.update((files) => {
        delete files[deletedFile];
        return files;
      });
      this.embeddedTutorialManager.openFiles.update((files) =>
        files.filter((file) => file !== deletedFile),
      );
      this.setProjectFiles();
      this.updateVfsEnv();
      this.saveLibrariesTypes();
    }
    createEditorState() {
      const newEditorState = EditorState.create({
        doc: this.currentFile().content,
        extensions: [
          ...CODE_EDITOR_EXTENSIONS,
          this.currentFile().language,
          placeholderExtension('Type your code here...'),
          ...this.getLanguageExtensions(),
        ],
      });
      this._editorStates.set(this.currentFile().filename, newEditorState);
      return newEditorState;
    }
    getLanguageExtensions() {
      if (this.currentFile().filename.endsWith('.ts')) {
        return [
          getAutocompleteExtension(this.eventManager$, this.currentFile, this.sendRequestToTsVfs),
          getDiagnosticsExtension(
            this.eventManager$,
            this.currentFile,
            this.sendRequestToTsVfs,
            this.diagnosticsState,
          ),
          getTooltipExtension(this.eventManager$, this.currentFile, this.sendRequestToTsVfs),
        ];
      }
      return [];
    }
    /**
     * Write the new file contents to the sandbox filesystem
     */
    async changeFileContentsScheduled(newContent) {
      try {
        await this.nodeRuntimeSandbox.writeFile(this.currentFile().filename, newContent);
      } catch (err) {
        // Note: `writeFile` throws if the sandbox is not initialized yet, which can happen if
        // the user starts typing right after the page loads.
        // Here the error is ignored as it is expected.
      }
    }
    /**
     * Change file contents on files signals and update the editor state
     */
    changeFileContentsOnRealTime(transaction) {
      this._editorStates.set(this.currentFile().filename, transaction.state);
      const newContent = transaction.state.doc.toString();
      this.currentFile.update((currentFile) => ({...currentFile, content: newContent}));
      this.files.update((files) =>
        files.map((file) =>
          file.filename === this.currentFile().filename ? {...file, content: newContent} : file,
        ),
      );
      // send current file content to Ts Vfs worker to run diagnostics on current file state
      this.sendRequestToTsVfs({
        action: 'code-changed' /* TsVfsWorkerActions.CODE_CHANGED */,
        data: {
          file: this.currentFile().filename,
          code: newContent,
        },
      });
    }
    getTutorialFiles(files) {
      const languagesExtensions = Object.keys(LANGUAGES);
      const tutorialFiles = Object.entries(files)
        .filter((fileAndContent) => typeof fileAndContent[1] === 'string')
        .map(([filename, content]) => {
          const extension = languagesExtensions.find((extension) => filename.endsWith(extension));
          const language = extension ? LANGUAGES[extension] : LANGUAGES['ts'];
          return {
            filename,
            content,
            language,
          };
        });
      return tutorialFiles;
    }
  };
  return (CodeMirrorEditor = _classThis);
})();
export {CodeMirrorEditor};
//# sourceMappingURL=code-mirror-editor.service.js.map
