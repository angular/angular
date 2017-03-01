# Angular Language Service Test

This directory is an integration test for `@angular/language-service` to ensure
that various versions of the server can be loaded in the supported versions of 
TypeScript's language service.

## New supported version of TypeScript

To add a new supported version of TypeScript:

1) Create directory in `typescripts` to hold the new version following the pattern
   of the other versions.
2) Add the directory name to the end of the `TYPESCRIPTS` variable in the 
   `scripts/env.sh` file.
3) Run `scripts/update_golden.sh` to generate the expected files.
4) Verify the expected output is reasonable by comparing to a known good output
   from a previous version.

## Update golden files

If the expected output needs to be updated run `scripts/update_golden.sh` to
update the expected output of the server.

## Adding a new fixture

Currently there is no automated way to produce a new fixture. The way the
current fixtures were created was to hack a version of tsserver.js to write the
commands from `VSCode` to a file while performing the operation to be tested.
I also hand modified the input to remove superfluous request.

Once a new fixture is created:

1) Add the fixture base name (without the .json) to `FIXTURES` in 
   `scripts/env.sh`.
2) Run `scripts/udpate_golden.sh` to produce the expected output files.
3) Hand validate the expected output is reasonable.
