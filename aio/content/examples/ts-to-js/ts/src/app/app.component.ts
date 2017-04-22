import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styles: [
    // See hero-di-inject-additional.component
    'hero-host, hero-host-meta { border: 1px dashed black; display: block; padding: 4px;}',
    '.heading {font-style: italic}'
  ]
})
export class AppComponent {
  title = 'TypeScript';
}
