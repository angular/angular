import * as ts from 'typescript';

interface Options extends ts.CompilerOptions {
  // Absolute path to a directory where generated file structure is written
  genDir: string;

  // Path to the directory containing the tsconfig.json file.
  basePath: string;

  // Don't produce .metadata.json files (they don't work for bundled emit with --out)
  skipMetadataEmit: boolean;

  // Don't produce .ngfactory.ts or .css.shim.ts files
  skipTemplateCodegen: boolean;

  // Print extra information while running the compiler
  trace: boolean;

  // Whether to embed debug information in the compiled templates
  debug?: boolean;

  // Starting with TypeScript 1.9, the 'rootDirs' option can be used
  // to allow multiple source directories to have relative imports
  // between them.
  // This option causes generated code to use imports relative to the
  // current directory, and requires you configure the 'rootDirs' to
  // include both the genDir and rootDir.
  // However, due to https://github.com/Microsoft/TypeScript/issues/8245
  // note that using this option does not lay out into a flat directory
  // with application and generated sources side-by-side, so you must
  // teach your module loader how to resolve such imports as well.
  writeImportsForRootDirs?: boolean;
}

export default Options;
