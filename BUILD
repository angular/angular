package(default_visibility = ["//visibility:public"])
exports_files(["tsconfig.json"])

# This rule belongs in node_modules/BUILD
# It's here as a workaround for
# https://github.com/bazelbuild/bazel/issues/374#issuecomment-296217940
filegroup(
    name = "node_modules",
    srcs = glob([
        # Performance workaround: list individual files
        # This won't scale in the general case.
        # TODO(alexeagle): figure out what to do
        "node_modules/typescript/lib/**",
        "node_modules/zone.js/**/*.d.ts",
        "node_modules/rxjs/**/*.d.ts",
        "node_modules/@types/**/*.d.ts",
    ]),
)
