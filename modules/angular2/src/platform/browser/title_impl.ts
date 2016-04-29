import {DOM} from 'angular2/src/platform/dom/dom_adapter';

/**
 * A service that can be used to get and set the title of a current HTML document.
 *
 * When an Angular 2 application is not bootstrapped on the entire HTML document (`<html>` tag)
 * it is not possible to bind to the `text` property of the `HTMLTitleElement` elements
 * (representing the `<title>` tag). Instead, this service can be used to set and get the current
 * title value.
 */
export class TitleImpl {
  /**
   * Get the title of the current HTML document.
   * @returns {string}
   */
  getTitle(): string { return DOM.getTitle(); }

  /**
   * Set the title of the current HTML document.
   * @param newTitle
   */
  setTitle(newTitle: string) { DOM.setTitle(newTitle); }
}
