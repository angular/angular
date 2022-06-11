#!/usr/bin/env node

/**
 * Script that builds the release output of all packages which have the "release-package
 * Bazel tag set. The script builds all those packages and copies the release output to the
 * distribution folder within the project.
 */

import {performDefaultSnapshotBuild} from './build-packages-dist.mjs';

// We always build as a snapshot build, unless the script is invoked directly by the
// release publish script. The snapshot release configuration ensures that the current
// Git `HEAD` sha is included for the version placeholders.
performDefaultSnapshotBuild();
