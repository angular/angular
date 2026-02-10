# Read This!

**The JSON files in this directory are not meant to be edited by hand.**

If you need to make modification, the respective files should be changed within the repository's [`syntaxes/src`](https://github.com/angular/vscode-ng-language-service/tree/main/syntaxes/src) directory.

Running `pnpm bazel run //vscode-ng-language-service/syntaxes:syntaxes` will then appropriately update the files in this directory.

# Syntaxes

This directory specifies
[TextMate grammars](https://macromates.com/manual/en/language_grammars) used by
VSCode to syntax highlight Angular source code.

## Adding a new grammar

To add a new grammar (not modifying an existing one), write the grammar as a
JSON file in this directory and register it in the root directory's
[package.json](./package.json) under the `contributes.grammars` array.

## Testing grammars

This repository uses
[vscode-tmgrammar-test](https://github.com/PanAeon/vscode-tmgrammar-test) for
testing VSCode TextMate grammars.

### Snapshot Tests

Snapshot test cases are specified in [test/cases.json](./test/cases.json).

- The source file to test the grammar on should go in [test/data/](./test/data).
- If an external grammar is needed (e.g. for HTML) is needed, a dummy grammar
  can be specified in [test/dummy/](./test/dummy) and will be automatically
  picked up by the grammar test driver.
- Each snapshot tests requires a language scope to test. Generally, this is the
  scope name of the grammar being tested (e.g. `inline-template.ng` for the
  inline template grammar). This scope will become the base name of the grammar
  matched for everything in the source file being tested, upon which more
  specific grammar matches will be stacked.

Snapshot golden files can be updated by running

```bash
pnpm bazel run //vscode-ng-language-service/syntaxes/test:test -- -u
```

in the root directory of this repository. Goldens must be updated when a new
test case is added. Be sure to check that the updated golden file looks as you
expect.
