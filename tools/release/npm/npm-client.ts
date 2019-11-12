import {spawnSync} from 'child_process';

/** Runs NPM publish within a specified directory */
export function npmPublish(packagePath: string, distTag: string): string | null {
  const result =
      spawnSync('npm', ['publish', '--access', 'public', '--tag', distTag], {
        cwd: packagePath,
        shell: true,
        env: process.env,
      });

  // We only want to return an error if the exit code is not zero. NPM by default prints the
  // logging messages to "stdout" and therefore just checking for "stdout" is not reliable.
  if (result.status !== 0) {
    return result.stderr.toString();
  }
  return null;
}
