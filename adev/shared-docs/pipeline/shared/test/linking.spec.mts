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
});
