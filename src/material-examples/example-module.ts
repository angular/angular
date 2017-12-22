
/* tslint:disable */
/** DO NOT MANUALLY EDIT THIS FILE, IT IS GENERATED VIA GULP 'build-examples-module' */
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ExampleMaterialModule} from './material-module';

export interface LiveExample {
  title: string;
  component: any;
  additionalFiles?: string[];
  selectorName?: string;
}

import {AutocompleteDisplayExample} from './autocomplete-display/autocomplete-display-example';
import {AutocompleteFilterExample} from './autocomplete-filter/autocomplete-filter-example';
import {AutocompleteOverviewExample} from './autocomplete-overview/autocomplete-overview-example';
import {AutocompleteSimpleExample} from './autocomplete-simple/autocomplete-simple-example';
import {ButtonOverviewExample} from './button-overview/button-overview-example';
import {ButtonToggleExclusiveExample} from './button-toggle-exclusive/button-toggle-exclusive-example';
import {ButtonToggleOverviewExample} from './button-toggle-overview/button-toggle-overview-example';
import {ButtonTypesExample} from './button-types/button-types-example';
import {CardFancyExample} from './card-fancy/card-fancy-example';
import {CardOverviewExample} from './card-overview/card-overview-example';
import {CdkTableBasicExample} from './cdk-table-basic/cdk-table-basic-example';
import {CheckboxConfigurableExample} from './checkbox-configurable/checkbox-configurable-example';
import {CheckboxOverviewExample} from './checkbox-overview/checkbox-overview-example';
import {ChipsInputExample} from './chips-input/chips-input-example';
import {ChipsOverviewExample} from './chips-overview/chips-overview-example';
import {ChipsStackedExample} from './chips-stacked/chips-stacked-example';
import {DatepickerApiExample} from './datepicker-api/datepicker-api-example';
import {DatepickerDisabledExample} from './datepicker-disabled/datepicker-disabled-example';
import {DatepickerEventsExample} from './datepicker-events/datepicker-events-example';
import {DatepickerFilterExample} from './datepicker-filter/datepicker-filter-example';
import {DatepickerFormatsExample} from './datepicker-formats/datepicker-formats-example';
import {DatepickerLocaleExample} from './datepicker-locale/datepicker-locale-example';
import {DatepickerMinMaxExample} from './datepicker-min-max/datepicker-min-max-example';
import {DatepickerMomentExample} from './datepicker-moment/datepicker-moment-example';
import {DatepickerOverviewExample} from './datepicker-overview/datepicker-overview-example';
import {DatepickerStartViewExample} from './datepicker-start-view/datepicker-start-view-example';
import {DatepickerTouchExample} from './datepicker-touch/datepicker-touch-example';
import {DatepickerValueExample} from './datepicker-value/datepicker-value-example';
import {DialogContentExampleDialog,DialogContentExample} from './dialog-content/dialog-content-example';
import {DialogDataExampleDialog,DialogDataExample} from './dialog-data/dialog-data-example';
import {DialogElementsExampleDialog,DialogElementsExample} from './dialog-elements/dialog-elements-example';
import {DialogOverviewExampleDialog,DialogOverviewExample} from './dialog-overview/dialog-overview-example';
import {DividerOverviewExample} from './divider-overview/divider-overview-example';
import {ElevationOverviewExample} from './elevation-overview/elevation-overview-example';
import {ExpansionOverviewExample} from './expansion-overview/expansion-overview-example';
import {ExpansionStepsExample} from './expansion-steps/expansion-steps-example';
import {MyTelInput,FormFieldCustomControlExample} from './form-field-custom-control/form-field-custom-control-example';
import {FormFieldErrorExample} from './form-field-error/form-field-error-example';
import {FormFieldHintExample} from './form-field-hint/form-field-hint-example';
import {FormFieldLabelExample} from './form-field-label/form-field-label-example';
import {FormFieldOverviewExample} from './form-field-overview/form-field-overview-example';
import {FormFieldPrefixSuffixExample} from './form-field-prefix-suffix/form-field-prefix-suffix-example';
import {FormFieldThemingExample} from './form-field-theming/form-field-theming-example';
import {GridListDynamicExample} from './grid-list-dynamic/grid-list-dynamic-example';
import {GridListOverviewExample} from './grid-list-overview/grid-list-overview-example';
import {IconOverviewExample} from './icon-overview/icon-overview-example';
import {IconSvgExample} from './icon-svg-example/icon-svg-example';
import {InputAutosizeTextareaExample} from './input-autosize-textarea/input-autosize-textarea-example';
import {InputClearableExample} from './input-clearable/input-clearable-example';
import {InputErrorStateMatcherExample} from './input-error-state-matcher/input-error-state-matcher-example';
import {InputErrorsExample} from './input-errors/input-errors-example';
import {InputFormExample} from './input-form/input-form-example';
import {InputHintExample} from './input-hint/input-hint-example';
import {InputOverviewExample} from './input-overview/input-overview-example';
import {InputPrefixSuffixExample} from './input-prefix-suffix/input-prefix-suffix-example';
import {ListOverviewExample} from './list-overview/list-overview-example';
import {ListSectionsExample} from './list-sections/list-sections-example';
import {ListSelectionExample} from './list-selection/list-selection-example';
import {MenuIconsExample} from './menu-icons/menu-icons-example';
import {MenuOverviewExample} from './menu-overview/menu-overview-example';
import {NestedMenuExample} from './nested-menu/nested-menu-example';
import {PaginatorConfigurableExample} from './paginator-configurable/paginator-configurable-example';
import {PaginatorOverviewExample} from './paginator-overview/paginator-overview-example';
import {ProgressBarBufferExample} from './progress-bar-buffer/progress-bar-buffer-example';
import {ProgressBarConfigurableExample} from './progress-bar-configurable/progress-bar-configurable-example';
import {ProgressBarDeterminateExample} from './progress-bar-determinate/progress-bar-determinate-example';
import {ProgressBarIndeterminateExample} from './progress-bar-indeterminate/progress-bar-indeterminate-example';
import {ProgressBarQueryExample} from './progress-bar-query/progress-bar-query-example';
import {ProgressSpinnerConfigurableExample} from './progress-spinner-configurable/progress-spinner-configurable-example';
import {ProgressSpinnerOverviewExample} from './progress-spinner-overview/progress-spinner-overview-example';
import {RadioNgModelExample} from './radio-ng-model/radio-ng-model-example';
import {RadioOverviewExample} from './radio-overview/radio-overview-example';
import {SelectCustomTriggerExample} from './select-custom-trigger/select-custom-trigger-example';
import {SelectDisabledExample} from './select-disabled/select-disabled-example';
import {SelectErrorStateMatcherExample} from './select-error-state-matcher/select-error-state-matcher-example';
import {SelectFormExample} from './select-form/select-form-example';
import {SelectHintErrorExample} from './select-hint-error/select-hint-error-example';
import {SelectMultipleExample} from './select-multiple/select-multiple-example';
import {SelectNoRippleExample} from './select-no-ripple/select-no-ripple-example';
import {SelectOptgroupExample} from './select-optgroup/select-optgroup-example';
import {SelectOverviewExample} from './select-overview/select-overview-example';
import {SelectPanelClassExample} from './select-panel-class/select-panel-class-example';
import {SelectResetExample} from './select-reset/select-reset-example';
import {SelectValueBindingExample} from './select-value-binding/select-value-binding-example';
import {SidenavAutosizeExample} from './sidenav-autosize/sidenav-autosize-example';
import {SidenavDisableCloseExample} from './sidenav-disable-close/sidenav-disable-close-example';
import {SidenavDrawerOverviewExample} from './sidenav-drawer-overview/sidenav-drawer-overview-example';
import {SidenavFixedExample} from './sidenav-fixed/sidenav-fixed-example';
import {SidenavModeExample} from './sidenav-mode/sidenav-mode-example';
import {SidenavOpenCloseExample} from './sidenav-open-close/sidenav-open-close-example';
import {SidenavOverviewExample} from './sidenav-overview/sidenav-overview-example';
import {SidenavPositionExample} from './sidenav-position/sidenav-position-example';
import {SidenavResponsiveExample} from './sidenav-responsive/sidenav-responsive-example';
import {SlideToggleConfigurableExample} from './slide-toggle-configurable/slide-toggle-configurable-example';
import {SlideToggleFormsExample} from './slide-toggle-forms/slide-toggle-forms-example';
import {SlideToggleOverviewExample} from './slide-toggle-overview/slide-toggle-overview-example';
import {SliderConfigurableExample} from './slider-configurable/slider-configurable-example';
import {SliderOverviewExample} from './slider-overview/slider-overview-example';
import {PizzaPartyComponent,SnackBarComponentExample} from './snack-bar-component/snack-bar-component-example';
import {SnackBarOverviewExample} from './snack-bar-overview/snack-bar-overview-example';
import {SortOverviewExample} from './sort-overview/sort-overview-example';
import {StepperOverviewExample} from './stepper-overview/stepper-overview-example';
import {TableBasicExample} from './table-basic/table-basic-example';
import {TableFilteringExample} from './table-filtering/table-filtering-example';
import {TableHttpExample} from './table-http/table-http-example';
import {TableOverviewExample} from './table-overview/table-overview-example';
import {TablePaginationExample} from './table-pagination/table-pagination-example';
import {TableSelectionExample} from './table-selection/table-selection-example';
import {TableSortingExample} from './table-sorting/table-sorting-example';
import {TabsOverviewExample} from './tabs-overview/tabs-overview-example';
import {TabsTemplateLabelExample} from './tabs-template-label/tabs-template-label-example';
import {ToolbarMultirowExample} from './toolbar-multirow/toolbar-multirow-example';
import {ToolbarOverviewExample} from './toolbar-overview/toolbar-overview-example';
import {TooltipOverviewExample} from './tooltip-overview/tooltip-overview-example';
import {TooltipPositionExample} from './tooltip-position/tooltip-position-example';

