### Portals
A `Portal `is a piece of UI that can be dynamically rendered to an open slot on the page.

The "piece of UI" can be either a `Component` or a `TemplateRef` and the "open slot" is 
a `PortalHost`.

Portals and PortalHosts are low-level building blocks that other concepts, such as overlays, are
built upon.

##### `Portal<T>`
| Method | Description |
| --- | --- |
| `attach(PortalHost): Promise<T>` | Attaches the portal to a host. |
| `detach(): Promise<void>` | Detaches the portal from its host. |
| `isAttached: boolean` | Whether the portal is attached. |

##### `PortalHost`
| Method | Description |
| --- | --- |
| `attach(Portal): Promise<void>` | Attaches a portal to the host. |
| `detach(): Promise<void>` | Detaches the portal from the host. |
| `dispose(): Promise<void>` | Permanently dispose the host. |
| `hasAttached: boolean` | Whether a portal is attached to the host. |


#### Portals in practice

##### `TemplatePortalDirective`
Used to get a portal from an `<ng-template>`. `TemplatePortalDirectives` *is* a `Portal`.

Usage:
```html
<ng-template cdk-portal>
  <p>The content of this template is captured by the portal.</p>
</ng-template>

<!-- OR -->

<!-- This result here is identical to the syntax above -->
<p *cdkPortal>
  The content of this template is captured by the portal.
</p>
```

A component can use `@ViewChild` or `@ViewChildren` to get a reference to a
`TemplatePortalDirective`.

##### `ComponentPortal`
Used to create a portal from a component type. When a component is dynamically created using
portals, it must be included in the `entryComponents` of its `NgModule`.

Usage:
```ts
this.userSettingsPortal = new ComponentPortal(UserSettingsComponent);
```


##### `PortalHostDirective`
Used to add a portal host to a template. `PortalHostDirective` *is* a `PortalHost`.

Usage:
```html
<!-- Attaches the `userSettingsPortal` from the previous example. -->
<ng-template [cdkPortalHost]="userSettingsPortal"></ng-template>
```
