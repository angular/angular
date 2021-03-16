const {join} = require('path');
const {spawn} = require('child_process');
const packageJson = require(join(__dirname, '../../package.json'));
const pattern = /^material-components-web$|^@material\//;
const params = Object.keys(packageJson.devDependencies)
  .filter(dependency => pattern.test(dependency))
  .reduce((mdcDependencies, dependency) => [...mdcDependencies, `${dependency}@canary`], []);

if (!params.length) {
  throw Error(`Could not find MDC dependencies in package.json`);
}

console.log('Updating all MDC dependencies to latest canary version');
const childProcess = spawn('yarn', ['add', ...params, '-D'], {shell: true});
childProcess.stdout.on('data', data => console.log(data + ''));
childProcess.stderr.on('data', data => console.error(data + ''));
childProcess.on('exit', code => process.exit(code));
