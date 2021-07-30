import {readFileSync, writeFileSync} from 'fs';
import {join, extname} from 'path';

// These imports to `@angular/compiler-cli` need to explicitly specify the `.js` extension as
// otherwise the Bazel NodeJS module resolution would end up resolving the ESM2015 `.mjs` files.
const {NodeJSFileSystem} = require('@angular/compiler-cli/src/ngtsc/file_system/index.js');
const {ConsoleLogger, LogLevel} = require('@angular/compiler-cli/src/ngtsc/logging/index.js');
const {createEs2015LinkerPlugin} = require('@angular/compiler-cli/linker/babel/index.js');

// There are no types installed for these packages.
const babel = require('@babel/core');
const {default: traverse} = require('@babel/traverse');

/** File system used by the Angular linker plugin. */
const fileSystem = new NodeJSFileSystem();
/** Logger used by the Angular linker plugin. */
const logger = new ConsoleLogger(LogLevel.info);

/** Basic interface describing a Babel AST node path. */
interface NodePath {
  type: string;
  parentPath: NodePath|undefined;
  node: any;
  buildCodeFrameError<T>(message: string, ctor: T): T;
}

/**
 * Determines the command line arguments for the current Bazel action. Since this action can
 * have a large set of input files, Bazel may write the arguments into a parameter file.
 * This function is responsible for handling normal argument passing or Bazel parameter files.
 * Read more here: https://docs.bazel.build/versions/master/skylark/lib/Args.html#use_param_file
 */
function getBazelActionArguments() {
  const args = process.argv.slice(2);

  // If Bazel uses a parameter file, we've specified that it passes the file in the following
  // format: "arg0 arg1 --param-file={path_to_param_file}"
  if (args[0].startsWith('--param-file=')) {
    return readFileSync(args[0].split('=')[1], 'utf8').trim().split('\n');
  }

  return args;
}

/** Naively checks whether this node path resolves to an Angular declare invocation. */
function isNgDeclareCallExpression(nodePath: NodePath): boolean {
  if (!nodePath.node.name.startsWith('ɵɵngDeclare')) {
    return false;
  }

  // Expect the `ngDeclare` identifier to be used as part of a property access that
  // is invoked within a call expression. e.g. `i0.ɵɵngDeclare<>`.
  return nodePath.parentPath?.type === 'MemberExpression' &&
         nodePath.parentPath.parentPath?.type === 'CallExpression';
}

/** Gets the AMD module name for a given Bazel manifest path */
function manifestPathToAmdName(manifestPath: string): string {
  return manifestPath.substring(0, manifestPath.lastIndexOf('.'));
}

/** Generates a JavaScript file that maps certain AMD modules to their associate. */
function generateAmdModuleMappingFile(mappings: Map<string, string>): string {
  let amdMappingFileContent = `
    function registerAlias(oldModuleName, newModuleName) {
      define(newModuleName, ['require', 'exports', oldModuleName], (require, exports) => {
        var source = require(oldModuleName);
        Object.keys(source).forEach(function(key) {
          exports[key] = source[key];
        });
      });
    }
  `;

  for (const [oldModuleName, newModuleName] of mappings.entries()) {
    amdMappingFileContent += `registerAlias("${oldModuleName}", "${newModuleName}");\n`;
  }

  return amdMappingFileContent;
}

/** Processes the given file with the Angular linker plugin. */
function processFileWithLinker(diskFilePath: string, fileContent: string): string {
  const fileExtension = extname(diskFilePath);

  // If the input file is not a JavaScript file, do not process it with the linker
  // Babel plugin and return the original file content.
  if (fileExtension !== '.js' && fileExtension !== '.mjs') {
    return fileContent;
  }

  // We run the linker with JIT mode so that the processed Angular declarations could be
  // run within unit tests that rely on JIT information to be available.
  const linkerPlugin = createEs2015LinkerPlugin({fileSystem, logger, linkerJitMode: true});
  const {code, ast} = babel.transformSync(fileContent, {
    ast: true,
    filename: diskFilePath,
    filenameRelative: diskFilePath,
    plugins: [linkerPlugin],
    compact: false,
  });

  // Naively check if there are any Angular declarations left that haven't been linked.
  traverse(ast, {
    Identifier: (astPath: NodePath) => {
      if (isNgDeclareCallExpression(astPath)) {
        throw astPath.buildCodeFrameError(
          'Found Angular declaration that has not been linked.', Error);
      }
    }
  });

  return code;
}

if (require.main === module) {
  const [outputDirExecPath, outputDirManifestPath, amdMappingFileExecPath, ...inputFiles] =
      getBazelActionArguments();
  const amdModuleMappings = new Map<string, string>();

  for (const inputFileArg of inputFiles) {
    const [inputFileExecPath, manifestPath] = inputFileArg.split(':');
    const outputExecPath = join(outputDirExecPath, manifestPath);
    const manifestOutputPath = `${outputDirManifestPath}/${manifestPath}`;
    const fileContent = readFileSync(inputFileExecPath, 'utf8');
    const oldAmdModuleName = manifestPathToAmdName(manifestPath);
    const newAmdModuleName = manifestPathToAmdName(manifestOutputPath);
    const processedContent = processFileWithLinker(inputFileExecPath, fileContent);

    // Keep track of the old AMD module name, and the expected new one. The AMD module
    // names are based on the file location within the repository. This matches the
    // AMD module names being generated by the NodeJS Bazel rules.
    amdModuleMappings.set(oldAmdModuleName, newAmdModuleName);

    writeFileSync(outputExecPath, processedContent);
  }

  // Generate a mapping file for AMD module names. Given we move sources to a new location, their
  // existing AMD module names like `angular_material/src/cdk/a11y/a11y.spec` are no longer valid.
  // Since we do not want to modify the AMD module code directly (and rewrite potential imports),
  // we keep the original AMD module names, but also generate a new file that maps the "new" AMD
  // module names (based on their new location) to the old AMD modules. This is necessary so that
  // imports continue to work, and that tests can be run within the `karma_web_test` rule.
  // https://github.com/bazelbuild/rules_nodejs/blob/a611b600b5d2f1242ee615ac4b1c8cd03d0c3b03/packages/concatjs/web_test/karma.conf.js#L310-L319
  const mappingContent = generateAmdModuleMappingFile(amdModuleMappings);
  writeFileSync(amdMappingFileExecPath, mappingContent);
}
