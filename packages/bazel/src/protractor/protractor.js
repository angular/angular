#!/usr/bin/env node

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

process.env.NODE_ENV = process.env.NODE_ENV || 'test';

require('protractor/built/cli.js');
