/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, signal} from '@angular/core';
import {FileSystemTree} from '@webcontainer/api';
import {BehaviorSubject} from 'rxjs';

import {TutorialMetadata} from '@angular/docs';
import {TUTORIALS_ASSETS_WEB_PATH} from './constants';

/**
 * A service responsible for the current tutorial, retrieving and providing
 * its source code and metadata.
 */
@Injectable({providedIn: 'root'})
export class EmbeddedTutorialManager {
  readonly tutorialId = signal<string>('');
  readonly tutorialFilesystemTree = signal<FileSystemTree | null>(null);
  readonly commonFilesystemTree = signal<FileSystemTree | null>(null);

  readonly type = signal<TutorialMetadata['type'] | undefined>(undefined);

  private readonly allFiles = signal<TutorialMetadata['allFiles']>([]);

  readonly hiddenFiles = signal<TutorialMetadata['hiddenFiles']>([]);
  readonly tutorialFiles = signal<TutorialMetadata['tutorialFiles']>({});
  readonly openFiles = signal<TutorialMetadata['openFiles']>([]);

  readonly answerFiles = signal<NonNullable<TutorialMetadata['answerFiles']>>({});

  readonly dependencies = signal<TutorialMetadata['dependencies'] | undefined>(undefined);
  private _shouldReInstallDependencies = signal<boolean>(false);
  readonly shouldReInstallDependencies = this._shouldReInstallDependencies.asReadonly();

  private metadata = signal<TutorialMetadata | undefined>(undefined);

  private _shouldChangeTutorial$ = new BehaviorSubject<boolean>(false);
  readonly tutorialChanged$ = this._shouldChangeTutorial$.asObservable();

  private readonly _filesToDeleteFromPreviousProject = signal(new Set<string>());
  readonly filesToDeleteFromPreviousProject = this._filesToDeleteFromPreviousProject.asReadonly();

  async fetchAndSetTutorialFiles(tutorial: string) {
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
    const allFilesWithoutAnswer = this.metadata()!.allFiles;
    const filesToDelete = this.computeFilesToRemove(allFilesWithoutAnswer, this.allFiles());

    if (filesToDelete) {
      this._filesToDeleteFromPreviousProject.set(filesToDelete);
    }

    this.tutorialFiles.set(this.metadata()!.tutorialFiles);
    this.openFiles.set(this.metadata()!.openFiles);
    this._shouldChangeTutorial$.next(true);
  }

  async fetchCommonFiles(): Promise<FileSystemTree> {
    if (this.commonFilesystemTree() !== null) return this.commonFilesystemTree() as FileSystemTree;

    //const commonFiles = await this.fetchTutorialSourceCode(TUTORIALS_COMMON_DIRECTORY);

    //this.tutorialFilesystemTree.set(commonFiles);

    return {};
  }

  private async fetchTutorialSourceCode(tutorial: string): Promise<FileSystemTree> {
    const tutorialSourceCode = await fetch(
      `${TUTORIALS_ASSETS_WEB_PATH}/${tutorial}/source-code.json`,
    );

    if (!tutorialSourceCode.ok) throw new Error(`Missing source code for tutorial ${tutorial}`);

    return await tutorialSourceCode.json();
  }

  private async fetchTutorialMetadata(tutorial: string): Promise<TutorialMetadata> {
    const tutorialSourceCode = await fetch(
      `${TUTORIALS_ASSETS_WEB_PATH}/${tutorial}/metadata.json`,
    );

    if (!tutorialSourceCode.ok) throw new Error(`Missing metadata for ${tutorial}`);

    return await tutorialSourceCode.json();
  }

  /**
   * Compare previous and new dependencies to determine if the dependencies changed.
   */
  private checkIfDependenciesChanged(
    newDeps: NonNullable<TutorialMetadata['dependencies']>,
  ): boolean {
    const existingDeps = this.dependencies();

    for (const name of Object.keys(newDeps)) {
      if (existingDeps?.[name] !== newDeps[name]) {
        return true;
      }
    }

    return false;
  }

  private computeFilesToRemove(
    newFiles: TutorialMetadata['allFiles'],
    existingFiles: TutorialMetadata['allFiles'],
  ): Set<string> | undefined {
    // All existing files are candidates for removal.
    const filesToDelete = new Set(existingFiles);

    // Retain files that are present in the new project.
    for (const file of newFiles) {
      filesToDelete.delete(file);
    }

    return filesToDelete;
  }
}
