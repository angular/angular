# Dynamic Component Instantiation

Angular's `createComponent` provides a powerful way to dynamically instantiate components in code, replacing earlier approaches that used `ComponentFactoryResolver`. This function creates a **`ComponentRef`** for a given component class, using a set of options to control _how and where_ the component is rendered. These options enable advanced scenarios such as attaching the component to a specific host DOM element, projecting content, and providing custom dependency injection contexts.

### `environmentInjector`

The environment injector determines how the dynamically created component resolves application‑level providers (services, tokens, and other DI bindings). In most cases you should pass the application injector from `ApplicationRef`:

When to create a child injector: if you need the dynamic component to use a different set of providers (for example, feature‑scoped), create a child `EnvironmentInjector` with `createEnvironmentInjector` and pass it here.

**Use when:** you want the dynamic component to resolve the same application/module providers as normal components — or when you intentionally want to scope/override providers for the created component.

### `hostElement`

A specific DOM element to use as the component’s **host**. If omitted, Angular creates one from the component selector. When you pass an existing element.

**Use when:** mounting into overlay/outlet containers, preserving stacking contexts, or avoiding extra DOM wrappers.

### `elementInjector`

Supplies the **parent element‑level injector** for the new component. This lets the dynamic component inherit **element‑scoped providers** from a parent component.

**Use when:** creating inside a component that has `providers: [...]`; pass `this.injector`. Omit when creating from a service with no relevant element context.

### `projectableNodes`

Content to project into the component’s `<ng-content>` slots. The type is **`Node[][]`**, where **each inner array maps to one slot** in the **declaration order**. You can project:

- DOM you build programmatically (e.g., `DocumentFragment` children),
- nodes rendered by other dynamic components (via `(ref.hostView as EmbeddedViewRef).rootNodes`).

**Use when:** composing like **modal/dialog/drawer** with header/content/footer slots.

### `directives`

Provide directive classes to make directives available in the created component's view. When supplied, Angular provides those directives to the component's template as if they were declared in the component's compilation scope.

**Use when:** the dynamic component's template requires directives that are not already in scope, or when you need to preconfigure directive inputs at creation time.

### `bindings`

An array of **creation‑time bindings** that connect inputs, outputs, and two‑way models for the component instance.

## Advanced usage

The following examples show common patterns for using `createComponent` in real-world scenarios (overlays, modals, and mixed projection). They demonstrate how to combine `projectableNodes`, `bindings`, `directives`, and injector options.

### Modal with **header / content / footer** slots

A common requirement is a modal dialog that projects a **header**, **content**, and **footer**. We’ll create a `Modal` that defines **three** `<ng-content>` slots and then project nodes into each slot.

```angular-ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-modal',
  styles: [
    `
      .backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: grid;
        place-items: center;
      }
      .modal {
        background: white;
        border-radius: 12px;
        min-width: 420px;
        max-width: 90vw;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      }
      .header,
      .footer {
        padding: 12px 16px;
        border-bottom: 1px solid #eee;
      }
      .content {
        padding: 16px;
        max-height: 70vh;
        overflow: auto;
      }
    `,
  ],
  template: `
    <div class="backdrop" role="dialog" aria-modal="true">
      <div class="modal">
        <section class="header">
          <ng-content select="[modal-header]" />
        </section>
        <section class="content">
          <ng-content select="[modal-content]" />
        </section>
        <footer class="footer">
          <ng-content select="[modal-footer]" />
        </footer>
      </div>
    </div>
  `,
})
export class Modal {}

```

The modal declares **three** slots (`[modal-header]`, `[modal-content]`, `[modal-footer]`). **Order of `projectableNodes` arrays must match the slot declaration order**.

We’ll build the three parts as **components** so they participate in change detection and can expose inputs/outputs if needed.

```angular-ts
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal-header',
  template: `<h2>{{ title() }}</h2>`,
})
export class ModalHeader {
  readonly title = input('Untitled');
}
```

```angular-ts
@Component({
  selector: 'app-modal-footer',
  template: `
    <div>
      <button (click)="cancel.emit()">Cancel</button>
      <button (click)="confirm.emit()">Confirm</button>
    </div>
  `,
})
export class ModalFooter {
  readonly confirm = output<void>();
  readonly cancel = output<void>();
}

```

