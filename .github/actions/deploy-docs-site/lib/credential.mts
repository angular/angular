import {fileSync} from 'tmp';
import {writeSync} from 'node:fs';
import {getInput, setSecret} from '@actions/core';

let credentialFilePath: undefined | string;

export function getCredentialFilePath(): string {
  if (credentialFilePath === undefined) {
    const tmpFile = fileSync({postfix: '.json'});
    writeSync(tmpFile.fd, getInput('serviceKey', {required: true}));
    setSecret(tmpFile.name);
    credentialFilePath = tmpFile.name;
  }
  return credentialFilePath;
}

/** Github access token. Used for querying the active release trains. */
export const githubReleaseTrainReadToken: string = getInput('githubReleaseTrainReadToken', {
  required: true,
});
