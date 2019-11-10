import { Component, Inject, LOCALE_ID } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(@Inject(LOCALE_ID) public locale: string) { }
  title = `cli-hello-world-ivy-i18n`;
  jan = new Date(2000, 0, 1);
}
