load("@npm//@angular/build-tooling/bazel/api-golden:index.bzl", "api_golden_test")

def generate_test_targets(targets, types = []):
    """Macro for generating `api_golden_test` Bazel test targets. Since there are multiple
    golden files in this package, we don't want to manually set up all golden files.

    In order to make this more maintainable, we allow passing a list of targets that will
    be automatically verified against the corresponding golden report file.
    """

    for target in targets:
        label = Label(target)

        # Splits the path that is relative to the current directory into the package name and
        # entry point tail path. The package name is always the first path segment (e.g. "cdk/")
        segments = label.package[len("src/"):].split("/", 1)
        package_name = segments[0]

        # Name of the entry-point if not the primary-one (e.g. "a11y", "drag-drop", "platform")
        entry_point = segments[1] if len(segments) > 1 else None

        golden_basename = (entry_point if entry_point else package_name).replace("/", "-")
        golden_file = "%s/%s.md" % (package_name, golden_basename)

        # Create the test rule that compares the build output with the golden file.
        api_golden_test(
            name = "%s_api" % golden_file,
            entry_point = "angular_material/%s/index.d.ts" % label.package,
            data = [golden_file] + [target],
            golden = "angular_material/tools/public_api_guard/%s" % golden_file,
            types = types,
        )
