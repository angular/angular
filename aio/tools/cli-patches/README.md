# Overview

The AIO application is built using the Angular CLI tool. We are often trialling new features for the CLI, which we apply to the library after it is installed.  This folder contains git patch files that contain these new features and a utility to apply those patches to the CLI library.

# Patches

1. [bazel-architect-output.patch](./bazel-architect-output.patch) - Patch architect to not clear the console before reporting the result of an operation. This makes it easier when working in bazel so that the cause of build and test errors can be seen in the console without needing to search through the command or test logs.