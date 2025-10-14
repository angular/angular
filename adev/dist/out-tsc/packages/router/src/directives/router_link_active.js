/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {ContentChildren, Directive, EventEmitter, Input, Output} from '@angular/core';
import {from, of} from 'rxjs';
import {mergeAll} from 'rxjs/operators';
import {NavigationEnd} from '../events';
import {RouterLink} from './router_link';
/**
 *
 * @description
 *
 * Tracks whether the linked route of an element is currently active, and allows you
 * to specify one or more CSS classes to add to the element when the linked route
 * is active.
 *
 * Use this directive to create a visual distinction for elements associated with an active route.
 * For example, the following code highlights the word "Bob" when the router
 * activates the associated route:
 *
 * ```html
 * <a routerLink="/user/bob" routerLinkActive="active-link">Bob</a>
 * ```
 *
 * Whenever the URL is either '/user' or '/user/bob', the "active-link" class is
 * added to the anchor tag. If the URL changes, the class is removed.
 *
 * You can set more than one class using a space-separated string or an array.
 * For example:
 *
 * ```html
 * <a routerLink="/user/bob" routerLinkActive="class1 class2">Bob</a>
 * <a routerLink="/user/bob" [routerLinkActive]="['class1', 'class2']">Bob</a>
 * ```
 *
 * To add the classes only when the URL matches the link exactly, add the option `exact: true`:
 *
 * ```html
 * <a routerLink="/user/bob" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact:
 * true}">Bob</a>
 * ```
 *
 * To directly check the `isActive` status of the link, assign the `RouterLinkActive`
 * instance to a template variable.
 * For example, the following checks the status without assigning any CSS classes:
 *
 * ```html
 * <a routerLink="/user/bob" routerLinkActive #rla="routerLinkActive">
 *   Bob {{ rla.isActive ? '(already open)' : ''}}
 * </a>
 * ```
 *
 * You can apply the `RouterLinkActive` directive to an ancestor of linked elements.
 * For example, the following sets the active-link class on the `<div>`  parent tag
 * when the URL is either '/user/jim' or '/user/bob'.
 *
 * ```html
 * <div routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}">
 *   <a routerLink="/user/jim">Jim</a>
 *   <a routerLink="/user/bob">Bob</a>
 * </div>
 * ```
 *
 * The `RouterLinkActive` directive can also be used to set the aria-current attribute
 * to provide an alternative distinction for active elements to visually impaired users.
 *
 * For example, the following code adds the 'active' class to the Home Page link when it is
 * indeed active and in such case also sets its aria-current attribute to 'page':
 *
 * ```html
 * <a routerLink="/" routerLinkActive="active" ariaCurrentWhenActive="page">Home Page</a>
 * ```
 *
 * NOTE: RouterLinkActive is a `ContentChildren` query.
 * Content children queries do not retrieve elements or directives that are in other components' templates, since a component's template is always a black box to its ancestors.
 *
 * @ngModule RouterModule
 *
 * @publicApi
 */
