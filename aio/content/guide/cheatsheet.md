<h1 class="no-toc">Cheat Sheet</h1>

<div id="cheatsheet">
<table class="is-full-width is-fixed-layout">
<tbody><tr>
<th>Bootstrapping</th>
<th><p><code>import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';</code>
</p>
</th>
</tr>
<tr>
<td><code><b>platformBrowserDynamic().bootstrapModule</b>(AppModule);</code></td>
<td><p>Bootstraps the app, using the root component from the specified <code>NgModule</code>. </p>
</td>
</tr>
</tbody></table>

<table class="is-full-width is-fixed-layout">
<tbody><tr>
<th>NgModules</th>
<th><p><code>import { NgModule } from '@angular/core';</code>
</p>
</th>
</tr>
<tr>
<td><code>@<b>NgModule</b>({ declarations: ..., imports: ...,<br>     exports: ..., providers: ..., bootstrap: ...})<br>class MyModule {}</code></td>
<td><p>Defines a module that contains components, directives, pipes, and providers.</p>
</td>
</tr><tr>
<td><code><b>declarations:</b> [MyRedComponent, MyBlueComponent, MyDatePipe]</code></td>
<td><p>List of components, directives, and pipes that belong to this module.</p>
</td>
</tr><tr>
<td><code><b>imports:</b> [BrowserModule, SomeOtherModule]</code></td>
<td><p>List of modules to import into this module. Everything from the imported modules
is available to <code>declarations</code> of this module.</p>
</td>
</tr><tr>
<td><code><b>exports:</b> [MyRedComponent, MyDatePipe]</code></td>
<td><p>List of components, directives, and pipes visible to modules that import this module.</p>
</td>
</tr><tr>
<td><code><b>providers:</b> [MyService, { provide: ... }]</code></td>
<td><p>List of dependency injection providers visible both to the contents of this module and to importers of this module.</p>
</td>
</tr><tr>
<td><code><b>entryComponents:</b> [SomeComponent, OtherComponent]</code></td>
<td><p>List of components not referenced in any reachable template, for example dynamically created from code.</p></td>
</tr><tr>
<td><code><b>bootstrap:</b> [MyAppComponent]</code></td>
<td><p>List of components to bootstrap when this module is bootstrapped.</p>
</td>
</tr>
</tbody></table>

<table class="is-full-width is-fixed-layout">
<tbody><tr>
<th>Template syntax</th>
<th></th>
</tr>
<tr>
<td><code>&lt;input <b>[value]</b>="firstName"&gt;</code></td>
<td><p>Binds property <code>value</code> to the result of expression <code>firstName</code>.</p>
</td>
</tr><tr>
<td><code>&lt;div <b>[attr.role]</b>="myAriaRole"&gt;</code></td>
<td><p>Binds attribute <code>role</code> to the result of expression <code>myAriaRole</code>.</p>
</td>
</tr><tr>
<td><code>&lt;div <b>[class.extra-sparkle]</b>="isDelightful"&gt;</code></td>
<td><p>Binds the presence of the CSS class <code>extra-sparkle</code> on the element to the truthiness of the expression <code>isDelightful</code>.</p>
</td>
</tr><tr>
<td><code>&lt;div <b>[style.width.px]</b>="mySize"&gt;</code></td>
<td><p>Binds style property <code>width</code> to the result of expression <code>mySize</code> in pixels. Units are optional.</p>
</td>
</tr><tr>
<td><code>&lt;button <b>(click)</b>="readRainbow($event)"&gt;</code></td>
<td><p>Calls method <code>readRainbow</code> when a click event is triggered on this button element (or its children) and passes in the event object.</p>
</td>
</tr><tr>
<td><code>&lt;div title="Hello <b>{{ponyName}}</b>"&gt;</code></td>
<td><p>Binds a property to an interpolated string, for example, "Hello Seabiscuit". Equivalent to:
<code>&lt;div [title]="'Hello ' + ponyName"&gt;</code></p>
</td>
</tr><tr>
<td><code>&lt;p&gt;Hello <b>{{ponyName}}</b>&lt;/p&gt;</code></td>
<td><p>Binds text content to an interpolated string, for example, "Hello Seabiscuit".</p>
</td>
</tr><tr>
<td><code>&lt;my-cmp <b>[(title)]</b>="name"&gt;</code></td>
<td><p>Sets up two-way data binding. Equivalent to: <code>&lt;my-cmp [title]="name" (titleChange)="name=$event"&gt;</code></p>
</td>
</tr><tr>
<td><code>&lt;video <b>#movieplayer</b> ...&gt;<br>  &lt;button <b>(click)</b>="movieplayer.play()"&gt;<br>&lt;/video&gt;</code></td>
<td><p>Creates a local variable <code>movieplayer</code> that provides access to the <code>video</code> element instance in data-binding and event-binding expressions in the current template.</p>
</td>
</tr><tr>
<td><code>&lt;p <b>*myUnless</b>="myExpression"&gt;...&lt;/p&gt;</code></td>
<td><p>The <code>*</code> symbol turns the current element into an embedded template. Equivalent to:
<code>&lt;ng-template [myUnless]="myExpression"&gt;&lt;p&gt;...&lt;/p&gt;&lt;/ng-template&gt;</code></p>
</td>
</tr><tr>
<td><code>&lt;p&gt;Card No.: <b>{{cardNumber | myCardNumberFormatter}}</b>&lt;/p&gt;</code></td>
<td><p>Transforms the current value of expression <code>cardNumber</code> via the pipe called <code>myCardNumberFormatter</code>.</p>
</td>
</tr><tr>
<td><code>&lt;p&gt;Employer: <b>{{employer?.companyName}}</b>&lt;/p&gt;</code></td>
<td><p>The safe navigation operator (<code>?</code>) means that the <code>employer</code> field is optional and if <code>undefined</code>, the rest of the expression should be ignored.</p>
</td>
</tr><tr>
<td><code>&lt;<b>svg:</b>rect x="0" y="0" width="100" height="100"/&gt;</code></td>
<td><p>An SVG snippet template needs an <code>svg:</code> prefix on its root element to disambiguate the SVG element from an HTML component.</p>
</td>
</tr><tr>
<td><code>&lt;<b>svg</b>&gt;<br>  &lt;rect x="0" y="0" width="100" height="100"/&gt;<br>&lt;/<b>svg</b>&gt;</code></td>
<td><p>An <code>&lt;svg&gt;</code> root element is detected as an SVG element automatically, without the prefix.</p>
</td>
</tr>
</tbody></table>

