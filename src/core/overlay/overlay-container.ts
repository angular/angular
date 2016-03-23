import {DOM} from '../platform/dom/dom_adapter';


/**
 * Create the overlay container element, which is simply a div
 * with the 'md-overlay-container' class on the document body.
 */
export function createOverlayContainer(): Element {
  let documentBody = DOM.getGlobalEventTarget('body');
  let container = DOM.createElement('div');
  DOM.addClass(container, 'md-overlay-container');
  DOM.appendChild(documentBody, container);
  return container;
}
