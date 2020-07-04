/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

'use strict';

var fs = require('fs');
var http = require('http');
var BrowserStackTunnel = require('browserstacktunnel-wrapper');

var HOSTNAME = 'localhost';
var PORTS = [9876, 9877];
var ACCESS_KEY = process.env.BROWSER_STACK_ACCESS_KEY;
var READY_FILE = process.env.BROWSER_PROVIDER_READY_FILE;
var TUNNEL_IDENTIFIER = process.env.TRAVIS_JOB_NUMBER;

// We need to start fake servers, otherwise the tunnel does not start.
var fakeServers = [];
var hosts = [];

PORTS.forEach(function(port) {
  fakeServers.push(http.createServer(function() {}).listen(port));
  hosts.push({name: HOSTNAME, port: port, sslFlag: 0});
});

var tunnel =
    new BrowserStackTunnel({key: ACCESS_KEY, localIdentifier: TUNNEL_IDENTIFIER, hosts: hosts});

console.info('Starting tunnel on ports', PORTS.join(', '));
tunnel.start(function(error) {
  if (error) {
    console.error('Can not establish the tunnel', error);
  } else {
    console.info('Tunnel established.');
    fakeServers.forEach(function(server) {
      server.close();
    });

    if (READY_FILE) {
      fs.writeFile(READY_FILE, '');
    }
  }
});

tunnel.on('error', function(error) {
  console.error(error);
});


// TODO(i): we should properly stop the tunnel when tests are done.
// tunnel.stop(function(error) {
//   if (error) {
//     console.log(error);
//   } else {
//     console.log('browserStack tunnel has stopped');
//   }
//});
