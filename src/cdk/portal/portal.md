The `portals` package provides a flexible system for rendering dynamic content into an application.

### Portals
A `Portal `is a piece of UI that can be dynamically rendered to an open slot on the page.

The "piece of UI" can be either a `Component` or a `TemplateRef` and the "open slot" is
a `PortalOutlet`.

Portals and PortalOutlets are low-level building blocks that other concepts, such as overlays, are
built upon.

##### `Portal<T>`
| Method | Description |
| --- | --- |
| `attach(PortalOutlet): Promise<T>` | Attaches the portal to a host. |
| `detach(): Promise<void>` | Detaches the portal from its host. |
| `isAttached: boolean` | Whether the portal is attached. |

##### `PortalOutlet`
| Method | Description |
| --- | --- |
| `attach(Portal): Promise<void>` | Attaches a portal to the host. |
| `detach(): Promise<void>` | Detaches the portal from the host. |
| `dispose(): Promise<void>` | Permanently dispose the host. |
| `hasAttached: boolean` | Whether a portal is attached to the host. |


#### Portals in practice

##### `CdkPortal`
Used to get a portal from an `<ng-template>`. `CdkPortal` *is* a `Portal`.

Usage:
```html
<ng-template cdkPortal>
  <p>The content of this template is captured by the portal.</p>
</ng-template>

<!-- OR -->

<!-- This result here is identical to the syntax above -->
<p *cdkPortal>
  The content of this template is captured by the portal.
</p>
```

A component can use `@ViewChild` or `@ViewChildren` to get a reference to a
`CdkPortal`.

##### `ComponentPortal`
Used to create a portal from a component type. When a component is dynamically created using
portals, it must be included in the `entryComponents` of its `NgModule`.

Usage:
```ts
this.userSettingsPortal = new ComponentPortal(UserSettingsComponent);
```


##### `CdkPortalOutlet`
Used to add a portal outlet to a template. `CdkPortalOutlet` *is* a `PortalOutlet`.

Usage:
```html
<!-- Attaches the `userSettingsPortal` from the previous example. -->
<ng-template [cdkPortalOutlet]="userSettingsPortal"></ng-template>
```
