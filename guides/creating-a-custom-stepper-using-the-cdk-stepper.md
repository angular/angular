# Creating a custom stepper using the CDK stepper

The [CDK stepper](https://material.angular.io/cdk/stepper/overview) allows to build a custom stepper which you can completely style yourself without any specific Material Design styling.

In this guide, we'll learn how we can build our own custom stepper using the CDK stepper. Here is what we'll build by the end of this guide:

<!-- example(cdk-custom-stepper-without-form) -->

## Create our custom stepper component

Now we are ready to create our custom stepper component. Therefore, we need to create a new Angular component which extends `CdkStepper`:

**custom-stepper.component.ts**

```ts
@Component({
  selector: "app-custom-stepper",
  templateUrl: "./custom-stepper.component.html",
  styleUrls: ["./custom-stepper.component.css"],
  // This custom stepper provides itself as CdkStepper so that it can be recognized
  // by other components.
  providers: [{ provide: CdkStepper, useExisting: CustomStepperComponent }]
})
export class CustomStepperComponent extends CdkStepper {
  onClick(index: number): void {
    this.selectedIndex = index;
  }
}
```

After we've extended our component class from `CdkStepper` we can now access different properties from this class like `linear`, `selectedIndex` and `steps` which are defined in the [API documentation](https://material.angular.io/cdk/stepper/api#CdkStepper).

This is the HTML template of our custom stepper component:

**custom-stepper.component.html**

```html
<section class="container">
  <header><h2>Step {{selectedIndex + 1}}/{{steps.length}}</h2></header>

  <div [style.display]="selected ? 'block' : 'none'">
    <!-- Content from the CdkStep is projected here -->
    <ng-container [ngTemplateOutlet]="selected.content"></ng-container>
  </div>

  <footer class="step-navigation-bar">
    <button class="nav-button" cdkStepperPrevious>&larr;</button>
    <button
      class="step"
      *ngFor="let step of steps; let i = index;"
      [ngClass]="{'active': selectedIndex === i}"
      (click)="onClick(i)"
    >
      Step {{i + 1}}
    </button>
    <button class="nav-button" cdkStepperNext>&rarr;</button>
  </footer>
</section>
```

In the `app.component.css` file we can now style the stepper however we want:

**custom-stepper.component.css**

```css
.example-container {
  border: 1px solid black;
  padding: 10px;
  margin: 10px;
}

.example-step-navigation-bar {
  display: flex;
  justify-content: flex-start;
  margin-top: 10px;
}

.example-active {
  color: blue;
}

.example-step {
  background: transparent;
  border: 0;
  margin: 0 10px;
  padding: 10px;
  color: black;
}

.example-step.example-active {
  color: blue;
  border-bottom: 1px solid blue;
}

.example-nav-button {
  background: transparent;
  border: 0;
}
```

## Using our new custom stepper component

Now we are ready to use our new custom stepper component and fill it with steps. Therefore we can, for example, add it to our `app.component.html` and define some steps:

**app.component.html**

```html
<app-custom-stepper>
  <cdk-step><p>This is any content of "Step 1"</p></cdk-step>
  <cdk-step><p>This is any content of "Step 2"</p></cdk-step>
</app-custom-stepper>
```

As you can see in this example, each step needs to be wrapped inside a `<cdk-step>` tag.

If you want to iterate over your steps and use your own custom component you can do it, for example, this way:

```html
<app-custom-stepper>
  <cdk-step *ngFor="let step of mySteps; let stepIndex = index">
    <my-step-component [step]="step"></my-step-component>
  </cdk-step>
</app-custom-stepper>
```

## Linear mode

The above example allows the user to freely navigate between all steps. The `CdkStepper` additionally provides the linear mode which requires the user to complete previous steps before proceeding.

A simple example without using forms could look this way:

**app.component.html**

```html
<app-custom-stepper linear>
  <cdk-step editable="false" [completed]="completed">
    <input type="text" name="a" value="Cannot proceed to next step" />
    <button (click)="completeStep()">Complete step</button>
  </cdk-step>
  <cdk-step editable="false">
    <input type="text" name="b" value="b" />
  </cdk-step>
</app-custom-stepper>
```

**app.component.ts**

```ts
export class AppComponent {
  completed = false;

  completeStep(): void {
    this.completed = true;
  }
}
```
