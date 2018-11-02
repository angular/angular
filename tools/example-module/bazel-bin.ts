import {generateExampleModule} from './generate-example-module';

/**
 * Entry point for the Bazel NodeJS target. Usually this would be a more generic CLI, but due to
 * Bazel not being able to handle a lot of files on Windows (with emulated Bash), we need to
 * read the arguments through environment variables which are handled better.
 *
 *   - https://github.com/bazelbuild/rules_nodejs/issues/404
 *   - https://github.com/bazelbuild/bazel/issues/3636
 */

if (require.main === module) {
  const {_SOURCE_FILES, _OUTPUT_FILE, _BASE_DIR} = process.env;

  generateExampleModule(_SOURCE_FILES.split(' '), _OUTPUT_FILE, _BASE_DIR);
}
