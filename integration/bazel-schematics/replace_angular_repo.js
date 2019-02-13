// TODO(kyliau): This file should be removed when we use Angular npm distro from
// Bazel projects.

const fs = require('fs');

function replaceAngular(content) {
  const regex = /ANGULAR_VERSION.*\nhttp_archive\((.*\n){4}\)/;
  if (!regex.test(content)) {
    throw new Error('Failed to find http_archive rule for Angular in WORKSPACE');
  }
  return content.replace(regex, `
local_repository(
    name = "angular",
    path = "../../..",
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
  fs.writeFileSync(workspace, content);
}

main(process.argv)
