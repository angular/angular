/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/* tslint:disable:no-console  */
require('zone.js/bundles/zone-node.umd.js');

import {enableProdMode, NgModuleFactory} from '@angular/core';
import {renderModuleFactory} from '@angular/platform-server';
import * as express from 'express';

import {HelloWorldServerModuleNgFactory} from './helloworld/app.server.ngfactory';
const helloworld = require('raw-loader!./helloworld/index.html');

import {TransferStateServerModuleNgFactory} from './transferstate/app.server.ngfactory';
const transferstate = require('raw-loader!./transferstate/index.html');

const app = express();

function render<T>(moduleFactory: NgModuleFactory<T>, html: string) {
  return (req, res) => {
    renderModuleFactory(moduleFactory, {
      document: html,
      url: req.url,
    }).then((response) => { res.send(response); });
  };
}

enableProdMode();

// Client bundles will be statically served from the built/ directory.
app.use('/built', express.static('built'));

// Keep the browser logs free of errors.
app.get('/favicon.ico', (req, res) => { res.send(''); });

//-----------ADD YOUR SERVER SIDE RENDERED APP HERE ----------------------
app.get('/helloworld', render(HelloWorldServerModuleNgFactory, helloworld));
app.get('/transferstate', render(TransferStateServerModuleNgFactory, transferstate));

app.listen(4206, function() { console.log('Server listening on port 4206!'); });
