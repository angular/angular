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
<td><p>Empaqueta la app, usando el componente raíz del <code>NgModule</code> especificado.</p>
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
<td><p>Define un módulo que contiene componentes, directivas, pipes y proveedores.</p>
</td>
</tr><tr>
<td><code><b>declarations:</b> [MyRedComponent, MyBlueComponent, MyDatePipe]</code></td>
<td><p>Lista de componentes, directivas y pipes que pertenecen a este módulo.</p>
</td>
</tr><tr>
<td><code><b>imports:</b> [BrowserModule, SomeOtherModule]</code></td>
<td><p>Lista de módulos para importar en este módulo. Todo, desde los módulos importados,
está disponible para las declaraciones (<code>declarations</code>) de este módulo.
</td>
</tr><tr>
<td><code><b>exports:</b> [MyRedComponent, MyDatePipe]</code></td>
<td><p>Lista de componentes, directivas y pipes visibles a los módulos que importan este módulo.</p>
</td>
</tr><tr>
<td><code><b>providers:</b> [MyService, { provide: ... }]</code></td>
<td><p>Lista de proveedores de inyección de dependencias visibles tanto para los contenidos de este módulo como para los importadores de este módulo.</p>
</td>
</tr><tr>
<td><code><b>entryComponents:</b> [SomeComponent, OtherComponent]</code></td>
<td><p>Lista de componentes no referenciados en cualquier plantilla accesible, por ejemplo, creada dinámicamente a partir de código.</p></td>
</tr><tr>
<td><code><b>bootstrap:</b> [MyAppComponent]</code></td>
<td><p>Lista de componentes a empaquetar cuando este módulo se inicia.</p>
</td>
</tr>
</tbody></table>

<table class="is-full-width is-fixed-layout">
<tbody><tr>
<th>Sintaxis de plantilla</th>
<th></th>
</tr>
<tr>
<td><code>&lt;input <b>[value]</b>="firstName"&gt;</code></td>
<td><p>Vincula la propiedad <code>value</code> al resultado de la expresión <code>firstName</code>.</p>
</td>
</tr><tr>
<td><code>&lt;div <b>[attr.role]</b>="myAriaRole"&gt;</code></td>
<td><p>Vincula el atributo <code>role</code> al resultado de la expresión <code>myAriaRole</code>.</p>
</td>
</tr><tr>
<td><code>&lt;div <b>[class.extra-sparkle]</b>="isDelightful"&gt;</code></td>
<td><p>Vincula la presencia de la clase CSS <code>extra-sparkle</code> sobre el elemento a la veracidad de la expresión <code>isDelightful</code>.</p>
</td>
</tr><tr>
<td><code>&lt;div <b>[style.width.px]</b>="mySize"&gt;</code></td>
<td><p>Vincula la propiedad de estilo <code>width</code> al resultado de la expresión <code>mySize</code> en píxeles. La unidad de medida es opcional.</p>
</td>
</tr><tr>
<td><code>&lt;button <b>(click)</b>="readRainbow($event)"&gt;</code></td>
<td><p>Llama al método <code>readRainbow</code> cuando se lanza un evento click en este elemento botón (o sus hijos) y pasa por argumento el objeto evento.</p>
</td>
</tr><tr>
<td><code>&lt;div title="Hola <b>{{ponyName}}</b>"&gt;</code></td>
<td><p>Vincula una propiedad a una cadena interpolada, por ejemplo, "Hola Seabiscuit". Equivalente a:
<td><p>Binds a property to an interpolated string, for example, "Hello Seabiscuit". Equivalent to:
<code>&lt;div [title]="'Hola ' + ponyName"&gt;</code></p>
</td>
</tr><tr>
<td><code>&lt;p&gt;Hola <b>{{ponyName}}</b>&lt;/p&gt;</code></td>
<td><p>Vincula el contenido de texto a una cadena interpolada, por ejemplo, "Hola Seabiscuit".</p>
</td>
</tr><tr>
<td><code>&lt;my-cmp <b>[(title)]</b>="name"&gt;</code></td>
<td><p>Establece el two-way data binding. Equivalente a: <code>&lt;my-cmp [title]="name" (titleChange)="name=$event"&gt;</code></p>
</td>
</tr><tr>
<td><code>&lt;video <b>#movieplayer</b> ...&gt;<br>  &lt;button <b>(click)</b>="movieplayer.play()"&gt;<br>&lt;/video&gt;</code></td>
<td><p>Crea una variable local <code>movieplayer</code> que provee acceso a la instancia del elemento <code>video</code> en las expresiones de data-binding y event-binding de la actual plantilla.</p>
</td>
</tr><tr>
<td><code>&lt;p <b>*myUnless</b>="myExpression"&gt;...&lt;/p&gt;</code></td>
<td><p>El símbolo <code>*</code> convierte el elemento actual en una plantilla incrustada. Equivalente a:
<code>&lt;ng-template [myUnless]="myExpression"&gt;&lt;p&gt;...&lt;/p&gt;&lt;/ng-template&gt;</code></p>
</td>
</tr><tr>
<td><code>&lt;p&gt;Card No.: <b>{{cardNumber | myCardNumberFormatter}}</b>&lt;/p&gt;</code></td>
<td><p>Transforma el valor actual de la expresión <code>cardNumber</code> a través de la pipe <code>myCardNumberFormatter</code>.</p>
</td>
</tr><tr>
<td><code>&lt;p&gt;Employer: <b>{{employer?.companyName}}</b>&lt;/p&gt;</code></td>
<td><p>El operador de navegación seguro (<code>?</code>) significa que el campo <code>employer</code> es opcional y que si es <code>undefined</code>, el resto de la expresión debería ser ignorado.</p>
</td>
</tr><tr>
<td><code>&lt;<b>svg:</b>rect x="0" y="0" width="100" height="100"/&gt;</code></td>
<td><p>Una plantilla de fragmento SVG necesita un prefijo <code>svg:</code> en su elemento raíz para distinguir el elemento SVG de un componente HTML.</p>
</td>
</tr><tr>
<td><code>&lt;<b>svg</b>&gt;<br>  &lt;rect x="0" y="0" width="100" height="100"/&gt;<br>&lt;/<b>svg</b>&gt;</code></td>
<td><p>Un elemento raíz <code>&lt;svg&gt;</code> es detectado como un elemento SVG automáticamente, sin el prefijo.</p>
</td>
</tr>
</tbody></table>

