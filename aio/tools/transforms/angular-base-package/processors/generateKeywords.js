'use strict';

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
    async $process(docs) {
      const {stemmer: stem} = await import('stemmer');


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


      for (const doc of filteredDocs) {
        // Search each top level property of the document for search terms
        let mainTokens = [];
        for (const key of Object.keys(doc)) {
          const value = doc[key];
          if (isString(value) && !propertiesToIgnore.has(key)) {
            mainTokens.push(...tokenize(value, ignoreWords, dictionary));
          }
        }

        const memberTokens = extractMemberTokens(doc, ignoreWords, dictionary);

        // Extract all the keywords from the headings
        let headingTokens = [];
        if (doc.vFile && doc.vFile.headings) {
          for (const headingTag of Object.keys(doc.vFile.headings)) {
            for (const headingText of doc.vFile.headings[headingTag]) {
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
        dictionary: Array.from(dictionary.keys()).join(' '),
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

      return docs;

      // Helpers
      function tokenize(text, ignoreWords, dictionary) {
        // Split on whitespace and things that are likely to be HTML tags (this is not exhaustive but reduces the unwanted tokens that are indexed).
        const rawTokens = text.split(new RegExp(
                                            '[\\s/]+' +                                // whitespace
                                            '|' +                                      // or
                                            '</?[a-z]+(?:\\s+\\w+(?:="[^"]+")?)*/?>',  // simple HTML tags (e.g. <td>, <hr/>, </table>, etc.)
                                            'ig'));
        const tokens = [];
        for (let token of rawTokens) {
          token = token.trim();

          // Trim unwanted trivia characters from the start and end of the token
          const TRIVIA_CHARS = '[\\s_"\'`({[<$*)}\\]>.,-]';
          // Tokens can contain letters, numbers, underscore, dot or hyphen but not at the start or end.
          // The leading TRIVIA_CHARS will capture any leading `.`, '-`' or `_` so we don't have to avoid them in this regular expression.
          // But we do need to ensure we don't capture the at the end of the token.
          const POSSIBLE_TOKEN = '[a-z0-9_.-]*[a-z0-9]';
          token = token.replace(new RegExp(`^${TRIVIA_CHARS}*(${POSSIBLE_TOKEN})${TRIVIA_CHARS}*$`, 'i'), '$1');

          // Skip if blank or in the ignored words list
          if (token === '' || ignoreWords.has(token.toLowerCase())) {
            continue;
          }

          // Skip tokens that contain weird characters
          if (!/^\w[\w.-]*$/.test(token)) {
            continue;
          }

          storeToken(token, tokens, dictionary);
          if (token.startsWith('ng')) {
            // Strip off `ng`, `ng-`, `ng1`, `ng2`, etc
            storeToken(token.replace(/^ng[-12]*/, ''), tokens, dictionary);
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
        if (!doc) return [];

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
    }
  };
};

function isString(value) {
  return typeof value == 'string';
}
