export const config = {
  // The MDC sidenav hasn't been implemented yet.
  skippedPackages: ['mdc-sidenav'],
  skippedExports: {
    'mdc-chips': [
      // These components haven't been implemented for MDC due to a different accessibility pattern.
      'MatChipListChange',
      'MatChipList'
    ],
    'mdc-chips/testing': [
      // Test harness code for a component that hasn't been implemented for MDC.
      'MatChipListHarness',
      'ChipListHarnessFilters'
    ],
    'mdc-autocomplete': [
      // Private base classes that are only exported for MDC.
      '_MatAutocompleteBase',
      '_MatAutocompleteTriggerBase',
      '_MatAutocompleteOriginBase'
    ],
    'mdc-autocomplete/testing': [
      // Private base classes that are only exported for MDC.
      '_MatAutocompleteHarnessBase'
    ],
    'mdc-core': [
      // Private base classes that are only exported for MDC.
      '_MatOptionBase',
      '_MatOptgroupBase'
    ],
    'mdc-dialog': [
      // Private base classes and utility function that are only exported for MDC.
      '_MatDialogBase',
      '_MatDialogContainerBase',
      '_closeDialogVia',
    ],
    'mdc-menu': [
      // Private base class that is only exported for MDC.
      '_MatMenuBase'
    ],
    'mdc-menu/testing': [
      // Private base class that is only exported for MDC.
      '_MatMenuHarnessBase',
      '_MatMenuItemHarnessBase'
    ],
    'mdc-paginator': [
      // Private base class that is only exported for MDC.
      '_MatPaginatorBase'
    ],
    'mdc-radio': [
      // Private base classes that are only exported for MDC.
      '_MatRadioGroupBase',
      '_MatRadioButtonBase',
    ],
    'mdc-radio/testing': [
      // Private base classes that are only exported for MDC.
      '_MatRadioGroupHarnessBase',
      '_MatRadioButtonHarnessBase',
    ],
    'mdc-select': [
      // Private base class that is only exported for MDC.
      '_MatSelectBase'
    ],
    'mdc-select/testing': [
      // Private base class that is only exported for MDC.
      '_MatSelectHarnessBase'
    ],
    'mdc-slide-toggle': [
      // Private module used to provide some common functionality.
      '_MatSlideToggleRequiredValidatorModule'
    ],
    'mdc-snack-bar': [
      // Private interface used to ensure consistency for MDC package.
      '_SnackBarContainer'
    ],
    'mdc-tabs': [
      // Private base classes that are only exported for MDC.
      '_MatTabBodyBase',
      '_MatTabHeaderBase',
      '_MatTabNavBase',
      '_MatTabLinkBase',
      '_MatTabGroupBase'
    ],
    'mdc-table': [
      // Private symbols that are only exported for MDC.
      '_MatTableDataSource',
      '_MAT_TEXT_COLUMN_TEMPLATE'
    ],
    'mdc-checkbox/testing': [
      // Private symbols that are only exported for MDC.
      '_MatCheckboxHarnessBase'
    ]
  }
};
