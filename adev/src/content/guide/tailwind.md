# Using Tailwind CSS with Angular

[Tailwind CSS](https://tailwindcss.com/) is a utility-first CSS framework that can be used to build modern websites without ever leaving your HTML. This guide will walk you through setting up Tailwind CSS in your Angular project.

## Setting up Tailwind CSS

### 1. Create an Angular project

First, create a new Angular project if you don't have one set up already.

<docs-code language="shell">
ng new my-project
cd my-project
</docs-code>

### 2. Install Tailwind CSS

Next, open a terminal in your Angular project's root directory and run the following command to install Tailwind CSS and its peer dependencies:

<docs-code language="shell">
npm install tailwindcss @tailwindcss/postcss postcss
</docs-code>

### 3. Configure PostCSS Plugins

Next, add a `.postcssrc.json` file in the file root of the project. 
Add the `@tailwindcss/postcss` plugin into your PostCSS configuration.

<docs-code language="json" header=".postcssrc.json">
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
</docs-code>

### 4. Import Tailwind CSS

Add an `@import` to `./src/styles.css` that imports Tailwind CSS.

<docs-code language="css" header="src/styles.css">
@import "tailwindcss";
</docs-code>

If you're using SCSS, add `@use` to `./src/styles.scss`. 

<docs-code language="scss" header="src/styles.css">
@use "tailwindcss";
</docs-code>

### 5. Start using Tailwind in your project

You can now start using Tailwind's utility classes in your component templates to style your application.

For example, you can add the following to your `app.html` file:

<docs-code language="html">
<h1 class="text-3xl font-bold underline">
  Hello world!
</h1>
</docs-code>

### 6. Start using Tailwind in your project

Run your build process with `ng serve` and you should see the styled heading.

## Troubleshooting

If Tailwindv4 is not loading any css classes when you run `ng serve`, ensure that your `angular.json` has the following:

```
{
  "projects": {
    "my-project": {
      "architect": {
          "build-client": {
            "builder": "@angular-devkit/build-angular:application",
            "options": {
              "styles": ["src/styles.css"]
          }
        }
      }
    }
  }
}
```

## Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)