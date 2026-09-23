/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {getSymbolUrl} from '../linking.mjs';

describe('getSymbolUrl', () => {
  it('should resolve class names to API URLs', () => {
    const apiEntries = {
      Combobox: {moduleName: 'aria/combobox'},
      AccordionPanel: {moduleName: 'aria/accordion'},
      Grid: {moduleName: 'aria/grid'},
    };

    expect(getSymbolUrl('Combobox', apiEntries)).toBe('/api/aria/combobox/Combobox');
    expect(getSymbolUrl('AccordionPanel', apiEntries)).toBe('/api/aria/accordion/AccordionPanel');
    expect(getSymbolUrl('Grid', apiEntries)).toBe('/api/aria/grid/Grid');
  });

  it('should resolve selector aliases to class names', () => {
    const apiEntries = {
      Combobox: {moduleName: 'aria/combobox'},
      ngCombobox: {moduleName: 'aria/combobox', targetSymbol: 'Combobox'},
      AccordionPanel: {moduleName: 'aria/accordion'},
      ngAccordionPanel: {moduleName: 'aria/accordion', targetSymbol: 'AccordionPanel'},
      GridCell: {moduleName: 'aria/grid'},
      ngGridCell: {moduleName: 'aria/grid', targetSymbol: 'GridCell'},
    };

    expect(getSymbolUrl('ngCombobox', apiEntries)).toBe('/api/aria/combobox/Combobox');
    expect(getSymbolUrl('ngAccordionPanel', apiEntries)).toBe('/api/aria/accordion/AccordionPanel');
    expect(getSymbolUrl('ngGridCell', apiEntries)).toBe('/api/aria/grid/GridCell');
  });

  it('should handle selector aliases with properties', () => {
    const apiEntries = {
      AccordionPanel: {moduleName: 'aria/accordion'},
      ngAccordionPanel: {moduleName: 'aria/accordion', targetSymbol: 'AccordionPanel'},
      ComboboxInput: {moduleName: 'aria/combobox'},
      ngComboboxInput: {moduleName: 'aria/combobox', targetSymbol: 'ComboboxInput'},
    };

    expect(getSymbolUrl('ngAccordionPanel.visible', apiEntries)).toBe(
      '/api/aria/accordion/AccordionPanel#visible',
    );
    expect(getSymbolUrl('ngComboboxInput.value', apiEntries)).toBe(
      '/api/aria/combobox/ComboboxInput#value',
    );
  });

  it('should return undefined for unknown symbols', () => {
    const apiEntries = {
      AccordionPanel: {moduleName: 'aria/accordion'},
      ngAccordionPanel: {moduleName: 'aria/accordion', targetSymbol: 'AccordionPanel'},
    };

    expect(getSymbolUrl('UnknownSymbol', apiEntries)).toBeUndefined();
    expect(getSymbolUrl('unknownSelector', apiEntries)).toBeUndefined();
    expect(getSymbolUrl('ngUnknownDirective', apiEntries)).toBeUndefined();
  });

  it('should only keep the member name in the fragment', () => {
    const apiEntries = {
      By: {moduleName: 'platform-browser'},
      TestBed: {moduleName: 'core/testing'},
      DebugElement: {moduleName: 'core'},
    };

    expect(getSymbolUrl(`By.css('h2:not([highlight])')`, apiEntries)).toBe(
      '/api/platform-browser/By#css',
    );
    expect(getSymbolUrl('TestBed.createComponent<T>', apiEntries)).toBe(
      '/api/core/testing/TestBed#createComponent',
    );
    expect(getSymbolUrl('DebugElement.query(predicate)!', apiEntries)).toBe(
      '/api/core/DebugElement#query',
    );
  });

  it('should not link a property of a plain function', () => {
    const apiEntries = {
      state: {moduleName: 'animations', entryType: 'function'},
      schema: {moduleName: 'forms/signals', entryType: 'function'},
    };

    expect(getSymbolUrl('state.metadata(HELP)', apiEntries)).toBeUndefined();
    expect(getSymbolUrl('schema.json', apiEntries)).toBeUndefined();
    expect(getSymbolUrl('schema', apiEntries)).toBe('/api/forms/signals/schema');
  });

  it('should link a property of an initializer API function to its page', () => {
    const apiEntries = {
      model: {moduleName: 'core', entryType: 'initializer_api_function'},
    };

    expect(getSymbolUrl('model.required', apiEntries)).toBe('/api/core/model');
  });
});
