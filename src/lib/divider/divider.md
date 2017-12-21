`<mat-divider>` is a component that allows for Material styling of a line separator with various orientation options.

<!-- example(divider-overview) -->


### Simple divider

A `<mat-divider>` element can be used on its own to create a horizontal or vertical line styled with a Material theme

```html
<mat-divider></mat-divider>
```

### Inset divider

Add the `inset` attribute in order to set whether or not the divider is an inset divider.

```html
<mat-divider [inset]="true"></mat-divider>
```

### Vertical divider

Add the `vertical` attribute in order to set whether or not the divider is vertically-oriented.

```html
<mat-divider [vertical]="true"></mat-divider>
```


### Lists with inset dividers

Dividers can be added to lists as a means of separating content into distinct sections.
Inset dividers can also be added to provide the appearance of distinct elements in a list without cluttering content
like avatar images or icons. Make sure to avoid adding an inset divider to the last element
in a list, because it will overlap with the section divider.

```html
<mat-list>
   <h3 mat-subheader>Folders</h3>
   <mat-list-item *ngFor="let folder of folders; last as last">
      <mat-icon mat-list-icon>folder</mat-icon>
      <h4 mat-line>{{folder.name}}</h4>
      <p mat-line class="demo-2"> {{folder.updated}} </p>
      <mat-divider [inset]="true" *ngIf="!last"></mat-divider>
   </mat-list-item>
   <mat-divider></mat-divider>
   <h3 md-subheader>Notes</h3>
   <mat-list-item *ngFor="let note of notes">
      <mat-icon md-list-icon>note</mat-icon>
      <h4 md-line>{{note.name}}</h4>
      <p md-line class="demo-2"> {{note.updated}} </p>
   </mat-list-item>
</mat-list>
```
