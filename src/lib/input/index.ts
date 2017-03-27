import {NgModule, ModuleWithProviders} from '@angular/core';
import {
  MdPlaceholder,
  MdInputContainer,
  MdHint,
  MdInputDirective,
  MdErrorDirective,
} from './input-container';
import {MdTextareaAutosize} from './autosize';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {PlatformModule} from '../core/platform/index';


@NgModule({
  declarations: [
    MdPlaceholder,
    MdInputContainer,
    MdHint,
    MdTextareaAutosize,
    MdInputDirective,
    MdErrorDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    PlatformModule,
  ],
  exports: [
    MdPlaceholder,
    MdInputContainer,
    MdHint,
    MdTextareaAutosize,
    MdInputDirective,
    MdErrorDirective
  ],
})
export class MdInputModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdInputModule,
      providers: [],
    };
  }
}


export * from './autosize'
export * from './input-container';
export * from './input-container-errors';

