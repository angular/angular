### Debugging the pre-rendered HTML file

Since the pre-rendered HTML file is built through a Bazel test target, the
generated HTML file will not be stored in a folder of the repository. Instead,
the file will be stored in the `bazel-out` folder.

You can retrieve the path to the file by either running:

* `bazel run //src/universal-app:server_test --test_output=all`
* `echo $(bazel info bazel-testlogs)/src/universal-app/server_test/test.outputs/index-prerendered.html`
