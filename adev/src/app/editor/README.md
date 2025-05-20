# EmbeddedEditor components, services and functionality

- [Scenarios](#scenarios)
  - [Loading a project](#loading-a-project)
  - [Updating the code](#updating-the-code)
  - [Creating a new file](#creating-a-new-file)
  - [Deleting a file](#deleting-a-file)
  - [Switching a project](#switching-a-project)
- [Components and services](#components-and-services)

  - [EmbeddedEditor](#EmbeddedEditor)
  - [CodeEditor](#CodeEditor)
    - [CodeMirrorEditor](#CodeMirrorEditor)
      - [TypeScript Web Worker](#typescript-web-worker)
  - [Preview](#Preview)
  - [Terminal](#Terminal)
    - [InteractiveTerminal](#InteractiveTerminal)
    - [Console](#Console)
  - [NodeRuntimeSandbox](#NodeRuntimeSandbox)
    - [NodeRuntimeState](#NodeRuntimeState)
  - [EmbeddedTutorialManager](#EmbeddedTutorialManager)
  - [EditorUiState](#EditorUiState)
  - [DownloadManager](#DownloadManager)
  - [AlertManager](#AlertManager)
  - [TypingsLoader](#TypingsLoader)

## External libraries

- [WebContainers API](https://webcontainers.io/)
- [CodeMirror](https://codemirror.net/)
- [@typescript/vfs](https://www.npmjs.com/package/@typescript/vfs)
- [Xterm.js](https://xtermjs.org/)

## Notes

- See [scripts/tutorials/README.md](/scripts/tutorials/README.md) for more information about the tutorials script.
- See [adev/src/content/tutorials/README.md](/adev/src/content/tutorials/README.md) for more information about the tutorials content.

---

## Scenarios

### Loading a project

1. The page responsible for the embedded editor lazy loads the [`EmbeddedEditor`](./embedded-editor.component.ts) component and the [`NodeRuntimeSandbox`](./node-runtime-sandbox.service.ts), then triggers the initialization of all components and services. The embedded editor is available in the following pages:

   - homepage: https://angular.dev
   - playground: https://angular.dev/playground
   - tutorial pages: https://angular.dev/tutorials

2. The project assets are fetched by the [`EmbeddedTutorialManager`](./embedded-tutorial-manager.service.ts). Meanwhile:

   - The code editor is initialized
   - The code editor initializes the TypeScript Web Worker, which initializes the "default file system map" using TypeScript's CDN.
   - The WebContainer is initialized
   - The terminal is initialized

3. The tutorial source code is mounted in the `WebContainer`'s filesystem by the [`NodeRuntimeSandbox`](./node-runtime-sandbox.service.ts)
4. The tutorial project dependencies are installed by the [`NodeRuntimeSandbox`](./node-runtime-sandbox.service.ts).
5. The development server is started by the [`NodeRuntimeSandbox`](./node-runtime-sandbox.service.ts) and the types are loaded by the [`TypingsLoader`](./typings-loader.service.ts) service.
6. The preview is loaded with the URL provided by the WebContainer API after the development server is started.
7. The project is ready.

### Updating the code

1. The user update the code in the code editor.
2. The code editor state is updated on real time, without debouncing so that the user can see the changes in the code editor and CodeMirror can handle the changes accordingly.
3. At the same time, the changes are sent to the TypeScript web worker to provide diagnostics, autocomplete and type features as soon as possible.
4. The code changes are debounced to be written in the WebContainer filesystem by the [`NodeRuntimeSandbox`](./node-runtime-sandbox.service.ts).
5. After the debounce time is reached, the code changes are written in the WebContainer filesystem by the [`NodeRuntimeSandbox`](./node-runtime-sandbox.service.ts), then the user can see the changes in the preview.

### Creating a new file

1. The user clicks on the new file button.
2. The new file tab is opened.
3. The user types the new file name.
4. If the file name is valid, the file is created in the WebContainer filesystem by the [`NodeRuntimeSandbox`](./node-runtime-sandbox.service.ts).

   - `..` is disallowed in the file name to prevent users to create files outside the `src` directory.

5. The file is added to the TypeScript virtual file system, allowing the TypeScript web worker to provide diagnostics, autocomplete and type features for the new file. Also, exports from the new file are available in other files.
6. The new file is added as the last tab in the code editor and the new file can be edited.

NOTE: If the new file name matches a file that already exists but is hidden in the code editor, the content for that file will show up in the created file. An example for a file that always exists is `index.html`.

### Deleting a file

1. The user clicks on the delete file button.
2. The file is deleted from the WebContainer filesystem by the [`NodeRuntimeSandbox`](./node-runtime-sandbox.service.ts).
3. The file is removed from the TypeScript virtual file system.
4. The file is removed from the code editor tabs.

NOTE: Some files can't be deleted to prevent users to break the app, being `src/main.ts`and `src/index.html`

### Switching a project

The embedded editor considers a project change when the embedded editor was already initialized and the user changes the page in the following scenarios:

- Navigating through tutorial steps
- Going from the homepage after the embedded editor is initialized to the playground
- Going from a tutorial page to the playground
- Going from a tutorial page to the homepage
- Going from the playground to the homepage

When a project change is detected, the [`EmbeddedTutorialManager`](./embedded-tutorial-manager.service.ts) emits the `tutorialChanged` observable, which is listened in multiple sub-components and services, then each component/service performs the necessary operations to switch the project.

The following steps are executed on project change:

1. The new project files are fetched by the [`EmbeddedTutorialManager`](./embedded-tutorial-manager.service.ts).
2. The new project files are mounted in the WebContainer filesystem.
3. The TypeScript virtual filesystem is updated with the new files and contents.
4. The previous project and new project files are compared.
   1. Files that are not available in the new project are deleted from the WebContainer filesystem.
   2. Files that have the same path and name have their content replaced on the previous step when the files are mounted.
5. The previous project dependencies are compared with the new project dependencies.
   1. If there are differences, a `npm install` is triggered, hiding the preview and going to the install loading step.
   2. If there are no differences, the project is ready.
6. Some states are reset, for example the "reveal answer" state if the previous project was in the "reveal answer" state.

## Components and services

### [`EmbeddedEditor`](./embedded-editor.component.ts)

The embedded editor is the parent component that holds all the components and services that compose the embedded editor.

#### [`CodeEditor`](./code-editor/code-editor.component.ts)

The component that holds the code editor view and the code editor state.

##### [`CodeMirrorEditor`](./code-editor/code-mirror-editor.service.ts)

[CodeMirror](https://codemirror.net/) is the library used to handle the code editor.

The `CodeMirrorEditor` service manages the CodeMirror instance and all the interactions with the library used to handle the code editor.

- handle the file edits and the CodeMirror view and state
- handle the current project files in the code editor
- handle the file creations and deletions
- handle the file changes
- handle all the CodeMirror specific events and extensions

###### [TypeScript Web Worker](./code-editor/workers/typescript-vfs.worker.ts)

The TypeScript features are provided by the TypeScript web worker, that is initialized by the `CodeMirrorEditor` service.

The TypeScript web worker uses `@typescript/vfs` and the TypeScript language service to provide diagnostics, autocomplete and type features.

#### [`Preview`](./preview/preview.component.ts)

The preview component manages the `iframe` responsible for displaying the tutorial project preview, with the URL provided by the WebContainer API after the development server is started.

While the project is being initialized, the preview displays the loading state.

#### [`Terminal`](./terminal/terminal.component.ts)

[Xterm.js](https://xtermjs.org/) is the library used to handle the terminals.

The terminal component handles the Xterm.js instance for the console and for the interactive terminal.

##### [`InteractiveTerminal`](./terminal/interactive-terminal.ts)

The interactive terminal is the terminal where the user can interact with the terminal and run commands, supporting only commands for the Angular CLI.

##### Console

The console displays the output for `npm install` and `ng serve`.

#### [`NodeRuntimeSandbox`](./node-runtime-sandbox.service.ts)

Responsible for managing the WebContainer instance and all communication with its API. This service handles:

- the WebContainer instance
- all Node.js scripts
- the WebContainer filesystem, mounting the tutorial project files, writing new content, deleting and creating files.
- the terminal session, reading and processing user inputs.
- the tutorial project dependencies, installing the dependencies.
- the processes running inside the WebContainer, being the npm scripts to install the dependencies, run the development server and the user inputs for the `ng` CLI.

##### [`NodeRuntimeState`](./node-runtime-state.service.ts)

Manages the [`NodeRuntimeSandbox`](./node-runtime-sandbox.service.ts) loading and error state.

#### [`EmbeddedTutorialManager`](./embedded-tutorial-manager.service.ts)

Manages the tutorial assets, being responsible for fetching the tutorial source code and metadata.

The source code is mounted in the WebContainer filesystem by the [`NodeRuntimeSandbox`](./node-runtime-sandbox.service.ts).

The metadata is used to manage the project, handle the project changes and the user interactivity with the app.

This service also handles the reveal answer and reset reveal answer feature.

#### [`EditorUiState`](./editor-ui-state.service.ts)

Manages the editor UI state, being responsible for handling the user interactions with the editor tabs, switching between the preview, the terminal and the console.

#### [`DownloadManager`](./download-manager.service.ts)

Responsible for handling the download button in the embedded editor, fetching the tutorial project files and generating a zip file with the project content.

#### [`AlertManager`](./alert-manager.service.ts)

Manage the alerts displayed in the embedded editor, being the out of memory alert when multiple tabs are opened, and unsupported environments alerts.

#### [`TypingsLoader`](./typings-loader.service.ts)

Manages the types definitions for the code editor.
