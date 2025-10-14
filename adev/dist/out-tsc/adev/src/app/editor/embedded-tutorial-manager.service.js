/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {Injectable, signal} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {TUTORIALS_ASSETS_WEB_PATH} from './constants';
/**
 * A service responsible for the current tutorial, retrieving and providing
 * its source code and metadata.
 */
let EmbeddedTutorialManager = (() => {
  let _classDecorators = [Injectable({providedIn: 'root'})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var EmbeddedTutorialManager = class {
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
      EmbeddedTutorialManager = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    tutorialId = signal('');
    tutorialFilesystemTree = signal(null);
    commonFilesystemTree = signal(null);
    type = signal(undefined);
    allFiles = signal([]);
    hiddenFiles = signal([]);
    tutorialFiles = signal({});
    openFiles = signal([]);
    answerFiles = signal({});
    dependencies = signal(undefined);
    _shouldReInstallDependencies = signal(false);
    shouldReInstallDependencies = this._shouldReInstallDependencies.asReadonly();
    metadata = signal(undefined);
    _shouldChangeTutorial$ = new BehaviorSubject(false);
    tutorialChanged$ = this._shouldChangeTutorial$.asObservable();
    _filesToDeleteFromPreviousProject = signal(new Set());
    filesToDeleteFromPreviousProject = this._filesToDeleteFromPreviousProject.asReadonly();
    async fetchAndSetTutorialFiles(tutorial) {
      const [commonSourceCode, tutorialSourceCode, metadata] = await Promise.all([
        this.fetchCommonFiles(),
        this.fetchTutorialSourceCode(tutorial),
        this.fetchTutorialMetadata(tutorial),
      ]);
      const projectChanged = !!this.tutorialId() && this.tutorialId() !== tutorial;
      this.tutorialId.set(tutorial);
      this.type.set(metadata.type);
      this.metadata.set(metadata);
      if (tutorialSourceCode) {
        if (projectChanged) {
          const filesToRemove = this.computeFilesToRemove(metadata.allFiles, this.allFiles());
          if (filesToRemove) {
            this._filesToDeleteFromPreviousProject.set(filesToRemove);
          }
          this._shouldReInstallDependencies.set(
            this.checkIfDependenciesChanged(metadata.dependencies ?? {}),
          );
        }
        this.tutorialFilesystemTree.set(tutorialSourceCode);
        this.dependencies.set(metadata.dependencies ?? {});
        this.tutorialFiles.set(metadata.tutorialFiles);
        this.answerFiles.set(metadata.answerFiles ?? {});
        this.openFiles.set(metadata.openFiles);
        this.hiddenFiles.set(metadata.hiddenFiles);
        this.allFiles.set(metadata.allFiles);
        // set common only once
        if (!this.commonFilesystemTree()) this.commonFilesystemTree.set(commonSourceCode);
      }
      this._shouldChangeTutorial$.next(projectChanged);
    }
    revealAnswer() {
      const answerFilenames = Object.keys(this.answerFiles());
      const openFilesAndAnswer = Array.from(
        // use Set to remove duplicates, spread openFiles first to keep files order
        new Set([...this.openFiles(), ...answerFilenames]),
      ).filter((filename) => !this.hiddenFiles()?.includes(filename));
      const tutorialFiles = Object.fromEntries(
        openFilesAndAnswer.map((file) => [file, this.answerFiles()[file]]),
      );
      const allFilesWithAnswer = [...this.allFiles(), ...answerFilenames];
      const filesToDelete = this.computeFilesToRemove(allFilesWithAnswer, this.allFiles());
      if (filesToDelete) {
        this._filesToDeleteFromPreviousProject.set(filesToDelete);
      }
      this.allFiles.set(allFilesWithAnswer);
      this.tutorialFiles.set(tutorialFiles);
      this.openFiles.set(openFilesAndAnswer);
      this._shouldChangeTutorial$.next(true);
    }
    resetRevealAnswer() {
      const allFilesWithoutAnswer = this.metadata().allFiles;
      const filesToDelete = this.computeFilesToRemove(allFilesWithoutAnswer, this.allFiles());
      if (filesToDelete) {
        this._filesToDeleteFromPreviousProject.set(filesToDelete);
      }
      this.tutorialFiles.set(this.metadata().tutorialFiles);
      this.openFiles.set(this.metadata().openFiles);
      this._shouldChangeTutorial$.next(true);
    }
    async fetchCommonFiles() {
      if (this.commonFilesystemTree() !== null) return this.commonFilesystemTree();
      //const commonFiles = await this.fetchTutorialSourceCode(TUTORIALS_COMMON_DIRECTORY);
      //this.tutorialFilesystemTree.set(commonFiles);
      return {};
    }
    async fetchTutorialSourceCode(tutorial) {
      const tutorialSourceCode = await fetch(
        `${TUTORIALS_ASSETS_WEB_PATH}/${tutorial}/source-code.json`,
      );
      if (!tutorialSourceCode.ok) throw new Error(`Missing source code for tutorial ${tutorial}`);
      return await tutorialSourceCode.json();
    }
    async fetchTutorialMetadata(tutorial) {
      const tutorialSourceCode = await fetch(
        `${TUTORIALS_ASSETS_WEB_PATH}/${tutorial}/metadata.json`,
      );
      if (!tutorialSourceCode.ok) throw new Error(`Missing metadata for ${tutorial}`);
      return await tutorialSourceCode.json();
    }
    /**
     * Compare previous and new dependencies to determine if the dependencies changed.
     */
    checkIfDependenciesChanged(newDeps) {
      const existingDeps = this.dependencies();
      for (const name of Object.keys(newDeps)) {
        if (existingDeps?.[name] !== newDeps[name]) {
          return true;
        }
      }
      return false;
    }
    computeFilesToRemove(newFiles, existingFiles) {
      // All existing files are candidates for removal.
      const filesToDelete = new Set(existingFiles);
      // Retain files that are present in the new project.
      for (const file of newFiles) {
        filesToDelete.delete(file);
      }
      return filesToDelete;
    }
  };
  return (EmbeddedTutorialManager = _classThis);
})();
export {EmbeddedTutorialManager};
//# sourceMappingURL=embedded-tutorial-manager.service.js.map
