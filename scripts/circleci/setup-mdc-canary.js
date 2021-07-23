const {join} = require('path');
const {spawn, spawnSync} = require('child_process');
const packageJson = require(join(__dirname, '../../package.json'));
const versionsProcess = spawnSync('yarn', [
  'info', 'material-components-web', 'dist-tags.canary', '--json'
], {shell: true});
let latestCanaryVersion = null;

try {
  latestCanaryVersion = JSON.parse(versionsProcess.stdout.toString()).data;
} catch (e) {
  console.error('Failed to retrieve latest MDC version');
  throw e;
}

const pattern = /^material-components-web$|^@material\//;
const params = Object.keys(packageJson.devDependencies)
  .filter(dependency => pattern.test(dependency))
  .reduce((mdcDependencies, dependency) =>
    [...mdcDependencies, `${dependency}@${latestCanaryVersion}`], []);

if (!params.length) {
  throw Error(`Could not find MDC dependencies in package.json`);
}

console.log(`Updating all MDC dependencies to version ${latestCanaryVersion}`);
const childProcess = spawn('yarn', ['add', ...params, '-D'], {shell: true});
childProcess.stdout.on('data', data => console.log(data + ''));
childProcess.stderr.on('data', data => console.error(data + ''));
childProcess.on('exit', code => process.exit(code));
