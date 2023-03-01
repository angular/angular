import {Component, Inject, LOCALE_ID} from '@angular/core';

@Component(
    {selector: 'app-root', templateUrl: './app.component.html', styleUrls: ['./app.component.css']})
export class AppComponent {
  constructor(@Inject(LOCALE_ID) public locale: string) {}
  title = `cli-hello-world-ivy-compat`;
  message = $localize`Welcome to the i18n app.`;
  jan = new Date(2000, 0, 1);
  extra = $localize`:@@custom:Extra message`;
}
