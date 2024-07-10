import {fileSync} from 'tmp';
import {writeSync} from 'fs';
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
