import {Component, NgModule} from '@angular/core';

@Component({
    template: `
    {{ val?.foo!.bar }}
    {{ val?.[0].foo!.bar }}
    {{ foo(val)?.foo!.bar }}
    {{ $any(val)?.foo!.bar }}
  `,
    standalone: false
})
export class MyApp {
  val: any = null;

  foo(val: unknown) {
    return val;
  }
}

@NgModule({declarations: [MyApp]})
export class MyModule {
}
