# App shell

Application shell is a way to render a portion of your application using a route at build time.
It can improve the user experience by quickly launching a static rendered page (a skeleton common to all pages) while the browser downloads the full client version and switches to it automatically after the code loads.

This gives users a meaningful first paint of your application that appears quickly because the browser can render the HTML and CSS without the need to initialize any JavaScript.

Learn more in [The App Shell Model](https://developers.google.com/web/fundamentals/architecture/app-shell).

## Step 1: Prepare the application

You can do this with the following CLI command:
<code-example language="bash">
ng new my-app --routing
</code-example>

For an existing application, you have to manually add the `RouterModule` and defining a `<router-outlet>` within your application.

## Step 2: Create the app shell

Use the CLI to automatically create the application shell.

<code-example language="bash">
ng generate app-shell
</code-example>

For more information about this command see [App shell command](cli/generate#app-shell-command). 

After running this command you will notice that the `angular.json` configuration file has been updated to add two new targets, with a few other changes.

<code-example language="json">
"server": {
  "builder": "@angular-devkit/build-angular:server",
  "defaultConfiguration": "production",
  "options": {
    "outputPath": "dist/my-app/server",
    "main": "src/main.server.ts",
    "tsConfig": "tsconfig.server.json"
  },
  "configurations": {
    "development": {
      "outputHashing": "none",
    },
    "production": {
      "outputHashing": "media",
      "fileReplacements": [
        {
          "replace": "src/environments/environment.ts",
          "with": "src/environments/environment.prod.ts"
        }
      ],
      "sourceMap": false,
      "optimization": true
    }
  }
},
"app-shell": {
  "builder": "@angular-devkit/build-angular:app-shell",
  "defaultConfiguration": "production",
  "options": {
    "route": "shell"
  },
  "configurations": {
    "development": {
      "browserTarget": "my-app:build:development",
      "serverTarget": "my-app:server:development",
    },
    "production": {
      "browserTarget": "my-app:build:production",
      "serverTarget": "my-app:server:production"
    }
  }
}
</code-example>

## Step 3: Verify the app is built with the shell content

Use the CLI to build the `app-shell` target.

<code-example language="bash">
ng run my-app:app-shell:development
</code-example>

Or to use the production configuration.

<code-example language="bash">
ng run my-app:app-shell:production
</code-example>

To verify the build output, open `dist/my-app/browser/index.html`. Look for default text `app-shell works!` to show that the application shell route was rendered as part of the output.
