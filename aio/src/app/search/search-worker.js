'use strict';

/* eslint-env worker */
/* global importScripts, lunr */

importScripts('https://unpkg.com/lunr@0.7.2');

var index = createIndex();
var pages = {};

makeRequest('search-data.json', loadIndex);

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


// Use XHR to make a request to the server
function makeRequest(url, callback) {
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
  self.postMessage({type: 'index-ready'});
}


// The worker receives a message everytime the web app wants to query the index
function handleMessage(message) {
  var id = message.data.id;
  var query = message.data.query;
  var results = queryIndex(query);
  self.postMessage({type: 'query-results', id: id, query: query, results: results});
}


// Query the index and return the processed results
function queryIndex(query) {
  // Only return the array of paths to pages
  return index.search(query).map(function(hit) { return pages[hit.ref]; });
}
