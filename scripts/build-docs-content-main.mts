#!/usr/bin/env node

/**
 * Script that builds the docs content NPM package and moves it into a conveniently
 * accessible distribution directory (the project `dist/` directory).
 */

import {buildDocsContentPackage} from './build-docs-content.mjs';

const builtPackage = buildDocsContentPackage();
console.info(`Built docs-content into: ${builtPackage.outputPath}`);
