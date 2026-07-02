# Using Tailwind CSS with Angular

[Tailwind CSS](https://tailwindcss.com/) is a utility-first CSS framework that can be used to build modern websites without ever leaving your HTML. This guide will walk you through setting up Tailwind CSS in your Angular project.

## Automated Setup with `ng add`

Angular CLI provides a streamlined way to integrate Tailwind CSS into your project using the `ng add` command. This command automatically installs the necessary packages, configures Tailwind CSS, and updates your project's build settings.

First, navigate to your Angular project's root directory in a terminal and run the following command:

```shell
ng add tailwindcss
```

This command performs the following actions:

- Installs `tailwindcss` and its peer dependencies.
- Configures the project to use Tailwind CSS.
- Adds the Tailwind CSS `@import` statement to your styles.

After running `ng add tailwindcss`, you can immediately start using Tailwind's utility classes in your component templates.

## Manual Setup (Alternative Method)

If you prefer to set up Tailwind CSS manually, follow these steps:

### 1. Create an Angular project

First, create a new Angular project if you don't have one set up already.

```shell
ng new my-project
cd my-project
```

### 2. Install Tailwind CSS

Next, open a terminal in your Angular project's root directory and run the following command to install Tailwind CSS and its peer dependencies:

<docs-code-multifile>
  <docs-code header="npm" language="shell">
    npm install tailwindcss @tailwindcss/postcss postcss
  </docs-code>
  <docs-code header="yarn" language="shell">
    yarn add tailwindcss @tailwindcss/postcss postcss
  </docs-code>
  <docs-code header="pnpm" language="shell">
    pnpm add tailwindcss @tailwindcss/postcss postcss
  </docs-code>
  <docs-code header="bun" language="shell">
    bun add tailwindcss @tailwindcss/postcss postcss
  </docs-code>
</docs-code-multifile>

### 3. Configure PostCSS Plugins

Next, add a `.postcssrc.json` file in the file root of the project.
Add the `@tailwindcss/postcss` plugin into your PostCSS configuration.

```json {header: '.postcssrc.json'}
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

### 4. Import Tailwind CSS

Add an `@import` to `./src/styles.css` that imports Tailwind CSS.

```css {header: "src/styles.css"}
@import 'tailwindcss';
```

If you're using SCSS, add `@use` to `./src/styles.scss`.

```scss {header: "src/styles.scss"}
@use 'tailwindcss';
```

### 5. Start using Tailwind in your project

You can now start using Tailwind's utility classes in your component templates to style your application. Run your build process with `ng serve` and you should see the styled heading.

For example, you can add the following to your `app.html` file:

```html
<h1 class="text-3xl font-bold underline">Hello world!</h1>
```

## Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
