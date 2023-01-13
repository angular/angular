# Angular coding style guide

Looking for an opinionated guide to Angular syntax, conventions, and application structure?
Step right in.
This style guide presents preferred conventions and, as importantly, explains why.

<a id="toc"></a>

## Style vocabulary

Each guideline describes either a good or bad practice, and all have a consistent presentation.

The wording of each guideline indicates how strong the recommendation is.

<div class="s-rule do">

**Do** is one that should always be followed.
*Always* might be a bit too strong of a word.
Guidelines that literally should always be followed are extremely rare.
On the other hand, you need a really unusual case for breaking a *Do* guideline.

</div>

<div class="s-rule consider">

**Consider** guidelines should generally be followed.
If you fully understand the meaning behind the guideline and have a good reason to deviate, then do so.
Aim to be consistent.

</div>

<div class="s-rule avoid">

**Avoid** indicates something you should almost never do.
Code examples to *avoid* have an unmistakable red header.

</div>

<div class="s-why">

**Why**? <br />
Gives reasons for following the previous recommendations.

</div>

## File structure conventions

Some code examples display a file that has one or more similarly named companion files.
For example, `hero.component.ts` and `hero.component.html`.

The guideline uses the shortcut `hero.component.ts|html|css|spec` to represent those various files.
Using this shortcut makes this guide's file structures easier to read and more terse.

<a id="single-responsibility"></a>

## Single responsibility

