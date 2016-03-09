import {TemplateRef, Type} from 'angular2/core';
import {ElementRef} from 'angular2/core';
import {ComponentRef} from 'angular2/core';

import {BaseException} from 'angular2/src/facade/exceptions';


/**
 * A `Portal` is something that you want to render somewhere else.
 * It can be attach to / detached from a `PortalHost`.
 */
export abstract class Portal<T> {
  private _attachedHost: PortalHost;

  /** Attach this portal to a host. */
  attach(host: PortalHost): Promise<T> {
    if (host == null) {
      throw new BaseException('Attempting to attach a portal to a null host');
    }

    if (host.hasAttached()) {
      throw new BaseException('Host already has a portal attached');
    }

    this._attachedHost = host;
    return <Promise<T>> host.attach(this);
  }

  /** Detach this portal from its host */
  detach(): Promise<void> {
    let host = this._attachedHost;
    if (host == null) {
      throw new BaseException('Portal has no host from which to detach');
    }

    this._attachedHost = null;
    return host.detach();
  }

  /** Whether this portal is attached to a host. */
  get isAttached(): boolean {
    return this._attachedHost != null;
  }

  /**
   * Sets the PortalHost reference without performing `attach()`. This is used directly by
   * the PortalHost when it is performing an `attach()` or `detatch()`.
   */
  setAttachedHost(host: PortalHost) {
    this._attachedHost = host;
  }
}


/**
 * A `ComponentPortal` is a portal that instantiates some Component upon attachment.
 */
export class ComponentPortal extends Portal<ComponentRef> {
  /** The type of the component that will be instantiated for attachment. */
  public component: Type;

  /**
   * [Optional] Where the attached component should live in Angular's *logical* component tree.
   * This is different from where the component *renders*, which is determined by the PortalHost.
   * The origin necessary when the host is outside of the Angular application context.
   */
  public origin: ElementRef;

  constructor(component: Type, origin: ElementRef = null) {
    super();
    this.component = component;
    this.origin = origin;
  }
}


/**
 * A `TemplatePortal` is a portal that represents some embedded template (TemplateRef).
 */
export class TemplatePortal extends Portal<Map<string, any>> {
  /** The embedded template that will be used to instantiate an embedded View in the host. */
  templateRef: TemplateRef;

  /**
   * Additional locals for the instantiated embedded view.
   * These locals can be seen as "exports" for the template, such as how ngFor has
   * index / event / odd.
   * See https://angular.io/docs/ts/latest/api/core/EmbeddedViewRef-class.html
   */
  locals: Map<string, any> = new Map<string, any>();

  constructor(template: TemplateRef) {
    super();
    this.templateRef = template;
  }

  get origin(): ElementRef {
    return this.templateRef.elementRef;
  }

  attach(host: PortalHost, locals?: Map<string, any>): Promise<Map<string, any>> {
    this.locals = locals == null ? new Map<string, any>() : locals;
    return super.attach(host);
  }

  detach(): Promise<void> {
    this.locals = new Map<string, any>();
    return super.detach();
  }
}


/**
 * A `PortalHost` is an space that can contain a single `Portal`.
 */
export interface PortalHost {
  attach(portal: Portal<any>): Promise<any>;

  detach(): Promise<any>;

  dispose(): void;

  hasAttached(): boolean;
}


/**
 * Partial implementation of PortalHost that only deals with attaching either a
 * ComponentPortal or a TemplatePortal.
 */
export abstract class BasePortalHost implements PortalHost {
  /** The portal currently attached to the host. */
  private _attachedPortal: Portal<any>;

  /** A function that will permanently dispose this host. */
  private _disposeFn: () => void;

  /** Whether this host has already been permanently disposed. */
  private _isDisposed: boolean = false;

  /** Whether this host has an attached portal. */
  hasAttached() {
    return this._attachedPortal != null;
  }

  attach(portal: Portal<any>): Promise<any> {
    if (portal == null) {
      throw new BaseException('Must provide a portal to attach');
    }

    if (this.hasAttached()) {
      throw new BaseException('A portal is already attached');
    }

    if (this._isDisposed) {
      throw new BaseException('This PortalHost has already been disposed');
    }

    if (portal instanceof ComponentPortal) {
      this._attachedPortal = portal;
      return this.attachComponentPortal(portal);
    } else if (portal instanceof TemplatePortal) {
      this._attachedPortal = portal;
      return this.attachTemplatePortal(portal);
    }

    throw new BaseException(
        'Attempting to attach an unknown Portal type. ' +
        'BasePortalHost accepts either a ComponentPortal or a TemplatePortal.');
  }

  abstract attachComponentPortal(portal: ComponentPortal): Promise<ComponentRef>;

  abstract attachTemplatePortal(portal: TemplatePortal): Promise<Map<string, any>>;

  detach(): Promise<void> {
    this._attachedPortal.setAttachedHost(null);
    this._attachedPortal = null;
    if (this._disposeFn != null) {
      this._disposeFn();
      this._disposeFn = null;
    }

    return Promise.resolve(null);
  }

  dispose() {
    if (this.hasAttached()) {
      this.detach();
    }

    this._isDisposed = true;
  }

  setDisposeFn(fn: () => void) {
    this._disposeFn = fn;
  }
}
