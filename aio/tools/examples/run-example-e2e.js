const path = require('canonical-path');
const fs = require('fs-extra');
const argv = require('yargs').argv;
const globby = require('globby');
const xSpawn = require('cross-spawn');
const treeKill = require('tree-kill');
const shelljs = require('shelljs');
const findFreePort = require('find-free-port');

shelljs.set('-e');

// Set `CHROME_BIN` as an environment variable for Karma to pick up in unit tests.
process.env.CHROME_BIN = require('puppeteer').executablePath();

const AIO_PATH = path.join(__dirname, '../../');
const SHARED_PATH = path.join(__dirname, '/shared');
const EXAMPLES_PATH = path.join(AIO_PATH, './content/examples/');
const PROTRACTOR_CONFIG_FILENAME = path.join(__dirname, './shared/protractor.config.js');
const SJS_SPEC_FILENAME = 'e2e-spec.ts';
const CLI_SPEC_FILENAME = 'e2e/src/app.e2e-spec.ts';
const EXAMPLE_CONFIG_FILENAME = 'example-config.json';
const DEFAULT_CLI_EXAMPLE_PORT = 4200;
const DEFAULT_CLI_SPECS_CONCURRENCY = 1;
const IGNORED_EXAMPLES = [];

const fixmeIvyExamples = [];

if (!argv.viewengine) {
  IGNORED_EXAMPLES.push(...fixmeIvyExamples);
}

/**
 * Run Protractor End-to-End Tests for Doc Samples
 *
 * Flags
 *  --filter to filter/select _example app subdir names
 *    e.g. --filter=foo  // all example apps with 'foo' in their folder names.
 *
 *  --setup to run yarn install, copy boilerplate and update webdriver
 *    e.g. --setup
 *
 *  --local to use the locally built Angular packages, rather than versions from npm
 *    Must be used in conjunction with --setup as this is when the packages are copied.
 *    e.g. --setup --local
 *
 *  --viewengine to turn on `ViewEngine` mode
 *
 *  --shard to shard the specs into groups to allow you to run them in parallel
 *    e.g. --shard=0/2 // the even specs: 0, 2, 4, etc
 *    e.g. --shard=1/2 // the odd specs: 1, 3, 5, etc
 *    e.g. --shard=1/3 // the second of every three specs: 1, 4, 7, etc
 *
 *  --cliSpecsConcurrency Amount of CLI example specs that should be executed concurrently.
 *    By default runs specs sequentially.
 *
 *  --retry to retry failed tests (useful for overcoming flakes)
 *    e.g. --retry 3  // To try each test up to 3 times.
 */
function runE2e() {
  if (argv.setup) {
    // Run setup.
    console.log('runE2e: setup boilerplate');
    const installPackagesCommand = `example-use-${argv.local ? 'local' : 'npm'}`;
    const addBoilerplateCommand = `boilerplate:add${argv.viewengine ? ':viewengine' : ''}`;
    shelljs.exec(`yarn ${installPackagesCommand}`, {cwd: AIO_PATH});
    shelljs.exec(`yarn ${addBoilerplateCommand}`, {cwd: AIO_PATH});
  }

  const outputFile = path.join(AIO_PATH, './protractor-results.txt');

  return Promise.resolve()
      .then(
          () => findAndRunE2eTests(
              argv.filter, outputFile, argv.shard,
              argv.cliSpecsConcurrency || DEFAULT_CLI_SPECS_CONCURRENCY, argv.retry || 1))
      .then((status) => {
        reportStatus(status, outputFile);
        if (status.failed.length > 0) {
          return Promise.reject('Some test suites failed');
        }
      })
      .catch(function(e) {
        console.log(e);
        process.exitCode = 1;
      });
}

