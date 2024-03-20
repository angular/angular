/**
 * This file simulates translating a generated translation file into a new locale.
 * In particular it takes an English locale XLIFF 1.2 format and translates to the French locale.
 */
const fs = require('fs');
const path = require('path');

// Load the file
const filePath = path.resolve(__dirname, '..', process.argv.pop());
const contents = fs.readFileSync(filePath, 'utf8');

// Backup the file
fs.writeFileSync(filePath + '.bak', contents, 'utf8');

// Write translated file
const updated =
    contents.replace(/source>/g, 'target>')
        .replace(/Hello/g, 'Bonjour')
        .replace(/source-language="([^"]+)"/g, 'source-language="$1" target-language="legacy"');
fs.writeFileSync(filePath, updated, 'utf8');
