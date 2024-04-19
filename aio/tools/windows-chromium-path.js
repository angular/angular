const os = require('os');
const path = require('path');

/*
  TODO: this is a hack; the root cause should be found and fixed.

  For some unknown reason, the symlinked copy of chromium under runfiles won't run under
  karma on Windows. To work around this, use chromium under the execroot in the external
  folder and point to that instead.

  Return:
    The adjusted absolute chromium path to use on Windows. On other platforms this is a
    noop and returns the existing process.env.CHROME_BIN.
*/
exports.getAdjustedChromeBinPathForWindows = function() {
    if (os.platform() === 'win32') {
        const runfilesWorkspaceRoot = path.join(process.env.RUNFILES, 'angular');

        // Get the path to chromium from the runfiles base folder. By default, the Bazel make var
        // $(CHROMIUM) (which CHROME_BIN is set to) has a preceding '../' to escape the workspace
        // root within runfiles. Additional '../' may have been prepended to cancel out any chdirs.
        const chromiumPath = process.env.CHROME_BIN.replace(/^(\.\.\/)*/, '');

        // Escape from runfiles to the exec root
        const execRootSlashWorkspace = 'execroot' + path.sep + 'angular';
        const index = runfilesWorkspaceRoot.indexOf(execRootSlashWorkspace);
        const execRootPath = runfilesWorkspaceRoot.substring(0, index + execRootSlashWorkspace.length);
        const runfilesToExecRoot = path.relative(runfilesWorkspaceRoot, execRootPath);

        // Resolve the path to chromium under the execroot
        const chromiumExecRootPath = path.resolve(
            runfilesWorkspaceRoot,
            runfilesToExecRoot,
            'external',
            chromiumPath
        );

        return chromiumExecRootPath;
    }
    return process.env.CHROME_BIN;
}
