Angular's `<ng-container>` element is a special element which doesn't actually gets added to the DOM but can simply be used to hold structural directives.

The `<ng-container>` is very useful for utilizing structural directives without adding new unnecessary elements to the DOM, this not only increases performance (even so slightly) since the browser ends up rendering less elements but can also be a valuable asset in having cleaner DOMs and styles alike.

@usageNotes


### With `*NgIf`s

One common use case of `<ng-container>` is alongside the `*ngIf` structural directive, by using the special element we can produce very clean templates easy to understand and work with.

For example we may want to have a number of elements shown conditionally but they do not need to be all under the same root element, that can be easily done by wrapping them in such a block:
```html
  <ng-container *ngIf="condition">
    ...
  </ng-container>
```

This can also be augmented with the an else statement alongside an `<ng-template>` as:
```html
  <ng-container *ngIf="condition; else templateA">
    ...
  </ng-container>
  <ng-template #templateA>
    ...
  </ng-template>
```

Or we can even only use the `<ng-container>` to redirect to the correct views without even needing to prove any content for it:
```html
  <ng-container *ngIf="condition; then templateA else templateB"></ng-container>
  <ng-template #templateA>
    ...
  </ng-template>
  <ng-template #templateB>
    ...
  </ng-template>
```


### Cleaner DOMs and Styles

Sometimes having extra DOM elements can actually hinder our solutions and force us to need workarounds to accomplish what would otherwise be straightforward.

Let's for example take the following HTML:

```html
<div class="flex-container">
  <ng-container *ngIf="numbers">
    <span>1</span>
    <span>2</span>
    <span>3</span>
  </ng-container>
  <ng-container *ngIf="letters">
    <span>A</span>
    <span>B</span>
    <span>C</span>
  </ng-container>
</div>
```

Which gets styled by the following css code:
```css
.flex-container {
  display: flex;
  justify-content: space-between;
}
```

Note how valuable is here not to have extra elements added to the DOM, thanks to that our flex container can apply its `justify-content` to the correct elements, no matter on whether both `*ngIf`'s conditions satisfied, just one or none, if we would have had to use `div`s instead of `ng-container` this would have been much more difficult since we would also need to make such `div`s flex containers as well and make them match the parent's layout accordingly.

Naturally this not only applied to flex containers, but to any other css styling which depends on the actual DOM structure (as for example `grid`, margins, the child combinator selector, etc...).

### Combination of multiple structural directives
Multiple structural directives cannot be used on the same element, so if you need to take advantage of more than one structural directive it is advised to use an `<ng-container>` per structural directive.

The most common scenario is with `*ngIf` and `*ngFor`, lets for example imagine that we have a list of items but each item needs to be showed only if a certain condition is true, we could be tempted to try something like:
```html
<ul>
  <li *ngFor="let item of items" *ngIf="item.isValid">
    {{ item.name }}
  </li>
</ul>
```

As we said that would not work, so what we can do is to simply move one of the structural directives to an `<ng-container>` element which would then wrap the other one, like so:
```html
<ul>
  <ng-container *ngFor="let item of items">
    <li *ngIf="item.isValid">
      {{ item.name }}
    </li>
  </ng-container>
</ul>
```

This would work as intended without introducing any new unnecessary elements in the DOM.

### Use alongside ngTemplateOutlet

`NgTemplateOutlet` directives can be applied to any element but they are most of the time applied
to `<ng-container>` ones since by combining the two we get a very clear and easy to follow HTML and DOM
structure in which no extra elements are necessary present and template views are instantiated where requested.

You can see an example of this in the [`NgTemplateOutlet`s api documentation page](/api/common/NgTemplateOutlet).

