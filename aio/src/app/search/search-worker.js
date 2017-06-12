'use strict';

/* eslint-env worker */
/* global importScripts, lunr */

var SEARCH_TERMS_URL = '/generated/docs/app/search-data.json';

// NOTE: This needs to be kept in sync with `ngsw-manifest.json`.
importScripts('/assets/js/lunr.min.js');

var index;
var pages = {};

self.onmessage = handleMessage;

// Create the lunr index - the docs should be an array of objects, each object containing
// the path and search terms for a page
function createIndex(addFn) {
  return lunr(/** @this */function() {
    this.ref('path');
    this.field('titleWords', {boost: 50});
    this.field('members', {boost: 40});
    this.field('keywords', {boost: 20});
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

  // The JSON file that is loaded should be an array of SearchTerms:
  //
  // export interface SearchTerms {
  //   path: string;
  //   type: string,
  //   titleWords: string;
  //   keyWords: string;
  // }

  var searchDataRequest = new XMLHttpRequest();
  searchDataRequest.onload = function() {
    callback(JSON.parse(this.responseText));
  };
  searchDataRequest.open('GET', url);
  searchDataRequest.send();
}


// Create the search index from the searchInfo which contains the information about each page to be indexed
function loadIndex(searchInfo) {
  return function(index) {
    // Store the pages data to be used in mapping query results back to pages
    // Add search terms from each page to the search index
    searchInfo.forEach(function(page) {
      index.add(page);
      pages[page.path] = page;
    });
  };
}

// Query the index and return the processed results
function queryIndex(query) {
  // The index requires the query to be lowercase
  var terms = query.toLowerCase().split(/\s+/);
  var results = index.query(function(qb) {
    terms.forEach(function(term) {
      // Only include terms that are longer than 2 characters, if there is more than one term
      // Add trailing wildcard to each term so that it will match more results
      if (terms.length === 1 || term.trim().length > 2) {
        qb.term(term, { wildcard: lunr.Query.wildcard.TRAILING });
      }
    });
  });
  // Only return the array of paths to pages
  return results.map(function(hit) { return pages[hit.ref]; });
}
