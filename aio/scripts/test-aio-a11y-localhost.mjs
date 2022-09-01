import getPort from 'get-port';
import sh from 'shelljs';
import treeKill from 'tree-kill';

sh.set('-e');

// Serve AIO locally on an unused port and run a11y audit tests against it.
// 
// This script is a wrapper around the existing test-aio-a11y.mjs script,
// but additionally acquires an unused port and sets up a local http server
// prior to running the audit so that it can be run concurrently with other
// tests under bazel without port contention.
//
// Arguments: <lightserverScript> <distDir> <testAioA11yScript>
//    lightserverScript - path light-server binary
//    distDir - path to aio dist folder
//    testAioA11yScript - path to the nodejs_binary bash script wrapping
//     the test-aio-a11y.mjs script

async function main(args) {
  const lightserver = args[0];
  const distDir = args[1];
  const testAioA11y = args[2];

  const port = await getPort();

  const lightserverCmd = [
    lightserver,
    '--bind=localhost',
    '--historyindex=/index.html',
    '--no-reload',
    '-s',
    distDir,
    '-p',
    port,
    '--quiet'
  ];
  const lightserverProcess = sh.exec(lightserverCmd.join(' '), {async: true, silent: true});

  const testAioA11yCmd = `${testAioA11y} http://localhost:${port}`;
  sh.exec(testAioA11yCmd);
    
  await killProcess(lightserverProcess);
}

(async() => await main(process.argv.slice(2)))();

function killProcess(childProcess) {
  return new Promise((resolve, reject) => {
    treeKill(childProcess.pid, error => {
      if (error) {
        reject(error);
      }
      resolve();
    });
  });
}
