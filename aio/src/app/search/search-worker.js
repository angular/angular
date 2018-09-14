'use strict';

/* eslint-env worker */
/* global importScripts, lunr */

var SEARCH_TERMS_URL = '/generated/docs/app/search-data.json';

// NOTE: This needs to be kept in sync with `ngsw-config.json`.
importScripts('/assets/js/lunr.min.js');

var index;
var pages /* : SearchInfo */ = {};

// interface SearchInfo {
//  [key: string]: PageInfo;
// }

// interface PageInfo {
//   path: string;
//   type: string,
//   titleWords: string;
//   keyWords: string;
// }

self.onmessage = handleMessage;

// Create the lunr index - the docs should be an array of objects, each object containing
// the path and search terms for a page
function createIndex(addFn) {
  lunr.QueryLexer.termSeparator = lunr.tokenizer.separator = /\s+/;
  return lunr(/** @this */function() {
    this.ref('path');
    this.field('titleWords', {boost: 10});
    this.field('headingWords', {boost: 5});
    this.field('members', {boost: 4});
    this.field('keywords', {boost: 2});
    addFn(this);
  });
}

// The worker receives a message to load the index and to query the index
function handleMessage(message) {
  var type = message.data.type;
  var id = message.data.id;
  var payload = message.data.payload;
  switch(type) {
    case 'load-index':
      makeRequest(SEARCH_TERMS_URL, function(searchInfo) {
        index = createIndex(loadIndex(searchInfo));
        self.postMessage({type: type, id: id, payload: true});
      });
      break;
    case 'query-index':
      self.postMessage({type: type, id: id, payload: {query: payload, results: queryIndex(payload)}});
      break;
    default:
      self.postMessage({type: type, id: id, payload: {error: 'invalid message type'}})
  }
}

// Use XHR to make a request to the server
function makeRequest(url, callback) {

  // The JSON file that is loaded should be an array of PageInfo:
  var searchDataRequest = new XMLHttpRequest();
  searchDataRequest.onload = function() {
    callback(JSON.parse(this.responseText));
  };
  searchDataRequest.open('GET', url);
  searchDataRequest.send();
}


// Create the search index from the searchInfo which contains the information about each page to be indexed
function loadIndex(searchInfo /*: SearchInfo */) {
  return function(index) {
    // Store the pages data to be used in mapping query results back to pages
    // Add search terms from each page to the search index
    searchInfo.forEach(function(page /*: PageInfo */) {
      index.add(page);
      pages[page.path] = page;
    });
  };
}

// Query the index and return the processed results
function queryIndex(query) {
  try {
    if (query.length) {
      var results = index.search(query);
      if (results.length === 0) {
        // Add a relaxed search in the title for the first word in the query
        // E.g. if the search is "ngCont guide" then we search for "ngCont guide titleWords:ngCont*"
        var titleQuery = 'titleWords:*' + query.split(' ', 1)[0] + '*';
        results = index.search(query + ' ' + titleQuery);
      }
      // Map the hits into info about each page to be returned as results
      return results.map(function(hit) { return pages[hit.ref]; });
    }
  } catch(e) {
    // If the search query cannot be parsed the index throws an error
    // Log it and recover
    console.log(e);
  }
  return [];
}
