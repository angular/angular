load("@aspect_bazel_lib//lib:copy_to_directory.bzl", "copy_to_directory")
load("//packages/bazel:index.bzl", "types_bundle")

def generate_types_bundle_artifact(name, entry_points):
    """Generates a tree artfiact containing the bundled public entry-point type definitions.

    Bundled entry-points need to be put into a tree artifact to avoid collisions with
    the original type outputs.

    Args:
        name: Name of the tree artifact.
        entry_points: List of entry-points. Entry-points are expected be directionaries
                      with properties for `file` (the `.ts` file as label) and `target`.
      """
    type_bundle_targets = []
    temp_directory_name = "%s_temp" % name

    for entry_point in entry_points:
        entry_point_file_label = Label(entry_point["file"])
        entry_point_path = "%s/%s" % (entry_point_file_label.package, entry_point_file_label.name)

        # Use the `.d.ts` output file as entry-point and relativize it to the current package.
        entry_point_path = entry_point_path.replace(".ts", ".d.ts")[len(native.package_name()) + 1:]

        target_name = "dts_bundle_%s" % (entry_point_path.replace("/", "_"))
        type_bundle_targets.append(target_name)

        types_bundle(
            name = target_name,
            output_name = "%s/%s" % (temp_directory_name, entry_point_path),
            entry_point = entry_point_path,
            deps = [entry_point["target"]],
        )

    copy_to_directory(
        name = name,
        srcs = type_bundle_targets,
        replace_prefixes = {
            # Remove the special prefix we add to all type bundles. Bundles are prefixed
            # that way to avoid collisions with the actual `.d.ts` entry-points.
            temp_directory_name: "",
        },
    )
