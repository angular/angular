/*
 * Verifies (and approves if requested) a test project directory against a golden directory.
 * Expected usage:
 * verify-golden \
 *   &lt;should_approve (true | false)&gt; \
 *   &lt;golden_directory (relative to cwd)&gt; \
 *   &lt;golden_directory (relative to workspace)&gt; \
 *   ...&lt;ignored_files (relative to cwd)&gt;
 */

import {promises as fsPromises, Stats} from 'fs';
import path from 'path';

const CURRENT_WORKING_DIRECTORY = process.cwd();
const SHOULD_APPROVE = process.argv[2].toLowerCase() === 'true';
const TEST_DIRECTORY = CURRENT_WORKING_DIRECTORY;
const GOLDEN_DIRECTORY = path.join(CURRENT_WORKING_DIRECTORY, process.argv[3]);
const IGNORED_FILES = new Set(process.argv.slice(5));

if (SHOULD_APPROVE && !process.env.BUILD_WORKSPACE_DIRECTORY) {
  console.error('Approval command must be run with `bazel run`.');
  process.exit(1);
}

/** Represents a diff between a test and golden file. */
interface FileDiff {
  filename: string;
  actual: string | null;
  expected: string | null;
}

/**
 * Gets the value of a file for diffing purposes, may be file contents or a placeholder value
 * (e.g. if the file doesn't exist)
 */
function getDiffValue(stats: PromiseSettledResult<Stats>, content: PromiseSettledResult<string>) {
  if (stats.status === 'rejected') {
    return '<File does not exist>';
  }
  if (stats.value.isDirectory()) {
    return '<Directory>';
  }
  if (content.status === 'rejected') {
    // Some unexpected error. File should be readable since it exists and is not a directory.
    throw content.reason;
  }
  return content.value;
}

/** Gets a diff for the given test and golden file pair. */
async function compareFiles(
  testFile: string,
  goldenFile: string,
  filename: string,
): Promise<FileDiff | null> {
  const files = [testFile, goldenFile];
  const statsPromises = [testFile, goldenFile].map(f => fsPromises.stat(f));
  const contentPromises = files.map((f, i) =>
    statsPromises[i].then(stats =>
      stats?.isFile() ? fsPromises.readFile(f).then(buffer => buffer.toString()) : '',
    ),
  );
  const [testStats, goldenStats] = await Promise.allSettled(statsPromises);
  const [testContent, goldenContent] = await Promise.allSettled(contentPromises);
  const diff = {
    filename,
    actual: getDiffValue(goldenStats, goldenContent),
    expected: getDiffValue(testStats, testContent),
  };
  if (testStats.status === 'rejected' && goldenStats.status === 'rejected') {
    return null; // Neither file exists.
  }
  if (testStats.status === 'rejected' || goldenStats.status === 'rejected') {
    return diff;
  }
  if (testStats.value.isDirectory() && goldenStats.value.isDirectory()) {
    return null; // Both files are directories.
  }
  if (testStats.value.isDirectory() || goldenStats.value.isDirectory()) {
    return diff;
  }
  if (diff.actual === diff.expected) {
    return null; // Both files have the same content.
  }
  return diff;
}

/** Displays the given diffs to the user. */
function showDiffs(diffs: FileDiff[]) {
  console.error('Found unexpected diffs:');
  for (const diff of diffs) {
    console.error(
      [
        ''.padEnd(80, '='),
        `----- ${diff.filename} (actual) `.padEnd(80, '-'),
        diff.actual,
        `----- ${diff.filename} (expected) `.padEnd(80, '-'),
        diff.expected,
        '',
      ].join('\n'),
    );
  }
}

/**
 * Verifies the given file is the same between the test and golden directory.
 * If the given file is a directory, verifies all sub-files recursively.
 */
async function verify(
  testDirectory: string,
  goldenDirectory: string,
  file: string,
  ignoredFiles: Set<string>,
): Promise<FileDiff[]> {
  // Skip diffing any ignored files.
  if (ignoredFiles.has(file)) {
    return [];
  }

  // Check for a diff on the current file.
  const testFile = path.join(testDirectory, file);
  const goldenFile = path.join(goldenDirectory, file);
  const diff = await compareFiles(testFile, goldenFile, file);
  if (diff) {
    return [diff];
  }

  // Check any sub-files if the current file is a directory.
  const subFiles = await Promise.all(
    [testFile, goldenFile].map(f =>
      fsPromises.stat(f).then(s => (s.isDirectory() ? fsPromises.readdir(f) : [])),
    ),
  );
  const results = await Promise.all(
    subFiles
      .flat()
      .map(subFile =>
        verify(testDirectory, goldenDirectory, path.join(file, subFile), ignoredFiles),
      ),
  );
  return results.flat();
}

/**
 * Copies the given file from the source directory to the destination directory.
 * If the given file is a directory, copies all sub-files recursively.
 */
async function copyFiles(
  sourceDirectory: string,
  destinationDirectory: string,
  file: string,
  ignoredFiles: Set<string>,
) {
  // Skip copying any ignored files (saving them in golden would just be cruft).
  if (ignoredFiles.has(file)) {
    return;
  }

  const sourceFile = path.join(sourceDirectory, file);
  const destinationFile = path.join(destinationDirectory, file);
  const stats = await fsPromises.stat(sourceFile);
  if (stats.isDirectory()) {
    await fsPromises.mkdir(destinationFile);
    const subFiles = await fsPromises.readdir(sourceFile);
    await Promise.all(
      subFiles.map(subFile =>
        copyFiles(sourceDirectory, destinationDirectory, path.join(file, subFile), ignoredFiles),
      ),
    );
  } else {
    await fsPromises.writeFile(destinationFile, await fsPromises.readFile(sourceFile));
  }
}

// Get a list of diffs and either update them or report them to the user.
(async () => {
  try {
    const diffs = await verify(TEST_DIRECTORY, GOLDEN_DIRECTORY, '.', IGNORED_FILES);
    if (diffs.length) {
      if (SHOULD_APPROVE) {
        const APPROVED_GOLDEN_DIRECTORY = path.join(
          process.env.BUILD_WORKSPACE_DIRECTORY!,
          process.argv[4],
        );
        await fsPromises.rm(APPROVED_GOLDEN_DIRECTORY, {recursive: true, force: true});
        await copyFiles(TEST_DIRECTORY, APPROVED_GOLDEN_DIRECTORY, '.', IGNORED_FILES);
        process.exit(0);
      } else {
        showDiffs(diffs);
        process.exit(1);
      }
    }
  } catch (e) {
    console.error('Error while diffing');
    console.error(e);
    process.exit(1);
  }
})();
