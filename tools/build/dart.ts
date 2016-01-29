/// <reference path="../typings/node/node.d.ts" />
// TODO(hansl): Get rid of this file. It's unneeded.

const which = require('which');
const child_process = require('child_process');


export type DartSdkExecutableMap = {
  ANALYZER: string,
  DARTDOCGEN: string,
  DARTFMT: string,
  PUB: string,
  VM: string,
};

/**
 * Return a map of {EXECUTABLE => Path} for the Dart SDK.
 * The executables are different on Windows / Unix.  Returns null if the Dart SDK cannot be
 * found.
 */
export function detect(): DartSdkExecutableMap {
  let sdk: DartSdkExecutableMap;
  try {
    const dartExecutable = which.sync('dart');
    if (process.platform === 'win32') {
      sdk = {
        ANALYZER: 'dartanalyzer.bat',
        DARTDOCGEN: 'dartdoc.bat',
        DARTFMT: 'dartfmt.bat',
        PUB: 'pub.bat',
        VM: 'dart.exe'
      };
    } else {
      sdk = {
        ANALYZER: 'dartanalyzer',
        DARTDOCGEN: 'dartdoc',
        DARTFMT: 'dartfmt',
        PUB: 'pub',
        VM: 'dart'
      };
    }
    console.log('Dart SDK detected:', dartExecutable);
    console.log('- dart: ' + child_process.spawnSync(sdk.VM, ['--version']).stderr.toString().replace(/\n/g, ''));
    console.log('- pub: ' + child_process.spawnSync(sdk.PUB, ['--version']).stdout.toString().replace(/\n/g, ''));

    return sdk;
  } catch (e) {
    console.log('Dart SDK is not available.');
    return null;
  }
}
