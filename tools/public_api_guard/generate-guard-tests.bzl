load("@angular//tools/ts-api-guardian:index.bzl", "ts_api_guardian_test")

"""
  Macro for generating ts-api-guardian Bazel test targets. Since there are multiple golden files
  in this package, we don't want to manually set up all golden files. In order to make this
  more maintainable, we allow passing a list of golden files that will be automatically verified
  against the associated source entry point.
"""
def generate_test_targets(golden_files):
  for golden_file in golden_files:
    # Splits the path that is relative to the current directory into the package name and
    # entry point tail path. The package name is always the first path segment (e.g. "cdk/")
    [package_name, entry_point_tail] = golden_file.split("/", 1)

    # Name of the entry-point (e.g. "a11y", "drag-drop", "platform")
    entry_point = entry_point_tail[:-len(".d.ts")]

    # Construct the path to the given entry-point. Note that we also need to find a way to
    # allow guards for the primary entry-point of a package. e.g. "//src/cdk:cdk" should be also
    # validated. We achieve this by checking if the package_name is equal to the entry_point name.
    # For example: "public_api_guard/cdk/cdk.d.ts" will be the golden for the primary entry-point.
    entry_point_path = "%s" % (package_name if entry_point == package_name
                               else "%s/%s" % (package_name, entry_point))

    # Create the test rule that compares the build output with the golden file.
    ts_api_guardian_test(
      name = "%s_api" % golden_file,
      actual = "angular_material/src/%s/index.d.ts" % entry_point_path,
      data = [golden_file] + [
        "//src/%s" % (entry_point_path),
      ],
      golden = "angular_material/tools/public_api_guard/%s" % golden_file,
      use_angular_tag_rules = False,
    )
