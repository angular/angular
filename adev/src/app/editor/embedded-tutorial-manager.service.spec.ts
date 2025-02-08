/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {TestBed} from '@angular/core/testing';
import type {FileSystemTree} from '@webcontainer/api';

import {type TutorialConfig, type TutorialMetadata, TutorialType} from '@angular/docs';
import {TUTORIALS_ASSETS_WEB_PATH} from '../editor/constants';
import {EmbeddedTutorialManager} from './embedded-tutorial-manager.service';

describe('EmbeddedTutorialManager', () => {
  let service: EmbeddedTutorialManager;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EmbeddedTutorialManager],
    });
    service = TestBed.inject(EmbeddedTutorialManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set the tutorialFiles as the answerFiles on revealAnswer', () => {
    const tutorialFiles = {'file': 'content'};
    const answerFiles = {'file': 'answer'};
    service['answerFiles'].set(answerFiles);
    service['tutorialFiles'].set(tutorialFiles);

    service.revealAnswer();
    expect(service.tutorialFiles()).toEqual(answerFiles);
  });

  it('should reset the tutorialFiles on resetRevealAnswer', () => {
    const tutorialFiles = {'file': 'original'};
    const answerFiles = {'file': 'answer'};
    const openFiles = ['file'];
    const config: TutorialConfig = {
      title: '',
      type: TutorialType.EDITOR,
      openFiles,
    };

    // set fake metadata as tutorialFiles will be reset based on
    // metadata.tutorialFiles
    service['metadata'].set({
      answerFiles,
      tutorialFiles,
      openFiles,
      hiddenFiles: [],
      type: config.type,
      dependencies: {},
      allFiles: [],
    });
    service['answerFiles'].set(answerFiles);
    service['hiddenFiles'].set(['hidden.ts']);

    service.revealAnswer();
    expect(service.tutorialFiles()).toEqual(answerFiles);
    expect(service.openFiles()).toEqual(openFiles);

    service.resetRevealAnswer();
    expect(service.tutorialFiles()).toEqual(tutorialFiles);
    expect(service.openFiles()).toEqual(openFiles);
  });

  it('should not have hiddenFiles in openFiles on reveal and reset answer', () => {
    const hiddenFiles = ['hidden1.ts', 'hidden2.ts'];
    const openFiles = ['open.ts'];
    const tutorialFiles = {
      [openFiles[0]]: 'content',
      [hiddenFiles[0]]: 'content',
    };
    const answerFiles = {'answer.ts': 'answer'};
    const config: TutorialConfig = {
      title: '',
      type: TutorialType.EDITOR,
      openFiles,
    };

    service.hiddenFiles.set(hiddenFiles);
    service.openFiles.set(openFiles);
    service.tutorialFiles.set(tutorialFiles);
    service.answerFiles.set(answerFiles);
    service['metadata'].set({
      answerFiles,
      tutorialFiles,
      openFiles,
      hiddenFiles,
      type: config.type,
      dependencies: {},
      allFiles: [],
    });

    service.revealAnswer();
    for (const hiddenFile of hiddenFiles) {
      expect(service.openFiles()).not.toContain(hiddenFile);
    }

    service.resetRevealAnswer();
    for (const hiddenFile of hiddenFiles) {
      expect(service.openFiles()).not.toContain(hiddenFile);
    }
  });

  it('should have answer files that are not hidden as openFiles on reveal answer', () => {
    const openFiles = ['file.ts'];
    const tutorialFiles = {
      [openFiles[0]]: 'content',
    };

    const newFile = 'new-file.ts';
    const answerFiles = {
      [openFiles[0]]: 'answer',
      [newFile]: 'answer',
    };

    const config: TutorialConfig = {
      title: '',
      type: TutorialType.EDITOR,
      openFiles,
    };

    service.openFiles.set(openFiles);
    service.tutorialFiles.set(tutorialFiles);
    service.answerFiles.set(answerFiles);
    service['metadata'].set({
      answerFiles,
      tutorialFiles,
      openFiles,
      hiddenFiles: [],
      type: config.type,
      dependencies: {},
      allFiles: [],
    });

    service.revealAnswer();
    expect(service.openFiles()).toContain(newFile);
  });

  it('should not have duplicate files in openFiles on reveal and reset answer', () => {
    const openFiles = ['file.ts'];
    const tutorialFiles = {
      [openFiles[0]]: 'content',
    };
    const answerFiles = {
      [openFiles[0]]: 'answer',
    };

    const config: TutorialConfig = {
      title: '',
      type: TutorialType.EDITOR,
      openFiles,
    };

    service.openFiles.set(openFiles);
    service.tutorialFiles.set(tutorialFiles);
    service.answerFiles.set(answerFiles);
    service['metadata'].set({
      answerFiles,
      tutorialFiles,
      openFiles,
      hiddenFiles: [],
      type: config.type,
      dependencies: {},
      allFiles: [],
    });

    service.revealAnswer();
    expect(service.openFiles().length).toBe(1);

    service.resetRevealAnswer();
    expect(service.openFiles().length).toBe(1);
  });

  it('should keep openFiles order on reveal and reset answer', () => {
    const openFiles = ['1', '2', '3'];
    const tutorialFiles = {
      [openFiles[0]]: 'content',
      [openFiles[1]]: 'content',
      [openFiles[2]]: 'content',
    };
    const answerFiles = {
      [openFiles[0]]: 'answer',
      [openFiles[1]]: 'answer',
      [openFiles[2]]: 'answer',
      '0': 'answer',
    };

    const config: TutorialConfig = {
      title: '',
      type: TutorialType.EDITOR,
      openFiles,
    };

    service.openFiles.set(openFiles);
    service.tutorialFiles.set(tutorialFiles);
    service.answerFiles.set(answerFiles);
    service['metadata'].set({
      answerFiles,
      tutorialFiles,
      openFiles,
      hiddenFiles: [],
      dependencies: {},
      type: config.type,
      allFiles: [],
    });

    service.revealAnswer();

    for (const [index, openFile] of service.openFiles().entries()) {
      if (openFiles[index]) {
        expect(openFile).toBe(openFiles[index]);
      }
    }

    service.resetRevealAnswer();
    for (const [index, openFile] of service.openFiles().entries()) {
      expect(openFile).toBe(openFiles[index]);
    }
  });

  it('should trigger tutorial change on reveal answer', () => {
    const _shouldChangeTutorial$Spy = spyOn(service['_shouldChangeTutorial$'], 'next');

    service.revealAnswer();

    expect(_shouldChangeTutorial$Spy).toHaveBeenCalled();
  });

  describe('fetchAndSetTutorialFiles', () => {
    const tutorial: string = 'tutorial-id';

    it('should fetch tutorial source code and config and set signals', async () => {
      const tutorialSourceCode: FileSystemTree = {
        'tutorial.ts': {
          file: {
            contents: 'code',
          },
        },
      };

      const metadata: TutorialMetadata = {
        tutorialFiles: {'app.js': ''},
        openFiles: ['app.js'],
        type: TutorialType.EDITOR,
        hiddenFiles: ['hidden.ts'],
        answerFiles: {'app.js': ''},
        dependencies: {},
        allFiles: [],
      };

      const fetchMock = spyOn(window, 'fetch');
      fetchMock.and.returnValues(
        Promise.resolve(new Response(JSON.stringify(tutorialSourceCode))),
        Promise.resolve(new Response(JSON.stringify(metadata))),
      );

      await service.fetchAndSetTutorialFiles(tutorial);

      expect(fetchMock).toHaveBeenCalledTimes(2);

      expect(service.tutorialId()).toEqual(tutorial);
      expect(service.tutorialFilesystemTree()).toEqual(tutorialSourceCode);
      expect(service.openFiles()).toEqual(metadata.openFiles!);
      expect(service.tutorialFiles()).toEqual(metadata.tutorialFiles!);

      expect(service['metadata']()).toEqual(metadata);

      expect(service.type()).toEqual(metadata.type);

      expect(service.hiddenFiles()).toEqual(metadata.hiddenFiles);
      expect(service.answerFiles()).toEqual(metadata.answerFiles!);
    });

    it('should throw an error if the tutorial files cannot be fetched', async () => {
      const fetchMock = spyOn(window, 'fetch');

      fetchMock
        .withArgs(`${TUTORIALS_ASSETS_WEB_PATH}/${tutorial}/source-code.json`)
        .and.returnValues(Promise.resolve(new Response(null, {status: 404})));

      fetchMock
        .withArgs(`${TUTORIALS_ASSETS_WEB_PATH}/${tutorial}/metadata.json`)
        .and.returnValues(Promise.resolve(new Response(null, {status: 404})));

      await expectAsync(service.fetchAndSetTutorialFiles(tutorial)).toBeRejectedWithError(
        `Missing source code for tutorial ${tutorial}`,
      );
    });

    it('should not set shouldReinstallDependencies if project did not change', async () => {
      const fetchMock = spyOn(window, 'fetch');

      fetchMock
        .withArgs(`${TUTORIALS_ASSETS_WEB_PATH}/${tutorial}/source-code.json`)
        .and.returnValues(Promise.resolve(new Response('{}', {status: 200})));

      fetchMock.withArgs(`${TUTORIALS_ASSETS_WEB_PATH}/${tutorial}/metadata.json`).and.returnValues(
        Promise.resolve(
          new Response(
            JSON.stringify({
              dependencies: {
                '@angular/core': '2.0.0',
              },
              allFiles: [],
            }),
            {status: 200},
          ),
        ),
      );

      await service['fetchAndSetTutorialFiles'](tutorial);

      expect(service.shouldReInstallDependencies()).toBe(false);
    });

    it('should trigger shouldReInstallDependencies if new metadata has different dependencies', async () => {
      const fetchMock = spyOn(window, 'fetch');

      fetchMock
        .withArgs(`${TUTORIALS_ASSETS_WEB_PATH}/${tutorial}/source-code.json`)
        .and.returnValues(Promise.resolve(new Response('{}', {status: 200})));

      fetchMock.withArgs(`${TUTORIALS_ASSETS_WEB_PATH}/${tutorial}/metadata.json`).and.returnValues(
        Promise.resolve(
          new Response(
            JSON.stringify({
              dependencies: {
                '@angular/core': '2.0.0',
              },
              allFiles: [],
            }),
            {status: 200},
          ),
        ),
      );

      service['tutorialId'].set('previous-tutorial');
      service['dependencies'].set({
        '@angular/core': '1.0.0',
      });

      await service['fetchAndSetTutorialFiles'](tutorial);

      expect(service.shouldReInstallDependencies()).toBe(true);
    });

    it('should trigger shouldReInstallDependencies if new metadata has dependencies and previous dependencies were empty', async () => {
      const fetchMock = spyOn(window, 'fetch');

      fetchMock
        .withArgs(`${TUTORIALS_ASSETS_WEB_PATH}/${tutorial}/source-code.json`)
        .and.returnValues(Promise.resolve(new Response('{}', {status: 200})));

      fetchMock.withArgs(`${TUTORIALS_ASSETS_WEB_PATH}/${tutorial}/metadata.json`).and.returnValues(
        Promise.resolve(
          new Response(
            JSON.stringify({
              dependencies: {
                '@angular/core': '2.0.0',
              },
              allFiles: [],
            }),
            {status: 200},
          ),
        ),
      );

      service['tutorialId'].set('previous-tutorial');
      service['dependencies'].set({});

      await service['fetchAndSetTutorialFiles'](tutorial);

      expect(service.shouldReInstallDependencies()).toBe(true);
    });

    it('should not trigger shouldReInstallDependencies if new metadata has same dependencies', async () => {
      const fetchMock = spyOn(window, 'fetch');

      fetchMock
        .withArgs(`${TUTORIALS_ASSETS_WEB_PATH}/${tutorial}/source-code.json`)
        .and.returnValues(Promise.resolve(new Response('{}', {status: 200})));

      fetchMock.withArgs(`${TUTORIALS_ASSETS_WEB_PATH}/${tutorial}/metadata.json`).and.returnValues(
        Promise.resolve(
          new Response(
            JSON.stringify({
              dependencies: {
                '@angular/core': '1.0.0',
              },
              allFiles: [],
            }),
            {status: 200},
          ),
        ),
      );

      service['tutorialId'].set('previous-tutorial');
      service['dependencies'].set({
        '@angular/core': '1.0.0',
      });

      await service['fetchAndSetTutorialFiles'](tutorial);

      expect(service.shouldReInstallDependencies()).toBe(false);
    });

    it('should set files to delete on project change if previous project has unused files', async () => {
      const fetchMock = spyOn(window, 'fetch');

      fetchMock
        .withArgs(`${TUTORIALS_ASSETS_WEB_PATH}/${tutorial}/source-code.json`)
        .and.returnValues(Promise.resolve(new Response('{}', {status: 200})));

      const allFiles = ['file1.ts', 'file2.ts'];

      fetchMock.withArgs(`${TUTORIALS_ASSETS_WEB_PATH}/${tutorial}/metadata.json`).and.returnValues(
        Promise.resolve(
          new Response(
            JSON.stringify({
              allFiles,
            }),
            {status: 200},
          ),
        ),
      );

      const unusedFiles = ['old-file.ts', 'old-file.css'];
      const previousFiles = [...allFiles, ...unusedFiles];

      service['tutorialId'].set('previous-tutorial');
      service['allFiles'].set(previousFiles);

      await service['fetchAndSetTutorialFiles'](tutorial);

      expect(service['filesToDeleteFromPreviousProject']()).toEqual(new Set(unusedFiles));
    });

    it('should set no files to delete on project change if previous project has same files as new project', async () => {
      const fetchMock = spyOn(window, 'fetch');

      fetchMock
        .withArgs(`${TUTORIALS_ASSETS_WEB_PATH}/${tutorial}/source-code.json`)
        .and.returnValues(Promise.resolve(new Response('{}', {status: 200})));

      const allFiles = ['file1.ts', 'file2.ts'];

      fetchMock.withArgs(`${TUTORIALS_ASSETS_WEB_PATH}/${tutorial}/metadata.json`).and.returnValues(
        Promise.resolve(
          new Response(
            JSON.stringify({
              allFiles,
            }),
            {status: 200},
          ),
        ),
      );

      service['tutorialId'].set('previous-tutorial');
      service['allFiles'].set(allFiles);

      await service['fetchAndSetTutorialFiles'](tutorial);

      expect(service['filesToDeleteFromPreviousProject']().size).toBe(0);
    });

    it('should not set files to delete if project did not change', async () => {
      const fetchMock = spyOn(window, 'fetch');

      fetchMock
        .withArgs(`${TUTORIALS_ASSETS_WEB_PATH}/${tutorial}/source-code.json`)
        .and.returnValues(Promise.resolve(new Response('{}', {status: 200})));

      const allFiles = ['file1.ts', 'file2.ts'];

      fetchMock.withArgs(`${TUTORIALS_ASSETS_WEB_PATH}/${tutorial}/metadata.json`).and.returnValues(
        Promise.resolve(
          new Response(
            JSON.stringify({
              allFiles,
            }),
            {status: 200},
          ),
        ),
      );

      expect(service['allFiles']().length).toBe(0);

      await service['fetchAndSetTutorialFiles'](tutorial);

      expect(service['filesToDeleteFromPreviousProject']().size).toBe(0);
    });
  });
});