<table class="is-full-width is-fixed-layout">
<tbody><tr>
<th>Directivas incorporadas</th>
<th><p><code>import { CommonModule } from '@angular/common';</code>
</p>
</th>
</tr>
<tr>
<td><code>&lt;section <b>*ngIf</b>="showSection"&gt;</code></td>
<td><p>Elimina o recrea una parte del árbol DOM basado en la expresión <code>showSection</code>.</p>
</td>
</tr><tr>
<td><code>&lt;li <b>*ngFor</b>="let item of list"&gt;</code></td>
<td><p>Convierte el elemento li y su contenido en una plantilla, y lo utiliza para crear una vista por cada elemento de la lista.</p>
</td>
</tr><tr>
<td><code>&lt;div <b>[ngSwitch]</b>="conditionExpression"&gt;<br>  &lt;ng-template <b>[<b>ngSwitchCase</b>]</b>="case1Exp"&gt;...&lt;/ng-template&gt;<br>  &lt;ng-template <b>ngSwitchCase</b>="case2LiteralString"&gt;...&lt;/ng-template&gt;<br>  &lt;ng-template <b>ngSwitchDefault</b>&gt;...&lt;/ng-template&gt;<br>&lt;/div&gt;</code></td>
<td><p>Intercambia condicionalmente el contenido del div seleccionando una de las plantillas incrustadas en función del valor actual de <code>conditionExpression</code>.</p>
</td>
</tr><tr>
<td><code>&lt;div <b>[ngClass]</b>="{'active': isActive, 'disabled': isDisabled}"&gt;</code></td>
<td><p>Vincula la presencia de clases CSS en el elemento a la veracidad de los valores de mapa asociados. La expresión de la derecha debería devolver el mapa {class-name: true/false}.</p>
</td>
</tr>
<tr>
<td><code>&lt;div <b>[ngStyle]</b>="{'property': 'value'}"&gt;</code><br><code>&lt;div <b>[ngStyle]</b>="dynamicStyles()"&gt;</code></td>
<p>Te permite asignar estilos a un elemento HTML usando CSS. Puedes usar CSS directamente, como en el primer ejemplo, o puedes llamar a un método desde el componente.</p>
</td>
</tr>
</tbody></table>

