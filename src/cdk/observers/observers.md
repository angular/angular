### Observers

A directive for observing when the content of the host element changes. An event is emitted when a
mutation to the content is observed.

#### Example

```html
<div class="projected-content-wrapper" (cdkObserveContent)="projectContentChanged()">
  <ng-content></ng-content>
</div>
```
