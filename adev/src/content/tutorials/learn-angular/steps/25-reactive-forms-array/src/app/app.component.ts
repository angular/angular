import {Component} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-root',
  template: `
  <form>
    <label>User : </label>
    <input type="text" />

    <fieldset>Articles</fieldset>
  </form>

  <button type="button">Add article</button>`,
  standalone: true,
  imports: []
})
export class AppComponent {}
