const path = require('path');
const fs = require('fs-extra');
const argv = require('yargs').argv;
const globby = require('globby');
const xSpawn = require('cross-spawn');
const treeKill = require('tree-kill');

const AIO_PATH = path.join(__dirname, '../../');
const SHARED_PATH = path.join(__dirname, '/shared');
const EXAMPLES_PATH = path.join(AIO_PATH, './content/examples/');
const PROTRACTOR_CONFIG_FILENAME = path.join(__dirname, './shared/protractor.config.js');
const SPEC_FILENAME = 'e2e-spec.ts';
const EXAMPLE_CONFIG_FILENAME = 'example-config.json';
const IGNORED_EXAMPLES = [
  'ts-to-js/'
];

/**
 * Run Protractor End-to-End Tests for Doc Samples
 *
 * Flags
 *   --filter to filter/select _example app subdir names
 *    e.g. --filter=foo  // all example apps with 'foo' in their folder names.
 *
 *    --setup run yarn install, copy boilerplate and update webdriver
 *    e.g. --setup
 */
function runE2e() {
  let promise = Promise.resolve();
  if (argv.setup) {
    // Run setup.
    console.log('runE2e: copy boilerplate');
    const spawnInfo = spawnExt('yarn', ['boilerplate:add'], { cwd: AIO_PATH });
    promise = spawnInfo.promise
      .then(() => {
        console.log('runE2e: update webdriver');
        return spawnExt('yarn', ['webdriver:update'], { cwd: SHARED_PATH }).promise;
      });
  };

  const outputFile = path.join(AIO_PATH, './protractor-results.txt');

  return promise
    .then(() => findAndRunE2eTests(argv.filter, outputFile))
    .then((status) => {
      reportStatus(status, outputFile);
      if (status.failed.length > 0) {
        return Promise.reject('Some test suites failed');
      }
    }).catch(function (e) {
      console.log(e);
      process.exitCode = 1;
    });
}

// Finds all of the *e2e-spec.tests under the examples folder along with the corresponding apps
// that they should run under. Then run each app/spec collection sequentially.
function findAndRunE2eTests(filter, outputFile) {
  // create an output file with header.
  const startTime = new Date().getTime();
  let header = `Doc Sample Protractor Results on ${new Date().toLocaleString()}\n`;
  header += `  Filter: ${filter ? filter : 'All tests'}\n\n`;
  fs.writeFileSync(outputFile, header);

  // Run the tests sequentially.
  const status = { passed: [], failed: [] };
  return getE2eSpecPaths(EXAMPLES_PATH, filter)
    .then(e2eSpecPaths => e2eSpecPaths.reduce((promise, specPath) => {
      return promise.then(() => {
        const examplePath = path.dirname(specPath);
        return runE2eTests(examplePath, outputFile).then((ok) => {
          const arr = ok ? status.passed : status.failed;
          arr.push(examplePath);
        });
      });
    }, Promise.resolve()))
    .then(function () {
      const stopTime = new Date().getTime();
      status.elapsedTime = (stopTime - startTime) / 1000;
      return status;
    });
}

// Start the example in appDir; then run protractor with the specified
// fileName; then shut down the example.
// All protractor output is appended to the outputFile.
function runE2eTests(appDir, outputFile) {

  const config = loadExampleConfig(appDir);

  const appBuildSpawnInfo = spawnExt('yarn', [config.build], { cwd: appDir });
  const appRunSpawnInfo = spawnExt('yarn', [config.run, '--', '-s'], { cwd: appDir }, true);

  let run = runProtractor(appBuildSpawnInfo.promise, appDir, appRunSpawnInfo, outputFile);

  if (fs.existsSync(appDir + '/aot/index.html')) {
    run = run.then((ok) => ok && runProtractorAoT(appDir, outputFile));
  }
  return run;
}

