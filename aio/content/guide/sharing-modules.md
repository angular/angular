# Sharing Modules

## Prerequisites
A basic understanding of the following:
* [Feature Modules](guide/feature-modules).
* [JavaScript Modules vs. NgModules](guide/ngmodule-vs-jsmodule).
* [Frequently Used Modules](guide/frequent-ngmodules).
* [Routing and Navigation](guide/router).
* [Lazy loading modules](guide/lazy-loading-ngmodules).


<!--* [Components](#TBD)-->

<hr>

Creating shared modules allows you to organize and streamline your code. You can put commonly 
used directives, pipes, and components into one module and then import just that module wherever 
you need it in other parts of your app.

Consider the following module from an imaginary app:


```typescript
import { NgModule }            from '@angular/core';
import { CommonModule }        from '@angular/common';
import { FormsModule }         from '@angular/forms';
 
import { OrdersPipe }         from './orders.pipe';
import { NewItemDirective }  from './newitem.directive';
 
@NgModule({
  imports:      [ CommonModule ],
  declarations: [ OrdersPipe, NewItemDirective ],
  exports:      [ OrdersPipe, NewItemDirective,
                  CommonModule, FormsModule ]
})
export class SharedModule { }
```

Note the following:

* It imports the `CommonModule` because its component needs common directives.
* It declares and exports the utility pipe, directive, and component classes.
* It re-exports the `CommonModule` and `FormsModule`.

By re-exporting `CommonModule` and `FormsModule`, any other module that imports this 
`SharedModule`, gets access to directives like `NgIf` and `NgFor` from `CommonModule` 
and can bind to component properties with `[(ngModel)]`, a directive in the `FormsModule`.

Even though the components declared by `SharedModule` might not bind with `[(ngModel)]` and
there may be no need for `SharedModule` to import `FormsModule`, 
`SharedModule` can still export `FormsModule` without listing it among its `imports`. This 
way, you can give other modules access to `FormsModule` without having to import it directly 
into the `@NgModule` decorator.

<!--KW--"without listing it among its imports" Why?-->


### Sharing modules vs. sharing services

There is an important distinction between sharing modules and sharing services. Share 
modules when you want to share directives, pipes, and components, but don't use module 
sharing for sharing services where you need an app-wide singleton, that is, a single instance 
of the service. 

Share services through Angular dependency injection, rather than through the module system.
<!--KW--Is there a better way to say this since the service would still be in a module's 
providers array?-->

When a lazy loaded module imports a shared module that provides a service, it makes its 
own copy of that service. So if you need a service that's a singleton, provide it at the app level.
<!--KW--is this correct? It can't be in a shared module. So should it be shared in an eagerly loaded 
feature module?-->
To read about sharing services, see [Providers](guide/providers).

## More on NgModules

You may also be interested in the following:
* [Providers](guide/providers).
* [Types of Modules](guide/module-types).
