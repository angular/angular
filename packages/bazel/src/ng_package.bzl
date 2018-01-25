# Copyright Google Inc. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license
"""Implementation of the ng_package rule.
"""

# This provider exposes another flavor of output JavaScript, which is ES5 syntax
# with ES2015 module syntax (import/export).
# All Bazel rules should consume the standard dev or prod mode.
# However we need to publish this flavor on NPM, so it's necessary to be able
# to produce it.
ES5_ESM_TypeScript_output = provider()

def _ES5_ESM_outputs_aspect(target, ctx):
  # We can't recompile targets from a different workspace yet... why?
  if target.label.workspace_root.startswith("external/"): return []

  if hasattr(target, "typescript"):
    # We create a new tsconfig.json file that will have our compilation settings
    tsconfig = ctx.actions.declare_file("%s_es5_esm.tsconfig.json" % target.label.name)

    rerooted_outputs = [ctx.actions.declare_file("/".join([
        target.label.name + ".es5_esm",
        target.label.workspace_root,
        f.short_path[:-len(".closure.js")] + ".js"
    ])) for f in target.typescript.replay_params.outputs
    if not f.short_path.endswith(".externs.js")
    ]

    ctx.actions.run(
        executable = ctx.executable._modify_tsconfig,
        inputs = [target.typescript.replay_params.tsconfig],
        outputs = [tsconfig],
        arguments = [
            target.typescript.replay_params.tsconfig.path,
            "%s/%s.es5_esm" % (target.label.package, target.label.name),
            tsconfig.path,
            ctx.bin_dir.path
        ],
    )

    ctx.action(
        progress_message = "Compiling TypeScript (ES5 with ES Modules) %s" % target.label,
        inputs = target.typescript.replay_params.inputs + [tsconfig],
        # re-root the outputs under a ".es5_esm" directory so the path don't collide
        outputs = rerooted_outputs,
        arguments = [tsconfig.path],
        executable = target.typescript.replay_params.compiler,
        execution_requirements = {
            "supports-workers": "0",
        },
    )

  return [ES5_ESM_TypeScript_output(
    files = depset(rerooted_outputs)
  )]

# Downstream rules can use this aspect to access the ES5_ESM output flavor.
# Only terminal rules (those which expect never to be used in deps[]) should do
# this.
ES5_ESM_outputs_aspect = aspect(
    implementation = _ES5_ESM_outputs_aspect,
    # Recurse to the deps of any target we visit
    attr_aspects = ['deps'],
    attrs = {
      "_modify_tsconfig": attr.label(
          default = ("//packages/bazel/src:modify_tsconfig"),
          allow_files = True,
          executable = True,
          cfg = "host")
    },
)

load("@build_bazel_rules_nodejs//:internal/collect_es6_sources.bzl", "collect_es6_sources")

