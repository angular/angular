import {
  Attribute,
  Directive,
  ElementRef,
  Host,
  Inject,
  InjectionToken,
  Optional,
  Self,
  SkipSelf,
} from '@angular/core';

export const TOKEN = new InjectionToken<string>('TOKEN');

@Directive({
  selector: '[withDeps]',
})
export class WithDepsDirective {
  constructor(
    element: ElementRef,
    @Attribute('name') name: string,
    @Inject(TOKEN) @Optional() token: string | null,
    @Self() self: ElementRef,
    @SkipSelf() @Host() host: ElementRef,
  ) {}
}