<table class="is-full-width is-fixed-layout">
<tbody><tr>
<th>Formularios</th>
<th><p><code>import { FormsModule } from '@angular/forms';</code>
</p>
</th>
</tr>
<tr>
<td><code>&lt;input <b>[(ngModel)]</b>="userName"&gt;</code></td>
<td><p>Provee two-way data-binding, conversión y validación para controles de formulario.</p>
</td>
</tr>
</tbody></table>

<table class="is-full-width is-fixed-layout">
<tbody><tr>
<th>Decoradores de clases</th>
<th><p><code>import { Directive, ... } from '@angular/core';</code>
</p>
</th>
</tr>
<tr>
<td><code><b>@Component({...})</b><br>class MyComponent() {}</code></td>
<td><p>Declara que una clase es un componente y proporciona metadatos sobre el componente.</p>
</td>
</tr><tr>
<td><code><b>@Directive({...})</b><br>class MyDirective() {}</code></td>
<td><p>Declara que una clase es una directiva y proporciona metadatos sobre la directiva.</p>
</td>
</tr><tr>
<td><code><b>@Pipe({...})</b><br>class MyPipe() {}</code></td>
<td><p>Declara que una clase es una pipe y proporciona metadatos sobre la pipe.</p>
</td>
</tr><tr>
<td><code><b>@Injectable()</b><br>class MyService() {}</code></td>
<td><p>Declara que una clase puede ser proporcionada e inyectada por otras clases. Sin este decorador, el compilador no generará suficientes metadatos para permitir que la clase se cree correctamente cuando se inyecta en alguna parte.</p>
</td>
</tr>
</tbody></table>

<table class="is-full-width is-fixed-layout">
<tbody><tr>
<th>Configuración de Directiva</th>
<th><p><code>@Directive({ property1: value1, ... })</code>
</p>
</th>
</tr>
<tr>
<td><code><b>selector:</b> '.cool-button:not(a)'</code></td>
<td><p>Especifica un selector CSS que identifica esta directiva dentro de una plantilla. Los selectores compatibles incluyen <code>element</code>,
<code>[attribute]</code>, <code>.class</code>, and <code>:not()</code>.</p>
<p>No soporta selectores de relación padre-hijo.</p>
</td>
</tr><tr>
<td><code><b>providers:</b> [MyService, { provide: ... }]</code></td>
<td><p>Lista de proveedores de inyección de dependencia para esta directiva y sus hijos.</p>
</td>
</tr>
</tbody></table>

<table class="is-full-width is-fixed-layout">
<tbody><tr>
<th>Configuración de Componente</th>
<th><p>
<code>@Component</code> extiende <code>@Directive</code>,
entonces la configuración de <code>@Directive</code> se aplica también a los componentes</p>
</th>
</tr>
<tr>
<td><code><b>moduleId:</b> module.id</code></td>
<td><p>Si está presente, el <code>templateUrl</code> y <code>styleUrl</code> se resuelven en relación con el componente.</p>
</td>
</tr><tr>
<td><code><b>viewProviders:</b> [MyService, { provide: ... }]</code></td>
<td><p>Lista de proveedores de inyección de dependencias en la vista de este componente.</p>
</td>
</tr><tr>
<td><code><b>template:</b> 'Hola {{name}}'<br><b>templateUrl:</b> 'my-component.html'</code></td>
<td><p>Plantilla en línea o URL de plantilla externa de la vista del componente.</p>
</td>
</tr><tr>
<td><code><b>styles:</b> ['.primary {color: red}']<br><b>styleUrls:</b> ['my-component.css']</code></td>
<td><p>Lista de estilos CSS en línea o URL de hojas de estilo externas para estilar la vista del componente.</p>
</td>
</tr>
</tbody></table>