<table class="is-full-width is-fixed-layout">
<tbody><tr>
<th>Built-in directives</th>
<th><p><code>import { CommonModule } from '@angular/common';</code>
</p>
</th>
</tr>
<tr>
<td><code>&lt;section <b>*ngIf</b>="showSection"&gt;</code></td>
<td><p>Removes or recreates a portion of the DOM tree based on the <code>showSection</code> expression.</p>
</td>
</tr><tr>
<td><code>&lt;li <b>*ngFor</b>="let item of list"&gt;</code></td>
<td><p>Turns the li element and its contents into a template, and uses that to instantiate a view for each item in list.</p>
</td>
</tr><tr>
<td><code>&lt;div <b>[ngSwitch]</b>="conditionExpression"&gt;<br>  &lt;ng-template <b>[<b>ngSwitchCase</b>]</b>="case1Exp"&gt;...&lt;/ng-template&gt;<br>  &lt;ng-template <b>ngSwitchCase</b>="case2LiteralString"&gt;...&lt;/ng-template&gt;<br>  &lt;ng-template <b>ngSwitchDefault</b>&gt;...&lt;/ng-template&gt;<br>&lt;/div&gt;</code></td>
<td><p>Conditionally swaps the contents of the div by selecting one of the embedded templates based on the current value of <code>conditionExpression</code>.</p>
</td>
</tr><tr>
<td><code>&lt;div <b>[ngClass]</b>="{'active': isActive, 'disabled': isDisabled}"&gt;</code></td>
<td><p>Binds the presence of CSS classes on the element to the truthiness of the associated map values. The right-hand expression should return {class-name: true/false} map.</p>
</td>
</tr>
<tr>
<td><code>&lt;div <b>[ngStyle]</b>="{'property': 'value'}"&gt;</code><br><code>&lt;div <b>[ngStyle]</b>="dynamicStyles()"&gt;</code></td>
<td><p>Allows you to assign styles to an HTML element using CSS. You can use CSS directly, as in the first example, or you can call a method from the component.</p>
</td>
</tr>
</tbody></table>

<table class="is-full-width is-fixed-layout">
<tbody><tr>
<th>Forms</th>
<th><p><code>import { FormsModule } from '@angular/forms';</code>
</p>
</th>
</tr>
<tr>
<td><code>&lt;input <b>[(ngModel)]</b>="userName"&gt;</code></td>
<td><p>Provides two-way data-binding, parsing, and validation for form controls.</p>
</td>
</tr>
</tbody></table>

