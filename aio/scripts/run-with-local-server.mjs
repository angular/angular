import getPort from 'get-port';
import sh from 'shelljs';
import treeKill from 'tree-kill';

sh.set('-e');

// Serve contents over http while running an abitrary script. This is an
// implementation for the bazel macro local_server_test.
//
// Arguments: <lightserverScript> <distDir> <testScript> [testScriptArg ...]
//    lightserverScript - path light-server binary
//    distDir - path to the contents to serve
//    testScript - path to a script to run
//    ...testScriptArg - arguments to pass to the test script. The argument LOCALHOST_URL
//      will be substituted with the url of the served contents

async function main(args) {
  const lightserver = args[0];
  const distDir = args[1];
  const testScript = args[2];
  const testScriptArgs = args.slice(3);
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
    
  const command = [
    testScript,
    ...testScriptArgs
  ].join(' ').replace('LOCALHOST_URL', `http://localhost:${port}`);

  sh.exec(command);
    
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