var Package = require('dgeni').Package;
var jsdocPackage = require('dgeni-packages/jsdoc');
var linksPackage = require('../links-package');
var path = require('canonical-path');
var fs = require('fs');

// Define the dgeni package for generating the docs
module.exports = new Package('content', [jsdocPackage, linksPackage])

                     // Register the services and file readers
                     .factory(require('./readers/content'))

                     // Configure file reading
                     .config(function(readFilesProcessor, contentFileReader) {
                       readFilesProcessor.fileReaders.push(contentFileReader);
                     })

                     // Configure ids and paths
                     .config(function(computeIdsProcessor, computePathsProcessor) {

                       computeIdsProcessor.idTemplates.push({
                         docTypes: ['content'],
                         getId: function(doc) {
                           return doc.fileInfo
                               .relativePath
                               // path should be relative to `modules` folder
                               .replace(/.*\/?modules\//, '')
                               // path should not include `/docs/`
                               .replace(/\/docs\//, '/')
                               // path should not have a suffix
                               .replace(/\.\w*$/, '');
                         },
                         getAliases: function(doc) { return [doc.id]; }
                       });
                     });