<table class="is-full-width is-fixed-layout">
<tbody><tr>
<th>Class decorators</th>
<th><p><code>import { Directive, ... } from '@angular/core';</code>
</p>
</th>
</tr>
<tr>
<td><code><b>@Component({...})</b><br>class MyComponent() {}</code></td>
<td><p>Declares that a class is a component and provides metadata about the component.</p>
</td>
</tr><tr>
<td><code><b>@Directive({...})</b><br>class MyDirective() {}</code></td>
<td><p>Declares that a class is a directive and provides metadata about the directive.</p>
</td>
</tr><tr>
<td><code><b>@Pipe({...})</b><br>class MyPipe() {}</code></td>
<td><p>Declares that a class is a pipe and provides metadata about the pipe.</p>
</td>
</tr><tr>
<td><code><b>@Injectable()</b><br>class MyService() {}</code></td>
<td><p>Declares that a class has dependencies that should be injected into the constructor when the dependency injector is creating an instance of this class.
</p>
</td>
</tr>
</tbody></table>

<table class="is-full-width is-fixed-layout">
<tbody><tr>
<th>Directive configuration</th>
<th><p><code>@Directive({ property1: value1, ... })</code>
</p>
</th>
</tr>
<tr>
<td><code><b>selector:</b> '.cool-button:not(a)'</code></td>
<td><p>Specifies a CSS selector that identifies this directive within a template. Supported selectors include <code>element</code>,
<code>[attribute]</code>, <code>.class</code>, and <code>:not()</code>.</p>
<p>Does not support parent-child relationship selectors.</p>
</td>
</tr><tr>
<td><code><b>providers:</b> [MyService, { provide: ... }]</code></td>
<td><p>List of dependency injection providers for this directive and its children.</p>
</td>
</tr>
</tbody></table>

<table class="is-full-width is-fixed-layout">
<tbody><tr>
<th>Component configuration</th>
<th><p>
<code>@Component</code> extends <code>@Directive</code>,
so the <code>@Directive</code> configuration applies to components as well</p>
</th>
</tr>
<tr>
<td><code><b>moduleId:</b> module.id</code></td>
<td><p>If set, the <code>templateUrl</code> and <code>styleUrl</code> are resolved relative to the component.</p>
</td>
</tr><tr>
<td><code><b>viewProviders:</b> [MyService, { provide: ... }]</code></td>
<td><p>List of dependency injection providers scoped to this component's view.</p>
</td>
</tr><tr>
<td><code><b>template:</b> 'Hello {{name}}'<br><b>templateUrl:</b> 'my-component.html'</code></td>
<td><p>Inline template or external template URL of the component's view.</p>
</td>
</tr><tr>
<td><code><b>styles:</b> ['.primary {color: red}']<br><b>styleUrls:</b> ['my-component.css']</code></td>
<td><p>List of inline CSS styles or external stylesheet URLs for styling the component’s view.</p>
</td>
</tr>
</tbody></table>

<table class="is-full-width is-fixed-layout">
<tbody><tr>
<th>Class field decorators for directives and components</th>
<th><p><code>import { Input, ... } from '@angular/core';</code>
</p>
</th>
</tr>
<tr>
<td><code><b>@Input()</b> myProperty;</code></td>
<td><p>Declares an input property that you can update via property binding (example:
<code>&lt;my-cmp [myProperty]="someExpression"&gt;</code>).</p>
</td>
</tr><tr>
<td><code><b>@Output()</b> myEvent = new EventEmitter();</code></td>
<td><p>Declares an output property that fires events that you can subscribe to with an event binding (example: <code>&lt;my-cmp (myEvent)="doSomething()"&gt;</code>).</p>
</td>
</tr><tr>
<td><code><b>@HostBinding('class.valid')</b> isValid;</code></td>
<td><p>Binds a host element property (here, the CSS class <code>valid</code>) to a directive/component property (<code>isValid</code>).</p>
</td>
</tr><tr>
<td><code><b>@HostListener('click', ['$event'])</b> onClick(e) {...}</code></td>
<td><p>Subscribes to a host element event (<code>click</code>) with a directive/component method (<code>onClick</code>), optionally passing an argument (<code>$event</code>).</p>
</td>
</tr><tr>
<td><code><b>@ContentChild(myPredicate)</b> myChildComponent;</code></td>
<td><p>Binds the first result of the component content query (<code>myPredicate</code>) to a property (<code>myChildComponent</code>) of the class.</p>
</td>
</tr><tr>
<td><code><b>@ContentChildren(myPredicate)</b> myChildComponents;</code></td>
<td><p>Binds the results of the component content query (<code>myPredicate</code>) to a property (<code>myChildComponents</code>) of the class.</p>
</td>
</tr><tr>
<td><code><b>@ViewChild(myPredicate)</b> myChildComponent;</code></td>
<td><p>Binds the first result of the component view query (<code>myPredicate</code>) to a property (<code>myChildComponent</code>) of the class. Not available for directives.</p>
</td>
</tr><tr>
<td><code><b>@ViewChildren(myPredicate)</b> myChildComponents;</code></td>
<td><p>Binds the results of the component view query (<code>myPredicate</code>) to a property (<code>myChildComponents</code>) of the class. Not available for directives.</p>
</td>
</tr>
</tbody></table>

