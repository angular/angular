@title
Cheat Sheet

@description

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
<td><code>@<b>NgModule</b>({&nbsp;declarations:&nbsp;...,&nbsp;imports:&nbsp;...,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;exports:&nbsp;...,&nbsp;providers:&nbsp;...,&nbsp;bootstrap:&nbsp;...})<br>class&nbsp;MyModule&nbsp;{}</code></td>
<td><p>Defines a module that contains components, directives, pipes, and providers.</p>
</td>
</tr><tr>
<td><code><b>declarations:</b>&nbsp;[MyRedComponent,&nbsp;MyBlueComponent,&nbsp;MyDatePipe]</code></td>
<td><p>List of components, directives, and pipes that belong to this module.</p>
</td>
</tr><tr>
<td><code><b>imports:</b>&nbsp;[BrowserModule,&nbsp;SomeOtherModule]</code></td>
<td><p>List of modules to import into this module. Everything from the imported modules
is available to <code>declarations</code> of this module.</p>
</td>
</tr><tr>
<td><code><b>exports:</b>&nbsp;[MyRedComponent,&nbsp;MyDatePipe]</code></td>
<td><p>List of components, directives, and pipes visible to modules that import this module.</p>
</td>
</tr><tr>
<td><code><b>providers:</b>&nbsp;[MyService,&nbsp;{&nbsp;provide:&nbsp;...&nbsp;}]</code></td>
<td><p>List of dependency injection providers visible both to the contents of this module and to importers of this module.</p>
</td>
</tr><tr>
<td><code><b>bootstrap:</b>&nbsp;[MyAppComponent]</code></td>
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
<td><code>&lt;input&nbsp;<b>[value]</b>="firstName"&gt;</code></td>
<td><p>Binds property <code>value</code> to the result of expression <code>firstName</code>.</p>
</td>
</tr><tr>
<td><code>&lt;div&nbsp;<b>[attr.role]</b>="myAriaRole"&gt;</code></td>
<td><p>Binds attribute <code>role</code> to the result of expression <code>myAriaRole</code>.</p>
</td>
</tr><tr>
<td><code>&lt;div&nbsp;<b>[class.extra-sparkle]</b>="isDelightful"&gt;</code></td>
<td><p>Binds the presence of the CSS class <code>extra-sparkle</code> on the element to the truthiness of the expression <code>isDelightful</code>.</p>
</td>
</tr><tr>
<td><code>&lt;div&nbsp;<b>[style.width.px]</b>="mySize"&gt;</code></td>
<td><p>Binds style property <code>width</code> to the result of expression <code>mySize</code> in pixels. Units are optional.</p>
</td>
</tr><tr>
<td><code>&lt;button&nbsp;<b>(click)</b>="readRainbow($event)"&gt;</code></td>
<td><p>Calls method <code>readRainbow</code> when a click event is triggered on this button element (or its children) and passes in the event object.</p>
</td>
</tr><tr>
<td><code>&lt;div&nbsp;title="Hello&nbsp;<b>{{ponyName}}</b>"&gt;</code></td>
<td><p>Binds a property to an interpolated string, for example, "Hello Seabiscuit". Equivalent to:
<code>&lt;div [title]="'Hello ' + ponyName"&gt;</code></p>
</td>
</tr><tr>
<td><code>&lt;p&gt;Hello&nbsp;<b>{{ponyName}}</b>&lt;/p&gt;</code></td>
<td><p>Binds text content to an interpolated string, for example, "Hello Seabiscuit".</p>
</td>
</tr><tr>
<td><code>&lt;my-cmp&nbsp;<b>[(title)]</b>="name"&gt;</code></td>
<td><p>Sets up two-way data binding. Equivalent to: <code>&lt;my-cmp [title]="name" (titleChange)="name=$event"&gt;</code></p>
</td>
</tr><tr>
<td><code>&lt;video&nbsp;<b>#movieplayer</b>&nbsp;...&gt;<br>&nbsp;&nbsp;&lt;button&nbsp;<b>(click)</b>="movieplayer.play()"&gt;<br>&lt;/video&gt;</code></td>
<td><p>Creates a local variable <code>movieplayer</code> that provides access to the <code>video</code> element instance in data-binding and event-binding expressions in the current template.</p>
</td>
</tr><tr>
<td><code>&lt;p&nbsp;<b>*myUnless</b>="myExpression"&gt;...&lt;/p&gt;</code></td>
<td><p>The <code>*</code> symbol turns the current element into an embedded template. Equivalent to:
<code>&lt;ng-template [myUnless]="myExpression"&gt;&lt;p&gt;...&lt;/p&gt;&lt;/ng-template&gt;</code></p>
</td>
</tr><tr>
<td><code>&lt;p&gt;Card&nbsp;No.:&nbsp;<b>{{cardNumber&nbsp;|&nbsp;myCardNumberFormatter}}</b>&lt;/p&gt;</code></td>
<td><p>Transforms the current value of expression <code>cardNumber</code> via the pipe called <code>myCardNumberFormatter</code>.</p>
</td>
</tr><tr>
<td><code>&lt;p&gt;Employer:&nbsp;<b>{{employer?.companyName}}</b>&lt;/p&gt;</code></td>
<td><p>The safe navigation operator (<code>?</code>) means that the <code>employer</code> field is optional and if <code>undefined</code>, the rest of the expression should be ignored.</p>
</td>
</tr><tr>
<td><code>&lt;<b>svg:</b>rect&nbsp;x="0"&nbsp;y="0"&nbsp;width="100"&nbsp;height="100"/&gt;</code></td>
<td><p>An SVG snippet template needs an <code>svg:</code> prefix on its root element to disambiguate the SVG element from an HTML component.</p>
</td>
</tr><tr>
<td><code>&lt;<b>svg</b>&gt;<br>&nbsp;&nbsp;&lt;rect&nbsp;x="0"&nbsp;y="0"&nbsp;width="100"&nbsp;height="100"/&gt;<br>&lt;/<b>svg</b>&gt;</code></td>
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
<td><code>&lt;section&nbsp;<b>*ngIf</b>="showSection"&gt;</code></td>
<td><p>Removes or recreates a portion of the DOM tree based on the <code>showSection</code> expression.</p>
</td>
</tr><tr>
<td><code>&lt;li&nbsp;<b>*ngFor</b>="let&nbsp;item&nbsp;of&nbsp;list"&gt;</code></td>
<td><p>Turns the li element and its contents into a template, and uses that to instantiate a view for each item in list.</p>
</td>
</tr><tr>
<td><code>&lt;div&nbsp;<b>[ngSwitch]</b>="conditionExpression"&gt;<br>&nbsp;&nbsp;&lt;ng-template&nbsp;<b>[<b>ngSwitchCase</b>]</b>="case1Exp"&gt;...&lt;/ng-template&gt;<br>&nbsp;&nbsp;&lt;ng-template&nbsp;<b>ngSwitchCase</b>="case2LiteralString"&gt;...&lt;/ng-template&gt;<br>&nbsp;&nbsp;&lt;ng-template&nbsp;<b>ngSwitchDefault</b>&gt;...&lt;/ng-template&gt;<br>&lt;/div&gt;</code></td>
<td><p>Conditionally swaps the contents of the div by selecting one of the embedded templates based on the current value of <code>conditionExpression</code>.</p>
</td>
</tr><tr>
<td><code>&lt;div&nbsp;<b>[ngClass]</b>="{active:&nbsp;isActive,&nbsp;disabled:&nbsp;isDisabled}"&gt;</code></td>
<td><p>Binds the presence of CSS classes on the element to the truthiness of the associated map values. The right-hand expression should return {class-name: true/false} map.</p>
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
<td><code>&lt;input&nbsp;<b>[(ngModel)]</b>="userName"&gt;</code></td>
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
<td><code><b>@Component({...})</b><br>class&nbsp;MyComponent()&nbsp;{}</code></td>
<td><p>Declares that a class is a component and provides metadata about the component.</p>
</td>
</tr><tr>
<td><code><b>@Directive({...})</b><br>class&nbsp;MyDirective()&nbsp;{}</code></td>
<td><p>Declares that a class is a directive and provides metadata about the directive.</p>
</td>
</tr><tr>
<td><code><b>@Pipe({...})</b><br>class&nbsp;MyPipe()&nbsp;{}</code></td>
<td><p>Declares that a class is a pipe and provides metadata about the pipe.</p>
</td>
</tr><tr>
<td><code><b>@Injectable()</b><br>class&nbsp;MyService()&nbsp;{}</code></td>
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
<td><code><b>selector:</b>&nbsp;'.cool-button:not(a)'</code></td>
<td><p>Specifies a CSS selector that identifies this directive within a template. Supported selectors include <code>element</code>,
<code>[attribute]</code>, <code>.class</code>, and <code>:not()</code>.</p>
<p>Does not support parent-child relationship selectors.</p>
</td>
</tr><tr>
<td><code><b>providers:</b>&nbsp;[MyService,&nbsp;{&nbsp;provide:&nbsp;...&nbsp;}]</code></td>
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
<td><code><b>moduleId:</b>&nbsp;module.id</code></td>
<td><p>If set, the <code>templateUrl</code> and <code>styleUrl</code> are resolved relative to the component.</p>
</td>
</tr><tr>
<td><code><b>viewProviders:</b>&nbsp;[MyService,&nbsp;{&nbsp;provide:&nbsp;...&nbsp;}]</code></td>
<td><p>List of dependency injection providers scoped to this component's view.</p>
</td>
</tr><tr>
<td><code><b>template:</b>&nbsp;'Hello&nbsp;{{name}}'<br><b>templateUrl:</b>&nbsp;'my-component.html'</code></td>
<td><p>Inline template or external template URL of the component's view.</p>
</td>
</tr><tr>
<td><code><b>styles:</b>&nbsp;['.primary&nbsp;{color:&nbsp;red}']<br><b>styleUrls:</b>&nbsp;['my-component.css']</code></td>
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
<td><code><b>@Input()</b>&nbsp;myProperty;</code></td>
<td><p>Declares an input property that you can update via property binding (example:
<code>&lt;my-cmp [myProperty]="someExpression"&gt;</code>).</p>
</td>
</tr><tr>
<td><code><b>@Output()</b>&nbsp;myEvent&nbsp;=&nbsp;new&nbsp;EventEmitter();</code></td>
<td><p>Declares an output property that fires events that you can subscribe to with an event binding (example: <code>&lt;my-cmp (myEvent)="doSomething()"&gt;</code>).</p>
</td>
</tr><tr>
<td><code><b>@HostBinding('class.valid')</b>&nbsp;isValid;</code></td>
<td><p>Binds a host element property (here, the CSS class <code>valid</code>) to a directive/component property (<code>isValid</code>).</p>
</td>
</tr><tr>
<td><code><b>@HostListener('click',&nbsp;['$event'])</b>&nbsp;onClick(e)&nbsp;{...}</code></td>
<td><p>Subscribes to a host element event (<code>click</code>) with a directive/component method (<code>onClick</code>), optionally passing an argument (<code>$event</code>).</p>
</td>
</tr><tr>
<td><code><b>@ContentChild(myPredicate)</b>&nbsp;myChildComponent;</code></td>
<td><p>Binds the first result of the component content query (<code>myPredicate</code>) to a property (<code>myChildComponent</code>) of the class.</p>
</td>
</tr><tr>
<td><code><b>@ContentChildren(myPredicate)</b>&nbsp;myChildComponents;</code></td>
<td><p>Binds the results of the component content query (<code>myPredicate</code>) to a property (<code>myChildComponents</code>) of the class.</p>
</td>
</tr><tr>
<td><code><b>@ViewChild(myPredicate)</b>&nbsp;myChildComponent;</code></td>
<td><p>Binds the first result of the component view query (<code>myPredicate</code>) to a property (<code>myChildComponent</code>) of the class. Not available for directives.</p>
</td>
</tr><tr>
<td><code><b>@ViewChildren(myPredicate)</b>&nbsp;myChildComponents;</code></td>
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
<td><code><b>constructor(myService:&nbsp;MyService,&nbsp;...)</b>&nbsp;{&nbsp;...&nbsp;}</code></td>
<td><p>Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.</p>
</td>
</tr><tr>
<td><code><b>ngOnChanges(changeRecord)</b>&nbsp;{&nbsp;...&nbsp;}</code></td>
<td><p>Called after every change to input properties and before processing content or child views.</p>
</td>
</tr><tr>
<td><code><b>ngOnInit()</b>&nbsp;{&nbsp;...&nbsp;}</code></td>
<td><p>Called after the constructor, initializing input properties, and the first call to <code>ngOnChanges</code>.</p>
</td>
</tr><tr>
<td><code><b>ngDoCheck()</b>&nbsp;{&nbsp;...&nbsp;}</code></td>
<td><p>Called every time that the input properties of a component or a directive are checked. Use it to extend change detection by performing a custom check.</p>
</td>
</tr><tr>
<td><code><b>ngAfterContentInit()</b>&nbsp;{&nbsp;...&nbsp;}</code></td>
<td><p>Called after <code>ngOnInit</code> when the component's or directive's content has been initialized.</p>
</td>
</tr><tr>
<td><code><b>ngAfterContentChecked()</b>&nbsp;{&nbsp;...&nbsp;}</code></td>
<td><p>Called after every check of the component's or directive's content.</p>
</td>
</tr><tr>
<td><code><b>ngAfterViewInit()</b>&nbsp;{&nbsp;...&nbsp;}</code></td>
<td><p>Called after <code>ngAfterContentInit</code> when the component's view has been initialized. Applies to components only.</p>
</td>
</tr><tr>
<td><code><b>ngAfterViewChecked()</b>&nbsp;{&nbsp;...&nbsp;}</code></td>
<td><p>Called after every check of the component's view. Applies to components only.</p>
</td>
</tr><tr>
<td><code><b>ngOnDestroy()</b>&nbsp;{&nbsp;...&nbsp;}</code></td>
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
<td><code>{&nbsp;<b>provide</b>:&nbsp;MyService,&nbsp;<b>useClass</b>:&nbsp;MyMockService&nbsp;}</code></td>
<td><p>Sets or overrides the provider for <code>MyService</code> to the <code>MyMockService</code> class.</p>
</td>
</tr><tr>
<td><code>{&nbsp;<b>provide</b>:&nbsp;MyService,&nbsp;<b>useFactory</b>:&nbsp;myFactory&nbsp;}</code></td>
<td><p>Sets or overrides the provider for <code>MyService</code> to the <code>myFactory</code> factory function.</p>
</td>
</tr><tr>
<td><code>{&nbsp;<b>provide</b>:&nbsp;MyValue,&nbsp;<b>useValue</b>:&nbsp;41&nbsp;}</code></td>
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
<td><code>const&nbsp;routes:&nbsp;<b>Routes</b>&nbsp;=&nbsp;[<br>&nbsp;&nbsp;{&nbsp;path:&nbsp;'',&nbsp;component:&nbsp;HomeComponent&nbsp;},<br>&nbsp;&nbsp;{&nbsp;path:&nbsp;'path/:routeParam',&nbsp;component:&nbsp;MyComponent&nbsp;},<br>&nbsp;&nbsp;{&nbsp;path:&nbsp;'staticPath',&nbsp;component:&nbsp;...&nbsp;},<br>&nbsp;&nbsp;{&nbsp;path:&nbsp;'**',&nbsp;component:&nbsp;...&nbsp;},<br>&nbsp;&nbsp;{&nbsp;path:&nbsp;'oldPath',&nbsp;redirectTo:&nbsp;'/staticPath'&nbsp;},<br>&nbsp;&nbsp;{&nbsp;path:&nbsp;...,&nbsp;component:&nbsp;...,&nbsp;data:&nbsp;{&nbsp;message:&nbsp;'Custom'&nbsp;}&nbsp;}<br>]);<br><br>const&nbsp;routing&nbsp;=&nbsp;RouterModule.forRoot(routes);</code></td>
<td><p>Configures routes for the application. Supports static, parameterized, redirect, and wildcard routes. Also supports custom route data and resolve.</p>
</td>
</tr><tr>
<td><code><br>&lt;<b>router-outlet</b>&gt;&lt;/<b>router-outlet</b>&gt;<br>&lt;<b>router-outlet</b>&nbsp;name="aux"&gt;&lt;/<b>router-outlet</b>&gt;<br></code></td>
<td><p>Marks the location to load the component of the active route.</p>
</td>
</tr><tr>
<td><code><br>&lt;a&nbsp;routerLink="/path"&gt;<br>&lt;a&nbsp;<b>[routerLink]</b>="[&nbsp;'/path',&nbsp;routeParam&nbsp;]"&gt;<br>&lt;a&nbsp;<b>[routerLink]</b>="[&nbsp;'/path',&nbsp;{&nbsp;matrixParam:&nbsp;'value'&nbsp;}&nbsp;]"&gt;<br>&lt;a&nbsp;<b>[routerLink]</b>="[&nbsp;'/path'&nbsp;]"&nbsp;[queryParams]="{&nbsp;page:&nbsp;1&nbsp;}"&gt;<br>&lt;a&nbsp;<b>[routerLink]</b>="[&nbsp;'/path'&nbsp;]"&nbsp;fragment="anchor"&gt;<br></code></td>
<td><p>Creates a link to a different view based on a route instruction consisting of a route path, required and optional parameters, query parameters, and a fragment. To navigate to a root route, use the <code>/</code> prefix; for a child route, use the <code>./</code>prefix; for a sibling or parent, use the <code>../</code> prefix.</p>
</td>
</tr><tr>
<td><code>&lt;a&nbsp;[routerLink]="[&nbsp;'/path'&nbsp;]"&nbsp;routerLinkActive="active"&gt;</code></td>
<td><p>The provided classes are added to the element when the <code>routerLink</code> becomes the current active route.</p>
</td>
</tr><tr>
<td><code>class&nbsp;<b>CanActivate</b>Guard&nbsp;implements&nbsp;<b>CanActivate</b>&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;canActivate(<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;route:&nbsp;ActivatedRouteSnapshot,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;state:&nbsp;RouterStateSnapshot<br>&nbsp;&nbsp;&nbsp;&nbsp;):&nbsp;Observable&lt;boolean&gt;|Promise&lt;boolean&gt;|boolean&nbsp;{&nbsp;...&nbsp;}<br>}<br><br>{&nbsp;path:&nbsp;...,&nbsp;canActivate:&nbsp;[<b>CanActivate</b>Guard]&nbsp;}</code></td>
<td><p>An interface for defining a class that the router should call first to determine if it should activate this component. Should return a boolean or an Observable/Promise that resolves to a boolean.</p>
</td>
</tr><tr>
<td><code>class&nbsp;<b>CanDeactivate</b>Guard&nbsp;implements&nbsp;<b>CanDeactivate</b>&lt;T&gt;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;canDeactivate(<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;component:&nbsp;T,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;route:&nbsp;ActivatedRouteSnapshot,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;state:&nbsp;RouterStateSnapshot<br>&nbsp;&nbsp;&nbsp;&nbsp;):&nbsp;Observable&lt;boolean&gt;|Promise&lt;boolean&gt;|boolean&nbsp;{&nbsp;...&nbsp;}<br>}<br><br>{&nbsp;path:&nbsp;...,&nbsp;canDeactivate:&nbsp;[<b>CanDeactivate</b>Guard]&nbsp;}</code></td>
<td><p>An interface for defining a class that the router should call first to determine if it should deactivate this component after a navigation. Should return a boolean or an Observable/Promise that resolves to a boolean.</p>
</td>
</tr><tr>
<td><code>class&nbsp;<b>CanActivateChild</b>Guard&nbsp;implements&nbsp;<b>CanActivateChild</b>&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;canActivateChild(<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;route:&nbsp;ActivatedRouteSnapshot,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;state:&nbsp;RouterStateSnapshot<br>&nbsp;&nbsp;&nbsp;&nbsp;):&nbsp;Observable&lt;boolean&gt;|Promise&lt;boolean&gt;|boolean&nbsp;{&nbsp;...&nbsp;}<br>}<br><br>{&nbsp;path:&nbsp;...,&nbsp;canActivateChild:&nbsp;[CanActivateGuard],<br>&nbsp;&nbsp;&nbsp;&nbsp;children:&nbsp;...&nbsp;}</code></td>
<td><p>An interface for defining a class that the router should call first to determine if it should activate the child route. Should return a boolean or an Observable/Promise that resolves to a boolean.</p>
</td>
</tr><tr>
<td><code>class&nbsp;<b>Resolve</b>Guard&nbsp;implements&nbsp;<b>Resolve</b>&lt;T&gt;&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;resolve(<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;route:&nbsp;ActivatedRouteSnapshot,<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;state:&nbsp;RouterStateSnapshot<br>&nbsp;&nbsp;&nbsp;&nbsp;):&nbsp;Observable&lt;any&gt;|Promise&lt;any&gt;|any&nbsp;{&nbsp;...&nbsp;}<br>}<br><br>{&nbsp;path:&nbsp;...,&nbsp;resolve:&nbsp;[<b>Resolve</b>Guard]&nbsp;}</code></td>
<td><p>An interface for defining a class that the router should call first to resolve route data before rendering the route. Should return a value or an Observable/Promise that resolves to a value.</p>
</td>
</tr><tr>
<td><code>class&nbsp;<b>CanLoad</b>Guard&nbsp;implements&nbsp;<b>CanLoad</b>&nbsp;{<br>&nbsp;&nbsp;&nbsp;&nbsp;canLoad(<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;route:&nbsp;Route<br>&nbsp;&nbsp;&nbsp;&nbsp;):&nbsp;Observable&lt;boolean&gt;|Promise&lt;boolean&gt;|boolean&nbsp;{&nbsp;...&nbsp;}<br>}<br><br>{&nbsp;path:&nbsp;...,&nbsp;canLoad:&nbsp;[<b>CanLoad</b>Guard],&nbsp;loadChildren:&nbsp;...&nbsp;}</code></td>
<td><p>An interface for defining a class that the router should call first to check if the lazy loaded module should be loaded. Should return a boolean or an Observable/Promise that resolves to a boolean.</p>
</td>
</tr>
</tbody></table>
</div>