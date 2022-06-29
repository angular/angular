/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  TemplateRef,
  ViewContainerRef,
  ElementRef,
  ComponentRef,
  EmbeddedViewRef,
  Injector,
  ComponentFactoryResolver,
} from '@angular/core';
import {
  throwNullPortalOutletError,
  throwPortalAlreadyAttachedError,
  throwNoPortalAttachedError,
  throwNullPortalError,
  throwPortalOutletAlreadyDisposedError,
  throwUnknownPortalTypeError,
} from './portal-errors';

/** Interface that can be used to generically type a class. */
export interface ComponentType<T> {
  new (...args: any[]): T;
}

/**
 * A `Portal` is something that you want to render somewhere else.
 * It can be attach to / detached from a `PortalOutlet`.
 */
export abstract class Portal<T> {
  private _attachedHost: PortalOutlet | null;

  /** Attach this portal to a host. */
  attach(host: PortalOutlet): T {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (host == null) {
        throwNullPortalOutletError();
      }

      if (host.hasAttached()) {
        throwPortalAlreadyAttachedError();
      }
    }

    this._attachedHost = host;
    return <T>host.attach(this);
  }

  /** Detach this portal from its host */
  detach(): void {
    let host = this._attachedHost;

    if (host != null) {
      this._attachedHost = null;
      host.detach();
    } else if (typeof ngDevMode === 'undefined' || ngDevMode) {
      throwNoPortalAttachedError();
    }
  }

  /** Whether this portal is attached to a host. */
  get isAttached(): boolean {
    return this._attachedHost != null;
  }

  /**
   * Sets the PortalOutlet reference without performing `attach()`. This is used directly by
   * the PortalOutlet when it is performing an `attach()` or `detach()`.
   */
  setAttachedHost(host: PortalOutlet | null) {
    this._attachedHost = host;
  }
}

/**
 * A `ComponentPortal` is a portal that instantiates some Component upon attachment.
 */
export class ComponentPortal<T> extends Portal<ComponentRef<T>> {
  /** The type of the component that will be instantiated for attachment. */
  component: ComponentType<T>;

  /**
   * Where the attached component should live in Angular's *logical* component tree.
   * This is different from where the component *renders*, which is determined by the PortalOutlet.
   * The origin is necessary when the host is outside of the Angular application context.
   */
  viewContainerRef?: ViewContainerRef | null;

  /** Injector used for the instantiation of the component. */
  injector?: Injector | null;

  /**
   * Alternate `ComponentFactoryResolver` to use when resolving the associated component.
   * Defaults to using the resolver from the outlet that the portal is attached to.
   */
  componentFactoryResolver?: ComponentFactoryResolver | null;

  /**
   * List of DOM nodes that should be projected through `<ng-content>` of the attached component.
   */
  projectableNodes?: Node[][] | null;

  constructor(
    component: ComponentType<T>,
    viewContainerRef?: ViewContainerRef | null,
    injector?: Injector | null,
    componentFactoryResolver?: ComponentFactoryResolver | null,
    projectableNodes?: Node[][] | null,
  ) {
    super();
    this.component = component;
    this.viewContainerRef = viewContainerRef;
    this.injector = injector;
    this.componentFactoryResolver = componentFactoryResolver;
    this.projectableNodes = projectableNodes;
  }
}

/**
 * A `TemplatePortal` is a portal that represents some embedded template (TemplateRef).
 */
export class TemplatePortal<C = any> extends Portal<EmbeddedViewRef<C>> {
  constructor(
    /** The embedded template that will be used to instantiate an embedded View in the host. */
    public templateRef: TemplateRef<C>,
    /** Reference to the ViewContainer into which the template will be stamped out. */
    public viewContainerRef: ViewContainerRef,
    /** Contextual data to be passed in to the embedded view. */
    public context?: C,
    /** The injector to use for the embedded view. */
    public injector?: Injector,
  ) {
    super();
  }

  get origin(): ElementRef {
    return this.templateRef.elementRef;
  }

