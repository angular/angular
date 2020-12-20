import { Directive, Input, HostListener } from '@angular/core';

// export for convenience.
export { RouterLink} from '@angular/router';

// tslint:disable: directive-class-suffix directive-selector
// #docregion router-link
@Directive({
  selector: '[routerLink]'
})
export class RouterLinkDirectiveStub {
  @Input('routerLink') linkParams: any;
  navigatedTo: any = null;

  @HostListener('click')
  onClick() {
    this.navigatedTo = this.linkParams;
  }
}
// #enddocregion router-link

/// Dummy module to satisfy Angular Language service. Never used.
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [
    RouterLinkDirectiveStub
  ]
})
export class RouterStubsModule {}
