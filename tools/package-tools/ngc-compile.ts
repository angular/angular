import {resolve as resolvePath} from 'path';
import {spawn} from 'child_process';
import {red} from 'chalk';

/**
 * Spawns a child process that compiles using ngc.
 * @param flags Command-line flags to be passed to ngc.
 * @returns Promise that resolves/rejects when the child process exits.
 */
export function ngcCompile(flags: string[]) {
  return new Promise((resolve, reject) => {
    const ngcPath = resolvePath('./node_modules/.bin/ngc');
    const childProcess = spawn(ngcPath, flags, {shell: true});

    // Pipe stdout and stderr from the child process.
    childProcess.stdout.on('data', (data: string|Buffer) => console.log(`${data}`));
    childProcess.stderr.on('data', (data: string|Buffer) => console.error(red(`${data}`)));
    childProcess.on('exit', (exitCode: number) => exitCode === 0 ? resolve() : reject());
  });
}
