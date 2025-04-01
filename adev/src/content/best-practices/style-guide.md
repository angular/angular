# Angular coding style guide

Looking for an opinionated guide to Angular syntax, conventions, and application structure?
Step right in.
This style guide presents preferred conventions and, as importantly, explains why.

## Style vocabulary

Each guideline describes either a good or bad practice, and all have a consistent presentation.

The wording of each guideline indicates how strong the recommendation is.

**Do** is one that should always be followed.
*Always* might be a bit too strong of a word.
Guidelines that literally should always be followed are extremely rare.
On the other hand, you need a really unusual case for breaking a *Do* guideline.

**Consider** guidelines should generally be followed.
If you fully understand the meaning behind the guideline and have a good reason to deviate, then do so.
Aim to be consistent.

**Avoid** indicates something you should almost never do.
Code examples to *avoid* have an unmistakable red header.

**Why**? <br />
Gives reasons for following the previous recommendations.

## File structure conventions

Some code examples display a file that has one or more similarly named companion files.
For example, `hero.component.ts` and `hero.component.html`.

The guideline uses the shortcut `hero.component.ts|html|css|spec` to represent those various files.
Using this shortcut makes this guide's file structures easier to read and more terse.

## Single responsibility

Apply the [*single responsibility principle (SRP)*](https://wikipedia.org/wiki/Single_responsibility_principle) to all components, services, and other symbols.
This helps make the application cleaner, easier to read and maintain, and more testable.

### Rule of One

#### Style 01-01

**Do** define one thing, such as a service or component, per file.

**Consider** limiting files to 400 lines of code.

**Why**? <br />
One component per file makes it far easier to read, maintain, and avoid collisions with teams in source control.

**Why**? <br />
One component per file avoids hidden bugs that often arise when combining components in a file where they may share variables, create unwanted closures, or unwanted coupling with dependencies.

**Why**? <br />
A single component can be the default export for its file which facilitates lazy loading with the router.

The key is to make the code more reusable, easier to read, and less mistake-prone.

The following *negative* example defines the `AppComponent`, bootstraps the app,
defines the `Hero` model object, and loads heroes from the server all in the same file.
*Don't do this*.

<docs-code path="adev/src/content/examples/styleguide/src/01-01/app/heroes/hero.component.avoid.ts" language="typescript" header="app/heroes/hero.component.ts"/>

It is a better practice to redistribute the component and its
supporting classes into their own, dedicated files.

<docs-code-multifile>
    <docs-code header="main.ts" path="adev/src/content/examples/styleguide/src/01-01/main.ts"/>
    <docs-code header="app/app.module.ts" path="adev/src/content/examples/styleguide/src/01-01/app/app.module.ts"/>
    <docs-code header="app/app.component.ts" path="adev/src/content/examples/styleguide/src/01-01/app/app.component.ts"/>
    <docs-code header="app/heroes/heroes.component.ts" path="adev/src/content/examples/styleguide/src/01-01/app/heroes/heroes.component.ts"/>
    <docs-code header="app/heroes/shared/hero.service.ts" path="adev/src/content/examples/styleguide/src/01-01/app/heroes/shared/hero.service.ts"/>
    <docs-code header="app/heroes/shared/hero.model.ts" path="adev/src/content/examples/styleguide/src/01-01/app/heroes/shared/hero.model.ts"/>
    <docs-code header="app/heroes/shared/mock-heroes.ts" path="adev/src/content/examples/styleguide/src/01-01/app/heroes/shared/mock-heroes.ts"/>
</docs-code-multifile>

As the application grows, this rule becomes even more important.

## Naming

Naming conventions are hugely important to maintainability and readability.
This guide recommends naming conventions for the file name and the symbol name.

### General Naming Guidelines

#### Style 02-01

**Do** use consistent names for all symbols.

**Do** follow a pattern that describes the symbol's feature then its type.
The recommended pattern is `feature.type.ts`.

**Why**? <br />
Naming conventions help provide a consistent way to find content at a glance.
Consistency within the project is vital.
Consistency with a team is important.
Consistency across a company provides tremendous efficiency.

**Why**? <br />
The naming conventions should help find desired code faster and make it easier to understand.

**Why**? <br />
Names of folders and files should clearly convey their intent.
For example, `app/heroes/hero-list.component.ts` may contain a component that manages a list of heroes.

### Separate file names with dots and dashes

#### Style 02-02

**Do** use dashes to separate words in the descriptive name.

**Do** use dots to separate the descriptive name from the type.

**Do** use consistent type names for all components following a pattern that describes the component's feature then its type.
A recommended pattern is `feature.type.ts`.

**Do** use conventional type names including `.service`, `.component`, `.pipe`, `.module`, and `.directive`.
Invent additional type names if you must but take care not to create too many.

**Why**? <br />
Type names provide a consistent way to quickly identify what is in the file.

**Why**? <br />
Type names make it easy to find a specific file type using an editor or IDE's fuzzy search techniques.

**Why**? <br />
Unabbreviated type names such as `.service` are descriptive and unambiguous.
Abbreviations such as `.srv`, `.svc`, and `.serv` can be confusing.

**Why**? <br />
Type names provide pattern matching for any automated tasks.

### Symbols and file names

#### Style 02-03

**Do** use consistent names for all assets named after what they represent.

**Do** use upper camel case for class names.

**Do** match the name of the symbol to the name of the file.

**Do** append the symbol name with the conventional suffix \(such as `Component`, `Directive`, `Module`, `Pipe`, or `Service`\) for a thing of that type.

**Do** give the filename the conventional suffix \(such as `.component.ts`, `.directive.ts`, `.module.ts`, `.pipe.ts`, or `.service.ts`\) for a file of that type.

**Why**? <br />
Consistent conventions make it easy to quickly identify and reference assets of different types.

| Symbol name                                                                                                                                                                          | File name |
|:---                                                                                                                                                                                  |:---       |
| <docs-code hideCopy language="typescript"> @Component({ … }) <br>export class AppComponent { } </docs-code>                             | app.component.ts |
| <docs-code hideCopy language="typescript"> @Component({ … }) <br>export class HeroesComponent { } </docs-code>                          | heroes.component.ts |
| <docs-code hideCopy language="typescript"> @Component({ … }) <br>export class HeroListComponent { } </docs-code>                        | hero-list.component.ts |
| <docs-code hideCopy language="typescript"> @Component({ … }) <br>export class HeroDetailComponent { } </docs-code>                      | hero-detail.component.ts |
| <docs-code hideCopy language="typescript"> @Directive({ … }) <br>export class ValidationDirective { } </docs-code>                      | validation.directive.ts |
| <docs-code hideCopy language="typescript"> @NgModule({ … }) <br>export class AppModule </docs-code>                                     | app.module.ts |
| <docs-code hideCopy language="typescript"> @Pipe({ name: 'initCaps' }) <br>export class InitCapsPipe implements PipeTransform { } </docs-code> | init-caps.pipe.ts |
| <docs-code hideCopy language="typescript"> @Injectable() <br>export class UserProfileService { } </docs-code>                                  | user-profile.service.ts |

### Service names

#### Style 02-04

**Do** use consistent names for all services named after their feature.

**Do** suffix a service class name with `Service`.
For example, something that gets data or heroes should be called a `DataService` or a `HeroService`.

A few terms are unambiguously services.
They typically indicate agency by ending in "-er".
You may prefer to name a service that logs messages `Logger` rather than `LoggerService`.
Decide if this exception is agreeable in your project.
As always, strive for consistency.

**Why**? <br />
Provides a consistent way to quickly identify and reference services.

**Why**? <br />
Clear service names such as `Logger` do not require a suffix.

**Why**? <br />
Service names such as `Credit` are nouns and require a suffix and should be named with a suffix when it is not obvious if it is a service or something else.

| Symbol name                                                                                                                                      | File name |
|:---                                                                                                                                              |:---       |
| <docs-code hideCopy language="typescript"> @Injectable() <br>export class HeroDataService { } </docs-code> | hero-data.service.ts |
| <docs-code hideCopy language="typescript"> @Injectable() <br>export class CreditService { } </docs-code>   | credit.service.ts    |
| <docs-code hideCopy language="typescript"> @Injectable() <br>export class Logger { } </docs-code>          | logger.service.ts    |

### Bootstrapping

#### Style 02-05

**Do** put bootstrapping and platform logic for the application in a file named `main.ts`.

**Do** include error handling in the bootstrapping logic.

**Avoid** putting application logic in `main.ts`.
Instead, consider placing it in a component or service.

**Why**? <br />
Follows a consistent convention for the startup logic of an app.

**Why**? <br />
Follows a familiar convention from other technology platforms.

<docs-code header="main.ts" path="adev/src/content/examples/styleguide/src/02-05/main.ts"/>

### Component selectors

#### Style 05-02

**Do** use *dashed-case* or *kebab-case* for naming the element selectors of components.

**Why**? <br />
Keeps the element names consistent with the specification for [Custom Elements](https://www.w3.org/TR/custom-elements).

<docs-code header="app/heroes/shared/hero-button/hero-button.component.ts" path="adev/src/content/examples/styleguide/src/05-02/app/heroes/shared/hero-button/hero-button.component.avoid.ts" visibleRegion="example"/>

<docs-code-multifile>
    <docs-code header="app/heroes/shared/hero-button/hero-button.component.ts" path="adev/src/content/examples/styleguide/src/05-02/app/heroes/shared/hero-button/hero-button.component.ts" visibleRegion="example"/>
    <docs-code header="app/app.component.html" path="adev/src/content/examples/styleguide/src/05-02/app/app.component.html"/>
</docs-code-multifile>

### Component custom prefix

#### Style 02-07

**Do** use a hyphenated, lowercase element selector value; for example, `admin-users`.

**Do** use a prefix that identifies the feature area or the application itself.

**Why**? <br />
Prevents element name collisions with components in other applications and with native HTML elements.

**Why**? <br />
Makes it easier to promote and share the component in other applications.

**Why**? <br />
Components are easy to identify in the DOM.

<docs-code header="app/heroes/hero.component.ts" path="adev/src/content/examples/styleguide/src/02-07/app/heroes/hero.component.avoid.ts" visibleRegion="example"/>

<docs-code header="app/users/users.component.ts" path="adev/src/content/examples/styleguide/src/02-07/app/users/users.component.avoid.ts" visibleRegion="example"/>

<docs-code header="app/heroes/hero.component.ts" path="adev/src/content/examples/styleguide/src/02-07/app/heroes/hero.component.ts" visibleRegion="example"/>

<docs-code header="app/users/users.component.ts" path="adev/src/content/examples/styleguide/src/02-07/app/users/users.component.ts" visibleRegion="example"/>

### Directive selectors

#### Style 02-06

**Do** Use lower camel case for naming the selectors of directives.

**Why**? <br />
Keeps the names of the properties defined in the directives that are bound to the view consistent with the attribute names.

**Why**? <br />
The Angular HTML parser is case-sensitive and recognizes lower camel case.

### Directive custom prefix

#### Style 02-08

**Do** spell non-element selectors in lower camel case unless the selector is meant to match a native HTML attribute.

**Don't** prefix a directive name with `ng` because that prefix is reserved for Angular and using it could cause bugs that are difficult to diagnose.

**Why**? <br />
Prevents name collisions.

**Why**? <br />
Directives are easily identified.

<docs-code header="app/shared/validate.directive.ts" path="adev/src/content/examples/styleguide/src/02-08/app/shared/validate.directive.avoid.ts" visibleRegion="example"/>

<docs-code header="app/shared/validate.directive.ts" path="adev/src/content/examples/styleguide/src/02-08/app/shared/validate.directive.ts" visibleRegion="example"/>

### Pipe names

#### Style 02-09

**Do** use consistent names for all pipes, named after their feature.
The pipe class name should use `UpperCamelCase` \(the general convention for class names\), and the corresponding `name` string should use *lowerCamelCase*.
The `name` string cannot use hyphens \("dash-case" or "kebab-case"\).

**Why**? <br />
Provides a consistent way to quickly identify and reference pipes.

| Symbol name                                                                                                                                                                          | File name |
|:---                                                                                                                                                                                  |:---       |
| <docs-code hideCopy language="typescript"> @Pipe({ name: 'ellipsis' }) <br>export class EllipsisPipe implements PipeTransform { } </docs-code> | ellipsis.pipe.ts  |
| <docs-code hideCopy language="typescript"> @Pipe({ name: 'initCaps' }) <br>export class InitCapsPipe implements PipeTransform { } </docs-code> | init-caps.pipe.ts |

### Unit test file names

#### Style 02-10

**Do** name test specification files the same as the component they test.

**Do** name test specification files with a suffix of `.spec`.

**Why**? <br />
Provides a consistent way to quickly identify tests.

**Why**? <br />
Provides pattern matching for [karma](https://karma-runner.github.io) or other test runners.

| Test type  | File names |
|:---        |:---        |
| Components | heroes.component.spec.ts <br /> hero-list.component.spec.ts <br /> hero-detail.component.spec.ts |
| Services   | logger.service.spec.ts <br /> hero.service.spec.ts <br /> filter-text.service.spec.ts            |
| Pipes      | ellipsis.pipe.spec.ts <br /> init-caps.pipe.spec.ts                                              |

## Application structure and NgModules

Have a near-term view of implementation and a long-term vision.
Start small but keep in mind where the application is heading.

All of the application's code goes in a folder named `src`.
All feature areas are in their own folder.

All content is one asset per file.
Each component, service, and pipe is in its own file.
All third party vendor scripts are stored in another folder and not in the `src` folder.
Use the naming conventions for files in this guide.

### Overall structural guidelines

#### Style 04-06

**Do** start small but keep in mind where the application is heading down the road.

**Do** have a near term view of implementation and a long term vision.

**Do** put all of the application's code in a folder named `src`.

**Consider** creating a folder for a component when it has multiple accompanying files \(`.ts`, `.html`, `.css`, and `.spec`\).

**Why**? <br />
Helps keep the application structure small and easy to maintain in the early stages, while being easy to evolve as the application grows.

**Why**? <br />
Components often have four files \(for example, `*.html`, `*.css`, `*.ts`, and `*.spec.ts`\) and can clutter a folder quickly.

Here is a compliant folder and file structure:

```markdown
project root
├── src
│ ├── app
│ │ ├── core
│ │ │ └── exception.service.ts|spec.ts
│ │ │ └── user-profile.service.ts|spec.ts
│ │ ├── heroes
│ │ │ ├── hero
│ │ │ │ └── hero.component.ts|html|css|spec.ts
│ │ │ ├── hero-list
│ │ │ │ └── hero-list.component.ts|html|css|spec.ts
│ │ │ ├── shared
│ │ │ │ └── hero-button.component.ts|html|css|spec.ts
│ │ │ │ └── hero.model.ts
│ │ │ │ └── hero.service.ts|spec.ts
│ │ │ └── heroes.component.ts|html|css|spec.ts
│ │ │ └── heroes.routes.ts
│ │ ├── shared
│ │ │ └── init-caps.pipe.ts|spec.ts
│ │ │ └── filter-text.component.ts|spec.ts
│ │ │ └── filter-text.service.ts|spec.ts
│ │ ├── villains
│ │ │ ├── villain
│ │ │ │ └── …
│ │ │ ├── villain-list
│ │ │ │ └── …
│ │ │ ├── shared
│ │ │ │ └── …
│ │ │ └── villains.component.ts|html|css|spec.ts
│ │ │ └── villains.module.ts
│ │ │ └── villains-routing.module.ts
│ │ └── app.component.ts|html|css|spec.ts
│ │ └── app.routes.ts
│ └── main.ts
│ └── index.html
│ └── …
└── node_modules/…
└── …
```

HELPFUL: While components in dedicated folders are widely preferred, another option for small applications is to keep components flat \(not in a dedicated folder\).
This adds up to four files to the existing folder, but also reduces the folder nesting.
Whatever you choose, be consistent.

### *Folders-by-feature* structure

#### Style 04-07

**Do** create folders named for the feature area they represent.

**Why**? <br />
A developer can locate the code and identify what each file represents at a glance.
The structure is as flat as it can be and there are no repetitive or redundant names.

**Why**? <br />
Helps reduce the application from becoming cluttered through organizing the content.

**Why**? <br />
When there are a lot of files, for example 10+, locating them is easier with a consistent folder structure and more difficult in a flat structure.

For more information, refer to [this folder and file structure example](#overall-structural-guidelines).

### App *root module*

IMPORTANT: The following style guide recommendations are for applications based on `NgModule`. New applications should use standalone components, directives, and pipes instead.

#### Style 04-08

**Do** create an NgModule in the application's root folder, for example, in `/src/app` if creating a `NgModule` based app.

**Why**? <br />
Every `NgModule` based application requires at least one root NgModule.

**Consider** naming the root module `app.module.ts`.

**Why**? <br />
Makes it easier to locate and identify the root module.

<docs-code path="adev/src/content/examples/styleguide/src/04-08/app/app.module.ts" language="typescript" visibleRegion="example" header="app/app.module.ts"/>

### Feature modules

#### Style 04-09

**Do** create an NgModule for all distinct features in an application; for example, a `Heroes` feature.

**Do** place the feature module in the same named folder as the feature area; for example, in `app/heroes`.

**Do** name the feature module file reflecting the name of the feature area and folder; for example, `app/heroes/heroes.module.ts`.

**Do** name the feature module symbol reflecting the name of the feature area, folder, and file; for example, `app/heroes/heroes.module.ts` defines `HeroesModule`.

**Why**? <br />
A feature module can expose or hide its implementation from other modules.

**Why**? <br />
A feature module identifies distinct sets of related components that comprise the feature area.

**Why**? <br />
A feature module can easily be routed to both eagerly and lazily.

**Why**? <br />
A feature module defines clear boundaries between specific functionality and other application features.

**Why**? <br />
A feature module helps clarify and make it easier to assign development responsibilities to different teams.

**Why**? <br />
A feature module can easily be isolated for testing.

### Shared feature module

#### Style 04-10

**Do** create a feature module named `SharedModule` in a `shared` folder; for example, `app/shared/shared.module.ts` defines `SharedModule`.

**Do** declare components, directives, and pipes in a shared module when those items will be re-used and referenced by the components declared in other feature modules.

**Consider** using the name SharedModule when the contents of a shared
module are referenced across the entire application.

**Consider** *not* providing services in shared modules.
Services are usually singletons that are provided once for the entire application or in a particular feature module.
There are exceptions, however.
For example, in the sample code that follows, notice that the `SharedModule` provides `FilterTextService`.
This is acceptable here because the service is stateless;that is, the consumers of the service aren't impacted by new instances.

**Do** import all modules required by the assets in the `SharedModule`; for example, `CommonModule` and `FormsModule`.

**Why**? <br />
`SharedModule` will contain components, directives, and pipes that may need features from another common module; for example, `ngFor` in `CommonModule`.

**Do** declare all components, directives, and pipes in the `SharedModule`.

**Do** export all symbols from the `SharedModule` that other feature modules need to use.

**Why**? <br />
`SharedModule` exists to make commonly used components, directives, and pipes available for use in the templates of components in many other modules.

**Avoid** specifying app-wide singleton providers in a `SharedModule`.
Intentional singletons are OK.
Take care.

**Why**? <br />
A lazy loaded feature module that imports that shared module will make its own copy of the service and likely have undesirable results.

**Why**? <br />
You don't want each module to have its own separate instance of singleton services.
Yet there is a real danger of that happening if the `SharedModule` provides a service.

```markdown
project root
├──src
├──├──app
├──├──├── shared
├──├──├──└── shared.module.ts
├──├──├──└── init-caps.pipe.ts|spec.ts
├──├──├──└── filter-text.component.ts|spec.ts
├──├──├──└── filter-text.service.ts|spec.ts
├──├──└── app.component.ts|html|css|spec.ts
├──├──└── app.module.ts
├──├──└── app-routing.module.ts
├──└── main.ts
├──└── index.html
└── …
```

<docs-code-multifile>
    <docs-code header="app/shared/shared.module.ts" path="adev/src/content/examples/styleguide/src/04-10/app/shared/shared.module.ts"/>
    <docs-code header="app/shared/init-caps.pipe.ts" path="adev/src/content/examples/styleguide/src/04-10/app/shared/init-caps.pipe.ts"/>
    <docs-code header="app/shared/filter-text/filter-text.component.ts" path="adev/src/content/examples/styleguide/src/04-10/app/shared/filter-text/filter-text.component.ts"/>
    <docs-code header="app/shared/filter-text/filter-text.service.ts" path="adev/src/content/examples/styleguide/src/04-10/app/shared/filter-text/filter-text.service.ts"/>
    <docs-code header="app/heroes/heroes.component.ts" path="adev/src/content/examples/styleguide/src/04-10/app/heroes/heroes.component.ts"/>
    <docs-code header="app/heroes/heroes.component.html" path="adev/src/content/examples/styleguide/src/04-10/app/heroes/heroes.component.html"/>
</docs-code-multifile>

### Lazy Loaded folders

#### Style 04-11

A distinct application feature or workflow may be *lazy loaded* or *loaded on demand* rather than when the application starts.

**Do** put the contents of lazy loaded features in a *lazy loaded folder*.
A typical *lazy loaded folder* contains a *routing component*, its child components, and their related assets.

**Why**? <br />
The folder makes it easy to identify and isolate the feature content.

## Components

### Components as elements

#### Style 05-03

**Consider** giving components an *element* selector, as opposed to *attribute* or *class* selectors.

**Why**? <br />
Components have templates containing HTML and optional Angular template syntax.
They display content.
Developers place components on the page as they would native HTML elements and web components.

**Why**? <br />
It is easier to recognize that a symbol is a component by looking at the template's html.

HELPFUL: There are a few cases where you give a component an attribute, such as when you want to augment a built-in element.
For example, [Material Design](https://material.angular.io/components/button/overview) uses this technique with `<button mat-button>`.
However, you wouldn't use this technique on a custom element.

<docs-code header="app/heroes/hero-button/hero-button.component.ts" path="adev/src/content/examples/styleguide/src/05-03/app/heroes/shared/hero-button/hero-button.component.avoid.ts" visibleRegion="example"/>

<docs-code header="app/app.component.html" path="adev/src/content/examples/styleguide/src/05-03/app/app.component.avoid.html"/>

<docs-code-multifile>
    <docs-code header="app/heroes/shared/hero-button/hero-button.component.ts" path="adev/src/content/examples/styleguide/src/05-03/app/heroes/shared/hero-button/hero-button.component.ts" visibleRegion="example"/>
    <docs-code header="app/app.component.html" path="adev/src/content/examples/styleguide/src/05-03/app/app.component.html"/>
</docs-code-multifile>

### Extract templates and styles to their own files

#### Style 05-04

**Do** extract templates and styles into a separate file, when more than 3 lines.

**Do** name the template file `[component-name].component.html`, where [component-name] is the component name.

**Do** name the style file `[component-name].component.css`, where [component-name] is the component name.

**Do** specify *component-relative* URLs, prefixed with `./`.

**Why**? <br />
Large, inline templates and styles obscure the component's purpose and implementation, reducing readability and maintainability.

**Why**? <br />
In most editors, syntax hints and code snippets aren't available when developing inline templates and styles.
The Angular TypeScript Language Service \(forthcoming\) promises to overcome this deficiency for HTML templates in those editors that support it; it won't help with CSS styles.

**Why**? <br />
A *component relative* URL requires no change when you move the component files, as long as the files stay together.

**Why**? <br />
The `./` prefix is standard syntax for relative URLs; don't depend on Angular's current ability to do without that prefix.

<docs-code header="app/heroes/heroes.component.ts" path="adev/src/content/examples/styleguide/src/05-04/app/heroes/heroes.component.avoid.ts" visibleRegion="example"/>

<docs-code-multifile>
    <docs-code header="app/heroes/heroes.component.ts" path="adev/src/content/examples/styleguide/src/05-04/app/heroes/heroes.component.ts" visibleRegion="example"/>
    <docs-code header="app/heroes/heroes.component.html" path="adev/src/content/examples/styleguide/src/05-04/app/heroes/heroes.component.html"/>
    <docs-code header="app/heroes/heroes.component.css" path="adev/src/content/examples/styleguide/src/05-04/app/heroes/heroes.component.css"/>
</docs-code-multifile>

### Decorate `input` and `output` properties

#### Style 05-12

**Do** use the `@Input()` and `@Output()` class decorators instead of the `inputs` and `outputs` properties of the `@Directive` and `@Component` metadata:

**Consider** placing `@Input()` or `@Output()` on the same line as the property it decorates.

**Why**? <br />
It is easier and more readable to identify which properties in a class are inputs or outputs.

**Why**? <br />
If you ever need to rename the property or event name associated with `@Input()` or `@Output()`, you can modify it in a single place.

**Why**? <br />
The metadata declaration attached to the directive is shorter and thus more readable.

**Why**? <br />
Placing the decorator on the same line *usually* makes for shorter code and still easily identifies the property as an input or output.
Put it on the line above when doing so is clearly more readable.

<docs-code header="app/heroes/shared/hero-button/hero-button.component.ts" path="adev/src/content/examples/styleguide/src/05-12/app/heroes/shared/hero-button/hero-button.component.avoid.ts" visibleRegion="example"/>

<docs-code header="app/heroes/shared/hero-button/hero-button.component.ts" path="adev/src/content/examples/styleguide/src/05-12/app/heroes/shared/hero-button/hero-button.component.ts" visibleRegion="example"/>

### Avoid aliasing `inputs` and `outputs`

#### Style 05-13

**Avoid** `input` and `output` aliases except when it serves an important purpose.

**Why**? <br />
Two names for the same property \(one private, one public\) is inherently confusing.

**Why**? <br />
You should use an alias when the directive name is also an `input` property,
and the directive name doesn't describe the property.

<docs-code header="app/heroes/shared/hero-button/hero-button.component.ts" path="adev/src/content/examples/styleguide/src/05-13/app/heroes/shared/hero-button/hero-button.component.avoid.ts" visibleRegion="example"/>

<docs-code header="app/app.component.html" path="adev/src/content/examples/styleguide/src/05-13/app/app.component.avoid.html"/>

<docs-code-multifile>
    <docs-code header="app/heroes/shared/hero-button/hero-button.component.ts" path="adev/src/content/examples/styleguide/src/05-13/app/heroes/shared/hero-button/hero-button.component.ts" visibleRegion="example"/>
    <docs-code header="app/heroes/shared/hero-button/hero-highlight.directive.ts" path="adev/src/content/examples/styleguide/src/05-13/app/heroes/shared/hero-highlight.directive.ts"/>
    <docs-code header="app/app.component.html" path="adev/src/content/examples/styleguide/src/05-13/app/app.component.html"/>
</docs-code-multifile>

### Delegate complex component logic to services

#### Style 05-15

**Do** limit logic in a component to only that required for the view.
All other logic should be delegated to services.

**Do** move reusable logic to services and keep components simple and focused on their intended purpose.

**Why**? <br />
Logic may be reused by multiple components when placed within a service and exposed as a function.

**Why**? <br />
Logic in a service can more easily be isolated in a unit test, while the calling logic in the component can be easily mocked.

**Why**? <br />
Removes dependencies and hides implementation details from the component.

**Why**? <br />
Keeps the component slim, trim, and focused.

<docs-code header="app/heroes/hero-list/hero-list.component.ts" path="adev/src/content/examples/styleguide/src/05-15/app/heroes/hero-list/hero-list.component.avoid.ts"/>

<docs-code header="app/heroes/hero-list/hero-list.component.ts" path="adev/src/content/examples/styleguide/src/05-15/app/heroes/hero-list/hero-list.component.ts" visibleRegion="example"/>

### Don't prefix `output` properties

#### Style 05-16

**Do** name events without the prefix `on`.

**Do** name event handler methods with the prefix `on` followed by the event name.

**Why**? <br />
This is consistent with built-in events such as button clicks.

**Why**? <br />
Angular allows for an [alternative syntax](guide/templates/binding) `on-*`.
If the event itself was prefixed with `on` this would result in an `on-onEvent` binding expression.

<docs-code header="app/heroes/hero.component.ts" path="adev/src/content/examples/styleguide/src/05-16/app/heroes/hero.component.avoid.ts" visibleRegion="example"/>

<docs-code header="app/app.component.html" path="adev/src/content/examples/styleguide/src/05-16/app/app.component.avoid.html"/>

<docs-code-multifile>
    <docs-code header="app/heroes/hero.component.ts" path="adev/src/content/examples/styleguide/src/05-16/app/heroes/hero.component.ts" visibleRegion="example"/>
    <docs-code header="app/app.component.html" path="adev/src/content/examples/styleguide/src/05-16/app/app.component.html"/>
</docs-code-multifile>

### Put presentation logic in the component class

#### Style 05-17

**Do** put presentation logic in the component class, and not in the template.

**Why**? <br />
Logic will be contained in one place \(the component class\) instead of being spread in two places.

**Why**? <br />
Keeping the component's presentation logic in the class instead of the template improves testability, maintainability, and reusability.

<docs-code header="app/heroes/hero-list/hero-list.component.ts" path="adev/src/content/examples/styleguide/src/05-17/app/heroes/hero-list/hero-list.component.avoid.ts" visibleRegion="example"/>

<docs-code header="app/heroes/hero-list/hero-list.component.ts" path="adev/src/content/examples/styleguide/src/05-17/app/heroes/hero-list/hero-list.component.ts" visibleRegion="example"/>
### Initialize inputs

#### Style 05-18

TypeScript's `--strictPropertyInitialization` compiler option ensures that a class initializes its properties during construction.
When enabled, this option causes the TypeScript compiler to report an error if the class does not set a value to any property that is not explicitly marked as optional.

By design, Angular treats all `@Input` properties as optional.
When possible, you should satisfy `--strictPropertyInitialization` by providing a default value.

<docs-code header="app/heroes/hero/hero.component.ts" path="adev/src/content/examples/styleguide/src/05-18/app/heroes/hero/hero.component.ts" visibleRegion="example"/>

If the property is hard to construct a default value for, use `?` to explicitly mark the property as optional.

<docs-code header="app/heroes/hero/hero.component.ts" path="adev/src/content/examples/styleguide/src/05-18/app/heroes/hero/hero.component.optional.ts" visibleRegion="example"/>

You may want to have a required `@Input` field, meaning all your component users are required to pass that attribute.
In such cases, use a default value.
Just suppressing the TypeScript error with `!` is insufficient and should be avoided because it will prevent the type checker from ensuring the input value is provided.

<docs-code header="app/heroes/hero/hero.component.ts" path="adev/src/content/examples/styleguide/src/05-18/app/heroes/hero/hero.component.avoid.ts" visibleRegion="example"/>

## Directives

### Use directives to enhance an element

#### Style 06-01

**Do** use attribute directives when you have presentation logic without a template.

**Why**? <br />
Attribute directives don't have an associated template.

**Why**? <br />
An element may have more than one attribute directive applied.

<docs-code header="app/shared/highlight.directive.ts" path="adev/src/content/examples/styleguide/src/06-01/app/shared/highlight.directive.ts" visibleRegion="example"/>

<docs-code header="app/app.component.html" path="adev/src/content/examples/styleguide/src/06-01/app/app.component.html"/>

### `HostListener`/`HostBinding` decorators versus `host` metadata

#### Style 06-03

**Consider** preferring the `@HostListener` and `@HostBinding` to the `host` property of the `@Directive` and `@Component` decorators.

**Do** be consistent in your choice.

**Why**? <br />
The property associated with `@HostBinding` or the method associated with `@HostListener` can be modified only in a single place —in the directive's class.
If you use the `host` metadata property, you must modify both the property/method declaration in the directive's class and the metadata in the decorator associated with the directive.

<docs-code header="app/shared/validator.directive.ts" path="adev/src/content/examples/styleguide/src/06-03/app/shared/validator.directive.ts"/>

Compare with the less preferred `host` metadata alternative.

**Why**? <br />
The `host` metadata is only one term to remember and doesn't require extra ES imports.

<docs-code header="app/shared/validator2.directive.ts" path="adev/src/content/examples/styleguide/src/06-03/app/shared/validator2.directive.ts"/>
## Services

### Services are singletons

#### Style 07-01

**Do** use services as singletons within the same injector.
Use them for sharing data and functionality.

**Why**? <br />
Services are ideal for sharing methods across a feature area or an app.

**Why**? <br />
Services are ideal for sharing stateful in-memory data.

<docs-code header="app/heroes/shared/hero.service.ts" path="adev/src/content/examples/styleguide/src/07-01/app/heroes/shared/hero.service.ts" visibleRegion="example"/>

### Providing a service

#### Style 07-03

**Do** provide a service with the application root injector in the `@Injectable` decorator of the service.

**Why**? <br />
The Angular injector is hierarchical.

**Why**? <br />
When you provide the service to a root injector, that instance of the service is shared and available in every class that needs the service.
This is ideal when a service is sharing methods or state.

**Why**? <br />
When you register a service in the `@Injectable` decorator of the service, optimization tools such as those used by the [Angular CLI's](cli) production builds can perform tree shaking and remove services that aren't used by your app.

**Why**? <br />
This is not ideal when two different components need different instances of a service.
In this scenario it would be better to provide the service at the component level that needs the new and separate instance.

<docs-code header="src/app/treeshaking/service.ts" path="adev/src/content/examples/dependency-injection/src/app/tree-shaking/service.ts"/>

### Use the @Injectable() class decorator

#### Style 07-04

**Do** use the `@Injectable()` class decorator instead of the `@Inject` parameter decorator when using types as tokens for the dependencies of a service.

**Why**? <br />
The Angular Dependency Injection \(DI\) mechanism resolves a service's own
dependencies based on the declared types of that service's constructor parameters.

**Why**? <br />
When a service accepts only dependencies associated with type tokens, the `@Injectable()` syntax is much less verbose compared to using `@Inject()` on each individual constructor parameter.

<docs-code header="app/heroes/shared/hero-arena.service.ts" path="adev/src/content/examples/styleguide/src/07-04/app/heroes/shared/hero-arena.service.avoid.ts" visibleRegion="example"/>

<docs-code header="app/heroes/shared/hero-arena.service.ts" path="adev/src/content/examples/styleguide/src/07-04/app/heroes/shared/hero-arena.service.ts" visibleRegion="example"/>
## Data Services

### Talk to the server through a service

#### Style 08-01

**Do** refactor logic for making data operations and interacting with data to a service.

**Do** make data services responsible for XHR calls, local storage, stashing in memory, or any other data operations.

**Why**? <br />
The component's responsibility is for the presentation and gathering of information for the view.
It should not care how it gets the data, just that it knows who to ask for it.
Separating the data services moves the logic on how to get it to the data service, and lets the component be simpler and more focused on the view.

**Why**? <br />
This makes it easier to test \(mock or real\) the data calls when testing a component that uses a data service.

**Why**? <br />
The details of data management, such as headers, HTTP methods, caching, error handling, and retry logic, are irrelevant to components and other data consumers.

A data service encapsulates these details.
It's easier to evolve these details inside the service without affecting its consumers.
And it's easier to test the consumers with mock service implementations.

## Lifecycle hooks

Use Lifecycle hooks to tap into important events exposed by Angular.

### Implement lifecycle hook interfaces

#### Style 09-01

**Do** implement the lifecycle hook interfaces.

**Why**? <br />
Lifecycle interfaces prescribe typed method signatures.
Use those signatures to flag spelling and syntax mistakes.

<docs-code header="app/heroes/shared/hero-button/hero-button.component.ts" path="adev/src/content/examples/styleguide/src/09-01/app/heroes/shared/hero-button/hero-button.component.avoid.ts" visibleRegion="example"/>

<docs-code header="app/heroes/shared/hero-button/hero-button.component.ts" path="adev/src/content/examples/styleguide/src/09-01/app/heroes/shared/hero-button/hero-button.component.ts" visibleRegion="example"/>
## Appendix

Useful tools and tips for Angular.

### File templates and snippets

#### Style A-02

**Do** use file templates or snippets to help follow consistent styles and patterns.
Here are templates and/or snippets for some of the web development editors and IDEs.

**Consider** using [snippets](https://marketplace.visualstudio.com/items?itemName=johnpapa.Angular2) for [Visual Studio Code](https://code.visualstudio.com) that follow these styles and guidelines.

<a href="https://marketplace.visualstudio.com/items?itemName=johnpapa.Angular2">

<img alt="Use Extension" src="assets/images/guide/styleguide/use-extension.gif">

</a>

**Consider** using [snippets](https://github.com/orizens/sublime-angular2-snippets) for [Sublime Text](https://www.sublimetext.com) that follow these styles and guidelines.

**Consider** using [snippets](https://github.com/mhartington/vim-angular2-snippets) for [Vim](https://www.vim.org) that follow these styles and guidelines.
