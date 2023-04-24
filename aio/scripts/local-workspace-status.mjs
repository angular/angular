import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

/*
  Script to use as a Bazel workspace status command (https://bazel.build/docs/user-manual#workspace-status)
  when building AIO against local Angular packages (--config=aio_local_deps). This provides an Angular version
  stamp variable used to stamp the locally built Angular packages. We stamp the packages with whatever version
  of Angular AIO is currently using. In order for the architect build to succeed, we need to trick architect
  into thinking it's using compatible Angular versions even if the Angular version is actually futher ahead.
*/

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const pkgJsonPath = path.join(__dirname, '..', 'package.json');
const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));

const aioAngularVersion =
  pkgJson.dependencies['@angular/core'].replace(/^[\^~]/, '') + '+forAIOLocalBuildToAvoidMismatch';

console.log(`\
STABLE_PROJECT_VERSION ${aioAngularVersion}
`);

// Fix stable-status.txt values to improve remote cache performance.
console.log(`\
BUILD_HOST fake_host
BUILD_USER fake_user
`);

// Fix the timestamp in volatile-status.txt to improve remote cache performance.
// Unlike the local Bazel cache, the remote cache does not ignore volatile-status.txt
// and will invalidate actions that depend on it when the values change.
// https://github.com/bazelbuild/bazel/issues/10075#issuecomment-546872111
console.log(`\
BUILD_TIMESTAMP 0
`);
