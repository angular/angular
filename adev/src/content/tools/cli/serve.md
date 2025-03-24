# Serving Angular apps for development

You can serve your Angular CLI application with the `ng serve` command.
This will compile your application, skip unnecessary optimizations, start a devserver, and automatically rebuild and live reload any subsequent changes.
You can stop the server by pressing `Ctrl+C`.

`ng serve` only executes the builder for the `serve` target in the default project as specified in `angular.json`.
While any builder can be used here, the most common (and default) builder is `@angular-devkit/build-angular:dev-server`.

You can determine which builder is being used for a particular project by looking up the `serve` target for that project.

<docs-code language="json">

{
  "projects": {
    "my-app": {
      "architect": {
        // `ng serve` invokes the Architect target named `serve`.
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          // ...
        },
        "build": { /* ... */ }
        "test": { /* ... */ }
      }
    }
  }
}

</docs-code>

This page discusses usage and options of `@angular-devkit/build-angular:dev-server`.

## Proxying to a backend server

Use [proxying support](https://webpack.js.org/configuration/dev-server/#devserverproxy) to divert certain URLs to a backend server, by passing a file to the `--proxy-config` build option.
For example, to divert all calls for `http://localhost:4200/api` to a server running on `http://localhost:3000/api`, take the following steps.

1. Create a file `proxy.conf.json` in your project's `src/` folder.
1. Add the following content to the new proxy file:

    <docs-code language="json">

    {
      "/api": {
        "target": "http://localhost:3000",
        "secure": false
      }
    }

    </docs-code>

1. In the CLI configuration file, `angular.json`, add the `proxyConfig` option to the `serve` target:

    <docs-code language="json">

    {
      "projects": {
        "my-app": {
          "architect": {
            "serve": {
              "builder": "@angular-devkit/build-angular:dev-server",
              "options": {
                "proxyConfig": "src/proxy.conf.json"
              }
            }
          }
        }
      }
    }

    </docs-code>

1. To run the development server with this proxy configuration, call `ng serve`.

Edit the proxy configuration file to add configuration options; following are some examples.
For a detailed description of all options, refer to the [webpack DevServer documentation](https://webpack.js.org/configuration/dev-server/#devserverproxy) when using `@angular-devkit/build-angular:browser`, or the [Vite DevServer documentation](https://vite.dev/config/server-options#server-proxy) when using `@angular-devkit/build-angular:browser-esbuild` or `@angular-devkit/build-angular:application`.

NOTE: If you edit the proxy configuration file, you must relaunch the `ng serve` process to make your changes effective.

## `localhost` resolution

As of Node version 17, Node will _not_ always resolve `http://localhost:<port>` to `http://127.0.0.1:<port>`
depending on each machine's configuration.

If you get an `ECONNREFUSED` error using a proxy targeting a `localhost` URL,
you can fix this issue by updating the target from `http://localhost:<port>` to `http://127.0.0.1:<port>`.

See [the `http-proxy-middleware` documentation](https://github.com/chimurai/http-proxy-middleware#nodejs-17-econnrefused-issue-with-ipv6-and-localhost-705)
for more information.
