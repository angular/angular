import { enableProdMode } from '@angular/core';
import { renderModule } from '@angular/platform-server';
import { createDocument } from 'domino';
import { readFileSync } from 'fs';
import 'zone.js/fesm2015/zone-node.js';
import { AppModule } from './app.js';

// Function to configure the global DOM environment using 'domino'
function configureGlobalDOM() {
  const indexHtml = readFileSync('./index.html', 'utf-8');
  const win = createDocument(indexHtml).defaultView;
  global['window'] = win;
  global['document'] = win.document;
  global['navigator'] = win.navigator;
}

// Function to render the Angular app and check for a specific pattern in the HTML
async function renderApp() {
  const html = await renderModule(AppModule, {
    document: '<test-app></test-app>',
    url: '/',
  });

  if (/>0:0</.test(html)) {
    process.exitCode = 0;
  } else {
    console.error('html was', html);
    process.exitCode = 1;
  }
}

// Configure the global DOM environment
configureGlobalDOM();

// Enable production mode in Angular
enableProdMode();

// Render the Angular app and handle errors
renderApp().catch(err => {
  console.error(err);
  process.exitCode = 2;
});
