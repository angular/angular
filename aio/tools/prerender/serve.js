'use strict';

// Imports
const fs = require('fs');
const http = require('http');
const path = require('path');
const { BASE_URL, DIST_DIR, PORT } = require('./constants');

// Constants
const CONTENT_TYPES = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};
const CACHE = {};
const VERBOSE = process.argv.includes('--verbose');

// Helpers
const urlToFile = url => path.join(DIST_DIR, url);

const getFile = filePath => new Promise((resolve, reject) => CACHE.hasOwnProperty(filePath) ?
  resolve(CACHE[filePath]) :
  fs.readFile(filePath, 'utf-8', (err, content) => err ? reject(err) : resolve(CACHE[filePath] = content)));

const middleware = (req, res) => {
  const method = req.method;
  let url = req.url;

  if (VERBOSE) console.log(`Request: ${method} ${url}`);
  if (method !== 'GET') return;

  if (url.endsWith('/')) url += 'index';
  if (!url.includes('.')) url += '.html';

  let filePath = urlToFile(url);
  if (!fs.existsSync(filePath)) filePath = urlToFile('index.html');

  getFile(filePath).
    then(content => {
      const contentType = CONTENT_TYPES[path.extname(filePath)] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.end(content);
    }).
    catch(err => {
      console.error(err);
      res.statusCode = 500;
      res.end(http.STATUS_CODES[500]);
    });
};

// Run
const server = http.
  createServer(middleware).
  on('error', err => console.error(err)).
  on('listening', () => console.log(`Server listening at ${BASE_URL}.`)).
  listen(PORT);


