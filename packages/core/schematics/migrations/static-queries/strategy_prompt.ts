/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {logging} from '@angular-devkit/core';

import {getInquirer, supportsPrompt} from '../../utils/schematics_prompt';

export enum SELECTED_STRATEGY {
  TEMPLATE,
  USAGE,
  TESTS,
}

/**
 * Prompts the user for the migration strategy that should be used. Defaults to the
 * template strategy as it provides a migration with rare manual corrections.
 * */
export async function promptForMigrationStrategy(logger: logging.LoggerApi) {
  if (supportsPrompt()) {
    logger.info('There are two available migration strategies that can be selected:');
    logger.info('  • Template strategy  -  migration tool (short-term gains, rare corrections)');
    logger.info('  • Usage strategy  -  best practices (long-term gains, manual corrections)');
    logger.info('For an easy migration, the template strategy is recommended. The usage');
    logger.info('strategy can be used for best practices and a code base that will be more');
    logger.info('flexible to changes going forward.');
    const {strategyName} = await getInquirer().prompt<{strategyName: string}>({
      type: 'list',
      name: 'strategyName',
      message: 'What migration strategy do you want to use?',
      choices: [
        {name: 'Template strategy', value: 'template'}, {name: 'Usage strategy', value: 'usage'}
      ],
      default: 'template',
    });
    logger.info('');
    return strategyName === 'usage' ? SELECTED_STRATEGY.USAGE : SELECTED_STRATEGY.TEMPLATE;
  } else {
    // In case prompts are not supported, we still want to allow developers to opt
    // into the usage strategy by specifying an environment variable. The tests also
    // use the environment variable as there is no headless way to select via prompt.
    return !!process.env['NG_STATIC_QUERY_USAGE_STRATEGY'] ? SELECTED_STRATEGY.USAGE :
                                                             SELECTED_STRATEGY.TEMPLATE;
  }
}
