/*
 * Use this script to run the tests for Firebase test utils.
 *
 * We cannot use `jasmine-ts`, because it does not support passing a glob pattern any more (see
 * https://github.com/svi3c/jasmine-ts/issues/33#issuecomment-511374288) and thus requires a
 * `jasmine.json` config file, which does not allow us to set the `projectBaseDir`. This in turn
 * means that you have to run the command from a specific directory (so that the spec paths are
 * resolved correctly).
 *
 * Using a file like this gives us full control.
 */

const Jasmine = require('jasmine');
const {join} = require('path');
const {register} = require('ts-node');

register({project: join(__dirname, 'tsconfig.json')});

const runner = new Jasmine({projectBaseDir: __dirname});
runner.loadConfig({spec_files: ['**/*.spec.ts']});
runner.execute().catch((error) => {
  // Something broke so non-zero exit to prevent the process from succeeding.
  console.error(error);
  process.exit(1);
});
