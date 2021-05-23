@name Invalid Shadow DOM selector
@category compiler
@shortDescription Component selector does not match shadow DOM requirements

@description
The selector of a component using `ViewEncapsulation.ShadowDom` doesn't match the custom element tag name requirements.

In order for a tag name to be considered a valid custom element name, it has to:
* Be in lower case.
* Contain a hyphen.
* Start with a letter (a-z).

@debugging
Rename your component's selector so that it matches the requirements.

**Before:**
```typescript
@Component({
  selector: 'comp',
  encapsulation: ViewEncapsulation.ShadowDom
  ...
})
```

**After:**
```typescript
@Component({
  selector: 'app-comp',
  encapsulation: ViewEncapsulation.ShadowDom
  ...
})
```