// Finds all of the *e2e-spec.tests under the examples folder along with the corresponding apps
// that they should run under. Then run each app/spec collection sequentially.
function findAndRunE2eTests(filter, outputFile, shard, cliSpecsConcurrency, maxAttempts) {
  const shardParts = shard ? shard.split('/') : [0, 1];
  const shardModulo = parseInt(shardParts[0], 10);
  const shardDivider = parseInt(shardParts[1], 10);

  // create an output file with header.
  const startTime = new Date().getTime();
  let header = `Doc Sample Protractor Results on ${new Date().toLocaleString()}\n`;
  header += `  Filter: ${filter ? filter : 'All tests'}\n\n`;
  fs.writeFileSync(outputFile, header);

  const status = {passed: [], failed: []};
  const updateStatus = (specDescription, passed) => {
    const arr = passed ? status.passed : status.failed;
    arr.push(specDescription);
  };
  const runTest = async (specPath, testFn) => {
    let attempts = 0;
    let passed = false;

    while (true) {
      attempts++;
      passed = await testFn();

      if (passed || (attempts >= maxAttempts)) break;
    }

    updateStatus(`${specPath} (attempts: ${attempts})`, passed);
  };

  return getE2eSpecs(EXAMPLES_PATH, filter)
      .then(e2eSpecPaths => {
        console.log('All e2e specs:');
        logSpecs(e2eSpecPaths);

        Object.keys(e2eSpecPaths).forEach(key => {
          const value = e2eSpecPaths[key];
          e2eSpecPaths[key] = value.filter((p, index) => index % shardDivider === shardModulo);
        });

        console.log(`E2e specs for shard ${shardParts.join('/')}:`);
        logSpecs(e2eSpecPaths);

        return e2eSpecPaths.systemjs
            .reduce(
                async (prevPromise, specPath) => {
                  await prevPromise;

                  const examplePath = path.dirname(specPath);
                  const testFn = () => runE2eTestsSystemJS(examplePath, outputFile);

                  await runTest(examplePath, testFn);
                },
                Promise.resolve())
            .then(async () => {
              const specQueue = [...e2eSpecPaths.cli];
              // Determine free ports for the amount of pending CLI specs before starting
              // any tests. This is necessary because ports can stuck in the "TIME_WAIT"
              // state after others specs which used that port exited. This works around
              // this potential race condition which surfaces on Windows.
              const ports = await findFreePort(4000, 6000, '127.0.0.1', specQueue.length);
              // Enable buffering of the process output in case multiple CLI specs will
              // be executed concurrently. This means that we can can print out the full
              // output at once without interfering with other CLI specs printing as well.
              const bufferOutput = cliSpecsConcurrency > 1;
              while (specQueue.length) {
                const chunk = specQueue.splice(0, cliSpecsConcurrency);
                await Promise.all(chunk.map(testDir => {
                  const port = ports.pop();
                  const testFn = () => runE2eTestsCLI(testDir, outputFile, bufferOutput, port);

                  return runTest(testDir, testFn);
                }));
              }
            });
      })
      .then(() => {
        const stopTime = new Date().getTime();
        status.elapsedTime = (stopTime - startTime) / 1000;
        return status;
      });
}

// Start the example in appDir; then run protractor with the specified
// fileName; then shut down the example.
// All protractor output is appended to the outputFile.
// SystemJS version
function runE2eTestsSystemJS(appDir, outputFile) {
  const config = loadExampleConfig(appDir);

  const appBuildSpawnInfo = spawnExt('yarn', [config.build], {cwd: appDir});
  const appRunSpawnInfo = spawnExt('yarn', [config.run, '-s'], {cwd: appDir}, true);

  let run = runProtractorSystemJS(appBuildSpawnInfo.promise, appDir, appRunSpawnInfo, outputFile);

  // Only run AOT tests in ViewEngine mode. The current AOT setup does not work in Ivy.
  // See https://github.com/angular/angular/issues/35989.
  if (argv.viewengine && fs.existsSync(appDir + '/aot/index.html')) {
    run = run.then((ok) => ok && runProtractorAoT(appDir, outputFile));
  }
  return run;
}

