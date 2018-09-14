# Getting Started - Architecture
So far, the application has relied on a single module, but as the application continues to grow, we should consider breaking our application into multiple NgModules.

Every component, directive, and pipe of our application belongs to exactly one NgModule, and the context of these objects is set by the NgModule they belong to.

When you refer to another component from within your template, that component must belong to the same NgModule, or be imported at the NgModule level.

At runtime, our application will be a tree of components, but each component could come from a different module. The structure of our component tree will likely be different than the structure of our modules.

(picture of component tree)

## Libraries
It is very common to create a "dumb" component library as a module or set of modules that can be imported by other teams. A great example of this is Angular Material which has [a module for each visual component](https://material.angular.io/components/categories) you may want to add to an application.



## Tasks
* Create a lazy loaded product details module

## Summary
The application now has a very basic landing page, pull data from the internet, and lazily loads Angular code as the user moves around the application.

The next step is to [deploy our application](/tutorial/getting-started-deployment).
