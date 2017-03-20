import { Injectable } from '@angular/core';

/**
 * Simple wrapper around the prettify.js library
 */
export class PrettyPrinter {
  formatCode(code: String, language?: string, linenums?: number | boolean) {
    return window['prettyPrintOne'](code, language, linenums);
  }
}