export const EXAMPLE_COMPONENTS = {
  'autocomplete-display': {
    title: 'Display value autocomplete',
    component: AutocompleteDisplayExample,
    additionalFiles: null,
    selectorName: null
  },
  'autocomplete-filter': {
    title: 'Filter autocomplete',
    component: AutocompleteFilterExample,
    additionalFiles: null,
    selectorName: null
  },
  'autocomplete-overview': {
    title: 'Autocomplete overview',
    component: AutocompleteOverviewExample,
    additionalFiles: null,
    selectorName: null
  },
  'autocomplete-simple': {
    title: 'Simple autocomplete',
    component: AutocompleteSimpleExample,
    additionalFiles: null,
    selectorName: null
  },
  'button-overview': {
    title: 'Basic buttons',
    component: ButtonOverviewExample,
    additionalFiles: null,
    selectorName: null
  },
  'button-toggle-exclusive': {
    title: 'Exclusive selection',
    component: ButtonToggleExclusiveExample,
    additionalFiles: null,
    selectorName: null
  },
  'button-toggle-overview': {
    title: 'Basic button-toggles',
    component: ButtonToggleOverviewExample,
    additionalFiles: null,
    selectorName: null
  },
  'button-types': {
    title: 'Button varieties',
    component: ButtonTypesExample,
    additionalFiles: null,
    selectorName: null
  },
  'card-fancy': {
    title: 'Card with multiple sections',
    component: CardFancyExample,
    additionalFiles: null,
    selectorName: null
  },
  'card-overview': {
    title: 'Basic cards',
    component: CardOverviewExample,
    additionalFiles: null,
    selectorName: null
  },
  'cdk-table-basic': {
    title: 'Basic CDK data-table',
    component: CdkTableBasicExample,
    additionalFiles: null,
    selectorName: null
  },
  'checkbox-configurable': {
    title: 'Configurable checkbox',
    component: CheckboxConfigurableExample,
    additionalFiles: null,
    selectorName: null
  },
  'checkbox-overview': {
    title: 'Basic checkboxes',
    component: CheckboxOverviewExample,
    additionalFiles: null,
    selectorName: null
  },
  'chips-input': {
    title: 'Chips with input',
    component: ChipsInputExample,
    additionalFiles: null,
    selectorName: null
  },
  'chips-overview': {
    title: 'Basic chips',
    component: ChipsOverviewExample,
    additionalFiles: null,
    selectorName: null
  },
  'chips-stacked': {
    title: 'Stacked chips',
    component: ChipsStackedExample,
    additionalFiles: null,
    selectorName: null
  },
  'datepicker-api': {
    title: 'Datepicker open method ',
    component: DatepickerApiExample,
    additionalFiles: null,
    selectorName: null
  },
  'datepicker-disabled': {
    title: 'Disabled datepicker ',
    component: DatepickerDisabledExample,
    additionalFiles: null,
    selectorName: null
  },
  'datepicker-events': {
    title: 'Datepicker input and change events ',
    component: DatepickerEventsExample,
    additionalFiles: null,
    selectorName: null
  },
  'datepicker-filter': {
    title: 'Datepicker with filter validation ',
    component: DatepickerFilterExample,
    additionalFiles: null,
    selectorName: null
  },
  'datepicker-formats': {
    title: 'Datepicker with custom formats ',
    component: DatepickerFormatsExample,
    additionalFiles: null,
    selectorName: null
  },
  'datepicker-locale': {
    title: 'Datepicker with different locale ',
    component: DatepickerLocaleExample,
    additionalFiles: null,
    selectorName: null
  },
  'datepicker-min-max': {
    title: 'Datepicker with min & max validation ',
    component: DatepickerMinMaxExample,
    additionalFiles: null,
    selectorName: null
  },
  'datepicker-moment': {
    title: 'Datepicker that uses Moment.js dates ',
    component: DatepickerMomentExample,
    additionalFiles: null,
    selectorName: null
  },
  'datepicker-overview': {
    title: 'Basic datepicker ',
    component: DatepickerOverviewExample,
    additionalFiles: null,
    selectorName: null
  },
  'datepicker-start-view': {
    title: 'Datepicker start date ',
    component: DatepickerStartViewExample,
    additionalFiles: null,
    selectorName: null
  },
  'datepicker-touch': {
    title: 'Datepicker touch UI ',
    component: DatepickerTouchExample,
    additionalFiles: null,
    selectorName: null
  },
  'datepicker-value': {
    title: 'Datepicker selected value ',
    component: DatepickerValueExample,
    additionalFiles: null,
    selectorName: null
  },
  'dialog-content': {
    title: 'Dialog with header, scrollable content and actions',
    component: DialogContentExample,
    additionalFiles: ["dialog-content-example-dialog.html"],
    selectorName: 'DialogContentExample, DialogContentExampleDialog'
  },
  'dialog-data': {
    title: 'Injecting data when opening a dialog',
    component: DialogDataExample,
    additionalFiles: ["dialog-data-example-dialog.html"],
    selectorName: 'DialogDataExample, DialogDataExampleDialog'
  },
  'dialog-elements': {
    title: 'Dialog elements',
    component: DialogElementsExample,
    additionalFiles: ["dialog-elements-example-dialog.html"],
    selectorName: 'DialogElementsExample, DialogElementsExampleDialog'
  },
  'dialog-overview': {
    title: 'Dialog Overview',
    component: DialogOverviewExample,
    additionalFiles: ["dialog-overview-example-dialog.html"],
    selectorName: 'DialogOverviewExample, DialogOverviewExampleDialog'
  },
  'divider-overview': {
    title: 'Basic divider',
    component: DividerOverviewExample,
    additionalFiles: null,
    selectorName: null
  },
  'elevation-overview': {
    title: 'Elevation CSS classes',
    component: ElevationOverviewExample,
    additionalFiles: null,
    selectorName: null
  },
  'expansion-overview': {
    title: 'Basic expansion panel',
    component: ExpansionOverviewExample,
    additionalFiles: null,
    selectorName: null
  },
  'expansion-steps': {
    title: 'Expansion panel as accordion',
    component: ExpansionStepsExample,
    additionalFiles: null,
    selectorName: null
  },
  'form-field-custom-control': {
    title: 'Form field with custom telephone number input control. ',
    component: FormFieldCustomControlExample,
    additionalFiles: ["form-field-custom-control-example.html"],
    selectorName: 'FormFieldCustomControlExample, MyTelInput'
  },
  'form-field-error': {
    title: 'Form field with error messages ',
    component: FormFieldErrorExample,
    additionalFiles: null,
    selectorName: null
  },
  'form-field-hint': {
    title: 'Form field with hints ',
    component: FormFieldHintExample,
    additionalFiles: null,
    selectorName: null
  },
  'form-field-label': {
    title: 'Form field with label ',
    component: FormFieldLabelExample,
    additionalFiles: null,
    selectorName: null
  },
  'form-field-overview': {
    title: 'Simple form field ',
    component: FormFieldOverviewExample,
    additionalFiles: null,
    selectorName: null
  },
  'form-field-prefix-suffix': {
    title: 'Form field with prefix & suffix ',
    component: FormFieldPrefixSuffixExample,
    additionalFiles: null,
    selectorName: null
  },
  'form-field-theming': {
    title: 'Form field theming ',
    component: FormFieldThemingExample,
    additionalFiles: null,
    selectorName: null
  },
  'grid-list-dynamic': {
    title: 'Dynamic grid-list',
    component: GridListDynamicExample,
    additionalFiles: null,
    selectorName: null
  },
  'grid-list-overview': {
    title: 'Basic grid-list',
    component: GridListOverviewExample,
    additionalFiles: null,
    selectorName: null
  },
  'icon-overview': {
    title: 'Basic icons',
    component: IconOverviewExample,
    additionalFiles: null,
    selectorName: null
  },
  'icon-svg': {
    title: 'SVG icons',
    component: IconSvgExample,
    additionalFiles: null,
    selectorName: null
  },
  'input-autosize-textarea': {
    title: 'Auto-resizing textarea ',
    component: InputAutosizeTextareaExample,
    additionalFiles: null,
    selectorName: null
  },
  'input-clearable': {
    title: 'Input with a clear button',
    component: InputClearableExample,
    additionalFiles: null,
    selectorName: null
  },
  'input-error-state-matcher': {
    title: 'Input with a custom ErrorStateMatcher ',
    component: InputErrorStateMatcherExample,
    additionalFiles: null,
    selectorName: null
  },
  'input-errors': {
    title: 'Input with error messages',
    component: InputErrorsExample,
    additionalFiles: null,
    selectorName: null
  },
  'input-form': {
    title: 'Inputs in a form',
    component: InputFormExample,
    additionalFiles: null,
    selectorName: null
  },
  'input-hint': {
    title: 'Input with hints',
    component: InputHintExample,
    additionalFiles: null,
    selectorName: null
  },
  'input-overview': {
    title: 'Basic Inputs',
    component: InputOverviewExample,
    additionalFiles: null,
    selectorName: null
  },
  'input-prefix-suffix': {
    title: 'Inputs with prefixes and suffixes',
    component: InputPrefixSuffixExample,
    additionalFiles: null,
    selectorName: null
  },
  'list-overview': {
    title: 'Basic list',
    component: ListOverviewExample,
    additionalFiles: null,
    selectorName: null
  },
  'list-sections': {
    title: 'List with sections',
    component: ListSectionsExample,
    additionalFiles: null,
    selectorName: null
  },
  'list-selection': {
    title: 'List with selection',
    component: ListSelectionExample,
    additionalFiles: null,
    selectorName: null
  },
  'menu-icons': {
    title: 'Menu with icons',
    component: MenuIconsExample,
    additionalFiles: null,
    selectorName: null
  },
  'menu-overview': {
    title: 'Basic menu',
    component: MenuOverviewExample,
    additionalFiles: null,
    selectorName: null
  },
  'nested-menu': {
    title: 'Nested menu',
    component: NestedMenuExample,
    additionalFiles: null,
    selectorName: null
  },
  'paginator-configurable': {
    title: 'Configurable paginator',
    component: PaginatorConfigurableExample,
    additionalFiles: null,
    selectorName: null
  },
  'paginator-overview': {
    title: 'Paginator',
    component: PaginatorOverviewExample,
    additionalFiles: null,
    selectorName: null
  },
  'progress-bar-buffer': {
    title: 'Buffer progress-bar',
    component: ProgressBarBufferExample,
    additionalFiles: null,
    selectorName: null
  },
  'progress-bar-configurable': {
    title: 'Configurable progress-bar',
    component: ProgressBarConfigurableExample,
    additionalFiles: null,
    selectorName: null
  },
  'progress-bar-determinate': {
    title: 'Determinate progress-bar',
    component: ProgressBarDeterminateExample,
    additionalFiles: null,
    selectorName: null
  },
  'progress-bar-indeterminate': {
    title: 'Indeterminate progress-bar',
    component: ProgressBarIndeterminateExample,
    additionalFiles: null,
    selectorName: null
  },
  'progress-bar-query': {
    title: 'Query progress-bar',
    component: ProgressBarQueryExample,
    additionalFiles: null,
    selectorName: null
  },
  'progress-spinner-configurable': {
    title: 'Configurable progress spinner',
    component: ProgressSpinnerConfigurableExample,
    additionalFiles: null,
    selectorName: null
  },
  'progress-spinner-overview': {
    title: 'Basic progress-spinner',
    component: ProgressSpinnerOverviewExample,
    additionalFiles: null,
    selectorName: null
  },
  'radio-ng-model': {
    title: 'Radios with ngModel',
    component: RadioNgModelExample,
    additionalFiles: null,
    selectorName: null
  },
  'radio-overview': {
    title: 'Basic radios',
    component: RadioOverviewExample,
    additionalFiles: null,
    selectorName: null
  },
  'select-custom-trigger': {
    title: 'Select with custom trigger text ',
    component: SelectCustomTriggerExample,
    additionalFiles: null,
    selectorName: null
  },
  'select-disabled': {
    title: 'Disabled select ',
    component: SelectDisabledExample,
    additionalFiles: null,
    selectorName: null
  },
  'select-error-state-matcher': {
    title: 'Select with a custom ErrorStateMatcher ',
    component: SelectErrorStateMatcherExample,
    additionalFiles: null,
    selectorName: null
  },
  'select-form': {
    title: 'Select in a form',
    component: SelectFormExample,
    additionalFiles: null,
    selectorName: null
  },
  'select-hint-error': {
    title: 'Select with form field features ',
    component: SelectHintErrorExample,
    additionalFiles: null,
    selectorName: null
  },
  'select-multiple': {
    title: 'Select with multiple selection ',
    component: SelectMultipleExample,
    additionalFiles: null,
    selectorName: null
  },
  'select-no-ripple': {
    title: 'Select with no option ripple ',
    component: SelectNoRippleExample,
    additionalFiles: null,
    selectorName: null
  },
  'select-optgroup': {
    title: 'Select with option groups ',
    component: SelectOptgroupExample,
    additionalFiles: null,
    selectorName: null
  },
  'select-overview': {
    title: 'Basic select',
    component: SelectOverviewExample,
    additionalFiles: null,
    selectorName: null
  },
  'select-panel-class': {
    title: 'Select with custom panel styling',
    component: SelectPanelClassExample,
    additionalFiles: null,
    selectorName: null
  },
  'select-reset': {
    title: 'Select with reset option ',
    component: SelectResetExample,
    additionalFiles: null,
    selectorName: null
  },
  'select-value-binding': {
    title: 'Select with 2-way value binding ',
    component: SelectValueBindingExample,
    additionalFiles: null,
    selectorName: null
  },
  'sidenav-autosize': {
    title: 'Autosize sidenav',
    component: SidenavAutosizeExample,
    additionalFiles: null,
    selectorName: null
  },
  'sidenav-disable-close': {
    title: 'Sidenav with custom escape and backdrop click behavior ',
    component: SidenavDisableCloseExample,
    additionalFiles: null,
    selectorName: null
  },
  'sidenav-drawer-overview': {
    title: 'Basic drawer ',
    component: SidenavDrawerOverviewExample,
    additionalFiles: null,
    selectorName: null
  },
  'sidenav-fixed': {
    title: 'Fixed sidenav ',
    component: SidenavFixedExample,
    additionalFiles: null,
    selectorName: null
  },
  'sidenav-mode': {
    title: 'Sidenav with configurable mode ',
    component: SidenavModeExample,
    additionalFiles: null,
    selectorName: null
  },
  'sidenav-open-close': {
    title: 'Sidenav open & close behavior ',
    component: SidenavOpenCloseExample,
    additionalFiles: null,
    selectorName: null
  },
  'sidenav-overview': {
    title: 'Basic sidenav ',
    component: SidenavOverviewExample,
    additionalFiles: null,
    selectorName: null
  },
  'sidenav-position': {
    title: 'Implicit main content with two sidenavs ',
    component: SidenavPositionExample,
    additionalFiles: null,
    selectorName: null
  },
  'sidenav-responsive': {
    title: 'Responsive sidenav ',
    component: SidenavResponsiveExample,
    additionalFiles: null,
    selectorName: null
  },
  'slide-toggle-configurable': {
    title: 'Configurable slide-toggle',
    component: SlideToggleConfigurableExample,
    additionalFiles: null,
    selectorName: null
  },
  'slide-toggle-forms': {
    title: 'Slide-toggle with forms',
    component: SlideToggleFormsExample,
    additionalFiles: null,
    selectorName: null
  },
  'slide-toggle-overview': {
    title: 'Basic slide-toggles',
    component: SlideToggleOverviewExample,
    additionalFiles: null,
    selectorName: null
  },
  'slider-configurable': {
    title: 'Configurable slider',
    component: SliderConfigurableExample,
    additionalFiles: null,
    selectorName: null
  },
  'slider-overview': {
    title: 'Basic slider',
    component: SliderOverviewExample,
    additionalFiles: null,
    selectorName: null
  },
  'snack-bar-component': {
    title: 'Snack-bar with a custom component',
    component: SnackBarComponentExample,
    additionalFiles: ["snack-bar-component-example-snack.html"],
    selectorName: 'SnackBarComponentExample, PizzaPartyComponent'
  },
  'snack-bar-overview': {
    title: 'Basic snack-bar',
    component: SnackBarOverviewExample,
    additionalFiles: null,
    selectorName: null
  },
  'sort-overview': {
    title: 'Sorting overview',
    component: SortOverviewExample,
    additionalFiles: null,
    selectorName: null
  },
  'stepper-overview': {
    title: 'Stepper overview',
    component: StepperOverviewExample,
    additionalFiles: null,
    selectorName: null
  },
  'table-basic': {
    title: 'Basic table',
    component: TableBasicExample,
    additionalFiles: null,
    selectorName: null
  },
  'table-filtering': {
    title: 'Table with filtering',
    component: TableFilteringExample,
    additionalFiles: null,
    selectorName: null
  },
  'table-http': {
    title: 'Table retrieving data through HTTP',
    component: TableHttpExample,
    additionalFiles: null,
    selectorName: null
  },
  'table-overview': {
    title: 'Data table with sorting, pagination, and filtering.',
    component: TableOverviewExample,
    additionalFiles: null,
    selectorName: null
  },
  'table-pagination': {
    title: 'Table with pagination',
    component: TablePaginationExample,
    additionalFiles: null,
    selectorName: null
  },
  'table-selection': {
    title: 'Table with selection',
    component: TableSelectionExample,
    additionalFiles: null,
    selectorName: null
  },
  'table-sorting': {
    title: 'Table with sorting',
    component: TableSortingExample,
    additionalFiles: null,
    selectorName: null
  },
  'tabs-overview': {
    title: 'Basic tabs',
    component: TabsOverviewExample,
    additionalFiles: null,
    selectorName: null
  },
  'tabs-template-label': {
    title: 'Complex Example',
    component: TabsTemplateLabelExample,
    additionalFiles: null,
    selectorName: null
  },
  'toolbar-multirow': {
    title: 'Multi-row toolbar',
    component: ToolbarMultirowExample,
    additionalFiles: null,
    selectorName: null
  },
  'toolbar-overview': {
    title: 'Basic toolbar',
    component: ToolbarOverviewExample,
    additionalFiles: null,
    selectorName: null
  },
  'tooltip-overview': {
    title: 'Basic tooltip',
    component: TooltipOverviewExample,
    additionalFiles: null,
    selectorName: null
  },
  'tooltip-position': {
    title: 'Tooltip with custom position',
    component: TooltipPositionExample,
    additionalFiles: null,
    selectorName: null
  },
};

