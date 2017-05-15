import {NgModule} from '@angular/core';
import {DateAdapter} from './date-adapter';
import {NativeDateAdapter} from './native-date-adapter';
import {MD_DATE_FORMATS} from './date-formats';
import {MD_NATIVE_DATE_FORMATS} from './native-date-formats';


export * from './date-adapter';
export * from './date-formats';
export * from './native-date-adapter';
export * from './native-date-formats';


@NgModule({
  providers: [{provide: DateAdapter, useClass: NativeDateAdapter}],
})
export class NativeDateModule {}


@NgModule({
  imports: [NativeDateModule],
  providers: [{provide: MD_DATE_FORMATS, useValue: MD_NATIVE_DATE_FORMATS}],
})
export class MdNativeDateModule {}
