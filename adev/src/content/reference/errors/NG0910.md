# Unsafe bindings on an iframe element

You see this error when Angular detects an attribute binding or a property binding on an `<iframe>` element using the following property names:

* sandbox
* allow
* allowFullscreen
* referrerPolicy
* csp
* fetchPriority

The mentioned attributes affect the security model setup for `<iframe>`s
and it's important to apply them before setting the `src` or `srcdoc` attributes.
To enforce that, Angular requires these attributes to be set on `<iframe>`s as
static attributes, so the values are set at the element creation time and they
remain the same throughout the lifetime of an `<iframe>` instance.

The error is thrown when a property binding with one of the mentioned attribute names is used:

```angular-html
<iframe [sandbox]="'allow-scripts'" src="..."></iframe>
```

or when it's an attribute bindings:

```angular-html
<iframe [attr.sandbox]="'allow-scripts'" src="..."></iframe>
```

Also, the error is thrown when a similar pattern is used in Directive's host bindings:

```typescript
@Directive({
  selector: 'iframe',
  host: {
    '[sandbox]': `'allow-scripts'`,
    '[attr.sandbox]': `'allow-scripts'`,
  }
})
class IframeDirective {}
```

## Debugging the error

The error message includes the name of the component with the template where
an `<iframe>` element with unsafe bindings is located.

The recommended solution is to use the mentioned attributes as static ones, for example:

```angular-html
<iframe sandbox="allow-scripts" src="..."></iframe>
```

If you need to have different values for these attributes (depending on various conditions),
you can use an `*ngIf` or an `*ngSwitch` on an `<iframe>` element:

```angular-html
<iframe *ngIf="someConditionA" sandbox="allow-scripts" src="..."></iframe>
<iframe *ngIf="someConditionB" sandbox="allow-forms" src="..."></iframe>
<iframe *ngIf="someConditionC" sandbox="allow-popups" src="..."></iframe>
```
