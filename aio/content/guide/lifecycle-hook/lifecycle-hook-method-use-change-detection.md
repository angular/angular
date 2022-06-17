# Use change detection hook method

The Angular framework detects changes to the `@input` properties and runs the `ngOnChanges()` hook method of a component or directive.
The following code example monitors the `OnChanges()` hook method.

<!-- vale off -->

<code-tabs>
    <code-pane format="typescript" header="on-changes.component.ts" language="typescript">import { Component, Input, OnChanges, SimpleChanges } from '&commat;angular/core'; &NewLine;import { NameOfObject } from './name-of-object.ts'; &NewLine; &NewLine;&commat;Component({ &NewLine; &nbsp;selector: 'on-changes', &NewLine; &nbsp;template: &grave; &NewLine; &nbsp;&lt;div class="info"&gt; &NewLine; &nbsp; &nbsp;&lt;p&gt;{{inputProperty1.childProperty}} relates to {{inputProperty2}}&lt;/p&gt; &NewLine; &NewLine; &nbsp; &nbsp;&lt;h3&gt;Change Log&lt;/h3&gt; &NewLine; &nbsp; &nbsp;&lt;div *ngFor="let chg of changeLog" class="log"&gt;{{chg}}&lt;/div&gt; &NewLine; &nbsp;&lt;/div&gt; &NewLine; &nbsp;&grave; &NewLine;}) &NewLine;export class OnChangesComponent implements OnChanges { &NewLine; &nbsp;&commat;Input() inputProperty1!: NameOfObject; &NewLine; &nbsp;&commat;Input() inputProperty2 = ''; &NewLine; &NewLine; &nbsp;changeLog: string[] = []; &NewLine; &NewLine; &nbsp;ngOnChanges(changes: SimpleChanges) { &NewLine; &nbsp; &nbsp;for (const propName in changes) { &NewLine; &nbsp; &nbsp; &nbsp;const chng = changes[propName]; &NewLine; &nbsp; &nbsp; &nbsp;const curVal  = JSON.stringify(chng.currentValue); &NewLine; &nbsp; &nbsp; &nbsp;const prevVal = JSON.stringify(chng.previousValue); &NewLine; &nbsp; &nbsp; &nbsp;this.changeLog.push(&grave;&dollar;{propName}: currentValue = &dollar;{curVal}, previousValue = &dollar;{prevVal}&grave;); &NewLine; &nbsp; &nbsp;} &NewLine; &nbsp;} &NewLine; &NewLine; &nbsp;reset() { this.changeLog = []; } &NewLine;} </code-pane>
    <code-pane format="html" header="on-changes-parent.component.html" language="html"> &lt;h2&gt;{{title}}&lt;/h2&gt; &NewLine;&lt;label for="inputProperty2-input"&gt;Input value of property 2: &lt;/label&gt; &NewLine;&lt;input type="text" id="inputProperty2-input" [(ngModel)]="inputProperty2"&gt; &NewLine;&lt;label for="inputProperty1-childProperty"&gt; Child value of object 1: &lt;/label&gt; &NewLine;&lt;input type="text" id="inputProperty1-childProperty" [(ngModel)]="inputProperty1.childProperty"&gt; &NewLine; &NewLine;&lt;button type="button" (click)="reset()"&gt;Reset Log&lt;/button&gt; &NewLine; &NewLine;&lt;on-changes [inputProperty1]="inputProperty1" [inputProperty2]="inputProperty2"&gt;&lt;/on-changes&gt; </code-pane>
    <code-pane format="typescript" header="on-changes-parent.component.ts" language="typescript">import { Component, ViewChild } from '&commat;angular/core'; &NewLine; &NewLine;import { NameOfObject } from './name-of-object.ts'; &NewLine;import { OnChanges } from './on-changes.component'; &NewLine; &NewLine;&commat;Component({ &NewLine; &nbsp;selector: 'on-changes-parent', &NewLine; &nbsp;templateUrl: './on-changes-parent.component.html', &NewLine; &nbsp;styles: [''] &NewLine;}) &NewLine;export class OnChangesParent { &NewLine; &nbsp;inputProperty1!: NameOfObject; &NewLine; &nbsp;inputProperty2 = ''; &NewLine; &nbsp;title = 'OnChanges'; &NewLine; &nbsp;&commat;ViewChild(OnChanges) childView!: OnChanges; &NewLine; &NewLine; &nbsp;constructor() { &NewLine; &nbsp; &nbsp;this.reset(); &NewLine; &nbsp;} &NewLine; &NewLine; &nbsp;reset() { &NewLine; &nbsp; &nbsp;// new NameOfObject object every time; triggers onChanges &NewLine; &nbsp; &nbsp;this.inputProperty1 = new NameOfObject('propertyValue1'); &NewLine; &nbsp; &nbsp;// set inputProperty2 only triggers onChanges if this value is different &NewLine; &nbsp; &nbsp;this.inputProperty2 = 'propertyValue2'; &NewLine; &nbsp; &nbsp;if (this.childView) { &NewLine; &nbsp; &nbsp; &nbsp;this.childView.reset(); &NewLine; &nbsp; &nbsp;} &NewLine; &nbsp;} &NewLine;} </code-pane>
    <code-pane format="typescript" header="name-of-object.ts" language="typescript">export class NameOfObject { &NewLine; &nbsp;constructor(public childProperty: string) { } &NewLine;} </code-pane>
</code-tabs>

<!-- vale on -->

The `ngOnChanges()` hook method takes an object.
The Angular framework maps the name of each changed property of the object to an instance of the [SimpleChange][AioApiCoreSimplechange] object.
The [SimpleChange][AioApiCoreSimplechange] object holds the current and previous values of each property.
The `ngOnChanges()` hook method iterates over the changed properties and logs each.

The following code example shows the input properties of the `on-changes` component.

<code-example format="typescript" header="on-changes.component.ts" language="typescript">

&commat;Input() inputProperty1!: NameOfObject;
&commat;Input() inputProperty2 = '';

</code-example>

The following code example shows the `OnChangesParent` host component binds to the input properties.

<code-example format="html" header="on-changes-parent.component.html" language="html">

&lt;on-changes [inputProperty1]="inputProperty1" [inputProperty2]="inputProperty2"&gt;&lt;/on-changes&gt;

</code-example>

<!-- The following image shows the user changes in action.

<div class="lightbox">

<img alt="OnChanges" src="generated/images/guide/lifecycle-hooks/on-changes-anim.gif">

</div> -->

When you change the value of the `inputProperty2` element tag in the UI, the Angular framework completes the following actions.

*   Updates the value of the `inputProperty2` property
*   Adds a console entry that contains the string value of the `inputProperty2` property

<div class="alert is-important">

**IMPORTANT**: <br />
The `ngOnChanges()` hook method is the child of the `NameOfObject` property and does not catch changes to `childProperty` property.


</div>

The Angular framework only runs the hook method when the user changes the value of the `inputProperty1` property.
The `inputProperty1` is the input property, and the value of the `inputProperty1` property is the reference to the `NameOfObject` object.
The reference to the `NameOfObject` object does not change when the user changes the value of the `childProperty` property.

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-06-16
