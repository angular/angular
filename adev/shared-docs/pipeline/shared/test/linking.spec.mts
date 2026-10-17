/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  type ApiEntries,
  type ApiManifest,
  getSymbolUrl,
  mapManifestToEntries,
} from '../linking.mjs';

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

describe('getSymbolUrl exemptions', () => {
  it('should not link the generic validator names, only the call', () => {
    const apiEntries = {
      email: {moduleName: 'forms/signals', entryType: 'function'},
      required: {moduleName: 'forms/signals', entryType: 'function'},
    };

    expect(getSymbolUrl('email', apiEntries)).toBeUndefined();
    expect(getSymbolUrl('required', apiEntries)).toBeUndefined();
    expect(getSymbolUrl('email.value', apiEntries)).toBeUndefined();
    expect(getSymbolUrl('email()', apiEntries)).toBe('/api/forms/signals/email');
  });
});

describe('mapManifestToEntries', () => {
  const mapEntries = (manifest: ApiManifest): ApiEntries =>
    JSON.parse(JSON.stringify(mapManifestToEntries(manifest)));

  it('should map entries and their aliases to the declaring class', () => {
    const entries = mapEntries([
      {
        moduleName: '@angular/aria/combobox',
        entries: [{name: 'Combobox', aliases: ['ngCombobox']}, {name: 'ComboboxInput'}],
      },
    ]);

    expect(entries['Combobox']).toEqual({moduleName: 'aria/combobox'});
    expect(entries['ngCombobox']).toEqual({moduleName: 'aria/combobox', targetSymbol: 'Combobox'});
  });

  it('should link an alias claimed by several directives to the one named after it', () => {
    const entries = mapEntries([
      {
        moduleName: '@angular/forms',
        entries: [
          {name: 'NgModel', aliases: ['ngModel']},
          {name: 'FormControlDirective', aliases: ['formControl']},
          {name: 'FormControlName', aliases: ['formControlName']},
          {
            name: 'SelectMultipleControlValueAccessor',
            aliases: ['multiple', 'ngModel', 'formControl', 'formControlName'],
          },
        ],
      },
      {
        moduleName: '@angular/router',
        entries: [
          {name: 'RouterLink', aliases: ['routerLink']},
          {name: 'RouterLinkWithHref', aliases: ['routerLink']},
        ],
      },
    ]);

    expect(entries['ngModel']).toEqual({moduleName: 'forms', targetSymbol: 'NgModel'});
    expect(entries['formControl']).toEqual({
      moduleName: 'forms',
      targetSymbol: 'FormControlDirective',
    });
    expect(entries['formControlName']).toEqual({
      moduleName: 'forms',
      targetSymbol: 'FormControlName',
    });
    expect(entries['routerLink']).toEqual({moduleName: 'router', targetSymbol: 'RouterLink'});
  });

  it('should count an alias listed twice by the same directive as one claimant', () => {
    const entries = mapEntries([
      {
        moduleName: '@angular/forms',
        entries: [{name: 'Switcher', aliases: ['toggle', 'toggle']}],
      },
    ]);

    expect(entries['toggle']).toEqual({moduleName: 'forms', targetSymbol: 'Switcher'});
  });

  it('should match an alias to a class named without the ng prefix', () => {
    const entries = mapEntries([
      {
        moduleName: '@angular/aria/tabs',
        entries: [
          {name: 'TabList', aliases: ['ngTabList']},
          {name: 'TabPanel', aliases: ['ngTabList', 'ngTabPanel']},
        ],
      },
    ]);

    expect(entries['ngTabList']).toEqual({moduleName: 'aria/tabs', targetSymbol: 'TabList'});
    expect(entries['ngTabPanel']).toEqual({moduleName: 'aria/tabs', targetSymbol: 'TabPanel'});
  });

  it('should not link an alias that no claimant is named after', () => {
    const entries = mapEntries([
      {
        moduleName: '@angular/forms',
        entries: [
          {name: 'NgForm', aliases: ['formArray']},
          {name: 'NgControlStatusGroup', aliases: ['formArray']},
        ],
      },
    ]);

    expect(entries['formArray']).toBeUndefined();
  });

  it('should not let an alias replace an entry with the same name', () => {
    const entries = mapEntries([
      {
        moduleName: '@angular/forms',
        entries: [{name: 'EmailValidator', aliases: ['email']}],
      },
      {
        moduleName: '@angular/forms/signals',
        entries: [{name: 'email'}],
      },
    ]);

    expect(entries['email']).toEqual({moduleName: 'forms/signals'});
  });

  it('should drop entries that share a name across packages', () => {
    const entries = mapEntries([
      {moduleName: '@angular/core', entries: [{name: 'Shared'}]},
      {moduleName: '@angular/common', entries: [{name: 'Shared'}]},
    ]);

    expect(entries['Shared']).toBeUndefined();
  });
});
