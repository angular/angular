load("@build_bazel_rules_nodejs//:providers.bzl", "JSNamedModuleInfo")

"""Gets the workspace name of the given rule context."""

def _get_workspace_name(ctx):
    if ctx.label.workspace_root:
        # We need the workspace_name for the target being visited.
        # Starlark doesn't have this - instead they have a workspace_root
        # which looks like "external/repo_name" - so grab the second path segment.
        return ctx.label.workspace_root.split("/")[1]
    else:
        return ctx.workspace_name

"""Implementation of the dev server rule."""

def _dev_server_rule_impl(ctx):
    files = depset(ctx.files.srcs)

    # List of files which are required for the devserver to run. This includes the
    # bazel runfile helpers (to resolve runfiles in bash) and the devserver binary
    # with its transitive runfiles (in order to be able to run the devserver).
    required_tools = ctx.files._bash_runfile_helpers + \
                     ctx.files._dev_server_bin + \
                     ctx.attr._dev_server_bin[DefaultInfo].files.to_list() + \
                     ctx.attr._dev_server_bin[DefaultInfo].data_runfiles.files.to_list()

    # Walk through all dependencies specified in the "deps" attribute. These labels need to be
    # unwrapped in case there are built using TypeScript-specific rules. This is because targets
    # built using "ts_library" or "ng_module" do not declare the generated JS files as default
    # rule output.
    for d in ctx.attr.deps:
        if JSNamedModuleInfo in d:
            files = depset(transitive = [files, d[JSNamedModuleInfo].sources])
        elif hasattr(d, "files"):
            files = depset(transitive = [files, d.files])

    workspace_name = _get_workspace_name(ctx)
    root_paths = ["", "/".join([workspace_name, ctx.label.package])] + ctx.attr.additional_root_paths

    # We can't use "ctx.actions.args()" because there is no way to convert the args object
    # into a string representing the command line arguments. It looks like bazel has some
    # internal logic to compute the string representation of "ctx.actions.args()".
    args = '--root_paths="%s" ' % ",".join(root_paths)

    if ctx.attr.historyApiFallback:
        args += "--historyApiFallback "

    ctx.actions.expand_template(
        template = ctx.file._launcher_template,
        output = ctx.outputs.launcher,
        substitutions = {
            "TEMPLATED_args": args,
        },
        is_executable = True,
    )

    return [
        DefaultInfo(runfiles = ctx.runfiles(
            files = files.to_list() + required_tools,
            collect_data = True,
            collect_default = True,
        )),
    ]

dev_server_rule = rule(
    implementation = _dev_server_rule_impl,
    outputs = {
        "launcher": "%{name}.sh",
    },
    attrs = {
        "additional_root_paths": attr.string_list(doc = """
          Additionally paths to serve files from. The paths should be formatted
          as manifest paths (e.g. "my_workspace/src")
        """),
        "deps": attr.label_list(
            allow_files = True,
            doc = """
              Dependencies that need to be available to the dev-server. This attribute can be
              used for TypeScript targets which provide multiple flavors of output.
            """,
        ),
        "historyApiFallback": attr.bool(
            default = True,
            doc = """
            Whether the devserver should fallback to "/index.html" for non-file requests.
            This is helpful for single page applications using the HTML history API.
          """,
        ),
        "srcs": attr.label_list(allow_files = True, doc = """
          Sources that should be available to the dev-server. This attribute can be
          used for explicit files. This attribute only uses the files exposed by the
          DefaultInfo provider (i.e. TypeScript targets should be added to "deps").
        """),
        "_bash_runfile_helpers": attr.label(default = Label("@bazel_tools//tools/bash/runfiles")),
        "_dev_server_bin": attr.label(
            default = Label("//devtools/tools/dev-server:dev-server_bin"),
        ),
        "_launcher_template": attr.label(allow_single_file = True, default = Label("//devtools/tools/dev-server:launcher_template.sh")),
    },
)

"""
  Creates a dev server that can depend on individual bazel targets. The server uses
  bazel runfile resolution in order to work with Bazel package paths. e.g. developers can
  request files through their manifest path: "my_workspace/src/dev-app/my-genfile".
"""

def dev_server(name, testonly = False, port = 4200, tags = [], **kwargs):
    dev_server_rule(
        name = "%s_launcher" % name,
        visibility = ["//visibility:private"],
        tags = tags,
        testonly = testonly,
        **kwargs
    )

    native.sh_binary(
        name = name,
        # The "ibazel_notify_changes" tag tells ibazel to not relaunch the executable on file
        # changes. Rather it will communicate with the server implementation through "stdin".
        tags = tags + ["ibazel_notify_changes"],
        srcs = ["%s_launcher.sh" % name],
        data = [":%s_launcher" % name],
        args = ["--port=%s" % port],
        testonly = testonly,
    )
