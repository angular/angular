/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/* tslint:disable:no-console  */
require('zone.js/bundles/zone-node.umd.js');

import {enableProdMode, Type} from '@angular/core';
import {renderModule} from '@angular/platform-server';
import * as express from 'express';

import {HelloWorldServerModule} from './helloworld/app.server';
const {default: helloworld} = require('raw-loader!./helloworld/index.html');

import {TransferStateServerModule} from './transferstate/app.server';
const {default: transferstate} = require('raw-loader!./transferstate/index.html');

import {HttpLazyTransferStateServerModule} from './http-transferstate-lazy/app.server';
const {default: httptransferstatelazy} = require('raw-loader!./http-transferstate-lazy/index.html');

const app = express();

function render(moduleType: Type<any>, html: string) {
  return (req, res) => {
    renderModule(moduleType, {
      document: html,
      url: req.url,
    }).then((response) => {
      res.send(response);
    });
  };
}

enableProdMode();

// Client bundles will be statically served from the built/ directory.
app.use('/webpack-out', express.static('webpack-out'));

// Keep the browser logs free of errors.
app.get('/favicon.ico', (req, res) => {
  res.send('');
});

// Mock API
app.get('/api', (req, res) => {
  res.json({ data: 'API response'});
});

//-----------ADD YOUR SERVER SIDE RENDERED APP HERE ----------------------
app.get('/helloworld', render(HelloWorldServerModule, helloworld));
app.get('/transferstate', render(TransferStateServerModule, transferstate));
app.get('/http-transferstate-lazy', render(HttpLazyTransferStateServerModule, httptransferstatelazy));

app.listen(4206, () => {
  console.log('Server listening on port 4206!');
});
