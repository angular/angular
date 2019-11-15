# Migrate Components

Next, you need to start converting each component by providing the UI implementation for each.

Converting a web component to a shared component usually involves:

1. Adding `.tns.html` and `.tns.css` files
2. Adding the component to the NativeScript AppModule **declarations**
3. Update navigation configuration to display the component
4. Providing template and styling code

The first two steps can be easily automated with a little help from the Angular CLI and NativeScript Schematics.

Here is an example of what this command looks like:

```sh
ng generate migrate-component --name=cmp-name
```

or in short:

```sh
ng g mc --name=cpm-name
```

## Migrate Component - Product List

The first component that you should start with is the **Product List component**, as this is the first component that gets loaded when the app starts. Run the following command:

```sh
ng generate migrate-component --name=product-list
```

This will:

- generate `product-list.component.tns.html` with the commented-out html from `product-list.component.html`
- generate an empty `product-list.component.tns.css`
- add the **ProductListComponent** to the **Declarations** of `app.module.tns.ts`

You should see these 3 file changes:

```
src
└── app
    ├── product-list
    |   ├── product-list.component.html
    |   ├── product-list.component.tns.html <= create
    |   └── product-list.component.ts
    |   └── product-list.component.tns.css  <= create
    |   └── product-list.component.css
    ├── app.module.tns.ts                   <= update
    └── app.module.ts           
```

### Update mobile Router configuration

During the migration the **Router Configuration** for the web and mobile apps are kept separately. This is especially useful during the migration process, as at the beginning, most of your components will be web only, so your mobile app won't be able to navigate to the not-yet-converted components.

The **Product List component** can be added to the NativeScript Routes.

Open `app-routing.module.tns.ts` and replace the **Routes** array with:

```typescript
import { ProductListComponent } from '@src/app/product-list/product-list.component';

export const routes: Routes = [
  { path: '', component: ProductListComponent },
];
```

After you save, your project should update and look like this:

<img src="generated/images/guide/nativescript/3-product-list-migrated-android.png" height="600">
<img src="generated/images/guide/nativescript/3-product-list-migrated-ios.png" height="600">

If that is the case, then you are on the right way to move forward.

### Update template

Now, you need to update the NativeScript UI template to match the content from the web app.

<div class="alert is-helpful">

This tutorial won't dive too deep into building the UI using NativeScript components. You can check out the NativeScript documentation to learn more about [UI Widgets](https://docs.nativescript.org/angular/ui/ng-ui-widgets/action-bar) and [Layouts](https://docs.nativescript.org/angular/ui/layouts/layouts). There is also an [interactive tutorial for NativeScript layouts](https://www.nslayouts.com/).

</div>

Let's go quickly through the web template and convert it to NativeScript. 

<div class="alert is-helpful">

Note that all template changes should be done in the `.tns.html` files (i.e. `product-list.component.tns.html`), while the `.html` files should be left intact.

</div>

`product-list.component.html`

```html
<h2>Products</h2>

<div *ngFor="let product of products; index as productId">

  <h3>
    <a [title]="product.name + ' details'" [routerLink]="['/products', productId]">
      {{ product.name }}
    </a>
  </h3>
  <p *ngIf="product.description">
    Description: {{ product.description }}
  </p>

  <button (click)="share()">
    Share
  </button>

  <app-product-alerts [product]="product" (notify)="onNotify()">
  </app-product-alerts>
</div>
```

**Step #1**

First, you have:

```html
<h2>Products</h2>
```