  /**
   * Attach the portal to the provided `PortalOutlet`.
   * When a context is provided it will override the `context` property of the `TemplatePortal`
   * instance.
   */
  override attach(host: PortalOutlet, context: C | undefined = this.context): EmbeddedViewRef<C> {
    this.context = context;
    return super.attach(host);
  }

  override detach(): void {
    this.context = undefined;
    return super.detach();
  }
}

/**
 * A `DomPortal` is a portal whose DOM element will be taken from its current position
 * in the DOM and moved into a portal outlet, when it is attached. On detach, the content
 * will be restored to its original position.
 */
export class DomPortal<T = HTMLElement> extends Portal<T> {
  /** DOM node hosting the portal's content. */
  readonly element: T;

  constructor(element: T | ElementRef<T>) {
    super();
    this.element = element instanceof ElementRef ? element.nativeElement : element;
  }
}

/** A `PortalOutlet` is an space that can contain a single `Portal`. */
export interface PortalOutlet {
  /** Attaches a portal to this outlet. */
  attach(portal: Portal<any>): any;

  /** Detaches the currently attached portal from this outlet. */
  detach(): any;

  /** Performs cleanup before the outlet is destroyed. */
  dispose(): void;

  /** Whether there is currently a portal attached to this outlet. */
  hasAttached(): boolean;
}

/**
 * @deprecated Use `PortalOutlet` instead.
 * @breaking-change 9.0.0
 */
export type PortalHost = PortalOutlet;

/**
 * Partial implementation of PortalOutlet that handles attaching
 * ComponentPortal and TemplatePortal.
 */
export abstract class BasePortalOutlet implements PortalOutlet {
  /** The portal currently attached to the host. */
  protected _attachedPortal: Portal<any> | null;

  /** A function that will permanently dispose this host. */
  private _disposeFn: (() => void) | null;

  /** Whether this host has already been permanently disposed. */
  private _isDisposed: boolean = false;

  /** Whether this host has an attached portal. */
  hasAttached(): boolean {
    return !!this._attachedPortal;
  }

  attach<T>(portal: ComponentPortal<T>): ComponentRef<T>;
  attach<T>(portal: TemplatePortal<T>): EmbeddedViewRef<T>;
  attach(portal: any): any;

  /** Attaches a portal. */
  attach(portal: Portal<any>): any {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (!portal) {
        throwNullPortalError();
      }

      if (this.hasAttached()) {
        throwPortalAlreadyAttachedError();
      }

      if (this._isDisposed) {
        throwPortalOutletAlreadyDisposedError();
      }
    }

    if (portal instanceof ComponentPortal) {
      this._attachedPortal = portal;
      return this.attachComponentPortal(portal);
    } else if (portal instanceof TemplatePortal) {
      this._attachedPortal = portal;
      return this.attachTemplatePortal(portal);
      // @breaking-change 10.0.0 remove null check for `this.attachDomPortal`.
    } else if (this.attachDomPortal && portal instanceof DomPortal) {
      this._attachedPortal = portal;
      return this.attachDomPortal(portal);
    }

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      throwUnknownPortalTypeError();
    }
  }

  abstract attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T>;

  abstract attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C>;

  // @breaking-change 10.0.0 `attachDomPortal` to become a required abstract method.
  readonly attachDomPortal: null | ((portal: DomPortal) => any) = null;

  /** Detaches a previously attached portal. */
  detach(): void {
    if (this._attachedPortal) {
      this._attachedPortal.setAttachedHost(null);
      this._attachedPortal = null;
    }

    this._invokeDisposeFn();
  }

  /** Permanently dispose of this portal host. */
  dispose(): void {
    if (this.hasAttached()) {
      this.detach();
    }

    this._invokeDisposeFn();
    this._isDisposed = true;
  }

  /** @docs-private */
  setDisposeFn(fn: () => void) {
    this._disposeFn = fn;
  }

  private _invokeDisposeFn() {
    if (this._disposeFn) {
      this._disposeFn();
      this._disposeFn = null;
    }
  }
}

/**
 * @deprecated Use `BasePortalOutlet` instead.
 * @breaking-change 9.0.0
 */
export abstract class BasePortalHost extends BasePortalOutlet {}
