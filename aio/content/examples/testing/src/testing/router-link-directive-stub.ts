import { Directive, Input, HostListener } from '@angular/core';

// export for convenience.
export { RouterLink} from '@angular/router';

/* tslint:disable:directive-class-suffix */
// #docregion router-link
@Directive({
  selector: '[routerLink]'
})
export class RouterLinkDirectiveStub {
  @Input() routerLink: any[] | string;
  navigatedTo: any = null;

  @HostListener('click')
  onClick() {
    this.navigatedTo = this.routerLink;
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
