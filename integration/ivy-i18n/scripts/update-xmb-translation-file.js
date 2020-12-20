/**
 * This file simulates translating a generated translation file into a new locale.
 * In particular it takes an English locale XMB format and translates to a French locale XTB format.
 */
const fs = require('fs');
const path = require('path');

// Load the file
const filePath = path.resolve(__dirname, '..', process.argv.pop());
const contents = fs.readFileSync(filePath, 'utf8');

// Write translated file
const updatedFilePath = filePath.replace(/\.xmb$/, '.xtb');
const updatedContents = contents.replace(/messagebundle/g, 'translationbundle>')
                            .replace(/<translationbundle>/g, '<translationbundle lang="legacy">')
                            .replace(/\bmsg\b/g, 'translation')
                            .replace(/Hello/g, 'Bonjour')
                            .replace(/<source>.*<\/source>/g, '');
fs.writeFileSync(updatedFilePath, updatedContents, 'utf8');
