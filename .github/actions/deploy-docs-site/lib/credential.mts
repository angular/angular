import {writeFileSync, mkdtempSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {getInput, setSecret} from '@actions/core';

let credentialFilePath: undefined | string;

export function getCredentialFilePath(): string {
  if (credentialFilePath === undefined) {
    const serviceKey = getInput('serviceKey', {required: true});
    setSecret(serviceKey); 
    
    const tmpDir = mkdtempSync(join(tmpdir(), 'credential-'));
    const filePath = join(tmpDir, 'credential.json');
    writeFileSync(filePath, serviceKey, {mode: 0o600}); // restrict permissions
    credentialFilePath = filePath;
  }
  return credentialFilePath;
}

/** Github access token. Used for querying the active release trains. */
export const githubReleaseTrainReadToken: string = getInput('githubReleaseTrainReadToken', {
  required: true,
});