Apply the [*single responsibility principle (SRP)*](https://wikipedia.org/wiki/Single_responsibility_principle) to all components, services, and other symbols.
This helps make the application cleaner, easier to read and maintain, and more testable.

<a id="01-01"></a>

### Rule of One

#### Style 01-01

<div class="s-rule do">

**Do** define one thing, such as a service or component, per file.

</div>

<div class="s-rule consider">

**Consider** limiting files to 400 lines of code.

</div>

<div class="s-why">

**Why**? <br />
One component per file makes it far easier to read, maintain, and avoid collisions with teams in source control.

</div>

<div class="s-why">

**Why**? <br />
One component per file avoids hidden bugs that often arise when combining components in a file where they may share variables, create unwanted closures, or unwanted coupling with dependencies.

</div>

<div class="s-why-last">

**Why**? <br />
A single component can be the default export for its file which facilitates lazy loading with the router.

</div>

The key is to make the code more reusable, easier to read, and less mistake-prone.

The following *negative* example defines the `AppComponent`, bootstraps the app,
defines the `Hero` model object, and loads heroes from the server all in the same file.
*Don't do this*.

<code-example format="typescript" path="styleguide/src/01-01/app/heroes/hero.component.avoid.ts" language="typescript" header="app/heroes/hero.component.ts"></code-example>

It is a better practice to redistribute the component and its
supporting classes into their own, dedicated files.

<code-tabs>
    <code-pane header="main.ts" path="styleguide/src/01-01/main.ts"></code-pane>
    <code-pane header="app/app.module.ts" path="styleguide/src/01-01/app/app.module.ts"></code-pane>
    <code-pane header="app/app.component.ts" path="styleguide/src/01-01/app/app.component.ts"></code-pane>
    <code-pane header="app/heroes/heroes.component.ts" path="styleguide/src/01-01/app/heroes/heroes.component.ts"></code-pane>
    <code-pane header="app/heroes/shared/hero.service.ts" path="styleguide/src/01-01/app/heroes/shared/hero.service.ts"></code-pane>
    <code-pane header="app/heroes/shared/hero.model.ts" path="styleguide/src/01-01/app/heroes/shared/hero.model.ts"></code-pane>
    <code-pane header="app/heroes/shared/mock-heroes.ts" path="styleguide/src/01-01/app/heroes/shared/mock-heroes.ts"></code-pane>
</code-tabs>

As the application grows, this rule becomes even more important.

[Back to top](#toc)

<a id="01-02"></a>

### Small functions

#### Style 01-02

<div class="s-rule do">

**Do** define small functions

</div>

<div class="s-rule consider">

**Consider** limiting to no more than 75 lines.

</div>

<div class="s-why">

**Why**? <br />
Small functions are easier to test, especially when they do one thing and serve one purpose.

</div>

<div class="s-why">

**Why**? <br />
Small functions promote reuse.

</div>

<div class="s-why">

**Why**? <br />
Small functions are easier to read.

</div>

<div class="s-why">

**Why**? <br />
Small functions are easier to maintain.

</div>

<div class="s-why-last">

**Why**? <br />
Small functions help avoid hidden bugs that come with large functions that share variables with external scope, create unwanted closures, or unwanted coupling with dependencies.

</div>

[Back to top](#toc)

## Naming

Naming conventions are hugely important to maintainability and readability.
This guide recommends naming conventions for the file name and the symbol name.

<a id="02-01"></a>

### General Naming Guidelines

#### Style 02-01

<div class="s-rule do">

**Do** use consistent names for all symbols.

</div>

<div class="s-rule do">

**Do** follow a pattern that describes the symbol's feature then its type.
The recommended pattern is `feature.type.ts`.

</div>

<div class="s-why">

**Why**? <br />
Naming conventions help provide a consistent way to find content at a glance.
Consistency within the project is vital.
Consistency with a team is important.
Consistency across a company provides tremendous efficiency.

</div>

<div class="s-why">

**Why**? <br />
The naming conventions should help find desired code faster and make it easier to understand.

</div>

<div class="s-why-last">

**Why**? <br />
Names of folders and files should clearly convey their intent.
For example, `app/heroes/hero-list.component.ts` may contain a component that manages a list of heroes.

</div>

[Back to top](#toc)

<a id="02-02"></a>

### Separate file names with dots and dashes

#### Style 02-02

<div class="s-rule do">

**Do** use dashes to separate words in the descriptive name.

</div>

<div class="s-rule do">

**Do** use dots to separate the descriptive name from the type.

</div>

<div class="s-rule do">

**Do** use consistent type names for all components following a pattern that describes the component's feature then its type.
A recommended pattern is `feature.type.ts`.

</div>

<div class="s-rule do">

**Do** use conventional type names including `.service`, `.component`, `.pipe`, `.module`, and `.directive`.
Invent additional type names if you must but take care not to create too many.

</div>

<div class="s-why">

**Why**? <br />
Type names provide a consistent way to quickly identify what is in the file.

</div>

<div class="s-why">

**Why**? <br />
Type names make it easy to find a specific file type using an editor or IDE's fuzzy search techniques.

</div>

<div class="s-why">

**Why**? <br />
Unabbreviated type names such as `.service` are descriptive and unambiguous.
Abbreviations such as `.srv`, `.svc`, and `.serv` can be confusing.

</div>

<div class="s-why-last">

**Why**? <br />
Type names provide pattern matching for any automated tasks.

</div>

[Back to top](#toc)

<a id="02-03"></a>

### Symbols and file names

#### Style 02-03

<div class="s-rule do">

**Do** use consistent names for all assets named after what they represent.

</div>

<div class="s-rule do">

**Do** use upper camel case for class names.

</div>

<div class="s-rule do">

**Do** match the name of the symbol to the name of the file.

</div>

<div class="s-rule do">

**Do** append the symbol name with the conventional suffix \(such as `Component`, `Directive`, `Module`, `Pipe`, or `Service`\) for a thing of that type.

</div>

<div class="s-rule do">

**Do** give the filename the conventional suffix \(such as `.component.ts`, `.directive.ts`, `.module.ts`, `.pipe.ts`, or `.service.ts`\) for a file of that type.

</div>

<div class="s-why">

**Why**? <br />
Consistent conventions make it easy to quickly identify and reference assets of different types.

</div>

| Symbol name                                                                                                                                                                          | File name |
|:---                                                                                                                                                                                  |:---       |
| <code-example format="typescript" hideCopy language="typescript"> &commat;Component({ &hellip; }) &NewLine;export class AppComponent { } </code-example>                             | app.component.ts |
| <code-example format="typescript" hideCopy language="typescript"> &commat;Component({ &hellip; }) &NewLine;export class HeroesComponent { } </code-example>                          | heroes.component.ts |
| <code-example format="typescript" hideCopy language="typescript"> &commat;Component({ &hellip; }) &NewLine;export class HeroListComponent { } </code-example>                        | hero-list.component.ts |
| <code-example format="typescript" hideCopy language="typescript"> &commat;Component({ &hellip; }) &NewLine;export class HeroDetailComponent { } </code-example>                      | hero-detail.component.ts |
| <code-example format="typescript" hideCopy language="typescript"> &commat;Directive({ &hellip; }) &NewLine;export class ValidationDirective { } </code-example>                      | validation.directive.ts |
| <code-example format="typescript" hideCopy language="typescript"> &commat;NgModule({ &hellip; }) &NewLine;export class AppModule </code-example>                                     | app.module.ts |
| <code-example format="typescript" hideCopy language="typescript"> &commat;Pipe({ name: 'initCaps' }) &NewLine;export class InitCapsPipe implements PipeTransform { } </code-example> | init-caps.pipe.ts |
| <code-example format="typescript" hideCopy language="typescript"> &commat;Injectable() &NewLine;export class UserProfileService { } </code-example>                                  | user-profile.service.ts |

[Back to top](#toc)

<a id="02-04"></a>

### Service names

#### Style 02-04

<div class="s-rule do">

**Do** use consistent names for all services named after their feature.

</div>

<div class="s-rule do">

**Do** suffix a service class name with `Service`.
For example, something that gets data or heroes should be called a `DataService` or a `HeroService`.

A few terms are unambiguously services.
They typically indicate agency by ending in "-er".
You may prefer to name a service that logs messages `Logger` rather than `LoggerService`.
Decide if this exception is agreeable in your project.
As always, strive for consistency.

</div>

<div class="s-why">

**Why**? <br />
Provides a consistent way to quickly identify and reference services.

</div>

<div class="s-why">

**Why**? <br />
Clear service names such as `Logger` do not require a suffix.

</div>

<div class="s-why-last">

**Why**? <br />
Service names such as `Credit` are nouns and require a suffix and should be named with a suffix when it is not obvious if it is a service or something else.

</div>

| Symbol name                                                                                                                                      | File name |
|:---                                                                                                                                              |:---       |
| <code-example format="typescript" hideCopy language="typescript"> &commat;Injectable() &NewLine;export class HeroDataService { } </code-example> | hero-data.service.ts |
| <code-example format="typescript" hideCopy language="typescript"> &commat;Injectable() &NewLine;export class CreditService { } </code-example>   | credit.service.ts    |
| <code-example format="typescript" hideCopy language="typescript"> &commat;Injectable() &NewLine;export class Logger { } </code-example>          | logger.service.ts    |

[Back to top](#toc)

<a id="02-05"></a>

### Bootstrapping

#### Style 02-05

<div class="s-rule do">

**Do** put bootstrapping and platform logic for the application in a file named `main.ts`.

</div>

<div class="s-rule do">

**Do** include error handling in the bootstrapping logic.

</div>

<div class="s-rule avoid">

**Avoid** putting application logic in `main.ts`.
Instead, consider placing it in a component or service.

</div>

<div class="s-why">

**Why**? <br />
Follows a consistent convention for the startup logic of an app.

</div>

<div class="s-why-last">

**Why**? <br />
Follows a familiar convention from other technology platforms.

</div>

<code-example header="main.ts" path="styleguide/src/02-05/main.ts"></code-example>

[Back to top](#toc)

<a id="05-02"></a>

### Component selectors

#### Style 05-02

<div class="s-rule do">

**Do** use *dashed-case* or *kebab-case* for naming the element selectors of components.

</div>

<div class="s-why-last">

**Why**? <br />
Keeps the element names consistent with the specification for [Custom Elements](https://www.w3.org/TR/custom-elements).

</div>

<code-example header="app/heroes/shared/hero-button/hero-button.component.ts" path="styleguide/src/05-02/app/heroes/shared/hero-button/hero-button.component.avoid.ts" region="example"></code-example>

<code-tabs>
    <code-pane header="app/heroes/shared/hero-button/hero-button.component.ts" path="styleguide/src/05-02/app/heroes/shared/hero-button/hero-button.component.ts" region="example"></code-pane>
    <code-pane header="app/app.component.html" path="styleguide/src/05-02/app/app.component.html"></code-pane>
</code-tabs>

[Back to top](#toc)

<a id="02-07"></a>

### Component custom prefix

#### Style 02-07

<div class="s-rule do">

**Do** use a hyphenated, lowercase element selector value; for example, `admin-users`.

</div>

<div class="s-rule do">

**Do** use a custom prefix for a component selector.
For example, the prefix `toh` represents **T**our **o**f **H**eroes and the prefix `admin` represents an admin feature area.

</div>

<div class="s-rule do">

**Do** use a prefix that identifies the feature area or the application itself.

</div>

<div class="s-why">

**Why**? <br />
Prevents element name collisions with components in other applications and with native HTML elements.

</div>

<div class="s-why">

**Why**? <br />
Makes it easier to promote and share the component in other applications.

</div>

<div class="s-why-last">

**Why**? <br />
Components are easy to identify in the DOM.

</div>

<code-example header="app/heroes/hero.component.ts" path="styleguide/src/02-07/app/heroes/hero.component.avoid.ts" region="example"></code-example>

<code-example header="app/users/users.component.ts" path="styleguide/src/02-07/app/users/users.component.avoid.ts" region="example"></code-example>

<code-example header="app/heroes/hero.component.ts" path="styleguide/src/02-07/app/heroes/hero.component.ts" region="example"></code-example>

<code-example header="app/users/users.component.ts" path="styleguide/src/02-07/app/users/users.component.ts" region="example"></code-example>

[Back to top](#toc)

<a id="02-06"></a>

### Directive selectors

#### Style 02-06

<div class="s-rule do">

**Do** Use lower camel case for naming the selectors of directives.

</div>

<div class="s-why">

**Why**? <br />
Keeps the names of the properties defined in the directives that are bound to the view consistent with the attribute names.

</div>

<div class="s-why-last">

**Why**? <br />
The Angular HTML parser is case-sensitive and recognizes lower camel case.

</div>

[Back to top](#toc)

<a id="02-08"></a>

### Directive custom prefix

#### Style 02-08

<div class="s-rule do">

**Do** use a custom prefix for the selector of directives \(for example, the prefix `toh` from **T**our **o**f **H**eroes\).

</div>

<div class="s-rule do">

**Do** spell non-element selectors in lower camel case unless the selector is meant to match a native HTML attribute.

</div>

<div class="s-rule avoid">

**Don't** prefix a directive name with `ng` because that prefix is reserved for Angular and using it could cause bugs that are difficult to diagnose.

</div>

<div class="s-why">

**Why**? <br />
Prevents name collisions.

</div>

<div class="s-why-last">

**Why**? <br />
Directives are easily identified.

</div>

<code-example header="app/shared/validate.directive.ts" path="styleguide/src/02-08/app/shared/validate.directive.avoid.ts" region="example"></code-example>

<code-example header="app/shared/validate.directive.ts" path="styleguide/src/02-08/app/shared/validate.directive.ts" region="example"></code-example>

[Back to top](#toc)

<a id="02-09"></a>

### Pipe names

#### Style 02-09

<div class="s-rule do">

**Do** use consistent names for all pipes, named after their feature.
The pipe class name should use [UpperCamelCase](guide/glossary#case-types) \(the general convention for class names\), and the corresponding `name` string should use *lowerCamelCase*.
The `name` string cannot use hyphens \("dash-case" or "kebab-case"\).

</div>

<div class="s-why-last">

**Why**? <br />
Provides a consistent way to quickly identify and reference pipes.

</div>

| Symbol name                                                                                                                                                                          | File name |
|:---                                                                                                                                                                                  |:---       |
| <code-example format="typescript" hideCopy language="typescript"> &commat;Pipe({ name: 'ellipsis' }) &NewLine;export class EllipsisPipe implements PipeTransform { } </code-example> | ellipsis.pipe.ts  |
| <code-example format="typescript" hideCopy language="typescript"> &commat;Pipe({ name: 'initCaps' }) &NewLine;export class InitCapsPipe implements PipeTransform { } </code-example> | init-caps.pipe.ts |

[Back to top](#toc)

<a id="02-10"></a>

### Unit test file names

#### Style 02-10

<div class="s-rule do">

**Do** name test specification files the same as the component they test.

</div>

<div class="s-rule do">

**Do** name test specification files with a suffix of `.spec`.

</div>

<div class="s-why">

**Why**? <br />
Provides a consistent way to quickly identify tests.

</div>

<div class="s-why-last">

**Why**? <br />
Provides pattern matching for [karma](https://karma-runner.github.io) or other test runners.

</div>

| Test type  | File names |
|:---        |:---        |
| Components | heroes.component.spec.ts <br /> hero-list.component.spec.ts <br /> hero-detail.component.spec.ts |
| Services   | logger.service.spec.ts <br /> hero.service.spec.ts <br /> filter-text.service.spec.ts            |
| Pipes      | ellipsis.pipe.spec.ts <br /> init-caps.pipe.spec.ts                                              |

[Back to top](#toc)

<a id="02-11"></a>

### *End-to-End* (E2E) test file names

#### Style 02-11

<div class="s-rule do">

**Do** name end-to-end test specification files after the feature they test with a suffix of `.e2e-spec`.

</div>

<div class="s-why">

**Why**? <br />
Provides a consistent way to quickly identify end-to-end tests.

</div>

<div class="s-why-last">

**Why**? <br />
Provides pattern matching for test runners and build automation.

</div>

| Test type        | File names |
|:---              |:---        |
| End-to-End Tests | app.e2e-spec.ts <br /> heroes.e2e-spec.ts |

[Back to top](#toc)

<a id="02-12"></a>

### Angular `NgModule` names

#### Style 02-12

<div class="s-rule do">

**Do** append the symbol name with the suffix `Module`.

</div>

<div class="s-rule do">

**Do** give the file name the `.module.ts` extension.

</div>

<div class="s-rule do">

**Do** name the module after the feature and folder it resides in.

</div>

<div class="s-why">

**Why**? <br />
Provides a consistent way to quickly identify and reference modules.

</div>

<div class="s-why">

**Why**? <br />
Upper camel case is conventional for identifying objects that can be instantiated using a constructor.

</div>

<div class="s-why-last">

**Why**? <br />
Easily identifies the module as the root of the same named feature.

</div>

<div class="s-rule do">

**Do** suffix a `RoutingModule` class name with `RoutingModule`.

</div>

<div class="s-rule do">

**Do** end the filename of a `RoutingModule` with `-routing.module.ts`.

</div>

<div class="s-why-last">

**Why**? <br />
A `RoutingModule` is a module dedicated exclusively to configuring the Angular router.
A consistent class and file name convention make these modules easy to spot and verify.

</div>

| Symbol name                                                                                                                                                    | File name |
|:---                                                                                                                                                            |:---       |
| <code-example format="typescript" hideCopy language="typescript"> &commat;NgModule({ &hellip; }) &NewLine;export class AppModule { } </code-example>           | app.module.ts            |
| <code-example format="typescript" hideCopy language="typescript"> &commat;NgModule({ &hellip; }) &NewLine;export class HeroesModule { } </code-example>        | heroes.module.ts         |
| <code-example format="typescript" hideCopy language="typescript"> &commat;NgModule({ &hellip; }) &NewLine;export class VillainsModule { } </code-example>      | villains.module.ts       |
| <code-example format="typescript" hideCopy language="typescript"> &commat;NgModule({ &hellip; }) &NewLine;export class AppRoutingModule { } </code-example>    | app-routing.module.ts    |
| <code-example format="typescript" hideCopy language="typescript"> &commat;NgModule({ &hellip; }) &NewLine;export class HeroesRoutingModule { } </code-example> | heroes-routing.module.ts |

[Back to top](#toc)

## Application structure and NgModules

Have a near-term view of implementation and a long-term vision.
Start small but keep in mind where the application is heading.

All of the application's code goes in a folder named `src`.
All feature areas are in their own folder, with their own NgModule.

All content is one asset per file.
Each component, service, and pipe is in its own file.
All third party vendor scripts are stored in another folder and not in the `src` folder.
You didn't write them and you don't want them cluttering `src`.
Use the naming conventions for files in this guide.

[Back to top](#toc)

<a id="04-01"></a>

### `LIFT`

#### Style 04-01

<div class="s-rule do">

**Do** structure the application such that you can **L**ocate code quickly, **I**dentify the code at a glance, keep the **F**lattest structure you can, and **T**ry to be DRY.

</div>

<div class="s-rule do">

**Do** define the structure to follow these four basic guidelines, listed in order of importance.

</div>

<div class="s-why-last">

**Why**? <br />
LIFT provides a consistent structure that scales well, is modular, and makes it easier to increase developer efficiency by finding code quickly.
To confirm your intuition about a particular structure, ask:
*Can I quickly open and start work in all of the related files for this feature*?

</div>

[Back to top](#toc)

<a id="04-02"></a>

### Locate

#### Style 04-02

<div class="s-rule do">

**Do** make locating code intuitive and fast.

</div>

<div class="s-why-last">

**Why**? <br />
To work efficiently you must be able to find files quickly, especially when you do not know \(or do not remember\) the file *names*.
Keeping related files near each other in an intuitive location saves time.
A descriptive folder structure makes a world of difference to you and the people who come after you.

</div>

[Back to top](#toc)

<a id="04-03"></a>

### Identify

#### Style 04-03

<div class="s-rule do">

**Do** name the file such that you instantly know what it contains and represents.

</div>

<div class="s-rule do">

**Do** be descriptive with file names and keep the contents of the file to exactly one component.

</div>

<div class="s-rule avoid">

**Avoid** files with multiple components, multiple services, or a mixture.

</div>

<div class="s-why-last">

**Why**? <br />
Spend less time hunting and pecking for code, and become more efficient.
Longer file names are far better than *short-but-obscure* abbreviated names.

</div>

<div class="alert is-helpful">

It may be advantageous to deviate from the *one-thing-per-file* rule when you have a set of small, closely-related features that are better discovered and understood in a single file than as multiple files.
Be wary of this loophole.

</div>

[Back to top](#toc)

<a id="04-04"></a>

### Flat

#### Style 04-04

<div class="s-rule do">

**Do** keep a flat folder structure as long as possible.

</div>

<div class="s-rule consider">

**Consider** creating sub-folders when a folder reaches seven or more files.

</div>

<div class="s-rule consider">

**Consider** configuring the IDE to hide distracting, irrelevant files such as generated `.js` and `.js.map` files.

</div>

<div class="s-why-last">

**Why**? <br />
No one wants to search for a file through seven levels of folders.
A flat structure is easy to scan.

On the other hand, [psychologists believe](https://en.wikipedia.org/wiki/The_Magical_Number_Seven,_Plus_or_Minus_Two) that humans start to struggle when the number of adjacent interesting things exceeds nine.
So when a folder has ten or more files, it may be time to create subfolders.

Base your decision on your comfort level.
Use a flatter structure until there is an obvious value to creating a new folder.

</div>

[Back to top](#toc)

<a id="04-05"></a>

### *T-DRY* \(Try to be *DRY*\)

#### Style 04-05

<div class="s-rule do">

**Do** be DRY \(Don't Repeat Yourself\).

</div>

<div class="s-rule avoid">

**Avoid** being so DRY that you sacrifice readability.

</div>

<div class="s-why-last">

**Why**? <br />
Being DRY is important, but not crucial if it sacrifices the other elements of LIFT.
That's why it's called *T-DRY*.
For example, it's redundant to name a template `hero-view.component.html` because with the `.html` extension, it is obviously a view.
But if something is not obvious or departs from a convention, then spell it out.

</div>

[Back to top](#toc)

<a id="04-06"></a>

### Overall structural guidelines

#### Style 04-06

<div class="s-rule do">

**Do** start small but keep in mind where the application is heading down the road.

</div>

<div class="s-rule do">

**Do** have a near term view of implementation and a long term vision.

</div>

<div class="s-rule do">

**Do** put all of the application's code in a folder named `src`.

</div>

<div class="s-rule consider">

**Consider** creating a folder for a component when it has multiple accompanying files \(`.ts`, `.html`, `.css`, and `.spec`\).

</div>

<div class="s-why">

**Why**? <br />
Helps keep the application structure small and easy to maintain in the early stages, while being easy to evolve as the application grows.

</div>

<div class="s-why-last">

**Why**? <br />
Components often have four files \(for example, `*.html`, `*.css`, `*.ts`, and `*.spec.ts`\) and can clutter a folder quickly.

</div>

<a id="file-tree"></a>

Here is a compliant folder and file structure:

<div class="filetree">
  <div class="file">
    &lt;project root&gt;
  </div>
  <div class="children">
    <div class="file">
      src
    </div>
    <div class="children">
      <div class="file">
        app
      </div>
      <div class="children">
        <div class="file">
          core
        </div>
        <div class="children">
          <div class="file">
            exception.service.ts&verbar;spec.ts
          </div>
          <div class="file">
            user-profile.service.ts&verbar;spec.ts
          </div>
        </div>
        <div class="file">
          heroes
        </div>
        <div class="children">
          <div class="file">
            hero
          </div>
          <div class="children">
            <div class="file">
              hero.component.ts&verbar;html&verbar;css&verbar;spec.ts
            </div>
          </div>
          <div class="file">
            hero-list
          </div>
          <div class="children">
            <div class="file">
              hero-list.component.ts&verbar;html&verbar;css&verbar;spec.ts
            </div>
          </div>
          <div class="file">
            shared
          </div>
          <div class="children">
            <div class="file">
              hero-button.component.ts&verbar;html&verbar;css&verbar;spec.ts
            </div>
            <div class="file">
              hero.model.ts
            </div>
            <div class="file">
              hero.service.ts&verbar;spec.ts
            </div>
          </div>
          <div class="file">
            heroes.component.ts&verbar;html&verbar;css&verbar;spec.ts
          </div>
          <div class="file">
            heroes.module.ts
          </div>
          <div class="file">
            heroes-routing.module.ts
          </div>
        </div>
        <div class="file">
          shared
        </div>
        <div class="children">
          <div class="file">
            shared.module.ts
          </div>
          <div class="file">
            init-caps.pipe.ts&verbar;spec.ts
          </div>
          <div class="file">
            filter-text.component.ts&verbar;spec.ts
          </div>
          <div class="file">
            filter-text.service.ts&verbar;spec.ts
          </div>
        </div>
        <div class="file">
          villains
        </div>
        <div class="children">
          <div class="file">
            villain
          </div>
          <div class="children">
            <div class="file">
              &hellip;
            </div>
          </div>
          <div class="file">
            villain-list
          </div>
          <div class="children">
            <div class="file">
              &hellip;
            </div>
          </div>
          <div class="file">
            shared
          </div>
          <div class="children">
            <div class="file">
              &hellip;
            </div>
          </div>
          <div class="file">
            villains.component.ts&verbar;html&verbar;css&verbar;spec.ts
          </div>
          <div class="file">
            villains.module.ts
          </div>
          <div class="file">
            villains-routing.module.ts
          </div>
        </div>
        <div class="file">
          app.component.ts&verbar;html&verbar;css&verbar;spec.ts
        </div>
        <div class="file">
          app.module.ts
        </div>
        <div class="file">
          app-routing.module.ts
        </div>
      </div>
      <div class="file">
        main.ts
      </div>
      <div class="file">
        index.html
      </div>
      <div class="file">
        &hellip;
      </div>
    </div>
    <div class="file">
      node_modules/&hellip;
    </div>
    <div class="file">
      &hellip;
    </div>
  </div>
</div>

<div class="alert is-helpful">

While components in dedicated folders are widely preferred, another option for small applications is to keep components flat \(not in a dedicated folder\).
This adds up to four files to the existing folder, but also reduces the folder nesting.
Whatever you choose, be consistent.

</div>

[Back to top](#toc)

<a id="04-07"></a>

### *Folders-by-feature* structure

#### Style 04-07

<div class="s-rule do">

**Do** create folders named for the feature area they represent.

</div>

<div class="s-why">

**Why**? <br />
A developer can locate the code and identify what each file represents at a glance.
The structure is as flat as it can be and there are no repetitive or redundant names.

</div>

<div class="s-why">

**Why**? <br />
The LIFT guidelines are all covered.

</div>

<div class="s-why">

**Why**? <br />
Helps reduce the application from becoming cluttered through organizing the content and keeping them aligned with the LIFT guidelines.

</div>

<div class="s-why">

**Why**? <br />
When there are a lot of files, for example 10+, locating them is easier with a consistent folder structure and more difficult in a flat structure.

</div>

<div class="s-rule do">

**Do** create an NgModule for each feature area.

</div>

<div class="s-why">

**Why**? <br />
NgModules make it easy to lazy load routable features.

</div>

<div class="s-why-last">

**Why**? <br />
NgModules make it easier to isolate, test, and reuse features.

</div>

<div>

For more information, refer to [this folder and file structure example](#file-tree).

</div>

[Back to top](#toc)

<a id="04-08"></a>

### App *root module*

#### Style 04-08

<div class="s-rule do">

**Do** create an NgModule in the application's root folder, for example, in `/src/app`.

</div>

<div class="s-why">

**Why**? <br />
Every application requires at least one root NgModule.

</div>

<div class="s-rule consider">

**Consider** naming the root module `app.module.ts`.

</div>

<div class="s-why-last">

**Why**? <br />
Makes it easier to locate and identify the root module.

</div>

<code-example format="typescript" path="styleguide/src/04-08/app/app.module.ts" language="typescript" region="example" header="app/app.module.ts"></code-example>

[Back to top](#toc)

<a id="04-09"></a>

### Feature modules

#### Style 04-09

<div class="s-rule do">

**Do** create an NgModule for all distinct features in an application; for example, a `Heroes` feature.

</div>

<div class="s-rule do">

**Do** place the feature module in the same named folder as the feature area; for example, in `app/heroes`.

</div>

<div class="s-rule do">

**Do** name the feature module file reflecting the name of the feature area and folder; for example, `app/heroes/heroes.module.ts`.

</div>

<div class="s-rule do">

**Do** name the feature module symbol reflecting the name of the feature area, folder, and file; for example, `app/heroes/heroes.module.ts` defines `HeroesModule`.

</div>

<div class="s-why">

**Why**? <br />
A feature module can expose or hide its implementation from other modules.

</div>

<div class="s-why">

**Why**? <br />
A feature module identifies distinct sets of related components that comprise the feature area.

</div>

<div class="s-why">

**Why**? <br />
A feature module can easily be routed to both eagerly and lazily.

</div>

<div class="s-why">

**Why**? <br />
A feature module defines clear boundaries between specific functionality and other application features.

</div>

<div class="s-why">

**Why**? <br />
A feature module helps clarify and make it easier to assign development responsibilities to different teams.

</div>

<div class="s-why-last">

**Why**? <br />
A feature module can easily be isolated for testing.

</div>

[Back to top](#toc)

<a id="04-10"></a>

### Shared feature module

#### Style 04-10

<div class="s-rule do">

**Do** create a feature module named `SharedModule` in a `shared` folder; for example, `app/shared/shared.module.ts` defines `SharedModule`.

</div>

<div class="s-rule do">

**Do** declare components, directives, and pipes in a shared module when those items will be re-used and referenced by the components declared in other feature modules.

</div>

<div class="s-rule consider">

**Consider** using the name SharedModule when the contents of a shared
module are referenced across the entire application.

</div>

<div class="s-rule avoid">

**Consider** *not* providing services in shared modules.
Services are usually singletons that are provided once for the entire application or in a particular feature module.
There are exceptions, however.
For example, in the sample code that follows, notice that the `SharedModule` provides `FilterTextService`.
This is acceptable here because the service is stateless;that is, the consumers of the service aren't impacted by new instances.

</div>

<div class="s-rule do">

**Do** import all modules required by the assets in the `SharedModule`; for example, `CommonModule` and `FormsModule`.

</div>

<div class="s-why">

**Why**? <br />
`SharedModule` will contain components, directives, and pipes that may need features from another common module; for example, `ngFor` in `CommonModule`.

</div>

<div class="s-rule do">

**Do** declare all components, directives, and pipes in the `SharedModule`.

</div>

<div class="s-rule do">

**Do** export all symbols from the `SharedModule` that other feature modules need to use.

</div>

<div class="s-why">

**Why**? <br />
`SharedModule` exists to make commonly used components, directives, and pipes available for use in the templates of components in many other modules.

</div>

<div class="s-rule avoid">

**Avoid** specifying app-wide singleton providers in a `SharedModule`.
Intentional singletons are OK.
Take care.

</div>

<div class="s-why">

**Why**? <br />
A lazy loaded feature module that imports that shared module will make its own copy of the service and likely have undesirable results.

</div>

<div class="s-why-last">

**Why**? <br />
You don't want each module to have its own separate instance of singleton services.
Yet there is a real danger of that happening if the `SharedModule` provides a service.

</div>

<div class="filetree">
  <div class="file">
    src
  </div>
  <div class="children">
    <div class="file">
      app
    </div>
    <div class="children">
      <div class="file">
        shared
      </div>
      <div class="children">
        <div class="file">
          shared.module.ts
        </div>
        <div class="file">
          init-caps.pipe.ts&verbar;spec.ts
        </div>
        <div class="file">
          filter-text.component.ts&verbar;spec.ts
        </div>
        <div class="file">
          filter-text.service.ts&verbar;spec.ts
        </div>
      </div>
      <div class="file">
        app.component.ts&verbar;html&verbar;css&verbar;spec.ts
      </div>
      <div class="file">
        app.module.ts
      </div>
      <div class="file">
        app-routing.module.ts
      </div>
    </div>
    <div class="file">
      main.ts
    </div>
    <div class="file">
      index.html
    </div>
  </div>
  <div class="file">
    &hellip;
  </div>
</div>

<code-tabs>
    <code-pane header="app/shared/shared.module.ts" path="styleguide/src/04-10/app/shared/shared.module.ts"></code-pane>
    <code-pane header="app/shared/init-caps.pipe.ts" path="styleguide/src/04-10/app/shared/init-caps.pipe.ts"></code-pane>
    <code-pane header="app/shared/filter-text/filter-text.component.ts" path="styleguide/src/04-10/app/shared/filter-text/filter-text.component.ts"></code-pane>
    <code-pane header="app/shared/filter-text/filter-text.service.ts" path="styleguide/src/04-10/app/shared/filter-text/filter-text.service.ts"></code-pane>
    <code-pane header="app/heroes/heroes.component.ts" path="styleguide/src/04-10/app/heroes/heroes.component.ts"></code-pane>
    <code-pane header="app/heroes/heroes.component.html" path="styleguide/src/04-10/app/heroes/heroes.component.html"></code-pane>
</code-tabs>

[Back to top](#toc)

<a id="04-11"></a>

### Lazy Loaded folders

#### Style 04-11

A distinct application feature or workflow may be *lazy loaded* or *loaded on demand* rather than when the application starts.

<div class="s-rule do">

**Do** put the contents of lazy loaded features in a *lazy loaded folder*.
A typical *lazy loaded folder* contains a *routing component*, its child components, and their related assets and modules.

</div>

<div class="s-why-last">

**Why**? <br />
The folder makes it easy to identify and isolate the feature content.

</div>

[Back to top](#toc)

<a id="04-12"></a>

### Never directly import lazy loaded folders

#### Style 04-12

<div class="s-rule avoid">

**Avoid** allowing modules in sibling and parent folders to directly import a module in a *lazy loaded feature*.

</div>

<div class="s-why-last">

**Why**? <br />
Directly importing and using a module will load it immediately when the intention is to load it on demand.

</div>

[Back to top](#toc)

### Do not add filtering and sorting logic to pipes

#### Style 04-13

<div class="s-rule avoid">

**Avoid** adding filtering or sorting logic into custom pipes.

</div>

<div class="s-rule do">

**Do** pre-compute the filtering and sorting logic in components or services before binding the model in templates.

</div>

<div class="s-why-last">

**Why**? <br />
Filtering and especially sorting are expensive operations.
As Angular can call pipe methods many times per second, sorting and filtering operations can degrade the user experience severely for even moderately-sized lists.

</div>

[Back to top](#toc)

## Components

<a id="05-03"></a>

### Components as elements

#### Style 05-03

<div class="s-rule do">

**Consider** giving components an *element* selector, as opposed to *attribute* or *class* selectors.

</div>

<div class="s-why">

**Why**? <br />
Components have templates containing HTML and optional Angular template syntax.
They display content.
Developers place components on the page as they would native HTML elements and web components.

</div>

<div class="s-why-last">

**Why**? <br />
It is easier to recognize that a symbol is a component by looking at the template's html.

</div>

<div class="alert is-helpful">

There are a few cases where you give a component an attribute, such as when you want to augment a built-in element.
For example, [Material Design](https://material.angular.io/components/button/overview) uses this technique with `<button mat-button>`.
However, you wouldn't use this technique on a custom element.

</div>

<code-example header="app/heroes/hero-button/hero-button.component.ts" path="styleguide/src/05-03/app/heroes/shared/hero-button/hero-button.component.avoid.ts" region="example"></code-example>

<code-example header="app/app.component.html" path="styleguide/src/05-03/app/app.component.avoid.html"></code-example>

<code-tabs>
    <code-pane header="app/heroes/shared/hero-button/hero-button.component.ts" path="styleguide/src/05-03/app/heroes/shared/hero-button/hero-button.component.ts" region="example"></code-pane>
    <code-pane header="app/app.component.html" path="styleguide/src/05-03/app/app.component.html"></code-pane>
</code-tabs>

[Back to top](#toc)

<a id="05-04"></a>

### Extract templates and styles to their own files

#### Style 05-04

<div class="s-rule do">

**Do** extract templates and styles into a separate file, when more than 3 lines.

</div>

<div class="s-rule do">

**Do** name the template file `[component-name].component.html`, where [component-name] is the component name.

</div>

<div class="s-rule do">

**Do** name the style file `[component-name].component.css`, where [component-name] is the component name.

</div>

<div class="s-rule do">

**Do** specify *component-relative* URLs, prefixed with `./`.

</div>

<div class="s-why">

**Why**? <br />
Large, inline templates and styles obscure the component's purpose and implementation, reducing readability and maintainability.

</div>

<div class="s-why">

**Why**? <br />
In most editors, syntax hints and code snippets aren't available when developing inline templates and styles.
The Angular TypeScript Language Service \(forthcoming\) promises to overcome this deficiency for HTML templates in those editors that support it; it won't help with CSS styles.

</div>

<div class="s-why">

**Why**? <br />
A *component relative* URL requires no change when you move the component files, as long as the files stay together.

</div>

<div class="s-why-last">

**Why**? <br />
The `./` prefix is standard syntax for relative URLs; don't depend on Angular's current ability to do without that prefix.

</div>

<code-example header="app/heroes/heroes.component.ts" path="styleguide/src/05-04/app/heroes/heroes.component.avoid.ts" region="example"></code-example>

<code-tabs>
    <code-pane header="app/heroes/heroes.component.ts" path="styleguide/src/05-04/app/heroes/heroes.component.ts" region="example"></code-pane>
    <code-pane header="app/heroes/heroes.component.html" path="styleguide/src/05-04/app/heroes/heroes.component.html"></code-pane>
    <code-pane header="app/heroes/heroes.component.css" path="styleguide/src/05-04/app/heroes/heroes.component.css"></code-pane>
</code-tabs>

[Back to top](#toc)

<a id="05-12"></a>

### Decorate `input` and `output` properties

#### Style 05-12

<div class="s-rule do">

**Do** use the `@Input()` and `@Output()` class decorators instead of the `inputs` and `outputs` properties of the `@Directive` and `@Component` metadata:

</div>

<div class="s-rule consider">

**Consider** placing `@Input()` or `@Output()` on the same line as the property it decorates.

</div>

<div class="s-why">

**Why**? <br />
It is easier and more readable to identify which properties in a class are inputs or outputs.

</div>

<div class="s-why">

**Why**? <br />
If you ever need to rename the property or event name associated with `@Input()` or `@Output()`, you can modify it in a single place.

</div>

<div class="s-why">

**Why**? <br />
The metadata declaration attached to the directive is shorter and thus more readable.

</div>

<div class="s-why-last">

**Why**? <br />
Placing the decorator on the same line *usually* makes for shorter code and still easily identifies the property as an input or output.
Put it on the line above when doing so is clearly more readable.

</div>

<code-example header="app/heroes/shared/hero-button/hero-button.component.ts" path="styleguide/src/05-12/app/heroes/shared/hero-button/hero-button.component.avoid.ts" region="example"></code-example>

<code-example header="app/heroes/shared/hero-button/hero-button.component.ts" path="styleguide/src/05-12/app/heroes/shared/hero-button/hero-button.component.ts" region="example"></code-example>

[Back to top](#toc)

<a id="05-13"></a>

### Avoid aliasing `inputs` and `outputs`

#### Style 05-13

<div class="s-rule avoid">

**Avoid** `input` and `output` aliases except when it serves an important purpose.

</div>

<div class="s-why">

**Why**? <br />
Two names for the same property \(one private, one public\) is inherently confusing.

</div>

<div class="s-why-last">

**Why**? <br />
You should use an alias when the directive name is also an `input` property,
and the directive name doesn't describe the property.

</div>

<code-example header="app/heroes/shared/hero-button/hero-button.component.ts" path="styleguide/src/05-13/app/heroes/shared/hero-button/hero-button.component.avoid.ts" region="example"></code-example>

<code-example header="app/app.component.html" path="styleguide/src/05-13/app/app.component.avoid.html"></code-example>

<code-tabs>
    <code-pane header="app/heroes/shared/hero-button/hero-button.component.ts" path="styleguide/src/05-13/app/heroes/shared/hero-button/hero-button.component.ts" region="example"></code-pane>
    <code-pane header="app/heroes/shared/hero-button/hero-highlight.directive.ts" path="styleguide/src/05-13/app/heroes/shared/hero-highlight.directive.ts"></code-pane>
    <code-pane header="app/app.component.html" path="styleguide/src/05-13/app/app.component.html"></code-pane>
</code-tabs>

[Back to top](#toc)

<a id="05-14"></a>

### Member sequence

#### Style 05-14

<div class="s-rule do">

**Do** place properties up top followed by methods.

</div>

<div class="s-rule do">

**Do** place private members after public members, alphabetized.

</div>

<div class="s-why-last">

**Why**? <br />
Placing members in a consistent sequence makes it easy to read and
helps instantly identify which members of the component serve which purpose.

</div>

<code-example header="app/shared/toast/toast.component.ts" path="styleguide/src/05-14/app/shared/toast/toast.component.avoid.ts" region="example"></code-example>

<code-example header="app/shared/toast/toast.component.ts" path="styleguide/src/05-14/app/shared/toast/toast.component.ts" region="example"></code-example>

[Back to top](#toc)

<a id="05-15"></a>

### Delegate complex component logic to services

#### Style 05-15

<div class="s-rule do">

**Do** limit logic in a component to only that required for the view.
All other logic should be delegated to services.

</div>

<div class="s-rule do">

**Do** move reusable logic to services and keep components simple and focused on their intended purpose.

</div>

<div class="s-why">

**Why**? <br />
Logic may be reused by multiple components when placed within a service and exposed as a function.

</div>

<div class="s-why">

**Why**? <br />
Logic in a service can more easily be isolated in a unit test, while the calling logic in the component can be easily mocked.

</div>

<div class="s-why">

**Why**? <br />
Removes dependencies and hides implementation details from the component.

</div>

<div class="s-why-last">

**Why**? <br />
Keeps the component slim, trim, and focused.

</div>

<code-example header="app/heroes/hero-list/hero-list.component.ts" path="styleguide/src/05-15/app/heroes/hero-list/hero-list.component.avoid.ts"></code-example>

<code-example header="app/heroes/hero-list/hero-list.component.ts" path="styleguide/src/05-15/app/heroes/hero-list/hero-list.component.ts" region="example"></code-example>

[Back to top](#toc)

<a id="05-16"></a>

### Don't prefix `output` properties

#### Style 05-16

<div class="s-rule do">

**Do** name events without the prefix `on`.

</div>

<div class="s-rule do">

**Do** name event handler methods with the prefix `on` followed by the event name.

</div>

<div class="s-why">

**Why**? <br />
This is consistent with built-in events such as button clicks.

</div>

<div class="s-why-last">

**Why**? <br />
Angular allows for an [alternative syntax](guide/binding-syntax) `on-*`.
If the event itself was prefixed with `on` this would result in an `on-onEvent` binding expression.

</div>

<code-example header="app/heroes/hero.component.ts" path="styleguide/src/05-16/app/heroes/hero.component.avoid.ts" region="example"></code-example>

<code-example header="app/app.component.html" path="styleguide/src/05-16/app/app.component.avoid.html"></code-example>

<code-tabs>
    <code-pane header="app/heroes/hero.component.ts" path="styleguide/src/05-16/app/heroes/hero.component.ts" region="example"></code-pane>
    <code-pane header="app/app.component.html" path="styleguide/src/05-16/app/app.component.html"></code-pane>
</code-tabs>

[Back to top](#toc)

<a id="05-17"></a>

### Put presentation logic in the component class

#### Style 05-17

<div class="s-rule do">

**Do** put presentation logic in the component class, and not in the template.

</div>

<div class="s-why">

**Why**? <br />
Logic will be contained in one place \(the component class\) instead of being spread in two places.

</div>

<div class="s-why-last">

**Why**? <br />
Keeping the component's presentation logic in the class instead of the template improves testability, maintainability, and reusability.

</div>

<code-example header="app/heroes/hero-list/hero-list.component.ts" path="styleguide/src/05-17/app/heroes/hero-list/hero-list.component.avoid.ts" region="example"></code-example>

<code-example header="app/heroes/hero-list/hero-list.component.ts" path="styleguide/src/05-17/app/heroes/hero-list/hero-list.component.ts" region="example"></code-example>

[Back to top](#toc)

### Initialize inputs

#### Style 05-18

TypeScript's `--strictPropertyInitialization` compiler option ensures that a class initializes its properties during construction.
When enabled, this option causes the TypeScript compiler to report an error if the class does not set a value to any property that is not explicitly marked as optional.

By design, Angular treats all `@Input` properties as optional.
When possible, you should satisfy `--strictPropertyInitialization` by providing a default value.

<code-example header="app/heroes/hero/hero.component.ts" path="styleguide/src/05-18/app/heroes/hero/hero.component.ts" region="example"></code-example>

If the property is hard to construct a default value for, use `?` to explicitly mark the property as optional.

<code-example header="app/heroes/hero/hero.component.ts" path="styleguide/src/05-18/app/heroes/hero/hero.component.optional.ts" region="example"></code-example>

You may want to have a required `@Input` field, meaning all your component users are required to pass that attribute.
In such cases, use a default value.
Just suppressing the TypeScript error with `!` is insufficient and should be avoided because it will prevent the type checker ensure the input value is provided.

<code-example header="app/heroes/hero/hero.component.ts" path="styleguide/src/05-18/app/heroes/hero/hero.component.avoid.ts" region="example"></code-example>

## Directives

<a id="06-01"></a>

### Use directives to enhance an element

#### Style 06-01

<div class="s-rule do">

**Do** use attribute directives when you have presentation logic without a template.

</div>

<div class="s-why">

**Why**? <br />
Attribute directives don't have an associated template.

</div>

<div class="s-why-last">

**Why**? <br />
An element may have more than one attribute directive applied.

</div>

<code-example header="app/shared/highlight.directive.ts" path="styleguide/src/06-01/app/shared/highlight.directive.ts" region="example"></code-example>

<code-example header="app/app.component.html" path="styleguide/src/06-01/app/app.component.html"></code-example>

[Back to top](#toc)

<a id="06-03"></a>

### `HostListener`/`HostBinding` decorators versus `host` metadata

#### Style 06-03

<div class="s-rule consider">

**Consider** preferring the `@HostListener` and `@HostBinding` to the `host` property of the `@Directive` and `@Component` decorators.

</div>

<div class="s-rule do">

**Do** be consistent in your choice.

</div>

<div class="s-why-last">

**Why**? <br />
The property associated with `@HostBinding` or the method associated with `@HostListener` can be modified only in a single place &mdash;in the directive's class.
If you use the `host` metadata property, you must modify both the property/method declaration in the directive's class and the metadata in the decorator associated with the directive.

</div>

<code-example header="app/shared/validator.directive.ts" path="styleguide/src/06-03/app/shared/validator.directive.ts"></code-example>

Compare with the less preferred `host` metadata alternative.

<div class="s-why-last">

**Why**? <br />
The `host` metadata is only one term to remember and doesn't require extra ES imports.

</div>

<code-example header="app/shared/validator2.directive.ts" path="styleguide/src/06-03/app/shared/validator2.directive.ts"></code-example>

[Back to top](#toc)

## Services

<a id="07-01"></a>

### Services are singletons

#### Style 07-01

<div class="s-rule do">

**Do** use services as singletons within the same injector.
Use them for sharing data and functionality.

</div>

<div class="s-why">

**Why**? <br />
Services are ideal for sharing methods across a feature area or an app.

</div>

<div class="s-why-last">

**Why**? <br />
Services are ideal for sharing stateful in-memory data.

</div>

<code-example header="app/heroes/shared/hero.service.ts" path="styleguide/src/07-01/app/heroes/shared/hero.service.ts" region="example"></code-example>

[Back to top](#toc)

<a id="07-02"></a>

### Single responsibility

#### Style 07-02

<div class="s-rule do">

**Do** create services with a single responsibility that is encapsulated by its context.

</div>

<div class="s-rule do">

**Do** create a new service once the service begins to exceed that singular purpose.

</div>

<div class="s-why">

**Why**? <br />
When a service has multiple responsibilities, it becomes difficult to test.

</div>

<div class="s-why-last">

**Why**? <br />
When a service has multiple responsibilities, every component or service that injects it now carries the weight of them all.

</div>

[Back to top](#toc)

<a id="07-03"></a>

### Providing a service

#### Style 07-03

<div class="s-rule do">

**Do** provide a service with the application root injector in the `@Injectable` decorator of the service.

</div>

<div class="s-why">

**Why**? <br />
The Angular injector is hierarchical.

</div>

<div class="s-why">

**Why**? <br />
When you provide the service to a root injector, that instance of the service is shared and available in every class that needs the service.
This is ideal when a service is sharing methods or state.

</div>

<div class="s-why">

**Why**? <br />
When you register a service in the `@Injectable` decorator of the service, optimization tools such as those used by the [Angular CLI's](cli) production builds can perform tree shaking and remove services that aren't used by your app.

</div>

<div class="s-why-last">

**Why**? <br />
This is not ideal when two different components need different instances of a service.
In this scenario it would be better to provide the service at the component level that needs the new and separate instance.

</div>

<code-example header="src/app/treeshaking/service.ts" path="dependency-injection/src/app/tree-shaking/service.ts"></code-example>

[Back to top](#toc)

<a id="07-04"></a>

### Use the &commat;Injectable() class decorator

#### Style 07-04

<div class="s-rule do">

**Do** use the `@Injectable()` class decorator instead of the `@Inject` parameter decorator when using types as tokens for the dependencies of a service.

</div>

<div class="s-why">

**Why**? <br />
The Angular Dependency Injection \(DI\) mechanism resolves a service's own
dependencies based on the declared types of that service's constructor parameters.

</div>

<div class="s-why-last">

**Why**? <br />
When a service accepts only dependencies associated with type tokens, the `@Injectable()` syntax is much less verbose compared to using `@Inject()` on each individual constructor parameter.

</div>

<code-example header="app/heroes/shared/hero-arena.service.ts" path="styleguide/src/07-04/app/heroes/shared/hero-arena.service.avoid.ts" region="example"></code-example>

<code-example header="app/heroes/shared/hero-arena.service.ts" path="styleguide/src/07-04/app/heroes/shared/hero-arena.service.ts" region="example"></code-example>

[Back to top](#toc)

## Data Services

<a id="08-01"></a>

### Talk to the server through a service

#### Style 08-01

<div class="s-rule do">

**Do** refactor logic for making data operations and interacting with data to a service.

</div>

<div class="s-rule do">

**Do** make data services responsible for XHR calls, local storage, stashing in memory, or any other data operations.

</div>

<div class="s-why">

**Why**? <br />
The component's responsibility is for the presentation and gathering of information for the view.
It should not care how it gets the data, just that it knows who to ask for it.
Separating the data services moves the logic on how to get it to the data service, and lets the component be simpler and more focused on the view.

</div>

<div class="s-why">

**Why**? <br />
This makes it easier to test \(mock or real\) the data calls when testing a component that uses a data service.

</div>

<div class="s-why-last">

**Why**? <br />
The details of data management, such as headers, HTTP methods, caching, error handling, and retry logic, are irrelevant to components and other data consumers.

A data service encapsulates these details.
It's easier to evolve these details inside the service without affecting its consumers.
And it's easier to test the consumers with mock service implementations.

</div>

[Back to top](#toc)

## Lifecycle hooks

Use Lifecycle hooks to tap into important events exposed by Angular.

[Back to top](#toc)

<a id="09-01"></a>

### Implement lifecycle hook interfaces

#### Style 09-01

<div class="s-rule do">

**Do** implement the lifecycle hook interfaces.

</div>

<div class="s-why-last">

**Why**? <br />
Lifecycle interfaces prescribe typed method signatures.
Use those signatures to flag spelling and syntax mistakes.

</div>

<code-example header="app/heroes/shared/hero-button/hero-button.component.ts" path="styleguide/src/09-01/app/heroes/shared/hero-button/hero-button.component.avoid.ts" region="example"></code-example>

<code-example header="app/heroes/shared/hero-button/hero-button.component.ts" path="styleguide/src/09-01/app/heroes/shared/hero-button/hero-button.component.ts" region="example"></code-example>

[Back to top](#toc)

## Appendix

Useful tools and tips for Angular.

[Back to top](#toc)

<a id="A-02"></a>

### File templates and snippets

#### Style A-02

<div class="s-rule do">

**Do** use file templates or snippets to help follow consistent styles and patterns.
Here are templates and/or snippets for some of the web development editors and IDEs.

</div>

<div class="s-rule consider">

**Consider** using [snippets](https://marketplace.visualstudio.com/items?itemName=johnpapa.Angular2) for [Visual Studio Code](https://code.visualstudio.com) that follow these styles and guidelines.

<a href="https://marketplace.visualstudio.com/items?itemName=johnpapa.Angular2">

<img alt="Use Extension" src="generated/images/guide/styleguide/use-extension.gif">

</a>

**Consider** using [snippets](https://atom.io/packages/angular-2-typescript-snippets) for [Atom](https://atom.io) that follow these styles and guidelines.

**Consider** using [snippets](https://github.com/orizens/sublime-angular2-snippets) for [Sublime Text](https://www.sublimetext.com) that follow these styles and guidelines.

**Consider** using [snippets](https://github.com/mhartington/vim-angular2-snippets) for [Vim](https://www.vim.org) that follow these styles and guidelines.

</div>

[Back to top](#toc)

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-02-28
