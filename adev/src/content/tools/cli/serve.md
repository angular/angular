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

You can use proxying support to divert certain URLs to a backend server, by passing a file to the `--proxy-config` build option.
For example, to divert all calls for `http://localhost:4200/api` to a server running on `http://localhost:3000/api`, take the following steps.

IMPORTANT: The development server's proxy configuration depends on your build configuration:
- **Modern applications** (using `@angular-devkit/build-angular:application` or `@angular-devkit/build-angular:browser-esbuild`) use [Vite's development server](https://vite.dev/config/server-options#server-proxy)
- **Legacy applications** (using `@angular-devkit/build-angular:browser`) use [Webpack's development server](https://webpack.js.org/configuration/dev-server/#devserverproxy)

Since Angular v17, new projects use the `application` builder with Vite by default.

1. Create a file `proxy.conf.json` in your project's `src/` folder.
1. Add the following content to the new proxy file:

    **For modern applications (Vite-based):**

    <docs-code language="json">

    {
      "/api/**": {
        "target": "http://localhost:3000",
        "secure": false,
        "changeOrigin": true,
        "logLevel": "debug"
      }
    }

    </docs-code>

    **For legacy applications (Webpack-based):**

    <docs-code language="json">

    {
      "/api": {
        "target": "http://localhost:3000",
        "secure": false
      }
    }

    </docs-code>

    **Key differences:**
    - **Route matching**: Vite uses `**` for wildcard matching (e.g., `/api/**`), while Webpack uses a single path segment (e.g., `/api`)
    - **Additional options**: Vite configurations often require `changeOrigin: true` for proper header handling

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
For a detailed description of all available proxy options, refer to:
- [Vite DevServer documentation](https://vite.dev/config/server-options#server-proxy) for modern applications using `@angular-devkit/build-angular:application` or `@angular-devkit/build-angular:browser-esbuild`
- [Webpack DevServer documentation](https://webpack.js.org/configuration/dev-server/#devserverproxy) for legacy applications using `@angular-devkit/build-angular:browser`

NOTE: If you edit the proxy configuration file, you must relaunch the `ng serve` process to make your changes effective.

## `localhost` resolution

As of Node version 17, Node will _not_ always resolve `http://localhost:<port>` to `http://127.0.0.1:<port>`
depending on each machine's configuration.

If you get an `ECONNREFUSED` error using a proxy targeting a `localhost` URL,
you can fix this issue by updating the target from `http://localhost:<port>` to `http://127.0.0.1:<port>`.

See [the `http-proxy-middleware` documentation](https://github.com/chimurai/http-proxy-middleware#nodejs-17-econnrefused-issue-with-ipv6-and-localhost-705)
for more information.
