# Serving Angular apps for development

You can serve your Angular CLI application with the `ng serve` command.
This will compile your application, skip unnecessary optimizations, start a devserver, and automatically rebuild and live reload any subsequent changes.
You can stop the server by pressing `Ctrl+C`.

`ng serve` only executes the builder for the `serve` target in the default project as specified in `angular.json`. While any builder can be used here, the most common (and default) builder is `@angular/build:dev-server`.

You can determine which builder is being used for a particular project by looking up the `serve` target for that project.

```json
{
  "projects": {
    "my-app": {
      "architect": {
        // `ng serve` invokes the Architect target named `serve`.
        "serve": {
          "builder": "@angular/build:dev-server"
          // ...
        },
        "build": {
          /* ... */
        },
        "test": {
          /* ... */
        }
      }
    }
  }
}
```

## Proxying to a backend server

Use [proxying support](https://vite.dev/config/server-options#server-proxy) to divert certain URLs to a backend server, by passing a file to the `--proxy-config` build option.
For example, to divert all calls for `http://localhost:4200/api` to a server running on `http://localhost:3000/api`, take the following steps.

1. Create a file `proxy.conf.json` in your project's `src/` folder.
1. Add the following content to the new proxy file:

```json
{
  "/api/**": {
    "target": "http://localhost:3000",
    "secure": false
  }
}
```

1. In the CLI configuration file, `angular.json`, add the `proxyConfig` option to the `serve` target:

```json
{
  "projects": {
    "my-app": {
      "architect": {
        "serve": {
          "builder": "@angular/build:dev-server",
          "options": {
            "proxyConfig": "src/proxy.conf.json"
          }
        }
      }
    }
  }
}
```

1. To run the development server with this proxy configuration, call `ng serve`.

NOTE: To apply changes made to your proxy configuration file, you must restart the `ng serve` process.

### Path matching behavior depends on the builder

**`@angular/build:dev-server`** (based on [Vite](https://vite.dev/config/server-options#server-proxy))

- `/api` matches only `/api`.
- `/api/*` matches `/api/users` but not `/api/users/123`.
- `/api/**` matches `/api/users` and `/api/users/123`.

**`@angular-devkit/build-angular:dev-server`** (based on [Webpack DevServer](https://webpack.js.org/configuration/dev-server/#devserverproxy))

- `/api` matches `/api` and any sub-paths (equivalent to `/api/**`).
