# third_party vendored sources in Angular

## TL;DR: don't copy sources into this repo

All sources in this repo should be authored from scratch by the committer.
Don't copy sources you've found in any other location.

## What if I have a good reason?

We do "vendor in" some sources, in cases where we do not want our users to have a transitive dependency.
For example, to make testing more reliable, we copy a font into our repo.
That allows our integration tests to run without dynamically requesting that font.

Follow these guidelines for adding sources under `third_party`:

1. Only vendor sources with compatible licenses. Apache 2.0 and MIT are good. Any other licenses, check with your team lead so we can verify our ability to comply with the license.
1. Preserve the license for code. The best thing to do is copy the entire LICENSE file along with the sources.
1. Indicate where the sources came from. Our convention is to create a directory based on the URL where the sources were fetched. Add version number or if missing, the retrieval date, as a comment in the build file just above the license() call. Example: https://github.com/angular/angular/blob/master/third_party/fonts.google.com/open-sans/BUILD.bazel
1. Avoid changing the files you fetched. If you make any changes to the sources, first commit the original, then in a separate commit, make your edits. include another metadata file listing your changes, like https://github.com/bazelbuild/rules_nodejs/blob/master/third_party/github.com/source-map-support/LOCAL_MODS.md
1. Any bundle or distribution which includes this code needs to propagate the LICENSE file or content. Talk to your TL to make sure this is done correctly. 

## Under Bazel

This directory is treated specially by Bazel.

All BUILD.bazel files under `third_party` are required to have a `licenses` statement.
See https://docs.bazel.build/versions/master/be/functions.html#licenses

Note that we don't yet have a way to enumerate the licenses and include them in our distribution.
Follow https://github.com/bazelbuild/bazel/issues/188
