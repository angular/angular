'use strict';

/* eslint-env worker */
/* global importScripts, lunr */

var SEARCH_TERMS_URL = '/generated/docs/app/search-data.json';

// NOTE: This needs to be kept in sync with `ngsw-manifest.json`.
importScripts('https://unpkg.com/lunr@0.7.2/lunr.min.js');

var index = createIndex();
var pages = {};

self.onmessage = handleMessage;

// Create the lunr index - the docs should be an array of objects, each object containing
// the path and search terms for a page
function createIndex() {
  return lunr(/** @this */function() {
    this.ref('path');
    this.field('titleWords', {boost: 50});
    this.field('members', {boost: 40});
    this.field('keywords', {boost: 20});
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
        loadIndex(searchInfo);
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
  // Store the pages data to be used in mapping query results back to pages
  // Add search terms from each page to the search index
  searchInfo.forEach(function(page) {
    index.add(page);
    pages[page.path] = page;
  });
}

// Query the index and return the processed results
function queryIndex(query) {
  // Only return the array of paths to pages
  return index.search(query).map(function(hit) { return pages[hit.ref]; });
}
