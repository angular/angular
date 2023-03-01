import {execSync} from 'child_process';
import path from 'path';
import {
  computeDeploymentsInfo,
  computeInputVars,
  skipDeployment,
  validateDeploymentsInfo,
} from './index.mjs';
import u from './utils.mjs';


describe('deploy-to-firebase:', () => {
  // Pre-computed values to avoid unnecessary re-computations.
  let mostRecentMinorBranch;
  let latestCommits;

  beforeAll(() => {
    // Computing the values involves network requests and may add a noticeable delay (during which
    // nothing is printed to stdout). Print a message to let the user know what is happening.
    console.log('\nPre-computing values for \'deploy-to-firebase\' tests...');

    mostRecentMinorBranch = u.getMostRecentMinorBranch();
    latestCommits = {
      main: u.getLatestCommit('main'),
      '2.1.x': u.getLatestCommit('2.1.x'),
      '2.4.x': u.getLatestCommit('2.4.x'),
      '4.3.x': u.getLatestCommit('4.3.x'),
      '4.4.x': u.getLatestCommit('4.4.x'),
      '9.1.x': u.getLatestCommit('9.1.x'),
      [mostRecentMinorBranch]: u.getLatestCommit(mostRecentMinorBranch),
    };
  });

  // Helpers
  const jsonFunctionReplacer = (_key, val) =>
    (typeof val === 'function') ? `function:${val.name}` : val;
  const getDeploymentsInfoFor = env => {
    const deploymentsInfo = computeDeploymentsInfo(computeInputVars(env));
    validateDeploymentsInfo(deploymentsInfo);
    return JSON.parse(JSON.stringify(deploymentsInfo, jsonFunctionReplacer));
  };

  it('main - skip deploy - not angular', () => {
    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'notangular',
    })).toEqual([
      {
        name: 'skipped',
        type: 'skipped',
        reason: 'Skipping deploy because this is not angular/angular.',
      },
    ]);
  });

  it('main - skip deploy - angular fork', () => {
    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'notangular',
      CI_REPO_NAME: 'angular',
    })).toEqual([
      {
        name: 'skipped',
        type: 'skipped',
        reason: 'Skipping deploy because this is not angular/angular.',
      },
    ]);
  });

  it('main - skip deploy - pull request', () => {
    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'true',
    })).toEqual([
      {
        name: 'skipped',
        type: 'skipped',
        reason: 'Skipping deploy because this is a PR build.',
      },
    ]);
  });

  it('main - deploy success - no active RC, major higher than stable', () => {
    const mostRecentMajorVersion = u.computeMajorVersion(mostRecentMinorBranch);
    const fakeMainMajorVersion = mostRecentMajorVersion + 1;

    // Fake the `package.json` version.
    spyOn(u, 'loadJson').and.returnValue({version: `${fakeMainMajorVersion}.0.0-next.42`});

    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: 'main',
      CI_STABLE_BRANCH: mostRecentMinorBranch,
      CI_COMMIT: latestCommits.main,
    })).toEqual([
      {
        name: 'next',
        type: 'primary',
        deployEnv: 'next',
        projectId: 'angular-io',
        siteId: 'next-angular-io-site',
        deployedUrl: 'https://next.angular.io/',
        preDeployActions: ['function:build', 'function:checkPayloadSize'],
        postDeployActions: ['function:testPwaScore'],
      },
      {
        name: 'redirectVersionDomainToNext',
        type: 'secondary',
        deployEnv: 'next',
        projectId: 'angular-io',
        siteId: `v${fakeMainMajorVersion}-angular-io-site`,
        deployedUrl: `https://v${fakeMainMajorVersion}.angular.io/`,
        preDeployActions: ['function:redirectAllToNext'],
        postDeployActions: ['function:undoRedirectAllToNext', 'function:testRedirectToNext'],
      },
    ]);
  });

  it('main - deploy success - no active RC, major same as stable', () => {
    const mostRecentMajorVersion = u.computeMajorVersion(mostRecentMinorBranch);

    // Fake the `package.json` version.
    spyOn(u, 'loadJson').and.returnValue({version: `${mostRecentMajorVersion}.42.0`});

    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: 'main',
      CI_STABLE_BRANCH: mostRecentMinorBranch,
      CI_COMMIT: latestCommits.main,
    })).toEqual([
      {
        name: 'next',
        type: 'primary',
        deployEnv: 'next',
        projectId: 'angular-io',
        siteId: 'next-angular-io-site',
        deployedUrl: 'https://next.angular.io/',
        preDeployActions: ['function:build', 'function:checkPayloadSize'],
        postDeployActions: ['function:testPwaScore'],
      },
    ]);
  });

  it('main - deploy success - active RC, major higher than RC and stable', () => {
    const mostRecentMajorVersion = u.computeMajorVersion(mostRecentMinorBranch);
    const fakeMainMajorVersion = mostRecentMajorVersion + 1;

    // Fake the `package.json` version.
    spyOn(u, 'loadJson').and.returnValue({version: `${fakeMainMajorVersion}.0.0-next.42`});

    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: 'main',
      CI_STABLE_BRANCH: '4.4.x',
      CI_COMMIT: latestCommits.main,
    })).toEqual([
      {
        name: 'next',
        type: 'primary',
        deployEnv: 'next',
        projectId: 'angular-io',
        siteId: 'next-angular-io-site',
        deployedUrl: 'https://next.angular.io/',
        preDeployActions: ['function:build', 'function:checkPayloadSize'],
        postDeployActions: ['function:testPwaScore'],
      },
      {
        name: 'redirectVersionDomainToNext',
        type: 'secondary',
        deployEnv: 'next',
        projectId: 'angular-io',
        siteId: `v${fakeMainMajorVersion}-angular-io-site`,
        deployedUrl: `https://v${fakeMainMajorVersion}.angular.io/`,
        preDeployActions: ['function:redirectAllToNext'],
        postDeployActions: ['function:undoRedirectAllToNext', 'function:testRedirectToNext'],
      },
    ]);
  });

  it('main - deploy success - active RC, major same as RC and higher than stable', () => {
    const mostRecentMajorVersion = u.computeMajorVersion(mostRecentMinorBranch);

    // Fake the `package.json` version.
    spyOn(u, 'loadJson').and.returnValue({version: `${mostRecentMajorVersion}.0.0-next.42`});

    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: 'main',
      CI_STABLE_BRANCH: '4.4.x',
      CI_COMMIT: latestCommits.main,
    })).toEqual([
      {
        name: 'next',
        type: 'primary',
        deployEnv: 'next',
        projectId: 'angular-io',
        siteId: 'next-angular-io-site',
        deployedUrl: 'https://next.angular.io/',
        preDeployActions: ['function:build', 'function:checkPayloadSize'],
        postDeployActions: ['function:testPwaScore'],
      },
    ]);
  });

  it('main - skip deploy - commit not HEAD', () => {
    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: 'main',
      CI_COMMIT: 'DUMMY_TEST_COMMIT',
    })).toEqual([
      {
        name: 'skipped',
        type: 'skipped',
        reason:
            'Skipping deploy because DUMMY_TEST_COMMIT is not the latest commit ' +
            `(${latestCommits.main}).`,
      },
    ]);
  });

  it('stable - deploy success - active RC', () => {
    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '4.3.x',
      CI_STABLE_BRANCH: '4.3.x',
      CI_COMMIT: latestCommits['4.3.x'],
    })).toEqual([
      {
        name: 'stable',
        type: 'primary',
        deployEnv: 'stable',
        projectId: 'angular-io',
        siteId: 'stable-angular-io-site',
        deployedUrl: 'https://angular.io/',
        preDeployActions: ['function:build', 'function:checkPayloadSize'],
        postDeployActions: ['function:testPwaScore'],
      },
      {
        name: 'redirectVersionDomainToStable',
        type: 'secondary',
        deployEnv: 'stable',
        projectId: 'angular-io',
        siteId: 'v4-angular-io-site',
        deployedUrl: 'https://v4.angular.io/',
        preDeployActions: ['function:redirectAllToStable'],
        postDeployActions: ['function:undoRedirectAllToStable', 'function:testRedirectToStable'],
      },
    ]);
  });

  it('stable - deploy success - no active RC', () => {
    const stableMajorVersion = u.computeMajorVersion(mostRecentMinorBranch);

    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: mostRecentMinorBranch,
      CI_STABLE_BRANCH: mostRecentMinorBranch,
      CI_COMMIT: latestCommits[mostRecentMinorBranch],
    })).toEqual([
      {
        name: 'stable',
        type: 'primary',
        deployEnv: 'stable',
        projectId: 'angular-io',
        siteId: 'stable-angular-io-site',
        deployedUrl: 'https://angular.io/',
        preDeployActions: ['function:build', 'function:checkPayloadSize'],
        postDeployActions: ['function:testPwaScore'],
      },
      {
        name: 'redirectVersionDomainToStable',
        type: 'secondary',
        deployEnv: 'stable',
        projectId: 'angular-io',
        siteId: `v${stableMajorVersion}-angular-io-site`,
        deployedUrl: `https://v${stableMajorVersion}.angular.io/`,
        preDeployActions: ['function:redirectAllToStable'],
        postDeployActions: ['function:undoRedirectAllToStable', 'function:testRedirectToStable'],
      },
      {
        name: 'redirectRcToStable',
        type: 'secondary',
        deployEnv: 'stable',
        projectId: 'angular-io',
        siteId: 'rc-angular-io-site',
        deployedUrl: 'https://rc.angular.io/',
        preDeployActions: ['function:disableServiceWorker', 'function:redirectNonFilesToStable'],
        postDeployActions: [
          'function:undoRedirectNonFilesToStable',
          'function:undoDisableServiceWorker',
          'function:testNoActiveRcDeployment',
        ],
      },
    ]);
  });

  it('stable - skip deploy - commit not HEAD', () => {
    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '4.3.x',
      CI_STABLE_BRANCH: '4.3.x',
      CI_COMMIT: 'DUMMY_TEST_COMMIT',
    })).toEqual([
      {
        name: 'skipped',
        type: 'skipped',
        reason:
            'Skipping deploy because DUMMY_TEST_COMMIT is not the latest commit ' +
            `(${latestCommits['4.3.x']}).`,
      },
    ]);
  });

  it('archive - deploy success', () => {
    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '2.4.x',
      CI_STABLE_BRANCH: '4.3.x',
      CI_COMMIT: latestCommits['2.4.x'],
    })).toEqual([
      {
        name: 'archive',
        type: 'primary',
        deployEnv: 'archive',
        projectId: 'angular-io',
        siteId: 'v2-angular-io-site',
        deployedUrl: 'https://v2.angular.io/',
        preDeployActions: ['function:build', 'function:checkPayloadSize'],
        postDeployActions: ['function:testPwaScore'],
      },
    ]);
  });

  // v9 used to be special-cased, because it was piloting the Firebase hosting "multisites" setup.
  // See https://angular-team.atlassian.net/browse/DEV-125 for more info.
  it('archive - deploy success (no special case for v9)', () => {
    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '9.1.x',
      CI_STABLE_BRANCH: '10.0.x',
      CI_COMMIT: latestCommits['9.1.x'],
    })).toEqual([
      {
        name: 'archive',
        type: 'primary',
        deployEnv: 'archive',
        projectId: 'angular-io',
        siteId: 'v9-angular-io-site',
        deployedUrl: 'https://v9.angular.io/',
        preDeployActions: ['function:build', 'function:checkPayloadSize'],
        postDeployActions: ['function:testPwaScore'],
      },
    ]);
  });

  it('archive - skip deploy - commit not HEAD', () => {
    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '2.4.x',
      CI_STABLE_BRANCH: '4.3.x',
      CI_COMMIT: 'DUMMY_TEST_COMMIT',
    })).toEqual([
      {
        name: 'skipped',
        type: 'skipped',
        reason:
            'Skipping deploy because DUMMY_TEST_COMMIT is not the latest commit ' +
            `(${latestCommits['2.4.x']}).`,
      },
    ]);
  });

  it('archive - skip deploy - major same as stable, minor lower than stable', () => {
    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '2.1.x',
      CI_STABLE_BRANCH: '2.2.x',
      CI_COMMIT: latestCommits['2.1.x'],
    })).toEqual([
      {
        name: 'skipped',
        type: 'skipped',
        reason:
            'Skipping deploy of branch "2.1.x" to Firebase.\n' +
            'There is a more recent branch with the same major version: "2.4.x"',
      },
    ]);
  });

  it('archive - skip deploy - major lower than stable, minor not highest for major', () => {
    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '2.1.x',
      CI_STABLE_BRANCH: '4.3.x',
      CI_COMMIT: latestCommits['2.1.x'],
    })).toEqual([
      {
        name: 'skipped',
        type: 'skipped',
        reason:
            'Skipping deploy of branch "2.1.x" to Firebase.\n' +
            'There is a more recent branch with the same major version: "2.4.x"',
      },
    ]);
  });

  it('rc - deploy success - major higher than stable', () => {
    const rcMajorVersion = u.computeMajorVersion(mostRecentMinorBranch);

    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: mostRecentMinorBranch,
      CI_STABLE_BRANCH: '2.2.x',
      CI_COMMIT: latestCommits[mostRecentMinorBranch],
    })).toEqual([
      {
        name: 'rc',
        type: 'primary',
        deployEnv: 'rc',
        projectId: 'angular-io',
        siteId: 'rc-angular-io-site',
        deployedUrl: 'https://rc.angular.io/',
        preDeployActions: ['function:build', 'function:checkPayloadSize'],
        postDeployActions: ['function:testPwaScore'],
      },
      {
        name: 'redirectVersionDomainToRc',
        type: 'secondary',
        deployEnv: 'rc',
        projectId: 'angular-io',
        siteId: `v${rcMajorVersion}-angular-io-site`,
        deployedUrl: `https://v${rcMajorVersion}.angular.io/`,
        preDeployActions: ['function:redirectAllToRc'],
        postDeployActions: ['function:undoRedirectAllToRc', 'function:testRedirectToRc'],
      },
    ]);
  });

  it('rc - deploy success - major same as stable, minor highest for major', () => {
    // Create a stable branch name that has the same major and lower minor than
    // `mostRecentMinorBranch`.
    // NOTE: Since `mostRecentMinorBranch` can have a minor version of `0`, we may end up with `-1`
    //       as the minor version for stable. This is a hack, but it works ¯\_(ツ)_/¯
    const stableBranch = mostRecentMinorBranch.replace(
        /^(\d+)\.(\d+)\.x$/, (_, major, minor) => `${major}.${minor - 1}.x`);

    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: mostRecentMinorBranch,
      CI_STABLE_BRANCH: stableBranch,
      CI_COMMIT: latestCommits[mostRecentMinorBranch],
    })).toEqual([
      {
        name: 'rc',
        type: 'primary',
        deployEnv: 'rc',
        projectId: 'angular-io',
        siteId: 'rc-angular-io-site',
        deployedUrl: 'https://rc.angular.io/',
        preDeployActions: ['function:build', 'function:checkPayloadSize'],
        postDeployActions: ['function:testPwaScore'],
      },
    ]);
  });

  it('rc - skip deploy - commit not HEAD', () => {
    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: mostRecentMinorBranch,
      CI_STABLE_BRANCH: '2.2.x',
      CI_COMMIT: 'DUMMY_TEST_COMMIT',
    })).toEqual([
      {
        name: 'skipped',
        type: 'skipped',
        reason:
            'Skipping deploy because DUMMY_TEST_COMMIT is not the latest commit ' +
            `(${latestCommits[mostRecentMinorBranch]}).`,
      },
    ]);
  });

  it('rc - skip deploy - major same as stable, minor not highest for major', () => {
    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '2.1.x',
      CI_STABLE_BRANCH: '2.0.x',
      CI_COMMIT: latestCommits['2.1.x'],
    })).toEqual([
      {
        name: 'skipped',
        type: 'skipped',
        reason:
            'Skipping deploy of branch "2.1.x" to Firebase.\n' +
            'There is a more recent branch with the same major version: "2.4.x"',
      },
    ]);
  });

  it('rc - skip deploy - major higher than stable, minor not highest for major', () => {
    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '4.3.x',
      CI_STABLE_BRANCH: '2.4.x',
      CI_COMMIT: latestCommits['4.3.x'],
    })).toEqual([
      {
        name: 'skipped',
        type: 'skipped',
        reason:
            'Skipping deploy of branch "4.3.x" to Firebase.\n' +
            'There is a more recent branch with the same major version: "4.4.x"',
      },
    ]);
  });

  it('rc - skip deploy - major higher than stable but not highest, minor highest for major', () => {
    expect(getDeploymentsInfoFor({
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '4.4.x',
      CI_STABLE_BRANCH: '2.4.x',
      CI_COMMIT: latestCommits['4.4.x'],
    })).toEqual([
      {
        name: 'skipped',
        type: 'skipped',
        reason:
            'Skipping deploy of branch "4.4.x" to Firebase.\n' +
            'This branch has an equal or higher major version than the stable branch ("2.4.x") ' +
            'and is not the most recent minor branch.',
      },
    ]);
  });

  it('integration - should run the main script without error', () => {
    // NOTE:
    // This test executes a new instance of the `deploy-to-firebase` script on a separate process
    // and thus does not share the `getRemoteRefs()` cache. To improve stability, we use an older
    // branch (`4.4.x`) that is unlikely to receive any new commits (so the one retrieved at the
    // beginning of the tests will still be the latest one for that branch).
    const scriptPath = path.join('aio', 'scripts', 'deploy-to-firebase', 'index.mjs');
    const cmd = `"${process.execPath}" "${scriptPath}" --dry-run`;
    const env = {
      CI_REPO_OWNER: 'angular',
      CI_REPO_NAME: 'angular',
      CI_PULL_REQUEST: 'false',
      CI_BRANCH: '4.4.x',
      CI_STABLE_BRANCH: mostRecentMinorBranch,
      CI_COMMIT: latestCommits['4.4.x'],
      // Pass along this Bazel test env var as it's used
      // by the script to determine if it's in a test.
      TEST_SRCDIR: process.env.TEST_SRCDIR,
    };

    const result = execSync(cmd, {encoding: 'utf8', env}).trim();
    expect(result).toBe(
        'Deployments (1): archive\n' +
        '\n' +
        '\n' +
        '\n' +
        'Deployment 1 of 1: archive\n' +
        '--------------------------\n' +
        'Git branch          : 4.4.x\n' +
        `Git commit          : ${latestCommits['4.4.x']}\n` +
        'Build/deploy mode   : archive\n' +
        'Firebase project    : angular-io\n' +
        'Firebase site       : v4-angular-io-site\n' +
        'Pre-deploy actions  : build, checkPayloadSize\n' +
        'Post-deploy actions : testPwaScore\n' +
        'Deployment URLs     : https://v4.angular.io/\n' +
        '                      https://v4-angular-io-site.web.app/');
  });
});

