import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ModuleWithProviders,
  NgModule,
  ViewEncapsulation
} from '@angular/core';

import {MdChip} from './chip';

@Component({
  moduleId: module.id,
  selector: 'md-chip-list',
  template: `<ng-content></ng-content>`,
  host: {
    // Properties
    'tabindex': '0',
    'role': 'listbox',
    'class': 'md-chip-list'
  },
  styleUrls: ['chips.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MdChipList {
  constructor(private _elementRef: ElementRef) {}

  ngAfterContentInit(): void {}
}

@NgModule({
  imports: [],
  exports: [MdChipList, MdChip],
  declarations: [MdChipList, MdChip]
})
export class MdChipsModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdChipsModule,
      providers: []
    };
  }
}
