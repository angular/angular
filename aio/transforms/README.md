# Documentation Generation

The dgeni tool is used to generate the documentation from the source files held in this repository.
The documentation generation is configured by a dgeni package defined in `docs/angular.io-package/index.js`.
This package, in turn requires a number of other packages, some are defined locally in the `docs` folder,
such as `docs/cheatsheet-package` and `docs/content-package`, etc. And some are brought in from the
`dgeni-packages` node modules, such as `jsdoc` and `nunjucks`.

## Generating the docs

To generate the documentation simply run `gulp docs` from the command line.

## Testing the dgeni packages

The local packages have unit tests that you can execute by running `gulp docs-test` from the command line.

## What does it generate?

The output from dgeni is written to files in the `dist/docs` folder.

Notably this includes a partial HTML file for each "page" of the documentation, such as API pages and guides.
It also includes JavaScript files that contain metadata about the documentation such as navigation data and
keywords for building a search index.

## Viewing the docs

You can view the dummy demo app using a simple HTTP server hosting `dist/docs/index.html`
