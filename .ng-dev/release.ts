import {join} from 'path';
import {exec} from 'shelljs';
import {ReleaseConfig} from '../dev-infra/release/config';

/** Configuration for the `ng-dev release` command. */
export const release: ReleaseConfig = {
  npmPackages: [
    '@angular/animations',
    '@angular/bazel',
    '@angular/common',
    '@angular/compiler',
    '@angular/compiler-cli',
    '@angular/core',
    '@angular/elements',
    '@angular/forms',
    '@angular/language-service',
    '@angular/localize',
    '@angular/platform-browser',
    '@angular/platform-browser-dynamic',
    '@angular/platform-server',
    '@angular/platform-webworker',
    '@angular/platform-webworker-dynamic',
    '@angular/router',
    '@angular/service-worker',
    '@angular/upgrade',
  ],
  // TODO: Implement release package building here.
  buildPackages: async () => [],
  // TODO: This can be removed once there is an org-wide tool for changelog generation.
  generateReleaseNotesForHead: async () => {
    exec('yarn -s gulp changelog', {cwd: join(__dirname, '../')});
  },
};
