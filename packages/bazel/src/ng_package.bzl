# Copyright Google Inc. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license
"""Implementation of the ng_package rule.
"""

load("@build_bazel_rules_nodejs//:internal/collect_es6_sources.bzl", "collect_es6_sources")
load("@build_bazel_rules_nodejs//:internal/rollup/rollup_bundle.bzl",
     "write_rollup_config",
     "rollup_module_mappings_aspect",
     "ROLLUP_ATTRS")
load(":esm5.bzl", "esm5_outputs_aspect", "ESM5Info")

def _rollup(ctx, output_name, inputs, npm_package_name, externals, entry_point_name, rootdir, format = "es"):
  rollup_config = ctx.actions.declare_file("%s.rollup.conf.js" % ctx.label.name)
  ext = ".umd.js" if format == "umd" else ".js"

  js_output = ctx.actions.declare_file(output_name + ext)
  map_output = ctx.actions.declare_file(output_name + ext + ".map")

  ctx.actions.expand_template(
      output = rollup_config,
      template = ctx.file._rollup_config_tmpl,
      substitutions = {
          "TMPL_banner_file": ctx.file.license_banner.path,
          "TMPL_stamp_data": ctx.file.stamp_data.path,
      },
  )

  args = ctx.actions.args()
  args.add(["--config", rollup_config.path])

  # TODO(i): we probably want to make "index.js" configurable or even better auto-configured
  #   based on the original tsconfig, since we allow the filename to be adjusted via
  #   flatModuleOutFile config property https://angular.io/guide/aot-compiler#flatmoduleoutfile
  args.add("--input")
  args.add([rootdir, entry_point_name, "index.js"], join_with="/")

  args.add(["--output", js_output.path])

  args.add(["--format", format])
  # TODO(alexeagle): don't hard-code this name
  args.add(["--name", "@angular/core"])

  # TODO(i): consider "--sourcemap", "inline"
  # Note: if the input has external source maps then we need to also install and use
  #   `rollup-plugin-sourcemaps`, which will require us to use rollup.config.js file instead
  #   of command line args
  args.add("--sourcemap")

  args.add("--external")
  args.add(externals, join_with=",")

  ctx.actions.run(
      progress_message = "Angular Packaging: rolling up %s" % ctx.label.name,
      mnemonic = "AngularPackageRollup",
      inputs = inputs.to_list() + [
          ctx.executable._rollup,
          ctx.file.license_banner,
          rollup_config,
          ctx.file.stamp_data,
      ],
      outputs = [js_output, map_output],
      executable = ctx.executable._rollup,
      arguments = [args],
  )
  return struct(
      js = js_output,
      map = map_output,
  )

def _uglify(ctx, input, entry_point_name):
  js_output = ctx.actions.declare_file(entry_point_name + ".umd.min.js")
  map_output = ctx.actions.declare_file(entry_point_name + ".umd.min.js.map")
  args = ctx.actions.args()
  args.add(["--compress", "--screw-ie8", "--comments"])
  args.add(["--prefix", "relative"])
  args.add(["--output", js_output.path])
  args.add(["--source-map", map_output.path])
  args.add(["--source-map-include-sources"])
  args.add(input.path)

  ctx.actions.run(
      progress_message = "Angular Packaging: minifying %s" % ctx.label.name,
      mnemonic = "AngularPackageUglify",
      inputs = [input],
      outputs = [js_output, map_output],
      executable = ctx.executable._uglify,
      arguments = [args],
  )
  return struct(
      js = js_output,
      map = map_output,
  )

