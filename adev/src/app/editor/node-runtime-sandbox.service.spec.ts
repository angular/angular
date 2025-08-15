/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';
import {BehaviorSubject, of as observableOf} from 'rxjs';

import {signal} from '@angular/core';
import {WebContainer} from '@webcontainer/api';
import {FakeWebContainer, FakeWebContainerProcess, TutorialType} from '@angular/docs';
import {AlertManager} from './alert-manager.service';
import {EmbeddedTutorialManager} from './embedded-tutorial-manager.service';
import {LoadingStep} from './enums/loading-steps';
import {NodeRuntimeSandbox, PACKAGE_MANAGER} from './node-runtime-sandbox.service';
import {NodeRuntimeState} from './node-runtime-state.service';
import {TerminalHandler} from './terminal/terminal-handler.service';
import {TypingsLoader} from './typings-loader.service';
import {DEV_SERVER_READY_MSG, OUT_OF_MEMORY_MSG} from './node-runtime-errors';

describe('NodeRuntimeSandbox', () => {
  let testBed: TestBed;
  let service: NodeRuntimeSandbox;

  const fakeTerminalHandler = {
    interactiveTerminalInstance: signal({
      write: (data: string) => {},
      onData: (data: string) => {},
      breakProcess$: observableOf(),
    }),
    readonlyTerminalInstance: signal({
      write: (data: string) => {},
    }),
    clearTerminals: () => {},
  };

  const tutorialChanged$ = new BehaviorSubject(false);

  const fakeEmbeddedTutorialManager: Partial<EmbeddedTutorialManager> = {
    tutorialId: signal('tutorial'),
    tutorialFilesystemTree: signal({'app.js': {file: {contents: ''}}}),
    commonFilesystemTree: signal({'app.js': {file: {contents: ''}}}),
    openFiles: signal(['app.js']),
    tutorialFiles: signal({'app.js': ''}),
    hiddenFiles: signal(['hidden.js']),
    answerFiles: signal({'answer.ts': ''}),
    type: signal(TutorialType.EDITOR),
    tutorialChanged$,
    shouldReInstallDependencies: signal(false),
    filesToDeleteFromPreviousProject: signal(new Set([])),
  };

  const setValuesToInitializeAngularCLI = () => {
    service['embeddedTutorialManager'].type.set(TutorialType.CLI);
    service['webContainerPromise'] = Promise.resolve(
      new FakeWebContainer() as unknown as WebContainer,
    );
  };

  const setValuesToInitializeProject = () => {
    service['embeddedTutorialManager'].type.set(TutorialType.EDITOR);

    const fakeSpawnProcess = new FakeWebContainerProcess();
    fakeSpawnProcess.output = {
      pipeTo: (data: WritableStream) => {
        data.getWriter().write(DEV_SERVER_READY_MSG);
      },
      pipeThrough: () => fakeSpawnProcess.output,
    } as any;

    service['webContainerPromise'] = Promise.resolve(
      new FakeWebContainer({spawn: fakeSpawnProcess}) as unknown as WebContainer,
    );
  };

  const setValuesToCatchOutOfMemoryError = () => {
    service['embeddedTutorialManager'].type.set(TutorialType.EDITOR);

    const fakeSpawnProcess = new FakeWebContainerProcess();
    fakeSpawnProcess.output = {
      pipeTo: (data: WritableStream) => {
        data.getWriter().write(OUT_OF_MEMORY_MSG);
      },
      pipeThrough: () => fakeSpawnProcess.output,
    } as any;

    service['webContainerPromise'] = Promise.resolve(
      new FakeWebContainer({spawn: fakeSpawnProcess}) as unknown as WebContainer,
    );
  };

  const fakeTypingsLoader: Partial<TypingsLoader> = {
    retrieveTypeDefinitions: (webcontainer: WebContainer) => Promise.resolve(),
  };
  const fakeAlertManager = {
    init: () => {},
  };

  beforeEach(() => {
    testBed = TestBed.configureTestingModule({
      providers: [
        NodeRuntimeSandbox,
        {
          provide: TerminalHandler,
          useValue: fakeTerminalHandler,
        },
        {
          provide: TypingsLoader,
          useValue: fakeTypingsLoader,
        },
        {
          provide: EmbeddedTutorialManager,
          useValue: fakeEmbeddedTutorialManager,
        },
        {
          provide: AlertManager,
          useValue: fakeAlertManager,
        },
        {
          provide: NodeRuntimeState,
        },
      ],
    });

    service = testBed.inject(NodeRuntimeSandbox);

    service['embeddedTutorialManager'].type.set(TutorialType.EDITOR);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set error message when install dependencies resolve exitCode not equal to 0', async () => {
    const EXPECTED_ERROR = 'Installation failed';

    service['webContainerPromise'] = Promise.resolve(
      new FakeWebContainer() as unknown as WebContainer,
    );

    const fakeSpawn = new FakeWebContainerProcess();
    fakeSpawn.exit = Promise.resolve(10);

    spyOn(service, 'spawn' as any)
      .withArgs(PACKAGE_MANAGER, ['install'])
      .and.returnValue(fakeSpawn);

    await service.init();

    expect(service['nodeRuntimeState'].error()?.message).toBe(EXPECTED_ERROR);
  });

  it('should have ready loading state after init succeeds', async () => {
    setValuesToInitializeProject();

    await service.init();

    const state = TestBed.inject(NodeRuntimeState);
    expect(state.loadingStep()).toBe(LoadingStep.READY);
  });

  it('should call writeFile with proper parameters', async () => {
    setValuesToInitializeProject();

    const fakeWebContainer = new FakeWebContainer();
    service['webContainerPromise'] = Promise.resolve(fakeWebContainer as unknown as WebContainer);
    const writeFileSpy = spyOn(fakeWebContainer.fs, 'writeFile');

    const path = 'path';
    const content = 'content';

    await service.writeFile(path, content);
    expect(writeFileSpy).toHaveBeenCalledOnceWith(path, content);
  });

  it('should call renameFile with proper parameters', async () => {
    setValuesToInitializeProject();

    const fakeWebContainer = new FakeWebContainer();
    service['webContainerPromise'] = Promise.resolve(fakeWebContainer as unknown as WebContainer);
    const renameFileSpy = spyOn(fakeWebContainer.fs, 'rename');

    const oldPath = 'oldPath';
    const newPath = 'newPath';

    await service.renameFile(oldPath, newPath);
    expect(renameFileSpy).toHaveBeenCalledOnceWith(oldPath, newPath);
  });

  it('should initialize a project based on the tutorial config', async () => {
    service['webContainerPromise'] = Promise.resolve(
      new FakeWebContainer() as unknown as WebContainer,
    );
    setValuesToInitializeProject();

    const initProjectSpy = spyOn(service, 'initProject' as any);

    await service.init();

    expect(initProjectSpy).toHaveBeenCalled();
  });

  it("should set the error state when an out of memory message is received from the web container's output", async () => {
    service['webContainerPromise'] = Promise.resolve(
      new FakeWebContainer() as unknown as WebContainer,
    );
    setValuesToCatchOutOfMemoryError();

    await service.init();

    expect(service['nodeRuntimeState'].error()!.message).toBe(OUT_OF_MEMORY_MSG);
    expect(service['nodeRuntimeState'].loadingStep()).toBe(LoadingStep.ERROR);
  });

  it('should run reset only once when called twice', async () => {
    const cleanupSpy = spyOn(service, 'cleanup' as any);
    const initSpy = spyOn(service, 'init' as any);

    setValuesToInitializeProject();

    const resetPromise = service.reset();
    const secondResetPromise = service.reset();

    await Promise.all([resetPromise, secondResetPromise]);

    expect(cleanupSpy).toHaveBeenCalledOnceWith();
    expect(initSpy).toHaveBeenCalledOnceWith();
  });

  it('should delete files on project change', async () => {
    service['webContainerPromise'] = Promise.resolve(
      new FakeWebContainer() as unknown as WebContainer,
    );
    setValuesToInitializeProject();

    await service.init();

    const filesToDeleteFromPreviousProject = ['deleteme.ts'];

    service['embeddedTutorialManager'] = {
      ...fakeEmbeddedTutorialManager,
      filesToDeleteFromPreviousProject: signal(new Set(filesToDeleteFromPreviousProject)),
    } as any;

    const createdFiles = ['created.ts'];
    service['_createdFiles'].set(new Set(createdFiles));

    const deleteFileSpy = spyOn(service, 'deleteFile');

    tutorialChanged$.next(true);

    const allFilesToDelete = [...createdFiles, ...filesToDeleteFromPreviousProject];

    for (const fileToDelete of allFilesToDelete) {
      expect(deleteFileSpy).toHaveBeenCalledWith(fileToDelete);
    }
  });

  it('should not have any filePath starting with "/" in solutions files', async () => {
    service['webContainerPromise'] = Promise.resolve(
      new FakeWebContainer() as unknown as WebContainer,
    );
    setValuesToInitializeProject();

    await service.init();

    const files = await service.getSolutionFiles();

    expect(files.length).toBe(1);
    expect(files[0].path).toBe('fake-file');
  });
});
