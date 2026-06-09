# Copyright Google LLC All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.dev/license

def _copy_dir_and_add_404_impl(ctx):
    # Get the input directory from the source target
    files_list = ctx.attr.src[DefaultInfo].files.to_list()
    if not files_list:
        fail("src target does not produce any files")
    input_dir = files_list[0]

    # Declare the output directory
    output_dir = ctx.actions.declare_directory("dist_firebase")

    # Execute the copy and 404.html creation in the sandbox
    ctx.actions.run_shell(
        inputs = [input_dir],
        outputs = [output_dir],
        command = """
        mkdir -p "$2"
        cp -R "$1"/. "$2"
        cp "$2"/browser/index.csr.html "$2"/browser/404.html
        """,
        arguments = [input_dir.path, output_dir.path],
    )
    return [DefaultInfo(files = depset([output_dir]))]

copy_dir_and_add_404 = rule(
    implementation = _copy_dir_and_add_404_impl,
    attrs = {
        "src": attr.label(mandatory = True),
    },
)
