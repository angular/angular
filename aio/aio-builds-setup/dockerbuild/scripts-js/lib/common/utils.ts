import {basename, resolve as resolvePath} from 'path';
import {SHORT_SHA_LEN} from './constants';

/**
 * Shorten a SHA to make it more readable
 * @param sha The SHA to shorten.
 */
export function computeShortSha(sha: string) {
  return sha.substr(0, SHORT_SHA_LEN);
}

/**
 * Compute the path for a downloaded artifact file.
 * @param downloadsDir The directory where artifacts are downloaded
 * @param pr The PR associated with this artifact.
 * @param sha The SHA associated with the build for this artifact.
 * @param artifactPath The path to the artifact on CircleCI.
 * @returns The fully resolved location for the specified downloaded artifact.
 */
export function computeArtifactDownloadPath(downloadsDir: string, pr: number, sha: string, artifactPath: string) {
  return resolvePath(downloadsDir, `${pr}-${computeShortSha(sha)}-${basename(artifactPath)}`);
}

/**
 * Extract the PR number and latest commit SHA from a downloaded file path.
 * @param downloadPath the path to the downloaded file.
 * @returns An object whose keys are the PR and SHA extracted from the file path.
 */
export function getPrInfoFromDownloadPath(downloadPath: string) {
  const file = basename(downloadPath);
  const [pr, sha] = file.split('-');
  return {pr: +pr, sha};
}

/**
 * Assert that a value is true.
 * @param value The value to assert.
 * @param message The message if the value is not true.
 */
export function assert(value: boolean, message: string) {
  if (!value) {
    throw new Error(message);
  }
}

/**
 * Assert that a parameter is not equal to "".
 * @param name The name of the parameter.
 * @param value The value of the parameter.
 */
export const assertNotMissingOrEmpty = (name: string, value: string | null | undefined) => {
  assert(!!value, `Missing or empty required parameter '${name}'!`);
};

/**
 * Get an environment variable.
 * @param name The name of the environment variable.
 * @param isOptional True if the variable is optional.
 * @returns The value of the variable or "" if it is optional and falsy.
 * @throws `Error` if the variable is falsy and not optional.
 */
export const getEnvVar = (name: string, isOptional = false): string => {
  const value = process.env[name];

  if (!isOptional && !value) {
    try {
     throw new Error(`ERROR: Missing required environment variable '${name}'!`);
    } catch (error) {
      console.error(error.stack);
      process.exit(1);
    }
  }

  return value || '';
};

/**
 * A basic logger implementation.
 * Delegates to `console`, but prepends each message with the current date and specified scope (i.e caller).
 */
export class Logger {
  private padding = ' '.repeat(20 - this.scope.length);

  /**
   * Create a new `Logger` instance for the specified `scope`.
   * @param scope The logger's scope (added to all messages).
   */
  constructor(private scope: string) {}

  public error(...args: any[]) { this.callMethod('error', args); }
  public info(...args: any[]) { this.callMethod('info', args); }
  public log(...args: any[]) { this.callMethod('log', args); }
  public warn(...args: any[]) { this.callMethod('warn', args); }

  private callMethod(method: 'error' | 'info' | 'log' | 'warn', args: any[]) {
    console[method](`[${new Date()}]`, `${this.scope}:${this.padding}`, ...args);
  }
}
