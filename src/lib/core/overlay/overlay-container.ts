import {Injectable, Optional, SkipSelf} from '@angular/core';


/**
 * The OverlayContainer is the container in which all overlays will load.
 * It should be provided in the root component to ensure it is properly shared.
 */
@Injectable()
export class OverlayContainer {
  protected _containerElement: HTMLElement;

  private _themeClass: string;

  /**
   * Base theme to be applied to all overlay-based components.
   */
  get themeClass(): string { return this._themeClass; }
  set themeClass(value: string) {
    if (this._containerElement) {
      this._containerElement.classList.remove(this._themeClass);

      if (value) {
        this._containerElement.classList.add(value);
      }
    }

    this._themeClass = value;
  }

  /**
   * This method returns the overlay container element.  It will lazily
   * create the element the first time  it is called to facilitate using
   * the container in non-browser environments.
   * @returns the container element
   */
  getContainerElement(): HTMLElement {
    if (!this._containerElement) { this._createContainer(); }
    return this._containerElement;
  }

  /**
   * Create the overlay container element, which is simply a div
   * with the 'cdk-overlay-container' class on the document body.
   */
  protected _createContainer(): void {
    let container = document.createElement('div');
    container.classList.add('cdk-overlay-container');

    if (this._themeClass) {
      container.classList.add(this._themeClass);
    }

    document.body.appendChild(container);
    this._containerElement = container;
  }
}

export function OVERLAY_CONTAINER_PROVIDER_FACTORY(parentContainer: OverlayContainer) {
  return parentContainer || new OverlayContainer();
};

export const OVERLAY_CONTAINER_PROVIDER = {
  // If there is already an OverlayContainer available, use that. Otherwise, provide a new one.
  provide: OverlayContainer,
  deps: [[new Optional(), new SkipSelf(), OverlayContainer]],
  useFactory: OVERLAY_CONTAINER_PROVIDER_FACTORY
};
