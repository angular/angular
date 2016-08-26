'use strict';

const childProcess = require('child_process');
const fs = require('fs');
const sourceMap = require('source-map'), SourceMapConsumer = sourceMap.SourceMapConsumer,
      SourceMapGenerator = sourceMap.SourceMapGenerator;
const path = require('path');

const SOURCE_MAPPING_URL_REGEXP = /^\/\/# sourceMappingURL=(.*)$/;

function printUsageAndExit() {
  console.error(`Usage: ${process.argv[0]} ${process.argv[1]} <input .js file> [-- <command...>]

Takes an input JavaScript file that has at the end of the file a list of
    //# sourceMappingURL=<source map location>
tokens overwrites it and its source map with a flattened source map.
Optionally runs the specified command before doing so.`);
  process.exit(1);
}

function main(fileName) {
  const lines = fs.readFileSync(fileName).toString().split('\n');
  if (!lines[lines.length - 1]) {
    // Remove Last EOL
    lines.pop();
  }

  const sourceMaps = [];
  let i;
  for (i = lines.length - 1; i >= 0; i--) {
    const match = lines[i].match(SOURCE_MAPPING_URL_REGEXP);
    if (match) {
      sourceMaps.unshift(match[1].trim());
    } else {
      break;
    }
  }
  const contents = lines.slice(0, i + 1);

  const maps = sourceMaps.map(m => {
    const mapName = path.join(path.dirname(fileName), m);
    const sourceMap = JSON.parse(fs.readFileSync(mapName).toString());
    return {fileName: mapName, sourceMap: sourceMap, consumer: new SourceMapConsumer(sourceMap)};
  });

  const firstMap = maps.shift();

  // Create an empty source map with the inline sources that we want to keep
  const generator = SourceMapGenerator.fromSourceMap(new SourceMapConsumer({
    version: 3,
    file: path.basename(fileName),
    sourceRoot: '',
    sources: firstMap.sourceMap.sources,
    sourcesContent: firstMap.sourceMap.sourcesContent,
    mappings: ''
  }));

  for (const map of maps) {
    if (map.sourceMap.sources.length !== 1) {
      throw new Error(
          `${map.fileName} has more than one source. Subsequent source maps must only be 1-to-1 mappings!`);
    }
  }

  firstMap.consumer.eachMapping(firstMapping => {
    const original = {line: firstMapping.originalLine, column: firstMapping.originalColumn};

    let finals = [{line: firstMapping.generatedLine, column: firstMapping.generatedColumn}];
    for (const map of maps) {
      finals = finals
                   .map(
                       loc => map.consumer.generatedPositionFor(
                           {source: map.sourceMap.sources[0], line: loc.line, column: loc.column}))
                   .filter(loc => loc.line !== null && loc.column !== null)
    }

    for (const loc of finals) {
      generator.addMapping({
        source: firstMapping.source,
        original: original,
        generated: loc,
        name: firstMapping.name
      });
    }
  });

  fs.writeFileSync(maps[maps.length - 1].fileName, generator.toString());
  // Match the TypeScript behavior that no EOL is emitted
  fs.writeFileSync(fileName, contents.join('\n'));
}

if (process.argv.length >= 3) {
  if (process.argv.length > 3) {
    const cmdArgs = process.argv.slice(3);
    if (cmdArgs[0] === '--') {
      cmdArgs.shift();
    }
    const result =
        childProcess.spawnSync(process.argv[4], process.argv.slice(5), {stdio: 'inherit'});
    if (result.status !== 0) {
      process.exit(result.status);
    }
  }
  main(process.argv[2]);

} else {
  printUsageAndExit();
}
