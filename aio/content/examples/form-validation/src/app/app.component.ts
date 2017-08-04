// #docregion
import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  template: `<hero-form-template></hero-form-template>
             <hr>
             <hero-form-reactive></hero-form-reactive>
             <hr>
             <hero-form-update-on></hero-form-update-on>`
})
export class AppComponent { }
