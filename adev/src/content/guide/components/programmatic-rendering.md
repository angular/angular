# Programmatically rendering components

Tip: This guide assumes you've already read the [Essentials Guide](essentials). Read that first if you're new to Angular.

In addition to using a component directly in a template, you can also dynamically render components.
The main way to dynamically render a component: in a template with `NgComponentOutlet`.

## Using NgComponentOutlet

`NgComponentOutlet` is a structural directive that dynamically renders a given component in a
template.

```angular-ts
@Component({ ... })
export class AdminBio { /* ... */ }

@Component({ ... })
export class StandardBio { /* ... */ }

@Component({
  ...,
  template: `
    <p>Profile for {{user.name}}</p>
    <ng-container *ngComponentOutlet="getBioComponent()" /> `
})
export class CustomDialog {
  @Input() user: User;

  getBioComponent() {
    return this.user.isAdmin ? AdminBio : StandardBio;
  }
}
```

See the [NgComponentOutlet API reference](api/common/NgComponentOutlet) for more information on the
directive's capabilities.

## Lazy-loading components

You can use conjunction between `NgComponentOutlet` and deferred loading with `@defer`, to
render components that are lazy-loaded with a standard
JavaScript [dynamic import](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/import).

```angular-ts
@Component({
  ...,
  template: `
    <section>
      <h2>Basic settings</h2>
      <basic-settings />
    </section>
    <section>
      <h2>Advanced settings</h2>
      @defer (on interaction) {
        <ng-container *ngComponentOutlet="advancedSettings"></ng-container>
      } @placeholder {
        <button (click)="loadAdvanced()">Load advanced settings</button>
      } @loading {
        <p>Loading advanced settings...</p>
      } @error {
        <p>Failed to load advanced settings.</p>
      }
    </section>
  `
})
export class AdminSettings {
  advancedSettings: {new(): AdminSettings} | undefined;

  async loadAdvanced() {
    this.advancedSettings = await import('path/to/advanced_settings.js');
  }
}
```

The example above loads and displays the `AdvancedSettings` upon receiving a button click.
