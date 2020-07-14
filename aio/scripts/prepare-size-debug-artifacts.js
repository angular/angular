#!/usr/bin/env node
const {cp, ls, mkdir, set} = require('shelljs');
const {join, resolve} = require('path');
set('-e');

// Read input arguments.
const [sizesTarget, artifactsRelativeDir] = process.argv.slice(2);

// Compute paths.
const projectDir = resolve(__dirname, '../..');
const sizesFilePath = join(projectDir, 'goldens/size-tracking/aio-payloads.json');
const distDir = join(projectDir, 'aio/dist');
const artifactsDir = resolve(projectDir, artifactsRelativeDir);

// Determine which files need to be copied.
const fileNamePrefixes = Object.keys(require(sizesFilePath)[sizesTarget].master.uncompressed);
const filesToCopyRe = new RegExp(`^(?:${fileNamePrefixes.join('|')})\\..+\\.js$`);
const filesToCopy = ls(distDir)
    .filter(file => filesToCopyRe.test(file))
    .map(file => join(distDir, file));

// Copy files to the specified directory.
mkdir('-p', artifactsDir);
cp(filesToCopy, artifactsDir);
