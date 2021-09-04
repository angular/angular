## RouterLink `null` and `undefined` inputs

The previous behavior of `RouterLink` for `null` and `undefined` inputs was to treat
the input the same as `[]` or `''`. This creates several unresolvable issues with
correctly disabling the links because `commands = []` does not behave the same
as disabling a link. Instead, it navigates to the current page, but will also
clear any fragment and/or query params.

The new behavior of the `routerLink` input will be to completely disable navigation
for `null` and `undefined` inputs. For HTML Anchor elements, this will also mean
removing the `href` attribute.

```html
<button [routerLink]="" fragment="section_2">section 2</button>
```

In the example from above, there is no value provided to the `routerLink` input.
This button would previously navigate to the current page and update the fragment to "section_2".
The updated behavior is to disable this link because the input
for `routerLink` is `undefined`.

If the intent for the link is to link to the current page rather than disable navigation,
the template should be updated to one of the following options:
```html
<button [routerLink]="[]" fragment="section_2">section 2</button>
<button [routerLink]="''" fragment="section_2">section 2</button>
<button routerLink fragment="section_2">section 2</button>
```