export const EXAMPLE_LIST = [
  AutocompleteDisplayExample,
  AutocompleteFilterExample,
  AutocompleteOverviewExample,
  AutocompleteSimpleExample,
  ButtonOverviewExample,
  ButtonToggleExclusiveExample,
  ButtonToggleOverviewExample,
  ButtonTypesExample,
  CardFancyExample,
  CardOverviewExample,
  CdkTableBasicExample,
  CheckboxConfigurableExample,
  CheckboxOverviewExample,
  ChipsInputExample,
  ChipsOverviewExample,
  ChipsStackedExample,
  DatepickerApiExample,
  DatepickerDisabledExample,
  DatepickerEventsExample,
  DatepickerFilterExample,
  DatepickerFormatsExample,
  DatepickerLocaleExample,
  DatepickerMinMaxExample,
  DatepickerMomentExample,
  DatepickerOverviewExample,
  DatepickerStartViewExample,
  DatepickerTouchExample,
  DatepickerValueExample,
  DialogContentExampleDialog,DialogContentExample,
  DialogDataExampleDialog,DialogDataExample,
  DialogElementsExampleDialog,DialogElementsExample,
  DialogOverviewExampleDialog,DialogOverviewExample,
  DividerOverviewExample,
  ElevationOverviewExample,
  ExpansionOverviewExample,
  ExpansionStepsExample,
  MyTelInput,FormFieldCustomControlExample,
  FormFieldErrorExample,
  FormFieldHintExample,
  FormFieldLabelExample,
  FormFieldOverviewExample,
  FormFieldPrefixSuffixExample,
  FormFieldThemingExample,
  GridListDynamicExample,
  GridListOverviewExample,
  IconOverviewExample,
  IconSvgExample,
  InputAutosizeTextareaExample,
  InputClearableExample,
  InputErrorStateMatcherExample,
  InputErrorsExample,
  InputFormExample,
  InputHintExample,
  InputOverviewExample,
  InputPrefixSuffixExample,
  ListOverviewExample,
  ListSectionsExample,
  ListSelectionExample,
  MenuIconsExample,
  MenuOverviewExample,
  NestedMenuExample,
  PaginatorConfigurableExample,
  PaginatorOverviewExample,
  ProgressBarBufferExample,
  ProgressBarConfigurableExample,
  ProgressBarDeterminateExample,
  ProgressBarIndeterminateExample,
  ProgressBarQueryExample,
  ProgressSpinnerConfigurableExample,
  ProgressSpinnerOverviewExample,
  RadioNgModelExample,
  RadioOverviewExample,
  SelectCustomTriggerExample,
  SelectDisabledExample,
  SelectErrorStateMatcherExample,
  SelectFormExample,
  SelectHintErrorExample,
  SelectMultipleExample,
  SelectNoRippleExample,
  SelectOptgroupExample,
  SelectOverviewExample,
  SelectPanelClassExample,
  SelectResetExample,
  SelectValueBindingExample,
  SidenavAutosizeExample,
  SidenavDisableCloseExample,
  SidenavDrawerOverviewExample,
  SidenavFixedExample,
  SidenavModeExample,
  SidenavOpenCloseExample,
  SidenavOverviewExample,
  SidenavPositionExample,
  SidenavResponsiveExample,
  SlideToggleConfigurableExample,
  SlideToggleFormsExample,
  SlideToggleOverviewExample,
  SliderConfigurableExample,
  SliderOverviewExample,
  PizzaPartyComponent,SnackBarComponentExample,
  SnackBarOverviewExample,
  SortOverviewExample,
  StepperOverviewExample,
  TableBasicExample,
  TableFilteringExample,
  TableHttpExample,
  TableOverviewExample,
  TablePaginationExample,
  TableSelectionExample,
  TableSortingExample,
  TabsOverviewExample,
  TabsTemplateLabelExample,
  ToolbarMultirowExample,
  ToolbarOverviewExample,
  TooltipOverviewExample,
  TooltipPositionExample,
];

@NgModule({
  declarations: EXAMPLE_LIST,
  entryComponents: EXAMPLE_LIST,
  imports: [
    ExampleMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ]
})
export class ExampleModule { }
