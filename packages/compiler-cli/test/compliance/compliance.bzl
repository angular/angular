load("//tools:defaults.bzl", _jasmine_node_test = "jasmine_node_test")

def compliance_test(name, bootstrap = [], **kwargs):
    """Default values for ts_library"""

    _jasmine_node_test(
        name = name,
        bootstrap = bootstrap,
        **kwargs
    )

    native.genrule(
        name = name + "_enable_partial_compilation_mode",
        outs = ["setup_compilation_mode_partial.js"],
        cmd = """
          echo "require('./compilation_mode_flag').setCompilationMode('partial');" > $@
        """,
    )

    _jasmine_node_test(
        name = name + "_partial",
        bootstrap = bootstrap + [name + "_enable_partial_compilation_mode"],
        **kwargs
    )
