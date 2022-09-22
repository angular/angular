const { resolve } = require('path');
const { readdirSync } = require('fs');

// If the output path isn't set, we are in a test so output a temporary
// directory (TEST_TMPDIR) that bazel provides for tests.
const BAZEL_OUTPUT_PATH = process.env.BAZEL_DGENI_OUTPUT_PATH || process.env.TEST_TMPDIR;

// The current directory is always the correct project root. During a build, this evalutates
// to the exec root. During the "fast-serve" bazel run mode, it resolves to the runfiles root
// of the fast serve binary.
const PROJECT_ROOT = resolve('.');

const AIO_PATH = resolve(PROJECT_ROOT, 'aio');
const TEMPLATES_PATH = resolve(AIO_PATH, 'tools/transforms/templates');
const API_TEMPLATES_PATH = resolve(TEMPLATES_PATH, 'api');
const CONTENTS_PATH = resolve(AIO_PATH, 'content');
const GUIDE_EXAMPLES_PATH = resolve(CONTENTS_PATH, 'examples');
const SRC_PATH = resolve(AIO_PATH, 'src');
const OUTPUT_PATH = resolve(BAZEL_OUTPUT_PATH, 'generated');
const DOCS_OUTPUT_PATH = resolve(OUTPUT_PATH, 'docs');
const API_SOURCE_PATH = resolve(PROJECT_ROOT, 'packages');

function requireFolder(dirname, folderPath) {
  const absolutePath = resolve(dirname, folderPath);
  return readdirSync(absolutePath)
    .filter(p => !/[._]spec\.js$/.test(p))  // ignore spec files
    .map(p => require(resolve(absolutePath, p)));
}
module.exports = { BAZEL_OUTPUT_PATH, PROJECT_ROOT, AIO_PATH, TEMPLATES_PATH, API_TEMPLATES_PATH, CONTENTS_PATH, GUIDE_EXAMPLES_PATH, SRC_PATH, OUTPUT_PATH, DOCS_OUTPUT_PATH, API_SOURCE_PATH, requireFolder };