function runProtractorSystemJS(prepPromise, appDir, appRunSpawnInfo, outputFile) {
  const specFilename = path.resolve(`${appDir}/${SJS_SPEC_FILENAME}`);
  return prepPromise
      .catch(function() {
        const emsg = `Application at ${appDir} failed to transpile.\n\n`;
        console.log(emsg);
        fs.appendFileSync(outputFile, emsg);
        return Promise.reject(emsg);
      })
      .then(function() {
        let transpileError = false;

        // Start protractor.
        console.log(`\n\n=========== Running aio example tests for: ${appDir}`);
        const spawnInfo = spawnExt(
            'yarn',
            [
              'protractor', PROTRACTOR_CONFIG_FILENAME, `--specs=${specFilename}`,
              '--params.appDir=' + appDir, '--params.outputFile=' + outputFile
            ],
            {cwd: SHARED_PATH});

        spawnInfo.proc.stderr.on('data', function(data) {
          transpileError = transpileError || /npm ERR! Exit status 100/.test(data.toString());
        });
        return spawnInfo.promise.catch(function() {
          if (transpileError) {
            const emsg = `${specFilename} failed to transpile.\n\n`;
            console.log(emsg);
            fs.appendFileSync(outputFile, emsg);
          }
          return Promise.reject();
        });
      })
      .then(
          function() {
            return finish(appRunSpawnInfo.proc.pid, true);
          },
          function() {
            return finish(appRunSpawnInfo.proc.pid, false);
          });
}

function finish(spawnProcId, ok) {
  // Ugh... proc.kill does not work properly on windows with child processes.
  // appRun.proc.kill();
  treeKill(spawnProcId);
  return ok;
}

// Run e2e tests over the AOT build for projects that examples it.
function runProtractorAoT(appDir, outputFile) {
  fs.appendFileSync(outputFile, '++ AoT version ++\n');
  const aotBuildSpawnInfo = spawnExt('yarn', ['build:aot'], {cwd: appDir});
  let promise = aotBuildSpawnInfo.promise;

  const copyFileCmd = 'copy-dist-files.js';
  if (fs.existsSync(appDir + '/' + copyFileCmd)) {
    promise = promise.then(() => spawnExt('node', [copyFileCmd], {cwd: appDir}).promise);
  }
  const aotRunSpawnInfo = spawnExt('yarn', ['serve:aot'], {cwd: appDir}, true);
  return runProtractorSystemJS(promise, appDir, aotRunSpawnInfo, outputFile);
}

// Start the example in appDir; then run protractor with the specified
// fileName; then shut down the example.
// All protractor output is appended to the outputFile.
// CLI version
function runE2eTestsCLI(appDir, outputFile, bufferOutput, port) {
  if (!bufferOutput) {
    console.log(`\n\n=========== Running aio example tests for: ${appDir}`);
  }

  // `--no-webdriver-update` is needed to preserve the ChromeDriver version already installed.
  const config = loadExampleConfig(appDir);
  const testCommands = config.tests || [{
                         cmd: 'yarn',
                         args: [
                           'e2e',
                           '--prod',
                           '--protractor-config=e2e/protractor-puppeteer.conf.js',
                           '--no-webdriver-update',
                           '--port={PORT}',
                         ],
                       }];
  let bufferedOutput = `\n\n============== AIO example output for: ${appDir}\n\n`;

  const e2eSpawnPromise = testCommands.reduce((prevSpawnPromise, {cmd, args}) => {
    // Replace the port placeholder with the specified port if present. Specs that
    // define their e2e test commands in the example config are able to use the
    // given available port. This ensures that the CLI tests can be run concurrently.
    args = args.map(a => a.replace('{PORT}', port || DEFAULT_CLI_EXAMPLE_PORT));

    return prevSpawnPromise.then(() => {
      const currSpawn = spawnExt(
          cmd, args, {cwd: appDir}, false, bufferOutput ? msg => bufferedOutput += msg : undefined);
      return currSpawn.promise.then(
          () => Promise.resolve(finish(currSpawn.proc.pid, true)),
          () => Promise.reject(finish(currSpawn.proc.pid, false)));
    });
  }, Promise.resolve());

  return e2eSpawnPromise
      .then(
          () => {
            fs.appendFileSync(outputFile, `Passed: ${appDir}\n\n`);
            return true;
          },
          () => {
            fs.appendFileSync(outputFile, `Failed: ${appDir}\n\n`);
            return false;
          })
      .then(passed => {
        if (bufferOutput) {
          process.stdout.write(bufferedOutput);
        }
        return passed;
      });
}

