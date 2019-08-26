# Angular Language Service Test

This directory is an integration test for `@angular/language-service` to ensure
that the language service works correctly as a `tsserver` plugin.

To use the tests:

- Use `yarn install` to install all dependencies in this directory and in the Angular repo root
    directory.
- From the Angular repo root directory, build Angular in the `dist/packages-dist` folder with
    `./scripts/build-packages-dist.sh`.
- In this directory, run the tests with `yarn test`.

## Update golden files

If the expected output needs to be updated, run `yarn golden my-golden.json`, replacing
`my-golden.json` with the golden file to be updated. Do not qualify the file with a directory path.
See [generate.ts](./generate.ts) for more information.

## Adding a new fixture

Currently there is no automated way to produce a new fixture. The way the
current fixtures were created was to hack a version of tsserver.js to write the
commands from `VSCode` to a file while performing the operation to be tested.
I also hand modified the input to remove superfluous request.

Once a new fixture is created:

1) Add the fixture name to `goldens/`
2) Run `yarn golden my-golden.json`, replacing `my-golden.json` with the new fixture name, to
   produce the expected output files.
3) Hand validate that the expected output is reasonable.