These components render elements with the **slot attributes** relative to `modal-header` and `modal-footer` , which the modal uses for projection.

```ts
import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  DOCUMENT,
  EmbeddedViewRef,
  inject,
  Injectable,
  inputBinding,
  Type,
} from '@angular/core';
import { ModalFooter, ModalHeader } from './components/header.component';
import { Modal } from './components/modal.component';
import { CdkTrapFocus } from '@angular/cdk/a11y';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private readonly appRef = inject(ApplicationRef);
  private readonly document = inject(DOCUMENT);

  open<C>(component: Type<C>, options?: { title?: string }) {
    const environmentInjector = this.appRef.injector;

    // Helper to attach view & extract rendered DOM nodes
    const attachAndNodes = <T>(ref: ComponentRef<T>) => {
      this.appRef.attachView(ref.hostView);
      return (ref.hostView as EmbeddedViewRef<unknown>).rootNodes;
    };

    // Create Header
    const headerRef = createComponent(ModalHeader, {
      environmentInjector,
      bindings: [inputBinding('title', () => options?.title ?? 'Modal Title')],
    });
    const headerNodes = attachAndNodes(headerRef);

    // Create the content component provided by the caller
    const contentRef = createComponent(component, { environmentInjector });
    const contentNodes = attachAndNodes(contentRef);

    // Create Footer
    const footerRef = createComponent(ModalFooter, { environmentInjector });
    const footerNodes = attachAndNodes(footerRef);

    // Create modal and project nodes into 3 slots
    const modalRef = createComponent(Modal, {
      environmentInjector,
      projectableNodes: [
        headerNodes, // slot 1: [modal-header]
        contentNodes, // slot 2: [modal-content]
        footerNodes, // slot 3: [modal-footer]
      ],
      directives: [
        {
          type: CdkTrapFocus,
          bindings: [
            inputBinding('cdkTrapFocusAutoCapture', () => true),
            inputBinding('cdkTrapFocus', () => true),
          ]
        }
      ]
    });

    const all = [headerRef, contentRef, footerRef, modalRef];

    // Function to close and cleanup the modal
    const close = (reason: 'confirm' | 'cancel') => {
      for (const ref of all) {
        this.appRef.detachView(ref.hostView);
        ref.destroy();
      }

      host.remove();
      console.log('Modal closed with:', reason);
    };

    const footerInstance = footerRef.instance;

    footerInstance.confirm.subscribe(() => close('confirm'));

    footerInstance.cancel.subscribe(() => close('cancel'));

    this.appRef.attachView(modalRef.hostView);

    // Mount to DOM using a custom host element
    const host = this.document.createElement('div');

    this.document.body.appendChild(host);

    host.style.zIndex = '1000';
    host.style.position = 'relative';

    host.appendChild(modalRef.location.nativeElement);
  }
}

```

IMPORTANT: Always **detach** then **destroy** to avoid memory leaks.

**Why this order?**

You create **content parts first**, capture their **root nodes**, and then pass them into the modal via `projectableNodes`. The array order must match the **declaration order** of the `<ng-content>` slots in the modal template. Finally, mount the modal’s host element into the DOM.

Usage with a dynamic component as the modal content

```angular-ts
@Component({
  selector: 'app-modal-content',
  template: `
    <div>
      <p>Awesome Content</p>
    </div>
  `,
})
export class AwesomeContent {}
```

You can open a modal that renders this component by injecting `ModalService`:

```ts
@Component({/* ... */})
export class Home {
  private readonly modalService = inject(ModalService);

  showModal() {
    this.modalService.open(AwesomeContent);
  }
}
```

---

### Using `elementInjector` to inherit parent providers

If you create the modal **inside a component** that provides a scoped service (e.g., `@Component({providers: [ScopedService]})`), pass the **parent element’s injector** so all dynamically created parts resolve that service from the parent component’s `ElementInjector`.

