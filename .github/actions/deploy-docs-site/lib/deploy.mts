import {cp, mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {Deployment} from './deployments.mjs';
import {join} from 'node:path';

import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {getCredentialFilePath} from './credential.mjs';

export async function deployToFirebase(
  deployment: Deployment,
  configPath: string,
  distDirPath: string,
) {
  if (deployment.destination == undefined) {
    console.log(`No deployment necessary for docs created from: ${deployment.branch}`);
    return;
  }

  console.log('Preparing for deployment to firebase...');

  const tmpDeployDir = await mkdtemp(join(tmpdir(), 'deploy-directory'));
  const deployConfigPath = join(tmpDeployDir, 'firebase.json');

  const config = JSON.parse(await readFile(configPath, {encoding: 'utf-8'})) as {
    hosting: {public: string};
  };
  config['hosting']['public'] = './dist';

  await writeFile(deployConfigPath, JSON.stringify(config, null, 2));

  await cp(distDirPath, join(tmpDeployDir, 'dist'), {recursive: true});
  spawnSync(`chmod 777 -R ${tmpDeployDir}`, {encoding: 'utf-8', shell: true});

  firebase(
    `target:clear --config ${deployConfigPath} --project angular-dev-site hosting angular-docs`,
    tmpDeployDir,
  );
  firebase(
    `target:apply --config ${deployConfigPath} --project angular-dev-site hosting angular-docs ${deployment.destination}`,
    tmpDeployDir,
  );
  firebase(
    `deploy --config ${deployConfigPath} --project angular-dev-site --only hosting --non-interactive`,
    tmpDeployDir,
  );
  firebase(
    `target:clear --config ${deployConfigPath} --project angular-dev-site hosting angular-docs`,
    tmpDeployDir,
  );

  await rm(tmpDeployDir, {recursive: true});
}

export async function setupRedirect(deployment: Deployment) {
  if (deployment.redirect === undefined) {
    console.log(`No redirect necessary for docs created from: ${deployment.branch}`);
    return;
  }

  console.log('Preparing to set up redirect on firebase...');

  const redirectConfig = JSON.stringify(
    {
      hosting: {
        target: 'angular-docs',
        redirects: [
          {
            type: 302,
            regex: '^(.*)$',
            destination: `${deployment.redirect.to}:1`,
          },
        ],
      },
    },
    null,
    2,
  );

  const tmpRedirectDir = await mkdtemp(join(tmpdir(), 'redirect-directory'));
  const redirectConfigPath = join(tmpRedirectDir, 'firebase.json');

  await writeFile(redirectConfigPath, redirectConfig);
  spawnSync(`chmod 777 -R ${tmpRedirectDir}`, {encoding: 'utf-8', shell: true});

  firebase(
    `target:clear --config ${redirectConfigPath} --project angular-dev-site hosting angular-docs`,
    tmpRedirectDir,
  );
  firebase(
    `target:apply --config ${redirectConfigPath} --project angular-dev-site hosting angular-docs ${deployment.redirect.from}`,
    tmpRedirectDir,
  );
  firebase(
    `deploy --config ${redirectConfigPath} --project angular-dev-site --only hosting --non-interactive`,
    tmpRedirectDir,
  );
  firebase(
    `target:clear --config ${redirectConfigPath} --project angular-dev-site hosting angular-docs`,
    tmpRedirectDir,
  );

  await rm(tmpRedirectDir, {recursive: true});
}

function firebase(cmd: string, cwd?: string) {
  spawnSync('npx', `-y firebase-tools@13.15.1 ${cmd}`.split(' '), {
    cwd,
    encoding: 'utf-8',
    shell: true,
    stdio: 'inherit',
    env: {
      ...process.env,
      GOOGLE_APPLICATION_CREDENTIALS: getCredentialFilePath(),
    },
  });
}