let RouterLinkActive = (() => {
  let _classDecorators = [
    Directive({
      selector: '[routerLinkActive]',
      exportAs: 'routerLinkActive',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _instanceExtraInitializers = [];
  let _links_decorators;
  let _links_initializers = [];
  let _links_extraInitializers = [];
  let _routerLinkActiveOptions_decorators;
  let _routerLinkActiveOptions_initializers = [];
  let _routerLinkActiveOptions_extraInitializers = [];
  let _ariaCurrentWhenActive_decorators;
  let _ariaCurrentWhenActive_initializers = [];
  let _ariaCurrentWhenActive_extraInitializers = [];
  let _isActiveChange_decorators;
  let _isActiveChange_initializers = [];
  let _isActiveChange_extraInitializers = [];
  let _set_routerLinkActive_decorators;
  var RouterLinkActive = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      _links_decorators = [ContentChildren(RouterLink, {descendants: true})];
      _routerLinkActiveOptions_decorators = [Input()];
      _ariaCurrentWhenActive_decorators = [Input()];
      _isActiveChange_decorators = [Output()];
      _set_routerLinkActive_decorators = [Input()];
      __esDecorate(
        this,
        null,
        _set_routerLinkActive_decorators,
        {
          kind: 'setter',
          name: 'routerLinkActive',
          static: false,
          private: false,
          access: {
            has: (obj) => 'routerLinkActive' in obj,
            set: (obj, value) => {
              obj.routerLinkActive = value;
            },
          },
          metadata: _metadata,
        },
        null,
        _instanceExtraInitializers,
      );
      __esDecorate(
        null,
        null,
        _links_decorators,
        {
          kind: 'field',
          name: 'links',
          static: false,
          private: false,
          access: {
            has: (obj) => 'links' in obj,
            get: (obj) => obj.links,
            set: (obj, value) => {
              obj.links = value;
            },
          },
          metadata: _metadata,
        },
        _links_initializers,
        _links_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _routerLinkActiveOptions_decorators,
        {
          kind: 'field',
          name: 'routerLinkActiveOptions',
          static: false,
          private: false,
          access: {
            has: (obj) => 'routerLinkActiveOptions' in obj,
            get: (obj) => obj.routerLinkActiveOptions,
            set: (obj, value) => {
              obj.routerLinkActiveOptions = value;
            },
          },
          metadata: _metadata,
        },
        _routerLinkActiveOptions_initializers,
        _routerLinkActiveOptions_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _ariaCurrentWhenActive_decorators,
        {
          kind: 'field',
          name: 'ariaCurrentWhenActive',
          static: false,
          private: false,
          access: {
            has: (obj) => 'ariaCurrentWhenActive' in obj,
            get: (obj) => obj.ariaCurrentWhenActive,
            set: (obj, value) => {
              obj.ariaCurrentWhenActive = value;
            },
          },
          metadata: _metadata,
        },
        _ariaCurrentWhenActive_initializers,
        _ariaCurrentWhenActive_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _isActiveChange_decorators,
        {
          kind: 'field',
          name: 'isActiveChange',
          static: false,
          private: false,
          access: {
            has: (obj) => 'isActiveChange' in obj,
            get: (obj) => obj.isActiveChange,
            set: (obj, value) => {
              obj.isActiveChange = value;
            },
          },
          metadata: _metadata,
        },
        _isActiveChange_initializers,
        _isActiveChange_extraInitializers,
      );
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      RouterLinkActive = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    router = __runInitializers(this, _instanceExtraInitializers);
    element;
    renderer;
    cdr;
    link;
    links = __runInitializers(this, _links_initializers, void 0);
    classes = (__runInitializers(this, _links_extraInitializers), []);
    routerEventsSubscription;
    linkInputChangesSubscription;
    _isActive = false;
    get isActive() {
      return this._isActive;
    }
    /**
     * Options to configure how to determine if the router link is active.
     *
     * These options are passed to the `Router.isActive()` function.
     *
     * @see {@link Router#isActive}
     */
    routerLinkActiveOptions = __runInitializers(this, _routerLinkActiveOptions_initializers, {
      exact: false,
    });
    /**
     * Aria-current attribute to apply when the router link is active.
     *
     * Possible values: `'page'` | `'step'` | `'location'` | `'date'` | `'time'` | `true` | `false`.
     *
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-current}
     */
    ariaCurrentWhenActive =
      (__runInitializers(this, _routerLinkActiveOptions_extraInitializers),
      __runInitializers(this, _ariaCurrentWhenActive_initializers, void 0));
    /**
     *
     * You can use the output `isActiveChange` to get notified each time the link becomes
     * active or inactive.
     *
     * Emits:
     * true  -> Route is active
     * false -> Route is inactive
     *
     * ```html
     * <a
     *  routerLink="/user/bob"
     *  routerLinkActive="active-link"
     *  (isActiveChange)="this.onRouterLinkActive($event)">Bob</a>
     * ```
     */
    isActiveChange =
      (__runInitializers(this, _ariaCurrentWhenActive_extraInitializers),
      __runInitializers(this, _isActiveChange_initializers, new EventEmitter()));
    constructor(router, element, renderer, cdr, link) {
      __runInitializers(this, _isActiveChange_extraInitializers);
      this.router = router;
      this.element = element;
      this.renderer = renderer;
      this.cdr = cdr;
      this.link = link;
      this.routerEventsSubscription = router.events.subscribe((s) => {
        if (s instanceof NavigationEnd) {
          this.update();
        }
      });
    }
    /** @docs-private */
    ngAfterContentInit() {
      // `of(null)` is used to force subscribe body to execute once immediately (like `startWith`).
      of(this.links.changes, of(null))
        .pipe(mergeAll())
        .subscribe((_) => {
          this.update();
          this.subscribeToEachLinkOnChanges();
        });
    }
    subscribeToEachLinkOnChanges() {
      this.linkInputChangesSubscription?.unsubscribe();
      const allLinkChanges = [...this.links.toArray(), this.link]
        .filter((link) => !!link)
        .map((link) => link.onChanges);
      this.linkInputChangesSubscription = from(allLinkChanges)
        .pipe(mergeAll())
        .subscribe((link) => {
          if (this._isActive !== this.isLinkActive(this.router)(link)) {
            this.update();
          }
        });
    }
    set routerLinkActive(data) {
      const classes = Array.isArray(data) ? data : data.split(' ');
      this.classes = classes.filter((c) => !!c);
    }
    /** @docs-private */
    ngOnChanges(changes) {
      this.update();
    }
    /** @docs-private */
    ngOnDestroy() {
      this.routerEventsSubscription.unsubscribe();
      this.linkInputChangesSubscription?.unsubscribe();
    }
    update() {
      if (!this.links || !this.router.navigated) return;
      queueMicrotask(() => {
        const hasActiveLinks = this.hasActiveLinks();
        this.classes.forEach((c) => {
          if (hasActiveLinks) {
            this.renderer.addClass(this.element.nativeElement, c);
          } else {
            this.renderer.removeClass(this.element.nativeElement, c);
          }
        });
        if (hasActiveLinks && this.ariaCurrentWhenActive !== undefined) {
          this.renderer.setAttribute(
            this.element.nativeElement,
            'aria-current',
            this.ariaCurrentWhenActive.toString(),
          );
        } else {
          this.renderer.removeAttribute(this.element.nativeElement, 'aria-current');
        }
        // Only emit change if the active state changed.
        if (this._isActive !== hasActiveLinks) {
          this._isActive = hasActiveLinks;
          this.cdr.markForCheck();
          // Emit on isActiveChange after classes are updated
          this.isActiveChange.emit(hasActiveLinks);
        }
      });
    }
    isLinkActive(router) {
      const options = isActiveMatchOptions(this.routerLinkActiveOptions)
        ? this.routerLinkActiveOptions
        : // While the types should disallow `undefined` here, it's possible without strict inputs
          this.routerLinkActiveOptions.exact || false;
      return (link) => {
        const urlTree = link.urlTree;
        return urlTree ? router.isActive(urlTree, options) : false;
      };
    }
    hasActiveLinks() {
      const isActiveCheckFn = this.isLinkActive(this.router);
      return (this.link && isActiveCheckFn(this.link)) || this.links.some(isActiveCheckFn);
    }
  };
  return (RouterLinkActive = _classThis);
})();
export {RouterLinkActive};
/**
 * Use instead of `'paths' in options` to be compatible with property renaming
 */
function isActiveMatchOptions(options) {
  return !!options.paths;
}
//# sourceMappingURL=router_link_active.js.map
