# Bundle

## `js_expected_symbol_test`
This folder contains tests which assert that most of the code is tree shaken away.
This is asserted by keeping gold files of all symbols which are expected to be retained.
When doing renaming it is often necessary to update the gold files; to do so use these scripts:

```
yarn run symbol-extractor:check
yarn run symbol-extractor:update
```
