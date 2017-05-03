# Documentation Generation

The dgeni tool is used to generate the documentation from the source files held in this repository.
The documentation generation is configured by a dgeni package defined in `tools/transforms/angular.io-package/index.js`.
This package, in turn requires a number of other packages, some are defined locally in the `tools/transforms` folder,
such as `tools/transforms/cheatsheet-package` and `tools/transforms/content-package`, etc. And some are brought in from the
`dgeni-packages` node modules, such as `jsdoc` and `nunjucks`.

## Generating the docs

To generate the documentation simply run `yarn docs` from the command line.

## Testing the dgeni packages

The local packages have unit tests that you can execute by running `yarn docs-test` from the command line.

## What does it generate?

The output from dgeni is written to files in the `src/generated` folder.

Notably this includes a JSON file containing the partial HTML for each "page" of the documentation, such as API pages and guides.
It also includes JSON files that contain metadata about the documentation such as navigation data and
keywords for building a search index.

## Viewing the docs

You can view the pages by running `yarn start` and navigating to https://localhost:4200.