// Report final status.
function reportStatus(status, outputFile) {
  let log = [''];

  log.push('Suites ignored due to legacy guides:');
  IGNORED_EXAMPLES.filter(example => !fixmeIvyExamples.find(ex => ex.startsWith(example)))
      .forEach(function(val) {
        log.push('  ' + val);
      });

  if (!argv.viewengine) {
    log.push('');
    log.push('Suites ignored due to breakage with Ivy:');
    fixmeIvyExamples.forEach(function(val) {
      log.push('  ' + val);
    });
  }

  log.push('');
  log.push('Suites passed:');
  status.passed.forEach(function(val) {
    log.push('  ' + val);
  });

  if (status.failed.length == 0) {
    log.push('All tests passed');
  } else {
    log.push('Suites failed:');
    status.failed.forEach(function(val) {
      log.push('  ' + val);
    });
  }
  log.push('\nElapsed time: ' + status.elapsedTime + ' seconds');
  log = log.join('\n');
  console.log(log);
  fs.appendFileSync(outputFile, log);
}

// Returns both a promise and the spawned process so that it can be killed if needed.
function spawnExt(
    command, args, options, ignoreClose = false, printMessage = msg => process.stdout.write(msg)) {
  let proc;
  const promise = new Promise((resolve, reject) => {
    let descr = command + ' ' + args.join(' ');
    let processOutput = '';
    printMessage(`running: ${descr}\n`);
    try {
      proc = xSpawn.spawn(command, args, options);
    } catch (e) {
      console.log(e);
      reject(e);
      return {proc: null, promise};
    }
    proc.stdout.on('data', printMessage);
    proc.stderr.on('data', printMessage);

    proc.on('close', function(returnCode) {
      printMessage(`completed: ${descr}\n\n`);
      // Many tasks (e.g., tsc) complete but are actually errors;
      // Confirm return code is zero.
      returnCode === 0 || ignoreClose ? resolve(0) : reject(returnCode);
    });
    proc.on('error', function(data) {
      printMessage(`completed with error: ${descr}\n\n`);
      printMessage(`${data.toString()}\n`);
      reject(data);
    });
  });
  return {proc, promise};
}

function getE2eSpecs(basePath, filter) {
  let specs = {};

  return getE2eSpecsFor(basePath, SJS_SPEC_FILENAME, filter)
      .then(sjsPaths => {
        specs.systemjs = sjsPaths;
      })
      .then(() => {
        return getE2eSpecsFor(basePath, CLI_SPEC_FILENAME, filter).then(cliPaths => {
          return cliPaths.map(p => {
            return p.replace(`${CLI_SPEC_FILENAME}`, '');
          });
        });
      })
      .then(cliPaths => {
        specs.cli = cliPaths;
      })
      .then(() => specs);
}

// Find all e2e specs in a given example folder.
function getE2eSpecsFor(basePath, specFile, filter) {
  // Only get spec file at the example root.
  // The formatter doesn't understand nested template string expressions (honestly, neither do I).
  // clang-format off
  const e2eSpecGlob = `${filter ? `*${filter}*` : '*'}/${specFile}`;
  // clang-format on
  return globby(e2eSpecGlob, {cwd: basePath, nodir: true})
      .then(
          paths => paths.filter(file => !IGNORED_EXAMPLES.some(ignored => file.startsWith(ignored)))
                       .map(file => path.join(basePath, file)));
}

// Load configuration for an example. Used for SystemJS
function loadExampleConfig(exampleFolder) {
  // Default config.
  let config = {build: 'build', run: 'serve:e2e'};

  try {
    const exampleConfig = fs.readJsonSync(`${exampleFolder}/${EXAMPLE_CONFIG_FILENAME}`);
    Object.assign(config, exampleConfig);
  } catch (e) {
  }

  return config;
}

// Log the specs (for debugging purposes).
// `e2eSpecPaths` is of type: `{[type: string]: string[]}`
// (where `type` is `systemjs`, `cli, etc.)
function logSpecs(e2eSpecPaths) {
  Object.keys(e2eSpecPaths).forEach(type => {
    const paths = e2eSpecPaths[type];

    console.log(`  ${type.toUpperCase()}:`);
    console.log(paths.map(p => `    ${p}`).join('\n'));
  });
}

runE2e();
