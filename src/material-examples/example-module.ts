
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
import {DatepickerFilterExample} from './datepicker-filter/datepicker-filter-example';
import {DatepickerMinMaxExample} from './datepicker-min-max/datepicker-min-max-example';
import {DatepickerOverviewExample} from './datepicker-overview/datepicker-overview-example';
import {DatepickerStartViewExample} from './datepicker-start-view/datepicker-start-view-example';
import {DatepickerTouchExample} from './datepicker-touch/datepicker-touch-example';
import {DialogContentExampleDialog,DialogContentExample} from './dialog-content/dialog-content-example';
import {DialogDataExampleDialog,DialogDataExample} from './dialog-data/dialog-data-example';
import {DialogElementsExampleDialog,DialogElementsExample} from './dialog-elements/dialog-elements-example';
import {DialogOverviewExampleDialog,DialogOverviewExample} from './dialog-overview/dialog-overview-example';
import {ExpansionOverviewExample} from './expansion-overview/expansion-overview-example';
import {ExpansionStepsExample} from './expansion-steps/expansion-steps-example';
import {MyTelInput,FormFieldCustomControlExample} from './form-field-custom-control/form-field-custom-control-example';
import {FormFieldErrorExample} from './form-field-error/form-field-error-example';
import {FormFieldHintExample} from './form-field-hint/form-field-hint-example';
import {FormFieldOverviewExample} from './form-field-overview/form-field-overview-example';
import {FormFieldPlaceholderExample} from './form-field-placeholder/form-field-placeholder-example';
import {FormFieldPrefixSuffixExample} from './form-field-prefix-suffix/form-field-prefix-suffix-example';
import {FormFieldThemingExample} from './form-field-theming/form-field-theming-example';
import {GridListDynamicExample} from './grid-list-dynamic/grid-list-dynamic-example';
import {GridListOverviewExample} from './grid-list-overview/grid-list-overview-example';
import {IconOverviewExample} from './icon-overview/icon-overview-example';
import {IconSvgExample} from './icon-svg-example/icon-svg-example';
import {InputClearableExample} from './input-clearable/input-clearable-example';
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
import {ProgressBarConfigurableExample} from './progress-bar-configurable/progress-bar-configurable-example';
import {ProgressBarOverviewExample} from './progress-bar-overview/progress-bar-overview-example';
import {ProgressSpinnerConfigurableExample} from './progress-spinner-configurable/progress-spinner-configurable-example';
import {ProgressSpinnerOverviewExample} from './progress-spinner-overview/progress-spinner-overview-example';
import {RadioNgModelExample} from './radio-ng-model/radio-ng-model-example';
import {RadioOverviewExample} from './radio-overview/radio-overview-example';
import {SelectFormExample} from './select-form/select-form-example';
import {SelectOverviewExample} from './select-overview/select-overview-example';
import {SidenavFabExample} from './sidenav-fab/sidenav-fab-example';
import {SidenavOverviewExample} from './sidenav-overview/sidenav-overview-example';
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
    title: 'Datepicker API',
    component: DatepickerApiExample,
    additionalFiles: null,
    selectorName: null
  },
  'datepicker-filter': {
    title: 'Datepicker Filter',
    component: DatepickerFilterExample,
    additionalFiles: null,
    selectorName: null
  },
  'datepicker-min-max': {
    title: 'Datepicker Min Max',
    component: DatepickerMinMaxExample,
    additionalFiles: null,
    selectorName: null
  },
  'datepicker-overview': {
    title: 'Basic datepicker',
    component: DatepickerOverviewExample,
    additionalFiles: null,
    selectorName: null
  },
  'datepicker-start-view': {
    title: 'Datepicker start date',
    component: DatepickerStartViewExample,
    additionalFiles: null,
    selectorName: null
  },
  'datepicker-touch': {
    title: 'Datepicker Touch',
    component: DatepickerTouchExample,
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
  'form-field-overview': {
    title: 'Simple form field ',
    component: FormFieldOverviewExample,
    additionalFiles: null,
    selectorName: null
  },
  'form-field-placeholder': {
    title: 'Form field with placeholder ',
    component: FormFieldPlaceholderExample,
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
  'input-clearable': {
    title: 'Input Clearable',
    component: InputClearableExample,
    additionalFiles: null,
    selectorName: null
  },
  'input-errors': {
    title: 'Input Errors',
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
    title: 'Input hints',
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
    title: 'Input Prefixes and Suffixes',
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
  'progress-bar-configurable': {
    title: 'Configurable progress-bar',
    component: ProgressBarConfigurableExample,
    additionalFiles: null,
    selectorName: null
  },
  'progress-bar-overview': {
    title: 'Basic progress-bar',
    component: ProgressBarOverviewExample,
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
  'select-form': {
    title: 'Select in a form',
    component: SelectFormExample,
    additionalFiles: null,
    selectorName: null
  },
  'select-overview': {
    title: 'Basic select',
    component: SelectOverviewExample,
    additionalFiles: null,
    selectorName: null
  },
  'sidenav-fab': {
    title: 'Sidenav with a FAB',
    component: SidenavFabExample,
    additionalFiles: null,
    selectorName: null
  },
  'sidenav-overview': {
    title: 'Basic sidenav',
    component: SidenavOverviewExample,
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
    title: 'Feature-rich data table',
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
  DatepickerFilterExample,
  DatepickerMinMaxExample,
  DatepickerOverviewExample,
  DatepickerStartViewExample,
  DatepickerTouchExample,
  DialogContentExampleDialog,DialogContentExample,
  DialogDataExampleDialog,DialogDataExample,
  DialogElementsExampleDialog,DialogElementsExample,
  DialogOverviewExampleDialog,DialogOverviewExample,
  ExpansionOverviewExample,
  ExpansionStepsExample,
  MyTelInput,FormFieldCustomControlExample,
  FormFieldErrorExample,
  FormFieldHintExample,
  FormFieldOverviewExample,
  FormFieldPlaceholderExample,
  FormFieldPrefixSuffixExample,
  FormFieldThemingExample,
  GridListDynamicExample,
  GridListOverviewExample,
  IconOverviewExample,
  IconSvgExample,
  InputClearableExample,
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
  ProgressBarConfigurableExample,
  ProgressBarOverviewExample,
  ProgressSpinnerConfigurableExample,
  ProgressSpinnerOverviewExample,
  RadioNgModelExample,
  RadioOverviewExample,
  SelectFormExample,
  SelectOverviewExample,
  SidenavFabExample,
  SidenavOverviewExample,
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
