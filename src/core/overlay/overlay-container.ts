

/**
 * Create the overlay container element, which is simply a div
 * with the 'md-overlay-container' class on the document body.
 */
export function createOverlayContainer(): Element {
  let container = document.createElement('div');
  container.classList.add('md-overlay-container');
  document.body.appendChild(container);
  return container;
}
