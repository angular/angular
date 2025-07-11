export const eventBindingsTemplate = `<button (click)="myMethod($event, idx)"></button>
<input type="radio" (click)="updateRadioButton($event)" />
<input type="text" (change)="text = $event.target.value" />`;