describe('validateDeploymentsInfo()', () => {
  const createTarget = (name, type) => ({
    name,
    type,
    deployEnv: 'deployEnv',
    projectId: 'projectId',
    siteId: 'siteId',
    deployedUrl: 'deployedUrl',
    preDeployActions: [],
    postDeployActions: [],
  });

  it('should error if there are deploy targets with unknown types', () => {
    const targets = [
      createTarget('target-1', 'primary'),
      createTarget('target-2', 'tertiary'),
      createTarget('target-3', 'secondary'),
      createTarget(undefined, 'other'),
    ];

    expect(() => validateDeploymentsInfo(targets)).toThrowError(
        'Expected all deploy targets to have a type of primary or secondary or skipped, but ' +
        'found 2 targets with an unknown type: target-2 (type: tertiary), <no name> (type: other)');
  });

  it('should error if there are non-skipped targets missing required properties', () => {
    // With target missing `name`.
    const targets1 = [
      createTarget('target-1', 'primary'),
      createTarget(undefined, 'secondary'),
    ];

    expect(() => validateDeploymentsInfo(targets1)).toThrowError(
        'Expected deploy target \'<no name>\' to have all required properties, but it is missing ' +
        '\'name\'.');

    // With target missing multiple properties.
    const targets2 = [
      createTarget('target-1', 'primary'),
      {
        ...createTarget('target-2', 'secondary'),
        deployEnv: undefined,
        postDeployActions: undefined,
      },
    ];

    expect(() => validateDeploymentsInfo(targets2)).toThrowError(
        'Expected deploy target \'target-2\' to have all required properties, but it is missing ' +
        '\'deployEnv\', \'postDeployActions\'.');
  });

  it('should error if there are skipped targets missing required properties', () => {
    // With target missing `name`.
    const targets1 = [
      createTarget('target-1', 'primary'),
      {...skipDeployment('just because'), name: undefined},
    ];

    expect(() => validateDeploymentsInfo(targets1)).toThrowError(
        'Expected deploy target \'<no name>\' to have all required properties, but it is missing ' +
        '\'name\'.');

    // With target missing `reason`.
    const targets2 = [
      createTarget('target-1', 'primary'),
      skipDeployment(undefined),
    ];

    expect(() => validateDeploymentsInfo(targets2)).toThrowError(
        'Expected deploy target \'skipped\' to have all required properties, but it is missing ' +
        '\'reason\'.');
  });

  it('should error if there are both skipped and non-skipped targets', () => {
    const targets = [
      skipDeployment('just because'),
      createTarget('target-2', 'secondary'),
    ];

    expect(() => validateDeploymentsInfo(targets)).toThrowError(
        'Expected a single skipped deploy target, but found 2 targets in total: skipped, target-2');
  });

  it('should error if there are multiple skipped targets', () => {
    const targets = [
      skipDeployment('just because'),
      skipDeployment('because why not'),
    ];

    expect(() => validateDeploymentsInfo(targets)).toThrowError(
        'Expected a single skipped deploy target, but found 2 targets in total: skipped, skipped');
  });

  it('should error if there is no primary target', () => {
    const targets = [
      createTarget('target-1', 'secondary'),
      createTarget('target-2', 'secondary'),
    ];

    expect(() => validateDeploymentsInfo(targets)).toThrowError(
        'Expected exactly one primary deploy target, but found 0: -');
  });

  it('should error if there is more than one primary target', () => {
    const targets = [
      createTarget('target-1', 'primary'),
      createTarget('target-2', 'secondary'),
      createTarget('target-3', 'primary'),
    ];

    expect(() => validateDeploymentsInfo(targets)).toThrowError(
        'Expected exactly one primary deploy target, but found 2: target-1, target-3');
  });

  it('should error if the primary target is not the first item in the list', () => {
    const targets = [
      createTarget('target-1', 'secondary'),
      createTarget('target-2', 'primary'),
      createTarget('target-3', 'secondary'),
    ];

    expect(() => validateDeploymentsInfo(targets)).toThrowError(
        'Expected the primary target (target-2) to be the first item in the deploy target list, ' +
        'but it was found at index 1 (0-based): target-1, target-2, target-3');
  });

  it('should error if there are secondary targets with a different `deployEnv` than primary',
      () => {
        const targets = [
          {...createTarget('target-1', 'primary'), deployEnv: 'deploy-env-1'},
          {...createTarget('target-2', 'secondary'), deployEnv: 'deploy-env-1'},
          {...createTarget('target-3', 'secondary'), deployEnv: 'deploy-env-2'},
          {...createTarget('target-4', 'secondary'), deployEnv: 'deploy-env-1'},
          {...createTarget('target-5', 'secondary'), deployEnv: 'deploy-env-2'},
          {...createTarget('target-6', 'secondary'), deployEnv: 'deploy-env-3'},
        ];

        expect(() => validateDeploymentsInfo(targets)).toThrowError(
            'Expected all secondary deploy targets to match the primary target\'s `deployEnv` ' +
            '(deploy-env-1), but 3 targets do not: target-3 (deployEnv: deploy-env-2), target-5 ' +
            '(deployEnv: deploy-env-2), target-6 (deployEnv: deploy-env-3)');
      });

  it('should succeed with a valid skipped target', () => {
    const targets = [
      skipDeployment('due to valid reasons'),
    ];

    expect(() => validateDeploymentsInfo(targets)).not.toThrow();
  });

  it('should succeed with a valid non-skipped target', () => {
    const targets = [
      createTarget('target-1', 'primary'),
    ];

    expect(() => validateDeploymentsInfo(targets)).not.toThrow();
  });

  it('should succeed with multiple valid non-skipped targets', () => {
    const targets = [
      createTarget('target-1', 'primary'),
      createTarget('target-2', 'secondary'),
      createTarget('target-3', 'secondary'),
      createTarget('target-4', 'secondary'),
    ];

    expect(() => validateDeploymentsInfo(targets)).not.toThrow();
  });
});
