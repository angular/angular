# Writing Dart Compatible TypeScript

When writing TypeScript files in Material 2, it is important to keep in mind that these files will be automatically compiled and verified in Dart. There is valid TypeScript that will work in Angular 2, but will be transpiled to invalid Dart code.

Because of this, there's certain things to keep in mind.

## Requirements

This document refers to the following concepts, but do not explain them:

* The Dart language: https://www.dartlang.org
* The `pub` Dart packages management: https://pub.dartlang.org/
* The `angular-cli` toolchain: https://github.com/angular/angular-cli

## Dart Toolchain

When running `ng build` (or `ng server` which also builds), a Broccoli tree will automatically compile and format your TypeScript code into Dart.  These files live along the JavaScript output of the build process, and also are moved into a special directory structure that is compatible with `pub`.

For example, let say you have a `md-awesome` component for Material, which contains the `awesome.ts` implementation. This file is contained in the source code as `src/components/awesome/awesome.ts`. Building this component (assuming no specs or `scss`) will result in the following files:

* `dist/components/awesome/awesome.ts`. The original copy.
* `dist/components/awesome/awesome.js`. The Javascript code.
* `dist/components/awesome/awesome.js.map`. Sourcemap.
* `dist/components/awesome/awesome.dart`. The Dart code, transpiled by `ts2dart` and formatted by `dartfmt`.
* `dist/dart/lib/components/awesome/awesome.dart`. The same file, copied from above into a directory structure compatible with `pub`.

If you have transpilation errors (ie. your TypeScript is invalid in Dart), these will fail the `ng build` step now and will output the errors in the console.

## Gotchas

Here's a list of gotchas to keep in mind when writing TypeScript code that will be compiled to Dart:

* **Unused imports are enforced in Dart.** Importing a file but not using it is an error, not a warning.
* **`void` is not a proper type for templates.** This is important when creating `EventEmitter<>` or other templates. Instead of `void`, use `Object` and pass in `null`.
* **There's no global execution.** Every executed code need to be in a function.
* **Unit tests need to live inside a `main()` function.** Because of the point above, `describe()` is technically executed code and has to live in a function. Additionally, spec files are programs in Dart and as such much have a `void main() {}` function containing the test code.
* **Boolean expressions are required to be boolean.** There's no type coercion or truthiness concept in Dart. Code like this: `if (!aNumber) {}` must be refactored to be `if (aNumber != 0) {}`.
* **Accessing any platform primitive must be done through a Facade.** For example, Promises or DOM manipulation. Facades are going to be provided on a need-to-have basis.
* **Union types are a no-go.** Dart has them on its roadmap, but for now we must avoid them.
* **Dart files cannot have the same name as a reserved keyword.** For example, `for.dart`, `switch.dart` or `class.dart` are all invalid names. Since the TypeScript files have the same name when transpiled to Dart, they also have the same restriction.
* **Default values need to be constants.** This mean that code like `function myFunction(arg1: string = callToSomething()) {}` will not compile.
* **The const keyword must have a const value.** Because of that, we cannot do `const x = a + b;` even if the value of `x`, `a` and `b` will not change.
* **Lambdas need to abide to the type required.** Meaning that if a function requires a function that takes one argument, the lambda cannot be `() => {}`. Use `_` for temporary parameters. This is notable in Promises.