<table class="is-full-width is-fixed-layout">
<tbody><tr>
<th>Decoradores para los campos de la clase para directivas y componentes.</th>
<th><p><code>import { Input, ... } from '@angular/core';</code>
</p>
</th>
</tr>
<tr>
<td><code><b>@Input()</b> myProperty;</code></td>
<td><p>Declara una propiedad de entrada (input) que puede actualizar mediante el enlace de propiedad (property binding) (ejemplo:
<code>&lt;my-cmp [myProperty]="someExpression"&gt;</code>).</p>
</td>
</tr><tr>
<td><code><b>@Output()</b> myEvent = new EventEmitter();</code></td>
<td><p>Declara una propiedad de salida (output) que dispara eventos a los que puede suscribirse con un enlace de evento (event binding) (ejemplo: <code>&lt;my-cmp (myEvent)="doSomething()"&gt;</code>).</p>
</td>
</tr><tr>
<td><code><b>@HostBinding('class.valid')</b> isValid;</code></td>
<td><p>Vincula una propiedad del elemento anfitrión (aquí, la clase CSS <code>valid</code>) a una propiedad de directiva/componente (<code>isValid</code>).</p>
</td>
</tr><tr>
<td><code><b>@HostListener('click', ['$event'])</b> onClick(e) {...}</code></td>
<td><p>Se suscribe a un evento del elemento anfitrión (<code>click</code>) con un método de directiva/componente (<code>onClick</code>), opcionalmente, pasando un argumento (<code>$event</code>).</p>
</td>
</tr><tr>
<td><code><b>@ContentChild(myPredicate)</b> myChildComponent;</code></td>
<td><p>Vincula el primer resultado de la consulta de contenido del componente (<code>myPredicate</code>) a una propiedad (<code>myChildComponent</code>) de la clase.</p>
</td>
</tr><tr>
<td><code><b>@ContentChildren(myPredicate)</b> myChildComponents;</code></td>
<td><p>Vincula los resultados de la consulta de contenido del componente (<code>myPredicate</code>) a una propiedad (<code>myChildComponents</code>) de la clase.</p>
</td>
</tr><tr>
<td><code><b>@ViewChild(myPredicate)</b> myChildComponent;</code></td>
<td><p>Vincula el primer resultado de la consulta de vista del componente (<code>myPredicate</code>) a una propiedad (<code>myChildComponent</code>) de la clase. No disponible para directivas.</p>
</td>
</tr><tr>
<td><code><b>@ViewChildren(myPredicate)</b> myChildComponents;</code></td>
<td><p>Vincula los resultados de la consulta de vista del componente (<code>myPredicate</code>) a una propiedad (<code>myChildComponents</code>) de la clase. No disponible para directivas.</p>
</td>
</tr>
</tbody></table>

<table class="is-full-width is-fixed-layout">
<tbody><tr>

<th>Detección de cambios (change detection) y ciclos de vida (lifecycle hooks) en directivas y componentes</th>
<th><p>(implementado como métodos de clase)
</p>
</th>
</tr>
<tr>
<td><code><b>constructor(myService: MyService, ...)</b> { ... }</code></td>
<td><p>Se llama antes que cualquier ciclo de vida. Úselo para inyectar dependencias, pero evite cualquier trabajo serio aquí.</p>
</td>
</tr><tr>
<td><code><b>ngOnChanges(changeRecord)</b> { ... }</code></td>
<td><p>Se llama después de cada cambio en las propiedades de entrada (input) y antes de procesar contenido o vistas de hijos.</p>
</td>
</tr><tr>
<td><code><b>ngOnInit()</b> { ... }</code></td>
<td><p>Se llama después del constructor, inicializando propiedades de entrada (input), y la primera llamada a <code>ngOnChanges</code>.</p>
</td>
</tr><tr>
<td><code><b>ngDoCheck()</b> { ... }</code></td>
<td><p>Se llama cada vez que se verifican las propiedades de entrada (input) de un componente o una directiva. Úselo para extender la detección de cambios (change detection) realizando una verificación personalizada.</p>
</td>
</tr><tr>
<td><code><b>ngAfterContentInit()</b> { ... }</code></td>
<td><p>Se llama después de <code>ngOnInit</code> cuando el contenido del componente o directiva ha sido inicializado.</p>
</td>
</tr><tr>
<td><code><b>ngAfterContentChecked()</b> { ... }</code></td>
<td><p>Se llama después de cada verificación del contenido del componente o directiva.</p>
</td>
</tr><tr>
<td><code><b>ngAfterViewInit()</b> { ... }</code></td>
<td><p>Se llama después de <code>ngAfterContentInit</code> cuando las vistas del componente y las vistas hijas / la vista en la que se encuentra una directiva ha sido inicializado.</p>
</td>
</tr><tr>
<td><code><b>ngAfterViewChecked()</b> { ... }</code></td>
<td><p>Se llama después de cada verificación de las vistas del componentes y las vistas hijas / la vista en la que se encuentra una directiva.</p>
</td>
</tr><tr>
<td><code><b>ngOnDestroy()</b> { ... }</code></td>
<td><p>Se llama una vez, antes de que la instancia se destruya.</p>
</td>
</tr>
</tbody></table>

