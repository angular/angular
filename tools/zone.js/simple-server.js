/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const http = require('http');
const path = require('path');
const fs = require('fs');
let server; 

const localFolder = __dirname;

function requestHandler(req, res) {
  if (req.url === '/close') {
    res.end('server closing');
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  } else {
		const file = localFolder + req.url;
 
		fs.readFile(file, function(err, contents) {
			if(!err){
				res.end(contents);
			} else {
		    res.writeHead(404, {'Content-Type': 'text/html'});
		    res.end('<h1>404, Not Found!</h1>');
			};
		});
	};
};
 
server = http.createServer(requestHandler).listen(8080);