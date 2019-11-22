#!/usr/bin/env node
'use strict';

const {buildTargetPackages} = require('./package-builder');


// Build the ivy packages.
buildTargetPackages('dist/packages-dist-ivy-aot', true, 'Ivy AOT');