<table class="is-full-width is-fixed-layout">
<tbody><tr>
<th>Configuración de inyección de dependencia</th>
<th></th>
</tr>
<tr>
<td><code>{ <b>provide</b>: MyService, <b>useClass</b>: MyMockService }</code></td>
<td><p>Establece o sobre-escribe el proveedor para <code>MyService</code> en la clase <code>MyMockService</code>.</p>
</td>
</tr><tr>
<td><code>{ <b>provide</b>: MyService, <b>useFactory</b>: myFactory }</code></td>
<td><p>Establece o sobre-escribe el proveedor para <code>MyService</code> en la factoría de función <code>myFactory</code>.</p>
</td>
</tr><tr>
<td><code>{ <b>provide</b>: MyValue, <b>useValue</b>: 41 }</code></td>
<td><p>Establece o sobre-escribe el proveedor para <code>MyValue</code> al valor <code>41</code>.</p>
</td>
</tr>
</tbody></table>

<table class="is-full-width is-fixed-layout">
<tbody><tr>
<th>Enrutamiento y navegación</th>
<th><p><code>import { Routes, RouterModule, ... } from '@angular/router';</code>
</p>
</th>
</tr>
<tr>
<td><code>const routes: <b>Routes</b> = [<br>  { path: '', component: HomeComponent },<br>  { path: 'path/:routeParam', component: MyComponent },<br>  { path: 'staticPath', component: ... },<br>  { path: '**', component: ... },<br>  { path: 'oldPath', redirectTo: '/staticPath' },<br>  { path: ..., component: ..., data: { message: 'Custom' } }<br>]);<br><br>const routing = RouterModule.forRoot(routes);</code></td>
<td><p>Configura rutas para la aplicación. Soporta rutas estáticas, parametrizadas, de redireccionamiento y comodines. También soporta datos de ruta personalizados y los resuelve.</p>
</td>
</tr><tr>
<td><code><br>&lt;<b>router-outlet</b>&gt;&lt;/<b>router-outlet</b>&gt;<br>&lt;<b>router-outlet</b> name="aux"&gt;&lt;/<b>router-outlet</b>&gt;<br></code></td>
<td><p>Marca la ubicación para cargar el componente de la ruta activa.</p>
</td>
</tr><tr>
<td><code><br>&lt;a routerLink="/path"&gt;<br>&lt;a <b>[routerLink]</b>="[ '/path', routeParam ]"&gt;<br>&lt;a <b>[routerLink]</b>="[ '/path', { matrixParam: 'value' } ]"&gt;<br>&lt;a <b>[routerLink]</b>="[ '/path' ]" [queryParams]="{ page: 1 }"&gt;<br>&lt;a <b>[routerLink]</b>="[ '/path' ]" fragment="anchor"&gt;<br></code></td>
<td><p>Crea un enlace a una vista diferente basada en una instrucción de ruta que consta de un camino de de ruta, parámetros obligatorios y opcionales, parámetros de consulta y un fragmento. Para navegar a un camino de ruta, usa el prefijo <code>/</code>; para una ruta hija, usa el prefijo <code>./</code>; para un padre o hermano, usa el prefijo <code>../</code>.</p>
</td>
</tr><tr>
<td><code>&lt;a [routerLink]="[ '/path' ]" routerLinkActive="active"&gt;</code></td>
<td><p>Las clases proporcionadas se agregan al elemento cuando el <code>routerLink</code> se convierte en la ruta activa actual.</p>
</td>
</tr><tr>
<td><code>class <b>CanActivate</b>Guard implements <b>CanActivate</b> {<br>    canActivate(<br>      route: ActivatedRouteSnapshot,<br>      state: RouterStateSnapshot<br>    ): Observable&lt;boolean|UrlTree&gt;|Promise&lt;boolean|UrlTree&gt;|boolean|UrlTree { ... }<br>}<br><br>{ path: ..., canActivate: [<b>CanActivate</b>Guard] }</code></td>
<td><p>Una interfaz para definir una clase que el enrutador debe llamar primero para determinar si debe activar este componente. Debe devolver un boolean|UrlTree o un Observable/Promise que se resuelba en un boolean|UrlTree.</p>
</td>
</tr><tr>
<td><code>class <b>CanDeactivate</b>Guard implements <b>CanDeactivate</b>&lt;T&gt; {<br>    canDeactivate(<br>      component: T,<br>      route: ActivatedRouteSnapshot,<br>      state: RouterStateSnapshot<br>    ): Observable&lt;boolean|UrlTree&gt;|Promise&lt;boolean|UrlTree&gt;|boolean|UrlTree { ... }<br>}<br><br>{ path: ..., canDeactivate: [<b>CanDeactivate</b>Guard] }</code></td>
<td><p>Una interfaz para definir una clase que el enrutador debería llamar primero para determinar si debería desactivar este componente después de una navegación. Debe devolver un boolean|UrlTree o un Observable/Promise que se resuelva a boolean|UrlTree.</p>
</td>
</tr><tr>
<td><code>class <b>CanActivateChild</b>Guard implements <b>CanActivateChild</b> {<br>    canActivateChild(<br>      route: ActivatedRouteSnapshot,<br>      state: RouterStateSnapshot<br>    ): Observable&lt;boolean|UrlTree&gt;|Promise&lt;boolean|UrlTree&gt;|boolean|UrlTree { ... }<br>}<br><br>{ path: ..., canActivateChild: [CanActivateGuard],<br>    children: ... }</code></td>
<td><p>Una interfaz para definir una clase que el enrutador debe llamar primero para determinar si debe activar la ruta hija. Debe devolver un boolean|UrlTree o un Observable/Promise que se resuelva en un boolean|UrlTree.</p>
</td>
</tr><tr>
<td><code>class <b>Resolve</b>Guard implements <b>Resolve</b>&lt;T&gt; {<br>    resolve(<br>      route: ActivatedRouteSnapshot,<br>      state: RouterStateSnapshot<br>    ): Observable&lt;any&gt;|Promise&lt;any&gt;|any { ... }<br>}<br><br>{ path: ..., resolve: [<b>Resolve</b>Guard] }</code></td>
<td><p>Una interfaz para definir una clase que el enrutador debe llamar primero para resolver los datos de la ruta antes de representar la ruta. Debe devolver un valor o un Observable/Promise que se resuelva en un valor.</p>
</td>
</tr><tr>
<td><code>class <b>CanLoad</b>Guard implements <b>CanLoad</b> {<br>    canLoad(<br>      route: Route<br>    ): Observable&lt;boolean|UrlTree&gt;|Promise&lt;boolean|UrlTree&gt;|boolean|UrlTree { ... }<br>}<br><br>{ path: ..., canLoad: [<b>CanLoad</b>Guard], loadChildren: ... }</code></td>
<td><p>Una interfaz para definir una clase a la que el enrutador debe llamar primero para verificar si el módulo perezoso cargado (lazy loaded module) debe cargarse. Debe devolver un boolean|UrlTree o un Observable/Promise que se resuelva en un boolean|UrlTree.</p>
</td>
</tr>
</tbody></table>
</div>
