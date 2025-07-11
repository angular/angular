export const NgModelTemplate = `<input [(ngModel)]="name" #ctrl="ngModel" required />

<p>Value: {{ name }}</p>
<p>Valid: {{ ctrl.valid }}</p>

<button (click)="setValue()">Set value</button>`;
