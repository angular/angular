/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var domino = require('domino');
var mockRequire = require('mock-require');
var nativeTimeout = setTimeout;
require('./zone-mix.umd');
mockRequire('electron', {
  desktopCapturer: {
    getSources: function(callback) {
      nativeTimeout(callback);
    }
  },
  shell: {
    openExternal: function(callback) {
      nativeTimeout(callback);
    }
  },
  ipcRenderer: {
    on: function(callback) {
      nativeTimeout(callback);
    }
  },
});
require('./zone-patch-electron.umd');
var electron = require('electron');
var zone = Zone.current.fork({name: 'zone'});
zone.run(function() {
  electron.desktopCapturer.getSources(function() {
    if (Zone.current.name !== 'zone') {
      process.exit(1);
    }
  });
  electron.shell.openExternal(function() {
    console.log('shell', Zone.current.name);
    if (Zone.current.name !== 'zone') {
      process.exit(1);
    }
  });
  electron.ipcRenderer.on(function() {
    if (Zone.current.name !== 'zone') {
      process.exit(1);
    }
  });
});