function runProtractor(prepPromise, appDir, appRunSpawnInfo, outputFile) {
  const specFilename = path.resolve(`${appDir}/${SPEC_FILENAME}`);
  return prepPromise
    .catch(function () {
      const emsg = `Application at ${appDir} failed to transpile.\n\n`;
      console.log(emsg);
      fs.appendFileSync(outputFile, emsg);
      return Promise.reject(emsg);
    })
    .then(function (data) {
      let transpileError = false;

      // Start protractor.

      const spawnInfo = spawnExt('yarn', ['protractor', '--',
        PROTRACTOR_CONFIG_FILENAME,
        `--specs=${specFilename}`,
        '--params.appDir=' + appDir,
        '--params.outputFile=' + outputFile
      ], { cwd: SHARED_PATH });

      spawnInfo.proc.stderr.on('data', function (data) {
        transpileError = transpileError || /npm ERR! Exit status 100/.test(data.toString());
      });
      return spawnInfo.promise.catch(function (err) {
        if (transpileError) {
          const emsg = `${specFilename} failed to transpile.\n\n`;
          console.log(emsg);
          fs.appendFileSync(outputFile, emsg);
        }
        return Promise.reject(emsg);
      });
    })
    .then(
    function () { return finish(true); },
    function () { return finish(false); }
    )

  function finish(ok) {
    // Ugh... proc.kill does not work properly on windows with child processes.
    // appRun.proc.kill();
    treeKill(appRunSpawnInfo.proc.pid);
    return ok;
  }
}

// Run e2e tests over the AOT build for projects that examples it.
function runProtractorAoT(appDir, outputFile) {
  fs.appendFileSync(outputFile, '++ AoT version ++\n');
  const aotBuildSpawnInfo = spawnExt('yarn', ['build:aot'], { cwd: appDir });
  let promise = aotBuildSpawnInfo.promise;

  const copyFileCmd = 'copy-dist-files.js';
  if (fs.existsSync(appDir + '/' + copyFileCmd)) {
    promise = promise.then(() => spawnExt('node', [copyFileCmd], { cwd: appDir }).promise);
  }
  const aotRunSpawnInfo = spawnExt('yarn', ['serve:aot'], { cwd: appDir }, true);
  return runProtractor(promise, appDir, aotRunSpawnInfo, outputFile);
}

// Report final status.
function reportStatus(status, outputFile) {
  let log = [''];
  log.push('Suites passed:');
  status.passed.forEach(function (val) {
    log.push('  ' + val);
  });

  if (status.failed.length == 0) {
    log.push('All tests passed');
  } else {
    log.push('Suites failed:');
    status.failed.forEach(function (val) {
      log.push('  ' + val);
    });
  }
  log.push('\nElapsed time: ' + status.elapsedTime + ' seconds');
  log = log.join('\n');
  console.log(log);
  fs.appendFileSync(outputFile, log);
}

// Returns both a promise and the spawned process so that it can be killed if needed.
function spawnExt(command, args, options, ignoreClose = false) {
  let proc;
  const promise = new Promise((resolve, reject) => {
    let descr = command + " " + args.join(' ');
    console.log('running: ' + descr);
    try {
      proc = xSpawn.spawn(command, args, options);
    } catch (e) {
      console.log(e);
      reject(e);
      return { proc: null, promise };
    }
    proc.stdout.on('data', function (data) {
      process.stdout.write(data.toString());
    });
    proc.stderr.on('data', function (data) {
      process.stdout.write(data.toString());
    });
    proc.on('close', function (returnCode) {
      console.log(`completed: ${descr} \n`);
      // Many tasks (e.g., tsc) complete but are actually errors;
      // Confirm return code is zero.
      returnCode === 0 || ignoreClose ? resolve(0) : reject(returnCode);
    });
    proc.on('error', function (data) {
      console.log(`completed with error: ${descr} \n`);
      console.log(data.toString());
      reject(data);
    });
  });
  return { proc, promise };
}

// Find all e2e specs in a given example folder.
function getE2eSpecPaths(basePath, filter) {
  // Only get spec file at the example root.
  const e2eSpecGlob = `${filter ? `*${filter}*` : '*'}/${SPEC_FILENAME}`;
  return globby(e2eSpecGlob, { cwd: basePath, nodir: true })
    .then(paths => paths
      .filter(file => IGNORED_EXAMPLES.some(ignored => !file.startsWith(ignored)))
      .map(file => path.join(basePath, file))
    );
}

// Load configuration for an example.
function loadExampleConfig(exampleFolder) {
  // Default config.
  let config = {
    build: 'build',
    run: 'serve:e2e'
  };

  try {
    const exampleConfig = fs.readJsonSync(`${exampleFolder}/${EXAMPLE_CONFIG_FILENAME}`);
    Object.assign(config, exampleConfig);
  } catch (e) { }

  return config;
}

runE2e();