This is clearly the title of the page. An `ActionBar` is the best component to serve as a title ([see NativeScript docs for ActionBar](https://docs.nativescript.org/angular/ui/ng-components/action-bar)).

Add the following to `product-list.component.tns.html` at the top.

```html
<ActionBar title="Products">
</ActionBar>
```

Below the `ActionBar` you have a `StackLayout` container ([see NativeScript docs for StackLayout](https://docs.nativescript.org/angular/ui/ng-components/layouts#stack-layout)), which is used to hold the contents of the page. Remove the three labels that are inside, like this:

```html
<ActionBar title="Products">
</ActionBar>
<StackLayout>
	<!-- Page content goes here -->
</StackLayout>
```

<div class="alert is-helpful">

Please note that besides the **ActionBar**, a NativeScript template (the same rule also applies to **ng-template**) can only contain one component. This is why you need a Layout component, which contains all the other components.

</div>

**Step #2**

Then you have a `div` that is repeated with `*ngFor` for each **product** in the **products** array.

```html
<div *ngFor="let product of products; index as productId">
  ...
</div>
```

Although you can use `*ngFor` in a mobile app, in most of the cases this is best handled by a `ListView` component, which helps with scrolling through the items and optimises GPU and memory handling for large data sources.

<div class="alert is-helpful">

You can learn more about the ListView and other similar components from this article: 

[ListView, RadListView, and Repeater - Why Do I Need Three?](https://www.nativescript.org/blog/listview-radlistview-and-repeater-why-do-i-need-three)

</div>

Add a `ListView` ([see NativeScript docs for ListView](https://docs.nativescript.org/angular/ui/ng-components/listview)) component inside the `StackLayout`, like this:

```html
<StackLayout>
  <!-- Page content goes here -->
  <ListView [items]="products" class="list-group" height="100%">
    <ng-template let-product="item" let-productId="index">

    </ng-template>
  </ListView>
</StackLayout>
```

Note the following:

- `[items]` — is used to provide a **data source**, it can also be used with an `async` pipe, like this:

  ```html
  <ListView [items]="data | async">
  ```

- `let-product="item"` — is used to provide a **name** for each item in the array, in this case the name for each item is **product**,

- `let-productId="index"` — is used to provide a name for **index** of the item, in this case the name of the index is **productId**

**Step 3**

Next, you need to reproduce the `<div>` and all of its contents:

`product-list.component.html`

```html
<div *ngFor="let product of products; index as productId">

  <h3>
    <a [title]="product.name + ' details'" [routerLink]="['/products', productId]">
      {{ product.name }}
    </a>
  </h3>
  <p *ngIf="product.description">
    Description: {{ product.description }}
  </p>

  <button (click)="share()">
    Share
  </button>

  <app-product-alerts [product]="product" (notify)="onNotify()">
  </app-product-alerts>
</div>
```

You can convert it to the NativeScript template by replacing:

- the `<div>` container with a `<StackLayout>`

  ```html
  <StackLayout class="list-group-item">
  
  </StackLayout>
  ```

- the `<h3><a>` product name and link with a `<Label>` ([see NativeScript docs for Label](https://docs.nativescript.org/angular/ui/ng-components/label)) — where **product.name** is provided with `[text]` and the navigation path is provided with `[nsRouterLink]`:

  ```html
  <Label [nsRouterLink]="['/products', productId]"
    [text]="product.name" textWrap="true" class="title">
  </Label>
  ```

  <div class="alert is-helpful">

  NativeScript provides its own `NativeScriptRouterModule` that extends the Angular RouterModule. It contains some extensions and additions that are essential for routing to work in a mobile environment and also provide options to bring the full native mobile navigation UX to Angular.

  To learn more about NativeScript Navigation with Angular [see NativeScript docs](https://docs.nativescript.org/core-concepts/angular-navigation).

  </div>

- the `p` element again with a `<Label>`, where we can preserve the `*ngIf` directive and add a `text` property as follows:

  ```html
  <Label *ngIf="product.description"
    text="Description: {{ product.description }}" textWrap="true">
  </Label>
  ```

- the `<button>` with a `<Button>`([see NativeScript docs for Button](https://docs.nativescript.org/angular/ui/ng-components/button)) — where you use the `(tap)` event instead of the `(click)` event (as you don't click on touch screens), and the text of the button is provided with the `text` attribute:

  ```html
  <Button (tap)="share()" text="Share" class="btn-blue"></Button>
  ```

- the `<app-product-alerts>` component is not mobile ready yet, so just leave it as a comment:

  ```html
  <!--   
    <app-product-alerts [product]="product" (notify)="onNotify()">
    </app-product-alerts>
  -->
  ```

The whole template should look like this:

`product-list.component.tns.html`

```html
<ActionBar title="Products">
</ActionBar>
<StackLayout>
  <ListView [items]="products" class="list-group" height="100%">
    <ng-template let-product="item" let-productId="index">
      <StackLayout class="list-group-item">
        <Label [nsRouterLink]="['/products', productId]"
               [text]="product.name" textWrap="true" class="title">
        </Label>

        <Label *ngIf="product.description"
               text="Description: {{ product.description }}" textWrap="true">
        </Label>

        <Button (tap)="share()" text="Share" class="btn-blue"></Button>
        
        <!--   
          <app-product-alerts [product]="product" (notify)="onNotify()">
          </app-product-alerts>
        -->
      </StackLayout>
    </ng-template>
  </ListView>
</StackLayout>
```

After you save, your app should look like this:

<img src="generated/images/guide/nativescript/3-product-list-updated-android.png" height="600">
<img src="generated/images/guide/nativescript/3-product-list-updated-ios.png" height="600">

## Migrate Component: Product Alerts

Next, you should tackle the **ProductAlerts component**, which is used as a presentation component in the **ProductList template**.

**Step 1**

First, run the migration schematic:

```sh
ng g mc --name=product-alerts
```

**Step 2**

Next — based on the web template — you need to update the mobile template:

`product-alerts.component.html`

```html
<p *ngIf="product.price > 700">
  <button (click)="notify.emit()">Notify Me</button>
</p>
```

You should update the mobile template like this:

`product-alerts.component.tns.html`

```html
<StackLayout *ngIf="product.price > 700">
  <Button (tap)="notify.emit()" text="Notify Me" class="btn-green"></Button>
</StackLayout>
```

**Step 3**

Open `product-list.component.tns.html` and remove the comments around `<app-product-alerts>`:

```html
<ActionBar title="Products">
</ActionBar>
<StackLayout>
  <ListView [items]="products" class="list-group" height="100%">
    <ng-template let-product="item" let-productId="index">
      <StackLayout class="list-group-item">
        <Label [nsRouterLink]="['/products', productId]"
               [text]="product.name" textWrap="true" class="title">
        </Label>

        <Label *ngIf="product.description"
               text="Description: {{ product.description }}" textWrap="true">
        </Label>

        <Button (tap)="share()" text="Share" class="btn-blue"></Button>
        
        <app-product-alerts [product]="product" (notify)="onNotify()">
        </app-product-alerts>
      </StackLayout>
    </ng-template>
  </ListView>
</StackLayout>
```

After you save all your files, your app should look like this:

<img src="generated/images/guide/nativescript/4-product-alerts-android.png" height="600">
<img src="generated/images/guide/nativescript/4-product-alerts-ios.png" height="600">


**Step 4**

When you test the **Share** and **Notify Me** buttons in a mobile application, you will get a long error, which will complain that `window.alert()` doesn't exist on the mobile platforms.

The `alert()` function is available without `window` for both web and mobile. To solve the issue change `window.alert()` to `alert()`. 

`product-list.component.ts`

```typescript
share() {
  alert('The product has been shared!');
}

onNotify() {
  alert('You will be notified when the product goes on sale');
}
```

After you save all your files, and press the `Notify Me` button, you should get a message in an alert modal:

<img src="generated/images/guide/nativescript/4-product-alerts-alert-android.png" height="600">
<img src="generated/images/guide/nativescript/4-product-alerts-alert-ios.png" height="600">


## Migrate Component: Product Details

The next component to migrate is the **Product Details component**. This is the component the app navigates to when you click/tap on a name of a phone.

This follows the same steps, as you did it last time.

**Step 1**

Run the migration schematic:

```sh
ng g migrate-component --name=product-details
```

**Step 2**

Update the navigation configuration in `app-routing.module.tns.ts`:

```typescript
import { ProductDetailsComponent } from '@src/app/product-details/product-details.component';

export const routes: Routes = [
  { path: '', component: ProductListComponent },
  { path: 'products/:productId', component: ProductDetailsComponent },
];
```

**Step 3**

Translate HTML to NativeScript template.

`product-details.component.html`

```html
<h2>Product Details</h2>

<div *ngIf="product">
  <h3>{{ product.name }}</h3>
  <h4>{{ product.price | currency }}</h4>
  <p>{{ product.description }}</p>

  <button (click)="addToCart(product)">Buy</button>
</div>
```

The above translates really nicely, as follows:

- `<h2>` => `ActionBar`

  ```html
  <ActionBar title="Product Details">
  </ActionBar>
  ```

- `<div>` => `<FlexboxLayout>` with items displayed in a column, and aligned in the center ([see NativeScript docs for FlexboxLayout](https://docs.nativescript.org/ui/layouts/layout-containers#flexboxlayout)):

  ```html
  <FlexboxLayout flexDirection="column" alignItems="center" class="m-10">
    
  </FlexboxLayout>
  ```

- `<h3>`, `<h4>` and `<p>` => `<Label>`

  ```html
  <Label text="{{ product.name }}" class="title"></Label>
  <Label text="{{ product.price | currency }}" class="h2"></Label>
  <Label text="{{ product.description }}" textWrap="true" class="h3"></Label>
  ```

- `<button>` => `<Button>`

  ```html
  <Button (tap)="addToCart(product)" text="Buy" class="btn-green"></Button>
  ```

Your NativeScript template should look like this:

`product-details.component.tns.html`

```html
<ActionBar title="Product Details">
</ActionBar>
<FlexboxLayout flexDirection="column" alignItems="center" class="m-10">
  <Label text="{{ product.name }}" class="title"></Label>
  <Label text="{{ product.price | currency }}" class="h2"></Label>
  <Label text="{{ product.description }}" textWrap="true" class="h3"></Label>

  <Button (tap)="addToCart(product)" text="Buy" class="btn-green"></Button>
</FlexboxLayout>
```

**Step 4**

Fix the call to `window.alert` in `product-details.component.ts`. Change `window.alert` to `alert`.

`product-details.component.ts`

```typescript
  addToCart(product) {
    alert('Your product has been added to the cart!');
    this.cartService.addToCart(product);
  }
```

After you save all your files, and navigate to details, your app should look like this:

<img src="generated/images/guide/nativescript/5-product-details-android.png" height="600">
<img src="generated/images/guide/nativescript/5-product-details-ios.png" height="600">

## Migrate Component: Cart

Migrating the **Cart component** is a little more challenging task, as it uses `FormBuilder`, which is not directly supported in NativeScript. This makes for a great example on how to handle web and mobile specific code.

### Handling Web/Mobile specific code

One of the best ways to handle a scenario like this is to extract the constructing of a `FormBuilder` to a service. Then have two implementations of the same service, one that uses `FormBuilder`, and the other that recreates the same functionality without a `FormBuilder`.

**Step 1**

Create a **Checkout Form service**:

```sh
ng generate service form/checkout-form
```

Remove `providedIn` from the directive definition, as you will provide this service directly in the **Cart component**.

Using Dependency Injection, request `FormBuilder`, then add a method called `prepareCheckoutForm()`, which should return a form with `name` and `address` properties. Like this:

`form/checkout-form.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Injectable()
export class CheckoutFormService {
  constructor(private formBuilder: FormBuilder) { }

  prepareCheckoutForm() {
    return this.formBuilder.group({
      name: '',
      address: ''
    });
  }
}
```

**Step 2**

Make a copy of `checkout-form.service.ts` and call it `checkout-form.service.tns.ts`.

In there you need to add an implementation of `CheckoutForm` class with `name` and `address` properties and the `reset()` method.

Then update the `prepareCheckoutForm()` in `CheckoutFormService` to return a new `CheckoutForm`.

`form/checkout-form.service.tns.ts`

```typescript
import { Injectable } from '@angular/core';

export class CheckoutForm {
  public name = '';
  public address = '';

  public reset() {
    this.name = '';
    this.address = '';
  }
}

@Injectable()
export class CheckoutFormService {
  public prepareCheckoutForm() {
    return new CheckoutForm();
  }
}
```

**Step 3**

Finally, you need to update the **CartComponent class** to use the `CheckoutFormService`.

Add `CheckoutFormService` to the `@Component` => `providers`:

`cart/cart.component.ts`

```typescript
import { CheckoutFormService } from '@src/app/form/checkout-form.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  providers: [CheckoutFormService]
})
```

Update the constructor to use `CheckoutFormService` instead of `FormBuilder`:

`cart/cart.component.ts`

```typescript
  constructor(
    private cartService: CartService,
    private formService: CheckoutFormService
  ) {
    this.items = this.cartService.getItems();
    this.checkoutForm = this.formService.prepareCheckoutForm();
  }
```

Also, make sure to remove all references to `FormBuilder`.

`cart.component.ts` should look like this:

```typescript
import { Component } from '@angular/core';

import { CartService } from '@src/app/cart.service';
import { CheckoutFormService } from '@src/app/form/checkout-form.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  providers: [CheckoutFormService]
})
export class CartComponent {
  items;
  checkoutForm;

  constructor(
    private cartService: CartService,
    private formService: CheckoutFormService
  ) {
    this.items = this.cartService.getItems();
    this.checkoutForm = this.formService.prepareCheckoutForm();
  }

  onSubmit(customerData) {
    console.warn('Your order has been submitted', customerData);

    this.items = this.cartService.clearCart();
    this.checkoutForm.reset();
  }
}
```

#### Summary

Splitting platform-specific functionality into separate files/services allows you to handle code differences in an elegant fashion, whilst keeping the common functionality shared.

### Migrating the rest of the component

Finally, you can update the **Cart component** to be code-sharing ready.

**Step 1**

Run the migration schematic:

```sh
ng g migrate-component --name=cart
```

**Step 2**

Update the navigation configuration in `app-routing.module.tns.ts`:

```typescript
import { CartComponent } from '@src/app/cart/cart.component';

export const routes: Routes = [
  { path: '', component: ProductListComponent },
  { path: 'products/:productId', component: ProductDetailsComponent },
  { path: 'cart', component: CartComponent },
];
```

**Step 3**

Update the **ProductList template**, to add a navigation link (`ActionItem`) for cart in the `ActionBar`.

`product-list.component.tns.html`

```html
<ActionBar title="Products">
  <ActionItem ios.position="right" [nsRouterLink]="['/cart']">
    <Label text="Cart" class="action-bar-item"></Label>
  </ActionItem>
</ActionBar>
```

The **Product List** should look like this:

<img src="generated/images/guide/nativescript/6-product-list-android.png" height="600">
<img src="generated/images/guide/nativescript/6-product-list-ios.png" height="600">

**Step 4**

Translate your HTML to a NativeScript template.

`cart.component.html`

```html
<h3>Cart</h3>

<p>
  <a routerLink="/shipping">Shipping Prices</a>
</p>

<div class="cart-item" *ngFor="let item of items">
  <span>{{ item.name }} </span>
  <span>{{ item.price | currency }}</span>
</div>

<form [formGroup]="checkoutForm" (ngSubmit)="onSubmit(checkoutForm.value)">
  <div>
    <label>Name</label>
    <input type="text" formControlName="name">
  </div>

  <div>
    <label>Address</label>
    <input type="text" formControlName="address">
  </div>

  <button class="button" type="submit">Purchase</button>
</form>
```

The above translates really nicely, as follows:

`<h3>` => `ActionBar`

```html
<ActionBar title="Cart">
</ActionBar>
```

As a container we could use a `StackLayout`, and position it inside a `ScrollView` to provide a scrollable area when the content is larger than its bounds.

```html
  <ScrollView>
    <StackLayout>

    </StackLayout>
  </ScrollView>
```

Then the Shipping Prices link:

```html
<p>
  <a routerLink="/shipping">Shipping Prices</a>
</p>
```

translates to:

```html
<Button row="0"
  text="Shipping Prices" nsRouterLink="/shipping" class="btn btn-outline">
</Button>
```

and the item name and price spans:

```html
<div class="cart-item" *ngFor="let item of items">
  <span>{{ item.name }} </span>
  <span>{{ item.price | currency }}</span>
</div>
```

translate to:

```html
<Label row="1" *ngIf="!items.length"
  text="No Items in the Cart" class="h2 text-center m-10">
</Label>

<StackLayout row="1" class="m-8">
  <GridLayout *ngFor="let item of items" columns="* auto" class="list-group cart-item">
    <Label col="0" [text]="item.name" class="list-group-item"></Label>
    <Label col="1" [text]="item.price | currency" class="list-group-item"></Label>
  </GridLayout>
</StackLayout>
```

The check out form:

```html
<form [formGroup]="checkoutForm" (ngSubmit)="onSubmit(checkoutForm.value)">
  <div>
    <label>Name</label>
    <input type="text" formControlName="name">
  </div>

  <div>
    <label>Address</label>
    <input type="text" formControlName="address">
  </div>

  <button class="button" type="submit">Purchase</button>
</form>
```

translates to:

```html
<GridLayout row="2" rows="auto auto auto" columns="auto *" class="form">
  <Label row="0" col="0" text="Name"></Label>
  <TextField row="0" col="1" [(ngModel)]="checkoutForm.name" hint="name..."></TextField>
  <Label row="1" col="0" text="Address"></Label>
  <TextField row="1" col="1" [(ngModel)]="checkoutForm.address" hint="address..."></TextField>
</GridLayout>
<Button text="Purchase" (tap)="onSubmit(checkoutForm)" class="btn-green"></Button>
```

Before we can use the `ngModel` directive in data binding, we must import the `NativeScriptFormsModule` and add it to the Angular module's imports list.

Open `app.module.tns.ts` where you will find a commented import for **NativeScriptFormsModule class** (*line 10*). Uncomment it, and add **NativeScriptFormsModule** to @NgModule **imports**, like this:

```typescript
import { NativeScriptFormsModule } from 'nativescript-angular/forms';

@NgModule({
  ...
  imports: [
    NativeScriptModule,
    AppRoutingModule,
    NativeScriptHttpClientModule,
    NativeScriptFormsModule
  ],
```

Finally, the `cart.component.tns.html` should look like this:

```html
<ActionBar title="Cart">
</ActionBar>
<ScrollView>
  <StackLayout>
    <Button row="0" 
      text="Shipping Prices" nsRouterLink="/shipping" class="btn btn-outline">
    </Button>

    <Label row="1" *ngIf="!items.length"
      text="No Items in the Cart" class="h2 text-center m-10">
    </Label>

    <StackLayout row="1" class="m-8">
      <GridLayout *ngFor="let item of items" columns="* auto" class="list-group cart-item">
        <Label col="0" [text]="item.name" class="list-group-item"></Label>
        <Label col="1" [text]="item.price | currency" class="list-group-item"></Label>
      </GridLayout>
    </StackLayout>

    <GridLayout row="2" rows="auto auto auto" columns="auto *" class="form">
      <Label row="0" col="0" text="Name"></Label>
      <TextField row="0" col="1" [(ngModel)]="checkoutForm.name" hint="name..."></TextField>
      <Label row="1" col="0" text="Address"></Label>
      <TextField row="1" col="1" [(ngModel)]="checkoutForm.address" hint="address..."></TextField>
    </GridLayout>
    <Button text="Purchase" (tap)="onSubmit(checkoutForm)" class="btn-green"></Button>

  </StackLayout>
</ScrollView>
```

The **Cart page** should look like this:

<img src="generated/images/guide/nativescript/7-cart-android.png" height="600">
<img src="generated/images/guide/nativescript/7-cart-ios.png" height="600">

## Migrate Component: Shipping

The final component to migrate is the **Shipping component**. This is the component the app navigates to during cart checkout for reviewing the available shipping options.

**Step 1**

Run the migration schematic:

```sh
ng g migrate-component --name=shipping
```

**Step 2**

Update the navigation configuration in `app-routing.module.tns.ts`:

```typescript
import { ShippingComponent } from '@src/app/shipping/shipping.component';

export const routes: Routes = [
  { path: '', component: ProductListComponent },
  { path: 'products/:productId', component: ProductDetailsComponent },
  { path: 'cart', component: CartComponent },
  { path: 'shipping', component: ShippingComponent },
];
```

**Step 3**

Update the NativeScript template:

`shipping.component.tns.html`

```html
<ActionBar title="Shipping Prices">
</ActionBar>

<StackLayout class="m-8">
  <GridLayout *ngFor="let shipping of shippingCosts | async" rows="auto" columns="120 *"
    class="shipping-item list-group">
    <Label col="0" [text]="shipping.type" class="list-group-item"></Label>
    <Label col="1" [text]="shipping.price | currency" class="list-group-item"></Label>
  </GridLayout>
</StackLayout>
```

Don't worry if the app doesn't work yet. Follow the below step before you test.

**Step 4**

The shipping component tries to load the data from the `shipping.json` file. This fails, because by default NativeScript doesn't bundle  **.json** files.

`shipping.component.ts`

```javascript
getShippingPrices() {
  return this.http.get('/assets/shipping.json');
}
```

NativeScript build process consists of two steps: bundling and building the native app. By default, some files like fonts and images are included in the application's bundle. The **webpack** bundler is explicitly instructed to copy these types of files to the native application in its configuration file.

Therefore, to make it possible for NativeScript to load **.json** files from the `assets` folder, you need to instruct Webpack to copy the file into the native application. This can be done with the help of `CopyWebpackPlugin` like this:

```javascript
new CopyWebpackPlugin([ 
  { from: { glob: "assets/*.json" } },
])
```

As it is already in use, just open `webpack.config.js`, find the comment line `// Copy assets to out dir. Add your own globs as needed.`
and update as follows:

`webpack.config.js`

```javascript
// Copy assets to out dir. Add your own globs as needed.
new CopyWebpackPlugin([
  { from: { glob: "assets/*.json" } },
  { from: { glob: "fonts/**" } },
  { from: { glob: "**/*.jpg" } },
  { from: { glob: "**/*.png" } },
], { ignore: [`${relative(appPath, appResourcesFullPath)}/**`] }),
```

In order to apply the changes to the `webpack.config.js` file, we need to stop the currently running process and start it again to pick up its new configuration. So, go back to your console/terminal and execute again `tns preview`.

The **Shipping page** should look like this:

<img src="generated/images/guide/nativescript/8-shipping-android.png" height="600">
<img src="generated/images/guide/nativescript/8-shipping-ios.png" height="600">

## Congratulations

Congratulations. You are now a Mobile developer! [Share this moment](https://twitter.com/intent/tweet?url=https://angular.io/guide/nativescript-intro&text=I%20just%20finished%20the%20%23Angular%20%23NativeScript%20Tutorial "Angular NativeScript on Twitter"), tell us what you thought of this Tutorial, or submit [suggestions](https://github.com/NativeScript/nativescript-schematics/issues/new/choose "NativeScript GitHub repository new issue form"). 

### Next Steps

Here are some useful resources to help you reach the next level:

* [NativeScript Angular docs](https://docs.nativescript.org/angular/start/introduction)
* [NativeScript mobile-only tutorial](https://play.nativescript.org/?template=play-ng&tutorial=getting-started-ng&utm_source=angular.io&utm_medium=web&utm_campaign=angular-tutorial) - this tutorial will guide through the steps required to create a NativeScript app from scratch
* [NativeScript Marketplace](https://market.nativescript.org/) - a website can help you find NativeScript plugins, NativeScript project templates and NativeScript Sample Apps to inspire you
* [Angular NativeScript code-sharing docs](https://docs.nativescript.org/angular/code-sharing/intro) - documentation for sharing the web and mobile code
* [NativeScript Layouts tutorial](https://www.nslayouts.com/) - this tutorial will teach you how to use various layout components available in NativeScript
