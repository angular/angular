# Angular embedded docs tutorial

- [Tutorial files](#tutorial-files)
- [Tutorials directory structure](#tutorials-directory-structure)
- [Reserved tutorials directories](#reserved-tutorials-directories)

## Tutorial files

The tutorials content consists of the tutorial content, source code and configuration.

### Content: `README.md`

The tutorial content must be located in a `README.md` file in the tutorial directory.

Taking the `learn-angular` tutorial as an example, see: [`adev/src/content/tutorials/learn-angular/intro/README.md`](/adev/src/content/tutorials/learn-angular/intro/README.md)

### Configuration: `config.json`

Each tutorial is defined by a `config.json`, which can have the following options:

- `title`: defines the tutorial title used in the tutorial nav
- `nextTutorial`: the path of the next tutorial (only in `intro/` step)
- `src`: the relative path to an external directory, which defines the tutorial source code used in the embedded editor
- `answerSrc`: the relative path to an external directory, which defines the tutorial answer used in the embedded editor
- `openFiles`: an array of files to be open in the editor
- `type`: the type denotes how the tutorial will be presented and which components are necessary for that tutorial
  - `cli`: a tutorial with a `cli` type will contain only the content and an interactive terminal with the Angular CLI
  - `editor`: used for the complete embedded editor, containing the code editor, the preview, an interactive terminal and the console with outputs from the dev server
  - `local`: disables the embedded editor and shows only the content
  - `editor-only`: a special config used for the tutorial playground and the homepage playground, which disables the content and shows only the embedded editor

### Source code

The tutorial source code includes every file in the tutorial directory, except `README.md` and `config.json`.

The tutorial source code has precedence over the [`common`](#common) project file, so if a file exists in both [`common`](#common) and in the tutorial directory, containing the same relative path, the tutorial file will override the [`common`](#common) file.

## Tutorials directory structure

A tutorial is composed of an introduction and steps. Both the intro and each step contains its own content, config and source code.

Taking the `learn-angular` tutorial as an example:

### Introduction

[`adev/src/content/tutorials/learn-angular/intro`](/adev/src/content/tutorials/learn-angular/intro)

is the introduction of the tutorial, which will live in the `/tutorials/learn-angular` route.

### Steps

[`adev/src/content/tutorials/learn-angular/steps`](/adev/src/content/tutorials/learn-angular/steps) is the directory that contains the tutorial steps.

These are some examples from the `learn-angular` tutorial:

- [`learn-angular/steps/1-components-in-angular`](/adev/src/content/tutorials/learn-angular/steps/1-components-in-angular): The route will be `/tutorials/learn-angular/1-components-in-angular`
- [`learn-angular/steps/2-updating-the-component-class`](/adev/src/content/tutorials/learn-angular/steps/2-updating-the-component-class): The route will be `/tutorials/learn-angular/2-updating-the-component-class`

Each step directory must start with a number followed by a hyphen, then followed by the step pathname.

- The number denotes the step, defining which will be the previous and next step within a tutorial.
- The hyphen is a delimiter :).
- The directory name, including the number and the hyphen, defines the step URL.

## Reserved tutorials directories

### `common`

The common project is a complete Angular project that is reused by all tutorials. It contains all
dependencies(`package.json`, `package-lock.json`), project configuration(`tsconfig.json`, `angular.json`) and main files to bootstrap the application(`index.html`, `main.ts`, `app.config.ts`).

A common project is used for a variety of reasons:

- Avoid duplication of files in tutorials.
- Optimize in-app performance by requesting the common project files and dependencies only once, benefiting from the
  browser cache on subsequent requests.
- Require a single `npm install` for all tutorials, therefore reducing the time to interactive with the tutorial
  when navigating different tutorials and steps.
- Provide a consistent environment for all tutorials.
- Allow each tutorial to focus on the specific source code for what's being taught and not on the project setup.

See [`adev/shared-docs/pipeline/tutorials/common`](/adev/shared-docs/pipeline/tutorials/common)

A tutorial can also provide its own `common` directory, whose files are applied on top of the shared common project for the intro and every step of that tutorial. See [`adev/src/content/tutorials/signals/common`](/adev/src/content/tutorials/signals/common) for an example.

### `playground`

The playground contains the source code for the tutorials playground at `/playground`. It should not contain any content.

See [`adev/src/content/tutorials/playground`](/adev/src/content/tutorials/playground)

### `homepage`

The homepage contains the source code for the homepage playground. It should not contain any content.

See [`adev/src/content/tutorials/homepage`](/adev/src/content/tutorials/homepage)

## Update dependencies

To update the dependencies of all tutorials you can run the following script

```bash
rm ./adev/src/content/tutorials/homepage/package-lock.json  ./adev/src/content/tutorials/first-app/common/package-lock.json ./adev/src/content/tutorials/learn-angular/common/package-lock.json ./adev/src/content/tutorials/playground/common/package-lock.json ./adev/src/content/tutorials/deferrable-views/common/package-lock.json ./adev/src/content/tutorials/signals/common/package-lock.json ./adev/src/content/tutorials/signal-forms/common/package-lock.json ./adev/shared-docs/pipeline/tutorials/common/package-lock.json

npm i --package-lock-only --prefix ./adev/src/content/tutorials/homepage
npm i --package-lock-only --prefix ./adev/src/content/tutorials/first-app/common
npm i --package-lock-only --prefix ./adev/src/content/tutorials/learn-angular/common
npm i --package-lock-only --prefix ./adev/src/content/tutorials/playground/common
npm i --package-lock-only --prefix ./adev/src/content/tutorials/deferrable-views/common
npm i --package-lock-only --prefix ./adev/src/content/tutorials/signals/common
npm i --package-lock-only --prefix ./adev/src/content/tutorials/signal-forms/common
npm i --package-lock-only --prefix ./adev/shared-docs/pipeline/tutorials/common
```
