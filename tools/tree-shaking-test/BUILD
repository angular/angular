ESM_PACKAGES = [
    "core",
    "common",
    "compiler",
    "forms",
    "http",
    "platform-browser",
    "platform-browser-dynamic",
    "platform-server",
    "router",
    "upgrade",
]

genrule(
    name = "tree_shaking_metric",
    srcs = ["//:{}_esm".format(p) for p in ESM_PACKAGES] + ["rollup.config.js"],
    outs = ["{}.bundle.js".format(p) for p in ESM_PACKAGES] +
        ["{}.entry.js".format(p) for p in ESM_PACKAGES],
    cmd = """
# Used by rollup.config.js to locate the esm modules.
export BINDIR="$(BINDIR)"
mkdir -p "$(BINDIR)/{package_name}"
for package in {packages}; do
  entry="$(BINDIR)/{package_name}/$$package.entry.js"
  output="$(BINDIR)/{package_name}/$$package.bundle.js"

  echo "import * as x from '@angular/$$package';" > $$entry

  $(location //:rollup_bin) --config $(location rollup.config.js) --input $$entry --output $$output
done
""".format(package_name=PACKAGE_NAME, packages=" ".join(ESM_PACKAGES)),
    tools = ["//:rollup_bin"],
    output_to_bindir = True,
)
