#!/usr/bin/env node
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as yargs from 'yargs';
import {tsCircularDependenciesBuilder} from './ts-circular-dependencies/index';
import {buildPullapproveParser} from './pullapprove/cli';
import {buildCommitMessageParser} from './commit-message/cli';

yargs.scriptName('ng-dev')
    .demandCommand()
    .recommendCommands()
    .command('ts-circular-deps <command>', '', tsCircularDependenciesBuilder)
    .command('pullapprove <command>', '', buildPullapproveParser)
    .command('commit-message <command>', '', buildCommitMessageParser)
    .wrap(120)
    .strict()
    .parse();
