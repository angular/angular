@cheatsheetSection
Template syntax
@cheatsheetIndex 1
@description

@cheatsheetItem
`<input [value]="firstName">`|`[value]`
Binds property `value` to the result of expression `firstName`.

@cheatsheetItem
`<div [attr.role]="myAriaRole">`|`[attr.role]`
Binds attribute `role` to the result of expression `myAriaRole`.

@cheatsheetItem
`<div [class.extra-sparkle]="isDelightful">`|`[class.extra-sparkle]`
Binds the presence of the css class `extra-sparkle` on the element to the truthiness of the expression `isDelightful`.

@cheatsheetItem
`<div [style.width.px]="mySize">`|`[style.width.px]`
Binds style property `width` to the result of expression `mySize` in pixels. Units are optional.

@cheatsheetItem
`<button (click)="readRainbow($event)">`|`(click)`
Calls method `readRainbow` when a click event is triggered on this button element (or its children) and passes in the event object.

@cheatsheetItem
`<div title="Hello {{ponyName}}">`|`{{ponyName}}`
Binds a property to an interpolated string, e.g. "Hello Seabiscuit". Equivalent to:
`<div [title]="'Hello' + ponyName">`

@cheatsheetItem
`<p>Hello {{ponyName}}</p>`|`{{ponyName}}`
Binds text content to an interpolated string, e.g. "Hello Seabiscuit".

@cheatsheetItem
`<my-cmp [(title)]="name">`|`[(title)]`
Sets up two-way data binding. Equivalent to: `<my-cmp [title]="name" (title-change)="name=$event">`

@cheatsheetItem
`<video #movieplayer ...>
  <button (click)="movieplayer.play()">
</video>`|`#movieplayer`|`(click)`
Creates a local variable `movieplayer` that provides access to the `video` element instance in data-binding and event-binding expressions in the current template.

@cheatsheetItem
`<p *my-unless="myExpression">...</p>`|`*my-unless`
The `*` symbol means that the current element will be turned into an embedded template. Equivalent to:
`<template [myless]="myExpression"><p>...</p></template>`

@cheatsheetItem
`<p>Card No.: {{cardNumber | myCreditCardNumberFormatter}}</p>`|`{{cardNumber | myCreditCardNumberFormatter}}`
Transforms the current value of expression `cardNumber` via the pipe called `creditCardNumberFormatter`.

@cheatsheetItem
`<p>Employer: {{employer?.companyName}}</p>`|`{{employer?.companyName}}`
The Elvis operator (`?`) means that the `employer` field is optional and if `undefined`, the rest of the expression should be ignored.
