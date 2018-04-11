#!/usr/bin/env node

/**
 * Script to manually add metadata re-exports to the @angular/material package generated
 * via the ng_package bazel rule. This is rather special to the @angular/material package,
 * so it hasn't been built into the ng_package rule yet.
 *
 * This is necessary for being able to import Angular constructs from "@angular/material"
 * while still bundling at a per-component level.
 */

const path = require('path');
const fs = require('fs');

const materialPackageDir = path.join(__dirname, '..', '..', 'dist', 'bazel-packages', 'material');

if (!fs.existsSync(materialPackageDir)) {
  console.error('The @angular/material package has not been written to dist/bazel-packages.');
  process.exit(1);
}

// We only add metadata re-exports for entry-points that *have* metadata (except the root,
// which we're going to overwrite). Create a set of export entries in the form:
// {"from": "./button/button_public_index"}.
const secondaryEntryPointExports = fs.readdirSync(materialPackageDir)
    .filter(f => f.endsWith('metadata.json') && !f.includes('public_index'))
    .map(f => path.basename(f, '.metadata.json'))
    .map(e => ({from: `./${e}/${e}_public_index`}));

// Read the root metadata for @angular/material from the bazel output so we can modify it with
// the additonal exports.
const rootMetadataPath = path.join(materialPackageDir, 'material_public_index.metadata.json');
const rootMetadata = JSON.parse(fs.readFileSync(rootMetadataPath, 'utf-8'));

rootMetadata.exports = secondaryEntryPointExports;
rootMetadata.flatModuleIndexRedirect = true;
fs.writeFileSync(rootMetadataPath, JSON.stringify(rootMetadata), 'utf-8');
