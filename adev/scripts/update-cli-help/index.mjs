import {execSync} from 'node:child_process';
import {readFile, writeFile, readdir, mkdtemp, realpath, copyFile, unlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {get} from 'node:https';
import {dirname, resolve as resolvePath, posix, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {existsSync, constants as fsConstants} from 'node:fs';

const GITHUB_API = 'https://api.github.com/repos/';
const CLI_BUILDS_REPO = 'angular/cli-builds';
const GITHUB_API_CLI_BUILDS = posix.join(GITHUB_API, CLI_BUILDS_REPO);

const scriptDir = dirname(fileURLToPath(import.meta.url));
const CLI_HELP_CONTENT_PATH = resolvePath(scriptDir, '../../src/content/cli/help');
const CLI_SHA_PATH = join(CLI_HELP_CONTENT_PATH, 'build-info.json');

async function main() {
  if (!existsSync(CLI_SHA_PATH)) {
    throw new Error(`${CLI_SHA_PATH} does not exist.`);
  }

  const branch = process.env.GITHUB_REF;
  const {sha: currentSha} = JSON.parse(await readFile(CLI_SHA_PATH, 'utf-8'));
  const latestSha = await getShaFromCliBuilds(branch);

  console.log(`Comparing ${currentSha}...${latestSha}.`);
  const affectedFiles = await getAffectedFiles(currentSha, latestSha);
  const changedHelpFiles = affectedFiles.filter((file) => file.startsWith('help/'));

  if (changedHelpFiles.length === 0) {
    console.log(`No 'help/**' files changed between ${currentSha} and ${latestSha}.`);

    return;
  }

  console.log(
    `The below help files changed between ${currentSha} and ${latestSha}:\n` +
      changedHelpFiles.map((f) => '* ' + f).join('\n'),
  );

  const temporaryDir = await realpath(await mkdtemp(join(tmpdir(), 'cli-src-')));
  const execOptions = {cwd: temporaryDir, stdio: 'inherit'};
  execSync('git init', execOptions);
  execSync('git remote add origin https://github.com/angular/cli-builds.git', execOptions);
  // fetch a commit
  execSync(`git fetch origin ${latestSha}`, execOptions);
  // reset this repository's main branch to the commit of interest
  execSync('git reset --hard FETCH_HEAD', execOptions);
  // get sha when files where changed
  const shaWhenFilesChanged = execSync(`git rev-list -1 ${latestSha} "help/"`, {
    encoding: 'utf8',
    cwd: temporaryDir,
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();

  // Delete existing JSON help files.
  const helpFilesUnlink = (await readdir(CLI_HELP_CONTENT_PATH))
    .filter((f) => f.endsWith('.json'))
    .map((f) => unlink(join(CLI_HELP_CONTENT_PATH, f)));

  await Promise.allSettled(helpFilesUnlink);

  // Copy new help files
  const tempHelpDir = join(temporaryDir, 'help');
  const helpFilesCopy = (await readdir(tempHelpDir)).map((f) => {
    const src = join(tempHelpDir, f);
    const dest = join(CLI_HELP_CONTENT_PATH, f);

    return copyFile(src, dest, fsConstants.COPYFILE_FICLONE);
  });

  await Promise.allSettled(helpFilesCopy);

  // Write SHA to file.
  await writeFile(
    CLI_SHA_PATH,
    JSON.stringify(
      {
        branchName: branch,
        sha: shaWhenFilesChanged,
      },
      undefined,
      2,
    ),
  );

  console.log('\nChanges: ');
  execSync(`git status --porcelain`, {stdio: 'inherit'});

  console.log(`Successfully updated help files in '${CLI_HELP_CONTENT_PATH}'.\n`);
}

/**
 * Get SHA of a branch.
 *
 * @param {string} branch
 * @param {string} headSha
 * @returns Promise<string>
 */
async function getShaFromCliBuilds(branch) {
  const sha = await httpGet(`${GITHUB_API_CLI_BUILDS}/commits/${branch}`, {
    headers: {Accept: 'application/vnd.github.VERSION.sha'},
  });

  if (!sha) {
    throw new Error(`Unable to extract the SHA for '${branch}'.`);
  }

  return sha;
}

/**
 * Get the affected files.
 *
 * @param {string} baseSha
 * @param {string} headSha
 * @returns Promise<string[]>
 */
async function getAffectedFiles(baseSha, headSha) {
  const {files} = JSON.parse(
    await httpGet(`${GITHUB_API_CLI_BUILDS}/compare/${baseSha}...${headSha}`),
  );
  return files.map((f) => f.filename);
}

function httpGet(url, options = {}) {
  options.headers ??= {};
  options.headers[
    'Authorization'
  ] = `token ${process.env.ANGULAR_CLI_BUILDS_READONLY_GITHUB_TOKEN}`;
  // User agent is required
  // https://docs.github.com/en/rest/overview/resources-in-the-rest-api?apiVersion=2022-11-28#user-agent-required
  options.headers['User-Agent'] = `ADEV_Angular_CLI_Sources_Update`;

  return new Promise((resolve, reject) => {
    get(url, options, (res) => {
      let data = '';
      res
        .on('data', (chunk) => {
          data += chunk;
        })
        .on('end', () => {
          resolve(data);
        });
    }).on('error', (e) => {
      reject(e);
    });
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