# ng_package produces package that is npm-ready.
def _ng_package_impl(ctx):
  npm_package_name = ctx.label.package.split("/")[-1]
  npm_package_directory = ctx.actions.declare_directory(ctx.label.name)

  esm_2015_files = collect_es6_sources(ctx)

  esm5_sources = depset()
  root_dirs = []

  for dep in ctx.attr.deps:
    if ESM5Info in dep:
      # TODO(alexeagle): we could make the module resolution in the rollup plugin
      # faster if we kept the files grouped with their root dir. This approach just
      # passes in both lists and requires multiple lookups (with expensive exception
      # handling) to locate the files again.
      transitive_output = dep[ESM5Info].transitive_output
      root_dirs.extend(transitive_output.keys())
      esm5_sources = depset(transitive=[esm5_sources] + transitive_output.values())

  externals = ctx.attr.globals.keys()

  fesm_2015 = _rollup(ctx, "fesm_2015/" + npm_package_name, esm_2015_files, npm_package_name, externals,
      ctx.label.package, "/".join([ctx.bin_dir.path, ctx.label.package, ctx.label.name + ".es6"]))
  fesm_5 = _rollup(ctx, "fesm_5/" + npm_package_name, esm5_sources, npm_package_name, externals,
       ctx.label.package, "/".join([ctx.bin_dir.path, ctx.label.package, ctx.label.package.split("/")[-1] + ".esm5"]))
  umd = _rollup(ctx, "umd/" + npm_package_name, esm5_sources, npm_package_name, externals,
      ctx.label.package, "/".join([ctx.bin_dir.path, ctx.label.package, ctx.label.package.split("/")[-1] + ".esm5"]),
      "umd")
  min = _uglify(ctx, umd.js, npm_package_name)

  # These accumulators match the directory names where the files live in the
  # Angular package format.
  esm2015 = [fesm_2015.js, fesm_2015.map]
  esm5 = [fesm_5.js, fesm_5.map]
  bundles = [umd.js, umd.map, min.js, min.map]

  for entry_point in ctx.attr.secondary_entry_points:
    entry_point_name = ctx.label.package + "/" + entry_point

    # TODO jasonaden says there is no particular reason these filenames differ
    umd_output_filename = "-".join([npm_package_name] + entry_point.split("/"))
    fesm_output_filename = entry_point.replace("/", "__")

    secondary_fesm_2015 = _rollup(ctx,  "fesm_2015/" + fesm_output_filename, esm_2015_files,
        npm_package_name, externals, entry_point_name,
       "/".join([ctx.bin_dir.path, ctx.label.package, ctx.label.name + ".es6"]))
    secondary_fesm_5 = _rollup(ctx, "fesm_5/" + fesm_output_filename, esm5_sources,
       npm_package_name, externals, entry_point_name,
       "/".join([ctx.bin_dir.path, entry_point_name, entry_point.split("/")[-1] + ".esm5"]))

    secondary_umd = _rollup(ctx, "umd/" + umd_output_filename, esm5_sources, npm_package_name, externals,
      entry_point_name, "/".join([ctx.bin_dir.path, entry_point_name, entry_point.split("/")[-1] + ".esm5"]),
      "umd")
    secondary_min = _uglify(ctx, secondary_umd.js, umd_output_filename)

    esm5.extend([secondary_fesm_5.js, secondary_fesm_5.map])
    esm2015.extend([secondary_fesm_2015.js, secondary_fesm_2015.map])
    bundles.extend([secondary_umd.js, secondary_umd.map, secondary_min.js, secondary_min.map])

  metadata_files = depset(transitive = [getattr(dep, "angular").flat_module_metadata
                                        for dep in ctx.attr.deps
                                        if hasattr(dep, "angular")])

  args = ctx.actions.args()
  args.add(npm_package_directory.path)
  args.add([ctx.bin_dir.path, ctx.attr.package_json.label.package], join_with="/")
  args.add([ctx.file.package_json.path, ctx.file.readme_md.path])
  # TODO(i): unflattened js files are disabled for now to match the output of build.sh
  # args.add([ctx.bin_dir.path, ctx.label.package, ctx.label.name + ".es6", ctx.attr.package_json.label.package], join_with="/")
  args.add([f.path for f in esm2015], join_with=",")
  args.add([f.path for f in esm5], join_with=",")
  args.add([f.path for f in bundles], join_with=",")
  args.add(ctx.file.stamp_data.path)

  ctx.actions.run(
      progress_message = "Angular Packaging: building npm package for %s" % ctx.label.name,
      mnemonic = "AngularPackage",
      inputs = (esm5_sources + esm2015 + esm5 + bundles) + [
            ctx.file.stamp_data,
            ctx.file.package_json,
            ctx.file.readme_md,
        ] + ctx.files.deps + collect_es6_sources(ctx).to_list() + metadata_files.to_list(),
      outputs = [npm_package_directory],
      executable = ctx.executable._packager,
      arguments = [args],
  )

  return struct(
    files = depset([npm_package_directory])
  )

# The directory structure is first determined by the module id. For example,
# it is the target directory for "my_library" or "@angular/core" but it is in a
# subdirectory "part" for "my_library/part" or "http" for the id
# "@angular/common/http"). The <base-name> below refers to the final segment
# of the module id. For example, "my_library" for "my_library", and "core"
# for "@angular/core" and "http" for "@angular/common/http".

# The directory layout is:
#   [x] <primary-entry-point>/
#   [x]   package.json
#   [x]   README.md
#   [x]   <primary-entry-point>.d.ts
#   [x]   <primary-entry-point>.metadata.json
#   [x]   <secondary-entry-point>.d.ts
#   [x]   <secondary-entry-point>.metadata.json
#   [x]   <secondary-entry-point>/
#   [ ]     package.json
#   [x]     <secondary-entry-point>.d.ts
#   [x]     <secondary-entry-point>.metadata.json
#   [ ]   bundles/
#   [ ]     <primary-entry-point>.umd.js
#   [ ]     <primary-entry-point>.umd.js.map
#   [ ]     <primary-entry-point>.umd.min.js
#   [ ]     <primary-entry-point>.umd.min.js.map
#   [ ]     <secondary-entry-point>.umd.js
#   [ ]     <secondary-entry-point>.umd.js.map
#   [ ]     <secondary-entry-point>.umd.min.js
#   [ ]     <secondary-entry-point>.umd.min.js.map
#   [x]   esm2015/
#   [x]     <primary-entry-point>.js
#   [x]     <primary-entry-point>.js.map
#   [ ]     <secondary-entry-point>.js
#   [ ]     <secondary-entry-point>.js.map
#   [ ]   esm5/
#   [ ]     <primary-entry-point>.js
#   [ ]     <primary-entry-point>.js.map
#   [ ]     <secondary-entry-point>.js
#   [ ]     <secondary-entry-point>.js.map
#   [ ]   <extra-files>
ng_package = rule(
    implementation = _ng_package_impl,
    attrs = dict(ROLLUP_ATTRS, **{
      "deps": attr.label_list(aspects = [
          rollup_module_mappings_aspect,
          esm5_outputs_aspect,
      ]),
      "package_json": attr.label(allow_single_file = FileType([".json"])),
      "readme_md": attr.label(allow_single_file = FileType([".md"])),
      "globals": attr.string_dict(default={}),
      "secondary_entry_points": attr.string_list(),
      "_packager": attr.label(
          default=Label("//packages/bazel/src/packager"),
          executable=True, cfg="host"),
      "_rollup": attr.label(
          default=Label("//packages/bazel/src/rollup"),
          executable=True, cfg="host"),
      "_rollup_config_tmpl": attr.label(
          default=Label("//packages/bazel/src/rollup:rollup.config.js"),
          allow_single_file=True),
      "_uglify": attr.label(
          default=Label("//packages/bazel/src:uglify"),
          executable=True, cfg="host"),
    }),
)
