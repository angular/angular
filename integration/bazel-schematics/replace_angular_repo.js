// TODO(kyliau): This file should be removed when we use Angular npm distro from
// Bazel projects.

const fs = require('fs');

function main(argv) {
  argv = argv.slice(2);
  if (argv.length !== 1) {
    throw new Error('Expect WORKSPACE to be first parameter');
  }
  const workspace = argv[0];
  const content = fs.readFileSync(workspace, 'utf-8');
  const regex = /ANGULAR_VERSION.*\nhttp_archive\((.*\n){4}\)/;
  if (!regex.test(content)) {
    throw new Error("Failed to find http_archive rule for Angular in WORKSPACE");
  }
  const newContent = content.replace(regex, `
local_repository(
    name = "angular",
    path = "../../..",
)`);
  fs.writeFileSync(workspace, newContent);
}

main(process.argv)
