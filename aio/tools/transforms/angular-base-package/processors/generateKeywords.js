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
    $runAfter: ['postProcessHtml'],
    $runBefore: ['writing-files'],
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

      // If the heading contains a name starting with ng, e.g. "ngController", then add the
      // name without the ng to the text, e.g. "controller".
      function preprocessText(text) {
        return text.replace(/(^|\s)([nN]g([A-Z]\w*))/g, '$1$2 $3');
      }

      function extractWords(text, words, keywordMap) {
        var tokens = preprocessText(text).toLowerCase().split(/[.\s,`'"#]+/mg);
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
        var membersMap = Object.assign({}, ignoreWordsMap);
        const headingWords = [];
        const headingWordMap = Object.assign({}, ignoreWordsMap);

        // Search each top level property of the document for search terms
        Object.keys(doc).forEach(function(key) {
          const value = doc[key];

          if (isString(value) && !propertiesToIgnore[key]) {
            extractWords(value, words, keywordMap);
          }

          // Special case properties that contain content relating to "members"
          // of a doc that represents, say, a class or interface
          if (key === 'members' || key === 'statics') {
            value.forEach(function(member) { extractWords(member.name, members, membersMap); });
          }
        });

        // Extract all the keywords from the headings
        if (doc.vFile && doc.vFile.headings) {
          Object.keys(doc.vFile.headings).forEach(function(headingTag) {
            doc.vFile.headings[headingTag].forEach(function(headingText) {
              extractWords(headingText, headingWords, headingWordMap);
            });
          });
        }

        // Extract the title to use in searches
        doc.searchTitle = doc.searchTitle || doc.title || doc.vFile && doc.vFile.title || doc.name || '';

        // Attach all this search data to the document
        doc.searchTerms = {
          titleWords: preprocessText(doc.searchTitle),
          headingWords: headingWords.sort().join(' '),
          keywords: words.sort().join(' '),
          members: members.sort().join(' ')
        };

      });

      // Now process all the search data and collect it up to be used in creating a new document
      var searchData = filteredDocs.map(function(page) {
        // Copy the properties from the searchTerms object onto the search data object
        return Object.assign({
          path: page.path,
          title: page.searchTitle,
          type: page.docType
        }, page.searchTerms);
      });

      docs.push({
        docType: 'json-doc',
        id: 'search-data-json',
        path: this.outputFolder + '/search-data.json',
        outputPath: this.outputFolder + '/search-data.json',
        data: searchData,
        renderedContent: JSON.stringify(searchData)
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