def _rollup(ctx, output_name, inputs, npm_package_name, externals, entry_point_name, rootdir, format = "es"):
  print("building rollup to ", output_name)
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
      inputs = inputs + [
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

# ng_package produces package that is npm ready.
def _ng_package_impl(ctx):
  npm_package_name = ctx.label.package.split("/")[-1]
  npm_package_directory = ctx.actions.declare_directory(ctx.label.name)

  esm_2015_files = collect_es6_sources(ctx).to_list()
  esm_es5_files = depset(transitive = [dep[ES5_ESM_TypeScript_output].files
                                       for dep in ctx.attr.deps
                                       if ES5_ESM_TypeScript_output in dep]).to_list()

  externals = ctx.attr.globals.keys()

  fesm_2015 = _rollup(ctx, "fesm_2015/" + npm_package_name, esm_2015_files, npm_package_name, externals,
      ctx.label.package, "/".join([ctx.bin_dir.path, ctx.label.package, ctx.label.name + ".es6"]))
  fesm_5 = _rollup(ctx, "fesm_5/" + npm_package_name, esm_es5_files, npm_package_name, externals,
      #FIXME(alexeagle): why is it /core.es5_esm rather than /npm_package.es5_esm? should be more similar to es6 above
      ctx.label.package, "/".join([ctx.bin_dir.path, ctx.label.package, ctx.label.package.split("/")[-1] + ".es5_esm"]))
  umd = _rollup(ctx, "umd/" + npm_package_name, esm_es5_files, npm_package_name, externals,
      #FIXME(alexeagle): why is it /core.es5_esm rather than /npm_package.es5_esm? should be more similar to es6 above
      ctx.label.package, "/".join([ctx.bin_dir.path, ctx.label.package, ctx.label.package.split("/")[-1] + ".es5_esm"]),
      "umd")
  min = _uglify(ctx, umd.js, npm_package_name)

  # These accumulators match the directory names where the files live in the
  # Angular package format.
  esm2015 = [fesm_2015.js, fesm_2015.map]
  esm5 = [fesm_5.js, fesm_5.map]
  bundles = [umd.js, umd.map, min.js, min.map]

  for entry_point in ctx.attr.secondary_entry_points:
    entry_point_name = entry_point.label.package
    externals = entry_point.globals.keys()

    # TODO jasonaden says there is no particular reason these filenames differ
    umd_output_filename = "-".join(entry_point_name.split("/")[1:])
    fesm_output_filename = entry_point_name[len(ctx.label.package)+1:].replace("/", "__")
    print("Try to get right names", fesm_output_filename)

    secondary_fesm_2015 = _rollup(ctx,  "fesm_2015/" + fesm_output_filename, esm_2015_files,
        npm_package_name, externals, entry_point_name,
       "/".join([ctx.bin_dir.path, ctx.label.package, ctx.label.name + ".es6"]))
    secondary_fesm_5 = _rollup(ctx, "fesm_5/" + fesm_output_filename, esm_es5_files,
       npm_package_name, externals, entry_point_name,
       "/".join([ctx.bin_dir.path, entry_point.label.package, entry_point.label.package.split("/")[-1] + ".es5_esm"]))

    secondary_umd = _rollup(ctx, "umd/" + umd_output_filename, esm_es5_files, npm_package_name, externals,
      #FIXME(alexeagle): why is it /core.es5_esm rather than /npm_package.es5_esm? should be more similar to es6 above
      entry_point_name, "/".join([ctx.bin_dir.path, entry_point.label.package, entry_point.label.package.split("/")[-1] + ".es5_esm"]),
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
      inputs = esm_es5_files + esm2015 + esm5 + bundles + [
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
#   [ ]   <secondary-entry-point>.d.ts
#   [ ]   <secondary-entry-point>.metadata.json
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
    attrs = {
      "deps": attr.label_list(aspects = [ES5_ESM_outputs_aspect]),
      "package_json": attr.label(allow_single_file = FileType([".json"])),
      "readme_md": attr.label(allow_single_file = FileType([".md"])),
      "license_banner": attr.label(allow_single_file = FileType([".txt"])),
      "globals": attr.string_dict(default={}),
      "secondary_entry_points": attr.label_list(),
      "stamp_data": attr.label(mandatory=True, allow_single_file=[".txt"]),
      "_packager": attr.label(default=Label("//packages/bazel/src/packager"), executable=True, cfg="host"),
      "_rollup": attr.label(default=Label("//packages/bazel/src/rollup"), executable=True, cfg="host"),
      "_rollup_config_tmpl": attr.label(default=Label("//packages/bazel/src/rollup:rollup.config.js"), allow_single_file=True),
      "_uglify": attr.label(default=Label("//packages/bazel/src/rollup:uglify"), executable=True, cfg="host"),
    }
)


def _ng_package_entry_point_impl(ctx):
  return struct(
      globals = ctx.attr.globals
  )

ng_package_entry_point = rule(
    implementation = _ng_package_entry_point_impl,
    attrs = {
        "globals": attr.string_dict(default={})
    }
)

def ng_package_macro(name, **kwargs):
  """Wraps the ng_package rule to allow running a genrule before it.

  We typically don't use macros because they are a leaky abstraction.
  However this is the only way to exercise the bazel stamping feature.

  Make sure the rule that gets the name=name is called "ng_package" so
  it matches what the user expects when they have an "ng_package" in
  their BUILD file.
  """
  native.genrule(
      name = "%s_stamp_data" % name,
      outs = ["%s_stamp_data.txt" % name],
      stamp = True,
      cmd = "cat bazel-out/volatile-status.txt > $@",
  )
  ng_package(
      name = name,
      stamp_data = ":%s_stamp_data.txt" % name,
      **kwargs
  )