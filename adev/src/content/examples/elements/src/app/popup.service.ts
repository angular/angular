import {
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
} from '@angular/core';
import {NgElement, WithProperties} from '@angular/elements';
import {Popup} from './popup';

@Injectable()
export class PopupService {
  private readonly injector = inject(EnvironmentInjector);
  private readonly applicationRef = inject(ApplicationRef);

  // Previous dynamic-loading method required you to set up infrastructure
  // before adding the popup to the DOM.
  showAsComponent(message: string) {
    // Create element
    const popup = document.createElement('popup-component');

    // Create the component and wire it up with the element
    const popupComponentRef = createComponent(Popup, {
      environmentInjector: this.injector,
      hostElement: popup,
    });

    // Attach to the view so that the change detector knows to run
    this.applicationRef.attachView(popupComponentRef.hostView);

    // Listen to the close event
    popupComponentRef.instance.closed.subscribe(() => {
      document.body.removeChild(popup);
      this.applicationRef.detachView(popupComponentRef.hostView);
    });

    // Set the message
    popupComponentRef.setInput('message', message);

    // Add to the DOM
    document.body.appendChild(popup);
  }

  // This uses the new custom-element method to add the popup to the DOM.
  showAsElement(message: string) {
    // Create element
    const popupEl: NgElement & WithProperties<Popup> = document.createElement(
      'popup-element',
    ) as any;

    // Listen to the close event
    popupEl.addEventListener('closed', () => document.body.removeChild(popupEl));

    // Set the message
    popupEl.setAttribute('message', message);
    // Add to the DOM
    document.body.appendChild(popupEl);
  }
}
