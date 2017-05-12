# Angular documentation project (https://angular.io)

Everything in this folder is part of the documentation project. This includes

* the web site for displaying the documentation
* the dgeni configuration for converting source files to rendered files that can be viewed in the web site.
* the tooling for setting up examples for development; and generating plunkers and zip files from the examples.

## Developer tasks

We use `yarn` to manage the dependencies and to run build tasks.
You should run all these tasks from the `angular/aio` folder.
Here are the most important tasks you might need to use:

* `yarn` - install all the dependencies.
* `yarn setup` - Install all the dependencies, boilerplate, plunkers, zips and runs dgeni on the docs.

* `yarn start` - run a development web server that watches the files; then builds the doc-viewer and reloads the page, as necessary.
* `yarn lint` - check that the doc-viewer code follows our style rules.
* `yarn test` - watch all the source files, for the doc-viewer, and run all the unit tests when any change.
* `yarn e2e` - run all the e2e tests for the doc-viewer.

* `yarn docs` - generate all the docs from the source files.
* `yarn docs-watch` - watch the Angular source and the docs files and run a short-circuited doc-gen for the docs that changed.
* `yarn docs-lint` - check that the doc gen code follows our style rules.
* `yarn docs-test` - run the unit tests for the doc generation code.

* `yarn boilerplate:add` - generate all the boilerplate code for the examples, so that they can be run locally.
* `yarn boilerplate:remove` - remove all the boilerplate code that was added via `yarn boilerplate:add`.
* `yarn generate-plunkers` - generate the plunker files that are used by the `live-example` tags in the docs.
* `yarn generate-zips` - generate the zip files from the examples. Zip available via the `live-example` tags in the docs.


## Using ServiceWorker locally

Since abb36e3cb, running `yarn start -- --prod` will no longer set up the ServiceWorker, which
would require manually running `yarn sw-manifest` and `yarn sw-copy` (something that is not possible
with webpack serving the files from memory).

If you want to test ServiceWorker locally, you can use `yarn build` and serve the files in `dist/`
with `yarn http-server -- dist -p 4200`.

For more details see #16745.


## Guide to authoring

There are two types of content in the documentatation:

* **API docs**: descriptions of the modules, classes, interfaces, decorators, etc that make up the Angular platform.
API docs are generated directly from the source code.
The source code is contained in TypeScript files, located in the `angular/packages` folder.
Each API item may have a preceding comment, which contains JSDoc style tags and content.
The content is written in markdown.

* **Other content**: guides, tutorials, and other marketing material.
All other content is written using markdown in text files, located in the `angular/aio/content` folder.
More specifically, there are sub-folders that contain particular types of content: guides, tutorial and marketing.

We use the [dgeni](https://github.com/angular/dgeni) tool to convert these files into docs that can be viewed in the doc-viewer.

### Generating the complete docs

The main task for generating the docs is `yarn docs`. This will process all the source files (API and other),
extracting the documentation and generating JSON files that can be consumed by the doc-viewer.

### Partial doc generation for editors

Full doc generation can take up to one minute. That's too slow for efficient document creation and editing.

You can make small changes in a smart editor that displays formatted markdown:
>In VS Code, _Cmd-K, V_ opens markdown preview in side pane; _Cmd-B_ toggles left sidebar

You also want to see those changes displayed properly in the doc viewer
with a quick, edit/view cycle time.

For this purpose, use the `yarn docs-watch` task, which watches for changes to source files and only
re-processes the the files necessary to generate the docs that are related to the file that has changed.
Since this task takes shortcuts, it is much faster (often less than 1 second) but it won't produce full
fidelity content. For example, links to other docs and code examples may not render correctly. This is
most particularly noticed in links to other docs and in the embedded examples, which may not always render
correctly.

The general setup is as follows:

* Open a terminal, ensure the dependencies are installed; run an initial doc generation; then start the doc-viewer:

```bash
yarn
yarn docs
yarn start
```

* Open a second terminal and start watching the docs

```bash
yarn docs-watch
```

* Open a browser at https://localhost:4200/ and navigate to the document on which you want to work.
You can automatically open the browser by using `yarn start -- -o` in the first terminal.

* Make changes to the page's associated doc or example files. Every time a file is saved, the doc will
be regenerated, the app will rebuild and the page will reload.