<table class="is-full-width is-fixed-layout">
<tbody><tr>
<th>Directive and component change detection and lifecycle hooks</th>
<th><p>(implemented as class methods)
</p>
</th>
</tr>
<tr>
<td><code><b>constructor(myService: MyService, ...)</b> { ... }</code></td>
<td><p>Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.</p>
</td>
</tr><tr>
<td><code><b>ngOnChanges(changeRecord)</b> { ... }</code></td>
<td><p>Called after every change to input properties and before processing content or child views.</p>
</td>
</tr><tr>
<td><code><b>ngOnInit()</b> { ... }</code></td>
<td><p>Called after the constructor, initializing input properties, and the first call to <code>ngOnChanges</code>.</p>
</td>
</tr><tr>
<td><code><b>ngDoCheck()</b> { ... }</code></td>
<td><p>Called every time that the input properties of a component or a directive are checked. Use it to extend change detection by performing a custom check.</p>
</td>
</tr><tr>
<td><code><b>ngAfterContentInit()</b> { ... }</code></td>
<td><p>Called after <code>ngOnInit</code> when the component's or directive's content has been initialized.</p>
</td>
</tr><tr>
<td><code><b>ngAfterContentChecked()</b> { ... }</code></td>
<td><p>Called after every check of the component's or directive's content.</p>
</td>
</tr><tr>
<td><code><b>ngAfterViewInit()</b> { ... }</code></td>
<td><p>Called after <code>ngAfterContentInit</code> when the component's views and child views / the view that a directive is in has been initialized.</p>
</td>
</tr><tr>
<td><code><b>ngAfterViewChecked()</b> { ... }</code></td>
<td><p>Called after every check of the component's views and child views / the view that a directive is in.</p>
</td>
</tr><tr>
<td><code><b>ngOnDestroy()</b> { ... }</code></td>
<td><p>Called once, before the instance is destroyed.</p>
</td>
</tr>
</tbody></table>

<table class="is-full-width is-fixed-layout">
<tbody><tr>
<th>Dependency injection configuration</th>
<th></th>
</tr>
<tr>
<td><code>{ <b>provide</b>: MyService, <b>useClass</b>: MyMockService }</code></td>
<td><p>Sets or overrides the provider for <code>MyService</code> to the <code>MyMockService</code> class.</p>
</td>
</tr><tr>
<td><code>{ <b>provide</b>: MyService, <b>useFactory</b>: myFactory }</code></td>
<td><p>Sets or overrides the provider for <code>MyService</code> to the <code>myFactory</code> factory function.</p>
</td>
</tr><tr>
<td><code>{ <b>provide</b>: MyValue, <b>useValue</b>: 41 }</code></td>
<td><p>Sets or overrides the provider for <code>MyValue</code> to the value <code>41</code>.</p>
</td>
</tr>
</tbody></table>