```angular-ts
import {
  ApplicationRef,
  EmbeddedViewRef,
  Injector,
  createComponent,
} from '@angular/core';

@Component({
  selector: 'app-some-parent',
  providers: [ScopedService]
  template: `<button (click)="openModal()">Open</button>`
})
export class SomeParentComponent {
  private readonly injector = inject(Injector);
  private readonly appRef = inject(ApplicationRef);

  openModal() {
    const environmentInjector = this.appRef.injector;

    // Create a part that needs ScopedService from the parent
    const modalContentRef = createComponent(ModalContent, {
      environmentInjector,
      elementInjector: this.injector, // ← inherit parent’s element-level providers
    });
    this.appRef.attachView(modalContentRef.hostView);

    // ...then project into the model as usual
  }
}
```

**Why this**

- Angular’s **ElementInjector** chain mirrors the component tree. By supplying `elementInjector: this.injector`, the dynamic child is treated as if it were created **under** the parent element, so it can resolve **element-scoped providers** defined on the parent.
- The `environmentInjector` continues to serve **application/module-scoped providers**.

**Benefits**

- Pass the same `elementInjector` to **all parts and the modal**, not just one, to keep a consistent DI boundary.
- If you’re creating components from a **service** (no parent element context), omit `elementInjector` (or explicitly construct one with the providers you need).

---

### Hybrid projection: programmatic + template fragments

Sometimes you want to project **DOM fragments** (markup you build on the fly) _alongside_ dynamic component output. You can **mix** nodes safely.

```ts
import { ApplicationRef, createComponent, DOCUMENT, EmbeddedViewRef, inject, Injectable } from '@angular/core';
import { ModalContent } from './components/header.component';
import { Modal } from './components/modal.component';

@Injectable({
  providedIn: 'root',
})
export class ModalInFlyService {
  private readonly appRef = inject(ApplicationRef);
  private readonly document = inject(DOCUMENT);

  open() {
    const environmentInjector = this.appRef.injector;
    // Programmatic DOM fragment for the header
    const headerFrag = document.createDocumentFragment();

    const titleEl = document.createElement('h2');
    titleEl.textContent = 'Warning';
    headerFrag.appendChild(titleEl);

    // Dynamic component for the content
    const contentRef = createComponent(ModalContent, { environmentInjector });
    this.appRef.attachView(contentRef.hostView);

    // Use the rendered nodes of the content component
    const contentNodes = (contentRef.hostView as EmbeddedViewRef<unknown>).rootNodes;

    // Plain DOM for footer buttons
    const footerFrag = document.createDocumentFragment();
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Confirm';

    footerFrag.append(cancelBtn, confirmBtn);

    // Create modal with mixed nodes projected into 3 slots
    const modalRef = createComponent(Modal, {
      environmentInjector,
      projectableNodes: [
        Array.from(headerFrag.childNodes), // slot 1: [modal-header]
        contentNodes, // slot 2: [modal-content]
        Array.from(footerFrag.childNodes), // slot 3: [modal-footer]
      ],
    });

    this.appRef.attachView(modalRef.hostView);

    this.document.body.appendChild(modalRef.location.nativeElement);
  }
}

```

**Why this pattern**

- `projectableNodes` accepts **`Node[][]`**, not just component view nodes. Passing **child nodes** of a `DocumentFragment` makes projection order explicit and avoids edge-cases where some DOM APIs move fragment children implicitly.
- Mixing dynamic components and raw DOM lets you keep **behavioral parts** (components with inputs/outputs) and **static markup** lightweight.

---

### Using `hostElement` strategically

Mounting into an **existing outlet** keeps your DOM & stacking contexts stable (ideal for overlays/portals). When you pass `hostElement`, Angular uses **that element as the host**

```ts
const outlet = document.querySelector('#overlay-outlet') as HTMLElement;

const modalRef = createComponent(Modal, {
  environmentInjector,
  projectableNodes: [headerNodes, contentNodes, footerNodes],
  hostElement: outlet, // use an existing element as the component’s host
});

appRef.attachView(modalRef.hostView);

// No need to append again
```

**Why this is preferable**

- You control **where** the component lives in the DOM tree (and thus CSS scope, z-index, and containment) without creating extra wrapper nodes.
- It plays nicely with **positioning systems** (e.g., a fixed overlay root).
