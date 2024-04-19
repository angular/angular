import {Component, NgModule} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
    <!-- A couple of security-sensitive attributes with constant values -->
    <embed src="https://angular.io/" />
    <iframe srcdoc="<h1>Angular</h1>"></iframe>
    <object data="https://angular.io/" codebase="/"></object>

    <!-- Repeated element to make sure attribute deduplication works properly -->
    <embed src="https://angular.io/" />

    <!-- Another element with a src attribute that is not security sensitive -->
    <img src="https://angular.io/" />
  `
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
