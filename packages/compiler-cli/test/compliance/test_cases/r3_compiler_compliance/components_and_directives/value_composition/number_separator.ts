import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-app',
  template: `
    <div>Total: \${{ 1_000_000 * multiplier }}</div>
    <span>Remaining: \${{ 123_456.78_9 / 2 }}</span>
  `
})
export class MyApp {
  multiplier = 5;
}

@NgModule({declarations: [MyApp]})
export class MyModule {
}
