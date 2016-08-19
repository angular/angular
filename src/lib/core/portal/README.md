# Portals

### Overview

A `Portal `is a piece of UI that can be dynamically rendered to an open slot on the page. 

The "piece of UI" can be either a `Component` or a `TemplateRef`.

The "open slot" is a `PortalHost`.

Portals and PortalHosts are low-level building blocks that other concepts, such as overlays, can
be built upon.
 
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




### Using portals



##### `TemplatePortalDirective`
Used to get a portal from a `<template>`. `TemplatePortalDirectives` *is* a `Portal`.

Usage:
```html
<template portal>
  <p>The content of this template is captured by the portal.</p>
</template>

<!-- OR -->

<!-- This result here is identical to the syntax above -->
<p *portal>
  The content of this template is captured by the portal.
</p>
```

A component can use `@ViewChild` or `@ViewChildren` to get a reference to a 
`TemplatePortalDiective`.

##### `ComponentPortal`
Used to create a portal from a component type.

Usage:
```ts
this.userSettingsPortal = new ComponentPortal(UserSettingsComponent);
```


##### `PortalHostDirective`
Used to add a portal host to a template. `PortalHostDirective` *is* a `PortalHost`.

Usage:
```html
<!-- Attaches the `userSettingsPortal` from the previous example. -->
<template [portalHost]="userSettingsPortal"></template>
```
