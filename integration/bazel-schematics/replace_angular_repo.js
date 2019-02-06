// TODO(kyliau): This file should be removed when we use Angular npm distro from
// Bazel projects.

const fs = require('fs');

function replaceAngular(content) {
  const regex = /ANGULAR_VERSION.*\nhttp_archive\((.*\n){4}\)/;
  if (!regex.test(content)) {
    throw new Error("Failed to find http_archive rule for Angular in WORKSPACE");
  }
  return content.replace(regex, `
local_repository(
    name = "angular",
    path = "../../..",
)`);
}

function replaceNpm(content) {
  const regex = /yarn_install\((.*\n){4}\)/;
  if (!regex.test(content)) {
    throw new Error("Failed to find yarn_install rule for Angular in WORKSPACE");
  }
  return content.replace(regex, `
yarn_install(
    name = "npm",
    # Need a reference to @angular here so that Bazel sets up the
    # external repository before calling yarn_install
    data = ["@angular//:LICENSE"],
    package_json = "//:package.json",
    yarn_lock = "//:yarn.lock",
)`);
}

function main(argv) {
  argv = argv.slice(2);
  if (argv.length !== 1) {
    throw new Error('Expect WORKSPACE to be first parameter');
  }
  const workspace = argv[0];
  let content = fs.readFileSync(workspace, 'utf-8');
  content = replaceAngular(content);
  content = replaceNpm(content);
  fs.writeFileSync(workspace, content);
}

main(process.argv)
