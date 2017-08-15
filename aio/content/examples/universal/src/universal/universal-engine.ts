/**
 * Node Express template engine for Universal apps
 */
import * as fs from 'fs';
import { Request } from 'express';

import { renderModuleFactory } from '@angular/platform-server';
import { APP_BASE_HREF } from '@angular/common';

const templateCache: { [key: string]: string } = {}; // page templates
const outputCache: { [key: string]: string } = {};   // rendered pages

export function universalEngine(setupOptions: any) {

  // Express template engine middleware
  return function (
    filePath: string,
    options: { req: Request },
    callback: (err: Error, html: string) => void) {

    const { req } = options;
    const routeUrl = req.url;

    const html = outputCache[routeUrl];
    if (html) {
      // return already-built page for this url
      console.log('from cache: ' + routeUrl);
      callback(null, html);
      return;
    }

    console.log('building: ' + routeUrl);
    let template = templateCache[filePath];
    if (!template) {
      template = fs.readFileSync(filePath).toString();
      templateCache[filePath] = template;
    }

    const { appModuleFactory } = setupOptions;
    const origin = getOrigin(req);

    // render the page
    // #docregion render
    renderModuleFactory(appModuleFactory, {
      document: template,
      url: routeUrl,
      extraProviders: [
        { provide: APP_BASE_HREF, useValue: origin }
      ]
    })
    .then(page => {
      outputCache[routeUrl] = page;
      callback(null, page);
    });
    // #enddocregion render
  };
}

function getOrigin(req: Request) {
  // e.g., http://localhost:3200/
  return `${req.protocol}://${req.hostname}:${req.connection.address().port}/`;
}
