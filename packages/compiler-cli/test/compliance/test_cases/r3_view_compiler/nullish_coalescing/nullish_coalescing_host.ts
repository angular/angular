import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-app',
  host: {
    '[attr.first-name]': `'Hello, ' + (firstName ?? 'Frodo') + '!'`,
    '(click)': `logLastName(lastName ?? lastNameFallback ?? 'unknown')`
  },
  template: ``
})
export class MyApp {
  firstName: string|null = null;
  lastName: string|null = null;
  lastNameFallback = 'Baggins';

  logLastName(name: string) {
    console.log(name);
  }
}

@NgModule({declarations: [MyApp]})
export class MyModule {
}
