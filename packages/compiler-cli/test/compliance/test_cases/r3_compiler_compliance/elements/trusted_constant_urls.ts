import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <iframe src="https://www.example.com/embed"></iframe>
    <embed src="https://www.example.com/plugin" />
  `,
})
export class AppComponent {}
