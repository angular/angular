'use strict';

/*
 * This is a Karma plugin that listens to Ibazel's update messages from stdin
 * and automatically re-runs the test when build is successful.
 *
 * To use this, in karma.conf.js:
 *
 * ```
 * const ibazelWatcher = reuqire('./tools/karma/ibazel_watcher');
 *
 * ...
 * config.set({
 *   frameworks: [..., 'ibazel_watcher'],
 *   plugins: [..., ibazelWatcher],
 * });
 * ...
 * ```
 */

function initIBazelWatcher(fileList, emitter, executor, config, logger) {
  if (process.env['IBAZEL_NOTIFY_CHANGES'] !== 'y' || config.autoWatch === false) {
    return;
  }

  const log = logger.create('watcher');

  log.debug('Initializing ibazel watcher.');

  // Disable default watcher.
  // As a result of disabling autoWatch we have to rewire the running logic by
  // ourselves.
  config.autoWatch = false;
  emitter.on('browsers_ready', () => { executor.schedule(); });
  emitter.on('file_list_modified', () => { executor.schedule(); });

  let buffer = '';
  process.stdin.on('readable', function onStdinReadable() {
    const chunk = process.stdin.read();
    if (!chunk) {
      return;
    }
    buffer += chunk.toString();

    const linebreak = buffer.indexOf('\n');
    while (buffer.indexOf('\n') !== -1) {
      const line = buffer.substr(0, linebreak);
      buffer = buffer.substr(linebreak + 1);

      switch (line) {
        case 'IBAZEL_BUILD_STARTED':
          log.debug('Bazel build started.');
          break;
        case 'IBAZEL_BUILD_COMPLETED SUCCEEDED':
          log.debug('Bazel build succeeded. ');
          fileList.refresh();
          break;
        case 'IBAZEL_BUILD_COMPLETED FAILED':
          log.info('Bazel build failed. Not re-running tests.');
          break;
      }
    }
  });

  process.stdin.on('end', function onStdinEnd() {
    process.exit(0);
  });
}

initIBazelWatcher.$inject = ['fileList', 'emitter', 'executor', 'config', 'logger'];

exports['framework:ibazel_watcher'] = ['factory', initIBazelWatcher];
