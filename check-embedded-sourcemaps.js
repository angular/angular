const fs = require('fs');
const path = require('path');

const sourceMapFilePath = process.argv[2];
const sourceMapFileDir  = path.dirname(sourceMapFilePath);

if (sourceMapFilePath) {
    const sourceMapContents = fs.readFileSync(sourceMapFilePath, 'UTF-8');

    const sourceMapObject = JSON.parse(sourceMapContents);

    if (sourceMapObject.sourcesContent) {
        sourceMapObject.sources.forEach(function(relativePath, index) {
            const shortPath = path.relative('.', path.resolve(sourceMapFileDir, relativePath));

            const embeddedSource = sourceMapObject.sourcesContent[index];
            const actualSource   = fs.readFileSync(shortPath, 'UTF-8');

            const same = embeddedSource === actualSource;

            console.log(`${sourceMapFilePath} -> ${shortPath}: ${same ? 'same': 'different'}`);
        }, this);
    }
}
