# Angular Language Service

The Angular Language Service is a way to get completions, errors, 
hints, and navigation inside your Angular templates whether they 
are external in an HTML file or embedded in annotations/decorators 
in a string. The Angular Language Service autodetects that you are 
opening an Angular file, reads your `ts.config` file, finds all the 
templates you have in your application, and then provides language 
services for any templates that you open.


## Autocompletion

Autocompletion can speed up your development time by providing you with 
contextual possiblities and hints as you type. This example shows 
autocomplete in an interpolations. As you type it out, 
you can hit tab to complete.

<figure>
  <img src="generated/images/guide/language-service/language-completion.gif" alt="autocompletion" width="100%">
</figure>

There are also completions within 
elements. Any elements you have as a component selector will 
show up in the completion list.

## Error checking

The Angular Language Service can also forewarn you of mistakes in your code. 
In this example, Angular doesn't know what `orders` is or where it comes from. 

<figure>
  <img src="generated/images/guide/language-service/language-error.gif" alt="error checking" width="100%">
</figure>

## Navigation

Navigation allows you to hover to 
see where a component, directive, module, etc. is from and then 
click and press F12 to go directly to its definition.

<figure>
  <img src="generated/images/guide/language-service/language-navigation.gif" alt="navigation"
  width="100%">
</figure>


## Angular Language Service in your editor

Angular Language Service is currently available for [Visual Studio Code](https://code.visualstudio.com/) and 
[WebStorm](https://www.jetbrains.com/webstorm). 
You can also use Angular Language Service in your code editor of choice by 
[configuring your language host manually](guide/language-service#integrate-with-your-editor).

### Visual Studio Code

In Visual Studio Code, install Angular Language Service from the store, 
which is accessible from the bottom icon on the left menu pane. 
You can also use the VS Quick Open (⌘+P) to search for the extension. When you've opened it, 
enter the following command: 

```sh
ext install ng-template
```

Then click the install button to install the Angular Language Service. 


### WebStorm

In webstorm, you have to install the language service as a dev dependency. 
When Angular sees this dev dependency, it provides the 
language service inside of WebStorm. Webstorm then gives you 
colorization inside the template and autocomplete in addition to the Angular Language Service.

Here's the dev dependency 
you need to have in `package.json`:

```json

devDependencies {
	"@angular/language-service": "^4.0.0"
}
```

Then in the terminal window at the root of your project, 
install the `devDependencies` with `npm` or `yarn`: 

```sh
npm install 
```
*OR* 

```sh
yarn
```

*OR* 

```sh
yarn install
```


### Sublime Text

In [Sublime Text](https://www.sublimetext.com/), you first need an extension to allow Typescript. Install the `@next` version of typescript in a local `node_modules` directory:

```sh
npm install --save-dev typescript@next
```

This installs the nightly TypeScript build. Starting with TypeScript 2.3, TypeScript has a language service plugin model that the language service can use. 

Next, in your user preferences (`Cmd+,` or `Ctrl+,`), add:

```json
"typescript-tsdk": "<path to your folder>/node_modules/typescript/lib"
```


## Installing in your project

You can also install Angular Language Service in your project with the 
following `npm` command:

```sh
npm install --save-dev @angular/language-service
```

## How the Language Service works

When you use an editor with a language service, there's an 
editor process which starts a separate language process/service 
to which it speaks through an [RPC](https://en.wikipedia.org/wiki/Remote_procedure_call). 
Any time you type inside of the editor, it sends information to the other process to 
track the state of your project. When you trigger a completion list within a template, the editor process first parses the template into an HTML AST, or [abstract syntax table](https://en.wikipedia.org/wiki/Abstract_syntax_tree). Then the Angular compiler interprets 
what module the template is part of, the scope you're in, and the component selector. Then it figures out where in the template AST your cursor is. When it determines the 
context, it can then determine what the children can be.

It's a little more involved if you are in an interpolation. If you have an interpolation of `{{data.---}}` inside a `div` and need the completion list after `data.---`, the compiler can't use the HTML AST to find the answer. The HTML AST can only tell the compiler that there is some text with the characters "`{{data.---}}`". That's when the template parser produces an expression AST, which resides within the template AST. The Angular Language Service, which is within 
the TypeScript Language Service, then looks at `data.---` within its context and determines 
what the members of `data` are. TypeScript then returns the list of possibilities.

### Integrate with your editor

You can still use the language service if you prefer an editor not listed on this page.

You'll need to implement the following `LanguageServiceHost` interface. 

```typescript
export interface LanguageServiceHost {
  readonly resolver: CompileMetadataResolver;
  getTemplateAt(filename: string, position: number): TemplateSource;
  getTemplates(filename: string): TemplateSources;
  getDeclarations(filename: string): Declarations;
  getAnalyzedModules(): NgAnalyzedModules;
  getTemplateReferences(): string[];
}
```

The language service is divided into two parts&mdash;the actual language 
service itself and its host. The host uses TypeScript to determine things 
like what should go into a completion list. 
If you create your own `TypeScriptServiceHost`, you also need to 
create your Angular Language Service. Pass in the host that you're 
using for the TypeScript service and the service 
itself so you get back a language service host. 

```typescript

export class TypeScriptServiceHost implements LanguageServiceHost {
...
}
const ngHost = new TypeScriptServiceHost(host, service);
const ngService = createLanguageService(ngHost);
...
const diagnostics = ngService.getDiagnostics(...);

```


If you do create an editor integration, the one thing that the Angular 
Language Service does that Typscript doesn't is provide diagnostics 
and completions inside of an HTML file. Once you have a `LanguageServiceHost`, 
you can tell the host to return all of the HTML files that 
are part of the project that are templates.

<hr>

For more information, see [Chuck Jazdzewski's presentation](https://www.youtube.com/watch?v=ez3R0Gi4z5A&t=368s) on the Angular Language 
Service from [ng-conf](https://www.ng-conf.org/) 2017.


