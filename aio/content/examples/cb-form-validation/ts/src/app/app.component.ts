// #docregion
import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  template: `<hero-form-template1></hero-form-template1>
             <hr>
             <hero-form-template2></hero-form-template2>
             <hr>
             <hero-form-reactive3></hero-form-reactive3>`
})
export class AppComponent { }
