# Compliance test cases

This directory contains test cases for the Angular compiler compliance tests.

A compliance test case is defined by creating a `TEST_CASES.json` file in a directory below this one.

The `TEST_CASES.json` defines one or more test case objects that can specify

* A description of the test.
* The input files that will be compiled.
* Options for the compiler.
* Expectations to check.

For example:

```
{
  "cases": [
    {
      "description": "description of the test - equivalent to an `it` clause message.",
      "inputFiles": ["abc.ts"],
      "expectations": [
        {
          "failureMessage": "message to display if this expectation fails",
          "files": [
            { "expected": "xyz.js", "generated": "abc.js" }, ...
          ]
        }, ...
      ],
      "compilerOptions": { ... },
      "angularCompilerOptions": { ... }
    }
  ]
}
```

## Input files

An array of paths can be provided in the `inputFiles` property.
These paths are relative to the `TEST_CASES.json` file.
The default is `["test.ts"]`.

## Expectations

An expectation consists of a `failureMessage`, which is displayed if the expectation check
fails, and a collection of expected `files` pairs.

Each pair consists of a path to a `generated` file, relative to the build output folder,
and a path to an `expected` file, relative to the test case.

The generated file is checked to see if it "matches" the expected file. The matching is
resilient to whitespace and certain identifier name changes.

The default `failureMessage` is `"Incorrect generated output."`.
The default expected `files` is a a collection of objects `{expected, generated}`,
where `expected` and `generated` are computed by taking each TS source file in the
`inputFiles` collection and replacing the `.ts` extension with `.js`.

## Focusing and excluding test cases

You can focus a test case by setting `"focusTest": true` in the `TEST_CASES.json` file.
This is equivalent to using jasmine `fit()`.

You can exclude a test case by setting `"excludeTest": true` in the `TEST_CASES.json` file.
This is equivalent to using jasmine `xit()`.
