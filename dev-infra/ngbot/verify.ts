/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {readFileSync} from 'fs';
import {resolve} from 'path';
import {parse as parseYaml} from 'yaml';

import {getRepoBaseDir} from '../utils/config';
import {error, green, info, red} from '../utils/console';

export function verify() {
  /** Full path to NgBot config file */
  const NGBOT_CONFIG_YAML_PATH = resolve(getRepoBaseDir(), '.github/angular-robot.yml');

  /** The NgBot config file */
  const ngBotYaml = readFileSync(NGBOT_CONFIG_YAML_PATH, 'utf8');

  try {
    // Try parsing the config file to verify that the syntax is correct.
    parseYaml(ngBotYaml);
    info(`${green('√')}  Valid NgBot YAML config`);
  } catch (e) {
    error(`${red('!')} Invalid NgBot YAML config`);
    error(e);
    process.exitCode = 1;
  }
}
