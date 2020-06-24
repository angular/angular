load("//dev-infra/benchmark/ng_rollup_bundle:ng_rollup_bundle.bzl", "ng_rollup_bundle")

def ls_rollup_bundle(name, **kwargs):
    """
        A variant of ng_rollup_bundle for the language-service bundle that
        outputs in AMD format.
    """
    visibility = kwargs.pop("visibility", None)

    # Note: the output file is called "umd.js" because of historical reasons.
    # The format is actually AMD and not UMD, but we are afraid to rename
    # the file because that would likely break the IDE and other integrations that
    # have the path hardcoded in them.
    ng_rollup_bundle(
        name = name + ".umd",
        build_optimizer = False,
        format = "amd",
        visibility = visibility,
        **kwargs
    )
    native.alias(
        name = name,
        actual = name + ".umd",
        visibility = visibility,
    )
