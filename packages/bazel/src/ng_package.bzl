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

def _rollup_esm2015(ctx, fesm_2015, esm_2015_files, license_banner_file, npm_package_name, license_banner_path, externals, entry_point_name):
  # unescape slashes in entry point names since we are about to create the final fs layout
  entry_point_name = entry_point_name.replace("_", "/")

  if  (npm_package_name == entry_point_name):
    input_dir = npm_package_name
  else:
    input_dir = npm_package_name + "/" + entry_point_name

  rollup_args = ctx.actions.args()
  # TODO(i): we probably want to make "index.js" configurable or even better auto-configured
  #   based on the original tsconfig, since we allow the filename to be adjusted via
  #   flatModuleOutFile config property https://angular.io/guide/aot-compiler#flatmoduleoutfile
  # TODO(i): is it ok to rely on the fact that 0-th file in the esm_2015_files is at the root
  #   of the directory? Is there a better way to get this directory path?
  rollup_args.add("--input")
  rollup_args.add([esm_2015_files[0].dirname, input_dir, "index.js"], join_with="/")

  rollup_args.add("--output")
  rollup_args.add([fesm_2015.path, entry_point_name + ".js"], join_with="/")

  rollup_args.add(["--banner", "\"$(cat " + license_banner_path + ")\""])
  rollup_args.add(["--format", "es"])

  # TODO(i): consider "--sourcemap", "inline"
  # Note: if the input has external source maps then we need to also install and use
  #   `rollup-plugin-sourcemaps`, which will require us to use rollup.config.js file instead
  #   of command line args
  rollup_args.add("--sourcemap")

  rollup_args.add("--external")
  rollup_args.add(externals, join_with=",")

  ctx.actions.run(
      progress_message = "Angular Packaging: rolling up %s" % ctx.label.name,
      mnemonic = "AngularPackageRollup",
      outputs = [fesm_2015],
      inputs = esm_2015_files + [ctx.executable._rollup, license_banner_file],
      executable = ctx.executable._rollup,
      arguments = [rollup_args],
  )

# ng_package produces package that is npm ready.
def _ng_package_impl(ctx):
  npm_package_name = ctx.label.package.split("/")[-1]
  npm_package_directory = ctx.actions.declare_directory(ctx.label.name)
  fesm_2015 = ctx.actions.declare_directory("fesm2015-" + npm_package_name)
  fesms_2015 = [fesm_2015]
  fesms_5 = [] # TODO(alexeagle)

  esm_2015_files = collect_es6_sources(ctx).to_list()
  stamped_package_json = ctx.file.package_json
  readme_md = ctx.file.readme_md
  license_banner_file = ctx.file.license_banner
  externals = ctx.attr.globals.keys()

  license_banner_path = license_banner_file.path if  (license_banner_file != None) else "/dev/null"

  _rollup_esm2015(ctx, fesm_2015, esm_2015_files, license_banner_file, npm_package_name, license_banner_path, externals, npm_package_name)

  for entry_point in ctx.attr.secondary_entry_points:
    entry_point_name = entry_point.name
    fesm_2015 = ctx.actions.declare_directory("fesm2015-" + entry_point_name)
    fesms_2015.append(fesm_2015)
    externals = entry_point.globals.keys()
    _rollup_esm2015(ctx, fesm_2015, esm_2015_files, license_banner_file, npm_package_name, license_banner_path, externals, entry_point_name)

  esm_es5_files = depset(transitive = [dep[ES5_ESM_TypeScript_output].files
                                       for dep in ctx.attr.deps
                                       if ES5_ESM_TypeScript_output in dep])
  metadata_files = depset(transitive = [getattr(dep, "angular").flat_module_metadata
                                        for dep in ctx.attr.deps
                                        if hasattr(dep, "angular")])

  ctx.actions.run(
    progress_message = "Angular Packaging: building npm package for %s" % ctx.label.name,
    mnemonic = "AngularPackage",
    outputs = [npm_package_directory],
    inputs = esm_es5_files.to_list() + fesms_2015 + fesms_5 + [
      stamped_package_json, readme_md
      ] + ctx.files.deps + collect_es6_sources(ctx).to_list() + metadata_files.to_list(),
    executable = ctx.executable._packager,
    arguments = [
      npm_package_directory.path,
      ctx.bin_dir.path + "/" + ctx.attr.package_json.label.package,
      stamped_package_json.path,
      readme_md.path,
      # TODO(i): unflattened js files are disabled for now to match the output of build.sh
      #"/".join([ctx.bin_dir.path, ctx.label.package, ctx.label.name + ".es6", ctx.attr.package_json.label.package]),
      ",".join([f.path for f in fesms_2015]),
      ",".join([f.path for f in fesms_5]),
    ],
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
      "_packager": attr.label(default=Label("//packages/bazel/src/packager"), executable=True, cfg="host"),
      "_rollup": attr.label(default=Label("//packages/bazel/src/rollup"), executable=True, cfg="host"),
    }
)


def _ng_package_entry_point_impl(ctx):
  return  struct(
      name = ctx.attr.name,
      globals = ctx.attr.globals
  )

ng_package_entry_point = rule(
    implementation = _ng_package_entry_point_impl,
    attrs = {
        "globals": attr.string_dict(default={})
    }
)

def ng_package_macro(name, package_json, license_banner, **kwargs):
  """Wraps the ng_package rule to allow running a genrule before it.

  We typically don't use macros because they are a leaky abstraction.
  However this is the only way to exercise the bazel stamping feature.

  Make sure the rule that gets the name=name is called "ng_package" so
  it matches what the user expects when they have an "ng_package" in
  their BUILD file.
  """
  native.genrule(
      name = "%s_package_json" % name,
      srcs = [package_json],
      outs = ["%s_package.stamped.json" % name],
      stamp = True,
      cmd = "sed \"s/0.0.0-PLACEHOLDER/$$(grep BUILD_SCM_VERSION bazel-out/volatile-status.txt | cut -d' ' -f 2)/\" $< > $@",
  )
  native.genrule(
      name = "%s_license_banner" % name,
      srcs = [license_banner],
      outs = ["%s_license_banner.stamped.txt" % name],
      stamp = True,
      cmd = "sed \"s/0.0.0-PLACEHOLDER/$$(grep BUILD_SCM_VERSION bazel-out/volatile-status.txt | cut -d' ' -f 2)/\" $< > $@",
  )
  ng_package(
      name = name,
      package_json = ":%s_package.stamped.json" % name,
      license_banner = "%s_license_banner.stamped.txt" % name,
      **kwargs
  )