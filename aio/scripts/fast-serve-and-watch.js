/*
    This script serves the aio app, watches for changes,
    and runs a fast dgeni build on any changed files.
*/

const spawn = require("cross-spawn");
const watchr = require("../tools/transforms/authors-package/watchr.js");
const architectCli = require.resolve("@angular-devkit/architect-cli/bin/architect");

const serve = spawn(architectCli, ["site:serve"], {stdio: "inherit"});
serve.on("error", error => {
    console.error("architect serve script failed");
    console.error(error);
    process.exit(1);
});
serve.on("close", code => {
    console.error(`architect serve script exited with code ${code}`);
    process.exit(1);
})

watchr.watch(true);