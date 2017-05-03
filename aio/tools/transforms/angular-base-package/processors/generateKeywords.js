'use strict';

var fs = require('fs');
var path = require('canonical-path');

/**
 * @dgProcessor generateKeywordsProcessor
 * @description
 * This processor extracts all the keywords from each document and creates
 * a new document that will be rendered as a JavaScript file containing all
 * this data.
 */
module.exports = function generateKeywordsProcessor(log, readFilesProcessor) {
  return {
    ignoreWordsFile: undefined,
    propertiesToIgnore: [],
    docTypesToIgnore: [],
    outputFolder: '',
    $validate: {
      ignoreWordsFile: {},
      docTypesToIgnore: {},
      propertiesToIgnore: {},
      outputFolder: {presence: true}
    },
    $runAfter: ['paths-computed'],
    $runBefore: ['rendering-docs'],
    $process: function(docs) {

      // Keywords to ignore
      var wordsToIgnore = [];
      var propertiesToIgnore;
      var docTypesToIgnore;

      // Keywords start with "ng:" or one of $, _ or a letter
      var KEYWORD_REGEX = /^((ng:|[$_a-z])[\w\-_]+)/;

      // Load up the keywords to ignore, if specified in the config
      if (this.ignoreWordsFile) {
        var ignoreWordsPath = path.resolve(readFilesProcessor.basePath, this.ignoreWordsFile);
        wordsToIgnore = fs.readFileSync(ignoreWordsPath, 'utf8').toString().split(/[,\s\n\r]+/gm);

        log.debug('Loaded ignore words from "' + ignoreWordsPath + '"');
        log.silly(wordsToIgnore);
      }

      propertiesToIgnore = convertToMap(this.propertiesToIgnore);
      log.debug('Properties to ignore', propertiesToIgnore);
      docTypesToIgnore = convertToMap(this.docTypesToIgnore);
      log.debug('Doc types to ignore', docTypesToIgnore);

      var ignoreWordsMap = convertToMap(wordsToIgnore);

      // If the title contains a name starting with ng, e.g. "ngController", then add the module
      // name
      // without the ng to the title text, e.g. "controller".
      function extractTitleWords(title) {
        var match = /ng([A-Z]\w*)/.exec(title);
        if (match) {
          title = title + ' ' + match[1].toLowerCase();
        }
        return title;
      }

      function extractWords(text, words, keywordMap) {
        var tokens = text.toLowerCase().split(/[.\s,`'"#]+/mg);
        tokens.forEach(function(token) {
          var match = token.match(KEYWORD_REGEX);
          if (match) {
            var key = match[1];
            if (!keywordMap[key]) {
              keywordMap[key] = true;
              words.push(key);
            }
          }
        });
      }


      const filteredDocs = docs
          // We are not interested in some docTypes
          .filter(function(doc) { return !docTypesToIgnore[doc.docType]; })
          // Ignore internals and private exports (indicated by the ɵ prefix)
          .filter(function(doc) { return !doc.internal && !doc.privateExport; });

      filteredDocs.forEach(function(doc) {


        var words = [];
        var keywordMap = Object.assign({}, ignoreWordsMap);
        var members = [];
        var membersMap = {};

        // Search each top level property of the document for search terms
        Object.keys(doc).forEach(function(key) {
          const value = doc[key];

          if (isString(value) && !propertiesToIgnore[key]) {
            extractWords(value, words, keywordMap);
          }

          if (key === 'methods' || key === 'properties' || key === 'events') {
            value.forEach(function(member) { extractWords(member.name, members, membersMap); });
          }
        });


        doc.searchTerms = {
          titleWords: extractTitleWords(doc.title || doc.name),
          keywords: words.sort().join(' '),
          members: members.sort().join(' ')
        };

      });

      var searchData =
          filteredDocs.filter(function(page) { return page.searchTerms; }).map(function(page) {
            return Object.assign(
                {path: page.path, title: page.searchTitle || page.name || page.title, type: page.docType}, page.searchTerms);
          });

      docs.push({
        docType: 'json-doc',
        id: 'search-data-json',
        template: 'json-doc.template.json',
        path: this.outputFolder + '/search-data.json',
        outputPath: this.outputFolder + '/search-data.json',
        data: searchData
      });
    }
  };
};


function isString(value) {
  return typeof value == 'string';
}

function convertToMap(collection) {
  const obj = {};
  collection.forEach(key => { obj[key] = true; });
  return obj;
}