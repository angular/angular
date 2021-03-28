'use strict';

const stem = require('stemmer');

/**
 * @dgProcessor generateKeywordsProcessor
 * @description
 * This processor extracts all the keywords from each document and creates
 * a new document that will be rendered as a JavaScript file containing all
 * this data.
 */
module.exports = function generateKeywordsProcessor(log) {
  return {
    ignoreWords: [],
    propertiesToIgnore: [],
    docTypesToIgnore: [],
    outputFolder: '',
    $validate: {
      ignoreWords: {},
      docTypesToIgnore: {},
      propertiesToIgnore: {},
      outputFolder: {presence: true}
    },
    $runAfter: ['postProcessHtml'],
    $runBefore: ['writing-files'],
    $process(docs) {

      const dictionary = new Map();

      // Keywords to ignore
      const ignoreWords = new Set(this.ignoreWords);
      log.debug('Words to ignore', ignoreWords);
      const propertiesToIgnore = new Set(this.propertiesToIgnore);
      log.debug('Properties to ignore', propertiesToIgnore);
      const docTypesToIgnore = new Set(this.docTypesToIgnore);
      log.debug('Doc types to ignore', docTypesToIgnore);


      const filteredDocs = docs
          // We are not interested in some docTypes
          .filter(doc => !docTypesToIgnore.has(doc.docType))
          // Ignore internals and private exports (indicated by the ɵ prefix)
          .filter(doc => !doc.internal && !doc.privateExport);


      for(const doc of filteredDocs) {
        // Search each top level property of the document for search terms
        let mainTokens = [];
        for(const key of Object.keys(doc)) {
          const value = doc[key];
          if (isString(value) && !propertiesToIgnore.has(key)) {
            mainTokens.push(...tokenize(value, ignoreWords, dictionary));
          }
        }

        const memberTokens = extractMemberTokens(doc, ignoreWords, dictionary);

        // Extract all the keywords from the headings
        let headingTokens = [];
        if (doc.vFile && doc.vFile.headings) {
          for(const headingTag of Object.keys(doc.vFile.headings)) {
            for(const headingText of doc.vFile.headings[headingTag]) {
              headingTokens.push(...tokenize(headingText, ignoreWords, dictionary));
            }
          }
        }


        // Extract the title to use in searches
        doc.searchTitle = doc.searchTitle || doc.title || doc.vFile && doc.vFile.title || doc.name || '';

        // Attach all this search data to the document
        doc.searchTerms = {};
        if (headingTokens.length > 0) {
          doc.searchTerms.headings = headingTokens;
        }
        if (mainTokens.length > 0) {
          doc.searchTerms.keywords = mainTokens;
        }
        if (memberTokens.length > 0) {
          doc.searchTerms.members = memberTokens;
        }
        if (doc.searchKeywords) {
          doc.searchTerms.topics = doc.searchKeywords.trim();
        }
      }

      // Now process all the search data and collect it up to be used in creating a new document
      const searchData = {
        dictionary: Array.from(dictionary.keys()),
        pages: filteredDocs.map(page => {
          // Copy the properties from the searchTerms object onto the search data object
          const searchObj = {
            path: page.path,
            title: page.searchTitle,
            type: page.docType,
          };
          if (page.deprecated) {
            searchObj.deprecated = true;
          }
          return Object.assign(searchObj, page.searchTerms);
        }),
      };

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

function tokenize(text, ignoreWords, dictionary) {
  // Split on whitespace and things that are likely to be HTML tags (this is not exhaustive but reduces the unwanted tokens that are indexed).
  const rawTokens = text.split(/[\s\/]+|<\/?[a-z]+(?:\s+\w+(?:="[^"]+")?)*>/img);
  const tokens = [];
  for(let token of rawTokens) {
    token = token.trim();

    // Strip off unwanted trivial characters
    token = token.replace(/^[_\-"'`({[<$*)}\]>.]+/, '').replace(/[_\-"'`({[<$*)}\]>.]+$/, '');

    // Skip if in the ignored words list
    if (ignoreWords.has(token.toLowerCase())) {
      continue;
    }

    // Skip tokens that contain weird characters
    if (!/^[\w._-]+$/.test(token)) {
      continue;
    }

    storeToken(token, tokens, dictionary);
    if (token.startsWith('ng')) {
      storeToken(token.substr(2), tokens, dictionary);
    }
  }

  return tokens;
}

function storeToken(token, tokens, dictionary) {
  token = stem(token);
  if (!dictionary.has(token)) {
    dictionary.set(token, dictionary.size);
  }
  tokens.push(dictionary.get(token));
}

function extractMemberTokens(doc, ignoreWords, dictionary) {
  if (!doc) return '';

  let memberContent = [];

  if (doc.members) {
    doc.members.forEach(member => memberContent.push(...tokenize(member.name, ignoreWords, dictionary)));
  }
  if (doc.statics) {
    doc.statics.forEach(member => memberContent.push(...tokenize(member.name, ignoreWords, dictionary)));
  }
  if (doc.extendsClauses) {
    doc.extendsClauses.forEach(clause => memberContent.push(...extractMemberTokens(clause.doc, ignoreWords, dictionary)));
  }
  if (doc.implementsClauses) {
    doc.implementsClauses.forEach(clause => memberContent.push(...extractMemberTokens(clause.doc, ignoreWords, dictionary)));
  }

  return memberContent;
}
