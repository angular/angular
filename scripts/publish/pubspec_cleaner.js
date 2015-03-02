// Cleans up pubspec.yaml files prior to publishing
// Usage: node pubspec_cleaner.js --pubspec-file=PATH_TO_PUBSPEC_YAML

fs   = require('fs');
yaml = require('js-yaml');
yargs = require('yargs');

var pubspecFileOpt = 'pubspec-file';
var pubspecFile = yargs
    .demand([pubspecFileOpt])
    .argv[pubspecFileOpt];

var doc = yaml.safeLoad(fs.readFileSync(pubspecFile, 'utf8'));

// Pub does not allow publishing with dependency_overrides
delete doc['dependency_overrides'];

fs.writeFileSync(pubspecFile, yaml.safeDump(doc));
