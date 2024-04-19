This test checks if the side effects for loading Angular packages have changed using <https://github.com/filipesilva/check-side-effects>.

Running `yarn test` will check all ES modules listed in `side-effects.json`.

Running `yarn update` will update any changed side effects.

To add a new ES module to this test, add a new entry in `side-effects.json`.

Usually the ESM and FESM should have the same output, but retained objects that were renamed during the flattening step will leave behind a different name.
