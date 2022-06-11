import {$} from 'zx';

export interface InstallOptions {
  /** Whether dependencies should be installed with the lockfile being frozen. */
  frozenLockfile: boolean;
}

/** Installs dependencies in the specified docs repository. */
export async function installDepsForDocsSite(
  repoDirPath: string,
  options: InstallOptions = {frozenLockfile: true},
) {
  const additionalArgs = ['--non-interactive'];

  if (options.frozenLockfile) {
    additionalArgs.push('--frozen-lockfile');
  }

  await $`yarn --cwd ${repoDirPath} install ${additionalArgs}`;
}
