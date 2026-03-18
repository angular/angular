import {Component, Injector} from '@angular/core';
import {createCustomElement} from '@angular/elements';
import {Popup} from './popup';
import {PopupService} from './popup.service';

@Component({
  selector: 'app-root',
  template: `
    <input #input value="Message" />
    <button type="button" (click)="popup.showAsComponent(input.value)">Show as component</button>
    <button type="button" (click)="popup.showAsElement(input.value)">Show as element</button>
  `,
  providers: [PopupService],
  imports: [Popup],
})
export class App {
  constructor(
    injector: Injector,
    public popup: PopupService,
  ) {
    // Convert `PopupComponent` to a custom element.
    const PopupElement = createCustomElement(Popup, {injector});
    // Register the custom element with the browser.
    customElements.define('popup-element', PopupElement);
  }
}
