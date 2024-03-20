load("//tools:defaults.bzl", "nodejs_test")

def local_server_test(name, entry_point, serve_target, data = [], args = [], **kwargs):
    """Run a test script alongside a locally running http server.

    Args:
        name: Name of the test target
        entry_point: The test script to run
        serve_target: The contents to serve
        data: Additional data required by the test script
        args: Args to pass to the test script. Note: The special argument LOCALHOST_URL
          will be substituted with the url pointing to the served contents.
        **kwargs: remaining args to pass to test
    """
    nodejs_test(
        name = name,
        testonly = True,
        args = [
            "$(rootpath @aio_npm//light-server/bin:light-server)",
            "$(rootpath %s)" % serve_target,
            "$(rootpath %s)" % entry_point,
        ] + args,
        data = [
            "//aio/scripts:run-with-local-server.mjs",
            "@aio_npm//get-port",
            "@aio_npm//shelljs",
            "@aio_npm//tree-kill",
            "@aio_npm//light-server/bin:light-server",
            serve_target,
            entry_point,
        ] + data,
        entry_point = "//aio/scripts:run-with-local-server.mjs",
        **kwargs
    )