<table class="is-full-width is-fixed-layout">
<tbody><tr>
<th>Routing and navigation</th>
<th><p><code>import { Routes, RouterModule, ... } from '@angular/router';</code>
</p>
</th>
</tr>
<tr>
<td><code>const routes: <b>Routes</b> = [<br>  { path: '', component: HomeComponent },<br>  { path: 'path/:routeParam', component: MyComponent },<br>  { path: 'staticPath', component: ... },<br>  { path: '**', component: ... },<br>  { path: 'oldPath', redirectTo: '/staticPath' },<br>  { path: ..., component: ..., data: { message: 'Custom' } }<br>]);<br><br>const routing = RouterModule.forRoot(routes);</code></td>
<td><p>Configures routes for the application. Supports static, parameterized, redirect, and wildcard routes. Also supports custom route data and resolve.</p>
</td>
</tr><tr>
<td><code><br>&lt;<b>router-outlet</b>&gt;&lt;/<b>router-outlet</b>&gt;<br>&lt;<b>router-outlet</b> name="aux"&gt;&lt;/<b>router-outlet</b>&gt;<br></code></td>
<td><p>Marks the location to load the component of the active route.</p>
</td>
</tr><tr>
<td><code><br>&lt;a routerLink="/path"&gt;<br>&lt;a <b>[routerLink]</b>="[ '/path', routeParam ]"&gt;<br>&lt;a <b>[routerLink]</b>="[ '/path', { matrixParam: 'value' } ]"&gt;<br>&lt;a <b>[routerLink]</b>="[ '/path' ]" [queryParams]="{ page: 1 }"&gt;<br>&lt;a <b>[routerLink]</b>="[ '/path' ]" fragment="anchor"&gt;<br></code></td>
<td><p>Creates a link to a different view based on a route instruction consisting of a route path, required and optional parameters, query parameters, and a fragment. To navigate to a root route, use the <code>/</code> prefix; for a child route, use the <code>./</code>prefix; for a sibling or parent, use the <code>../</code> prefix.</p>
</td>
</tr><tr>
<td><code>&lt;a [routerLink]="[ '/path' ]" routerLinkActive="active"&gt;</code></td>
<td><p>The provided classes are added to the element when the <code>routerLink</code> becomes the current active route.</p>
</td>
</tr><tr>
<td><code>class <b>CanActivate</b>Guard implements <b>CanActivate</b> {<br>    canActivate(<br>      route: ActivatedRouteSnapshot,<br>      state: RouterStateSnapshot<br>    ): Observable&lt;boolean&gt;|Promise&lt;boolean&gt;|boolean { ... }<br>}<br><br>{ path: ..., canActivate: [<b>CanActivate</b>Guard] }</code></td>
<td><p>An interface for defining a class that the router should call first to determine if it should activate this component. Should return a boolean or an Observable/Promise that resolves to a boolean.</p>
</td>
</tr><tr>
<td><code>class <b>CanDeactivate</b>Guard implements <b>CanDeactivate</b>&lt;T&gt; {<br>    canDeactivate(<br>      component: T,<br>      route: ActivatedRouteSnapshot,<br>      state: RouterStateSnapshot<br>    ): Observable&lt;boolean&gt;|Promise&lt;boolean&gt;|boolean { ... }<br>}<br><br>{ path: ..., canDeactivate: [<b>CanDeactivate</b>Guard] }</code></td>
<td><p>An interface for defining a class that the router should call first to determine if it should deactivate this component after a navigation. Should return a boolean or an Observable/Promise that resolves to a boolean.</p>
</td>
</tr><tr>
<td><code>class <b>CanActivateChild</b>Guard implements <b>CanActivateChild</b> {<br>    canActivateChild(<br>      route: ActivatedRouteSnapshot,<br>      state: RouterStateSnapshot<br>    ): Observable&lt;boolean&gt;|Promise&lt;boolean&gt;|boolean { ... }<br>}<br><br>{ path: ..., canActivateChild: [CanActivateGuard],<br>    children: ... }</code></td>
<td><p>An interface for defining a class that the router should call first to determine if it should activate the child route. Should return a boolean or an Observable/Promise that resolves to a boolean.</p>
</td>
</tr><tr>
<td><code>class <b>Resolve</b>Guard implements <b>Resolve</b>&lt;T&gt; {<br>    resolve(<br>      route: ActivatedRouteSnapshot,<br>      state: RouterStateSnapshot<br>    ): Observable&lt;any&gt;|Promise&lt;any&gt;|any { ... }<br>}<br><br>{ path: ..., resolve: [<b>Resolve</b>Guard] }</code></td>
<td><p>An interface for defining a class that the router should call first to resolve route data before rendering the route. Should return a value or an Observable/Promise that resolves to a value.</p>
</td>
</tr><tr>
<td><code>class <b>CanLoad</b>Guard implements <b>CanLoad</b> {<br>    canLoad(<br>      route: Route<br>    ): Observable&lt;boolean&gt;|Promise&lt;boolean&gt;|boolean { ... }<br>}<br><br>{ path: ..., canLoad: [<b>CanLoad</b>Guard], loadChildren: ... }</code></td>
<td><p>An interface for defining a class that the router should call first to check if the lazy loaded module should be loaded. Should return a boolean or an Observable/Promise that resolves to a boolean.</p>
</td>
</tr>
</tbody></table>
</div>
