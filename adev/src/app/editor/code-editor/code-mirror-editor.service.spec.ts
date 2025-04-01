/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BehaviorSubject, Subject} from 'rxjs';
import {EditorState} from '@codemirror/state';
import type {FileSystemTree} from '@webcontainer/api';

import {NodeRuntimeSandbox} from '../node-runtime-sandbox.service';
import {EmbeddedTutorialManager} from '../embedded-tutorial-manager.service';

import {CodeMirrorEditor, EDITOR_CONTENT_CHANGE_DELAY_MILLIES} from './code-mirror-editor.service';
import {TutorialConfig, TutorialMetadata} from '@angular/docs';

class FakeNodeRuntimeSandbox {
  async writeFile(path: string, content: string) {}
  createdFile$ = new Subject<void>();
  async readFile(path: string) {
    return Promise.resolve('content');
  }
}

const files = ['1.ts', '2.ts', '3.ts'];
// reverse the files list to test openFiles order
const filesReverse = [...files].reverse();

export class FakeEmbeddedTutorialManager {
  commonFilesystemTree = signal<FileSystemTree | null>(null);
  previousTutorial = signal<string | undefined>(undefined);
  nextTutorial = signal<string | undefined>(undefined);
  tutorialId = signal<string>('fake-tutorial');
  tutorialFiles = signal<NonNullable<TutorialMetadata['tutorialFiles']>>(
    // use a reverse map to test openFiles order
    Object.fromEntries(filesReverse.map((file) => [file, ''])),
  );
  openFiles = signal<TutorialConfig['openFiles']>(files);
  tutorialFilesystemTree = signal<FileSystemTree>(
    Object.fromEntries(
      files.map((file) => [
        file,
        {
          file: {
            contents: this.tutorialFiles()![0],
          },
        },
      ]),
    ),
  );

  private _shouldChangeTutorial$ = new BehaviorSubject<boolean>(false);
  tutorialChanged$ = this._shouldChangeTutorial$.asObservable();

  fetchAndSetTutorialFiles(tutorial: string): Promise<void> {
    return Promise.resolve();
  }
  fetchCommonFiles(): Promise<FileSystemTree> {
    return Promise.resolve({});
  }
}

describe('CodeMirrorEditor', () => {
  let service: CodeMirrorEditor;

  const fakeNodeRuntimeSandbox = new FakeNodeRuntimeSandbox();
  const fakeEmbeddedTutorialManager = new FakeEmbeddedTutorialManager();

  function dispatchDocumentChange(newContent: string) {
    for (let i = 0; i < newContent.length; i++) {
      service['_editorView']?.dispatch({
        changes: {from: i, insert: newContent[i]},
        selection: {anchor: i, head: 0},
      });
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CodeMirrorEditor,
        {
          provide: NodeRuntimeSandbox,
          useValue: fakeNodeRuntimeSandbox,
        },
        {
          provide: EmbeddedTutorialManager,
          useValue: fakeEmbeddedTutorialManager,
        },
      ],
    });
    service = TestBed.inject(CodeMirrorEditor);

    const parentElement = document.createElement('div');
    service.init(parentElement);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize the editor', () => {
    expect(service['_editorView']).toBeDefined();

    expect(service.files()).toBeDefined();
    expect(service.currentFile()).toBeDefined();

    const editorState = service['_editorStates'].get(service.currentFile().filename);
    expect(editorState).toBeInstanceOf(EditorState);
  });

  it('should change the current file', () => {
    const newFilename = files.at(-1)!;
    service.changeCurrentFile(newFilename);
    expect(service.currentFile().filename).toEqual(newFilename);

    const editorState = service['_editorStates'].get(newFilename);
    const editorContent = editorState?.doc.toString();
    const newFileContent = service.files().find((file) => file.filename === newFilename)?.content;

    expect(editorContent).toBe(newFileContent);
  });

  it('should update the current file content on change', async () => {
    const newContent = 'new content';

    dispatchDocumentChange(newContent);

    const updatedEditorState = service['_editorStates'].get(service.currentFile().filename);
    expect(updatedEditorState?.doc.toString()).toBe(newContent);

    const fileContentOnFilesSignal = service
      .files()
      .find((file) => file.filename === service.currentFile().filename)?.content;

    expect(fileContentOnFilesSignal).toBe(newContent);

    expect(service.currentFile().content).toBe(newContent);
  });

  it('should write the changed file content to the sandbox filesystem', () => {
    jasmine.clock().install();
    jasmine.clock().mockDate();
    const newContent = 'new content';

    const nodeRuntimeSandboxSpy = spyOn(fakeNodeRuntimeSandbox, 'writeFile');

    dispatchDocumentChange(newContent);
    jasmine.clock().tick(EDITOR_CONTENT_CHANGE_DELAY_MILLIES);

    expect(nodeRuntimeSandboxSpy).toHaveBeenCalledWith(service.currentFile().filename, newContent);
    jasmine.clock().uninstall();
  });

  it('should add created file to code editor', async () => {
    const newFile = 'new-component.component.ts';

    await service['addCreatedFileToCodeEditor'](newFile);

    expect(service['embeddedTutorialManager'].tutorialFiles()[newFile]).toBeDefined();
    expect(service.files().find((file) => file.filename === newFile)).toBeDefined();
  });

  it('should keep openFiles order', () => {
    service['setProjectFiles']();

    for (const [index, openFile] of service['openFiles']().entries()) {
      expect(openFile.filename).toEqual(service['embeddedTutorialManager'].openFiles()[index]);
    }
  });
});
