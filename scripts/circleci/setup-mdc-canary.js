const {join} = require('path');
const {writeFileSync} = require('fs');
const {spawn, spawnSync} = require('child_process');
const packageJsonPath = join(__dirname, '../../package.json');
const packageJson = require(packageJsonPath);
const versionsProcess = spawnSync(
  'yarn',
  ['info', 'material-components-web', 'dist-tags.canary', '--json'],
  {shell: true},
);
let latestCanaryVersion = null;

try {
  latestCanaryVersion = JSON.parse(versionsProcess.stdout.toString()).data;
} catch (e) {
  console.error('Failed to retrieve latest MDC version');
  throw e;
}

['devDependencies', 'dependencies'].forEach(field => {
  Object.keys(packageJson[field]).forEach(key => {
    if (/^material-components-web$|^@material\//.test(key)) {
      packageJson[field][key] = latestCanaryVersion;
    }
  });
});

writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log(`Updating all MDC dependencies to version ${latestCanaryVersion}`);
const childProcess = spawn('yarn', ['install', '--non-interactive'], {shell: true});
childProcess.stdout.on('data', data => console.log(data + ''));
childProcess.stderr.on('data', data => console.error(data + ''));
childProcess.on('exit', code => process.exit(code));
