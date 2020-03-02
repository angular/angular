#!/usr/bin/env node
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
'use strict';

const {buildTargetPackages} = require('./package-builder');


// Build the ivy packages.
buildTargetPackages('dist/packages-dist-ivy-aot', true, 'Ivy AOT');
