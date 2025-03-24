/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT} from '@angular/common';
import {ApplicationRef, PLATFORM_ID, Provider, Type, ɵsetDocument} from '@angular/core';
import {CLIENT_RENDER_MODE_FLAG} from '@angular/core/src/hydration/api';
import {getComponentDef} from '@angular/core/src/render3/def_getters';
import {
  bootstrapApplication,
  HydrationFeature,
  HydrationFeatureKind,
  provideClientHydration,
} from '@angular/platform-browser';

/**
 * The name of the attribute that contains a slot index
 * inside the TransferState storage where hydration info
 * could be found.
 */
const NGH_ATTR_NAME = 'ngh';
const EMPTY_TEXT_NODE_COMMENT = 'ngetn';
const TEXT_NODE_SEPARATOR_COMMENT = 'ngtns';

const NGH_ATTR_REGEXP = new RegExp(` ${NGH_ATTR_NAME}=".*?"`, 'g');
const EMPTY_TEXT_NODE_REGEXP = new RegExp(`<!--${EMPTY_TEXT_NODE_COMMENT}-->`, 'g');
const TEXT_NODE_SEPARATOR_REGEXP = new RegExp(`<!--${TEXT_NODE_SEPARATOR_COMMENT}-->`, 'g');

/**
 * Drop utility attributes such as `ng-version`, `ng-server-context` and `ngh`,
 * so that it's easier to make assertions in tests.
 */
export function stripUtilAttributes(html: string, keepNgh: boolean): string {
  html = html
    .replace(/ ng-version=".*?"/g, '')
    .replace(/ ng-server-context=".*?"/g, '')
    .replace(/ ng-reflect-(.*?)=".*?"/g, '')
    .replace(/ _nghost(.*?)=""/g, '')
    .replace(/ _ngcontent(.*?)=""/g, '');
  if (!keepNgh) {
    html = html
      .replace(NGH_ATTR_REGEXP, '')
      .replace(EMPTY_TEXT_NODE_REGEXP, '')
      .replace(TEXT_NODE_SEPARATOR_REGEXP, '');
  }
  return html;
}

/**
 * Extracts a portion of HTML located inside of the `<body>` element.
 * This content belongs to the application view (and supporting TransferState
 * scripts) rendered on the server.
 */
export function getAppContents(html: string): string {
  const result = stripUtilAttributes(html, true).match(/<body>(.*?)<\/body>/s);
  return result ? result[1] : html;
}

/**
 * Converts a static HTML to a DOM structure.
 *
 * @param html the rendered html in test
 * @param doc the document object
 * @returns a div element containing a copy of the app contents
 */
function convertHtmlToDom(html: string, doc: Document): HTMLElement {
  const contents = getAppContents(html);
  const container = doc.createElement('div');
  container.innerHTML = contents;
  return container;
}

/**
 * Reset TView, so that we re-enter the first create pass as
 * we would normally do when we hydrate on the client. Otherwise,
 * hydration info would not be applied to T data structures.
 */
export function resetTViewsFor(...types: Type<unknown>[]) {
  for (const type of types) {
    getComponentDef(type)!.tView = null;
  }
}

export function hydrate(
  doc: Document,
  component: Type<unknown>,
  options: {
    envProviders?: Provider[];
    hydrationFeatures?: () => HydrationFeature<HydrationFeatureKind>[];
  } = {},
) {
  const {envProviders = [], hydrationFeatures = () => []} = options;

  // Apply correct reference to the `document` object,
  // which will be used by runtime.
  ɵsetDocument(doc);

  // Define `document` to make `DefaultDomRenderer2` work, since it
  // references `document` directly to create style tags.
  global.document = doc;

  const providers = [
    ...envProviders,
    {provide: PLATFORM_ID, useValue: 'browser'},
    {provide: DOCUMENT, useFactory: () => doc},
    provideClientHydration(...hydrationFeatures()),
  ];

  return bootstrapApplication(component, {providers});
}

export function insertDomInDocument(doc: Document, html: string) {
  // Get HTML contents of the `<app>`, create a DOM element and append it into the body.
  const container = convertHtmlToDom(html, doc);

  // If there was a client render mode marker present in HTML - apply it to the <body>
  // element as well.
  const hasClientModeMarker = new RegExp(` ${CLIENT_RENDER_MODE_FLAG}`, 'g').test(html);
  if (hasClientModeMarker) {
    doc.body.setAttribute(CLIENT_RENDER_MODE_FLAG, '');
  }

  Array.from(container.childNodes).forEach((node) => doc.body.appendChild(node));
}

/**
 * This prepares the environment before hydration begins.
 *
 * @param doc the document object
 * @param html the server side rendered DOM string to be hydrated
 * @returns a promise with the application ref
 */
export function prepareEnvironment(doc: Document, html: string) {
  insertDomInDocument(doc, html);
  globalThis.document = doc;
  const scripts = doc.getElementsByTagName('script');
  for (const script of Array.from(scripts)) {
    if (script?.textContent?.startsWith('window.__jsaction_bootstrap')) {
      eval(script.textContent);
    }
  }
}

/**
 * This bootstraps an application with existing html and enables hydration support
 * causing hydration to be invoked.
 *
 * @param html the server side rendered DOM string to be hydrated
 * @param component the root component
 * @param envProviders the environment providers
 * @returns a promise with the application ref
 */
export async function prepareEnvironmentAndHydrate(
  doc: Document,
  html: string,
  component: Type<unknown>,
  options?: {
    envProviders?: Provider[];
    hydrationFeatures?: () => HydrationFeature<HydrationFeatureKind>[];
  },
): Promise<ApplicationRef> {
  prepareEnvironment(doc, html);
  return hydrate(doc, component, options);
}

/**
 * Clears document contents to have a clean state for the next test.
 */
export function clearDocument(doc: Document) {
  doc.body.textContent = '';
  doc.body.removeAttribute(CLIENT_RENDER_MODE_FLAG);
}
