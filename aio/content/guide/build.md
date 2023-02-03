# Building and serving Angular apps

This page discusses build-specific configuration options for Angular projects.

<a id="app-environments"></a>

## Configuring application environments

You can define different named build configurations for your project, such as `development` and `staging`, with different defaults.

Each named configuration can have defaults for any of the options that apply to the various [builder targets](guide/glossary#target), such as `build`, `serve`, and `test`.
The [Angular CLI](cli) `build`, `serve`, and `test` commands can then replace files with appropriate versions for your intended target environment.

### Configure environment-specific defaults

Using the Angular CLI, start by running the [generate environments command](cli/generate#environments-command) shown here to create the `src/environments/` directory and configure the project to use these files.

<code-example format="shell" language="shell">

ng generate environments

</code-example>

The project's `src/environments/` directory contains the base configuration file, `environment.ts`, which provides configuration for `production`, the default environment.
You can override default values for additional environments, such as `development` and `staging`, in target-specific configuration files.

For example:

<div class="filetree">
    <div class="file">
        myProject/src/environments
    </div>
    <div class="children">
        <div class="file">
          environment.ts
        </div>
        <div class="file">
          environment.development.ts
        </div>
        <div class="file">
          environment.staging.ts
        </div>
    </div>
</div>

The base file `environment.ts`, contains the default environment settings.
For example:

<code-example format="typescript" language="typescript">

export const environment = {
  production: true
};

</code-example>

The `build` command uses this as the build target when no environment is specified.
You can add further variables, either as additional properties on the environment object, or as separate objects.
For example, the following adds a default for a variable to the default environment:

<code-example format="typescript" language="typescript">

export const environment = {
  production: true,
  apiUrl: 'http://my-prod-url'
};

</code-example>

You can add target-specific configuration files, such as `environment.development.ts`.
The following content sets default values for the development build target:

<code-example format="typescript" language="typescript">

export const environment = {
  production: false,
  apiUrl: 'http://my-api-url'
};

</code-example>

### Using environment-specific variables in your app

The following application structure configures build targets for `development` and `staging` environments:

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
              app.component.html
            </div>
            <div class="file">
              app.component.ts
            </div>
        </div>
        <div class="file">
          environments
        </div>
        <div class="children">
            <div class="file">
              environment.ts
            </div>
            <div class="file">
              environment.development.ts
            </div>
            <div class="file">
              environment.staging.ts
            </div>
        </div>
    </div>
</div>

To use the environment configurations you have defined, your components must import the original environments file:

<code-example format="typescript" language="typescript">

import { environment } from './../environments/environment';

</code-example>

This ensures that the build and serve commands can find the configurations for specific build targets.

The following code in the component file \(`app.component.ts`\) uses an environment variable defined in the configuration files.

<code-example format="typescript" language="typescript">

  import { Component } from '&commat;angular/core';
  import { environment } from './../environments/environment';

  &commat;Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
  })
  export class AppComponent {
    constructor() {
      console.log(environment.production); // Logs false for development environment
    }

    title = 'app works!';
  }

</code-example>

<a id="file-replacement"></a>

## Configure target-specific file replacements

The main CLI configuration file, `angular.json`, contains a `fileReplacements` section in the configuration for each build target, which lets you replace any file in the TypeScript program with a target-specific version of that file.
This is useful for including target-specific code or variables in a build that targets a specific environment, such as production or staging.

By default no files are replaced.
You can add file replacements for specific build targets.
For example:

<code-example format="json" language="json">

  "configurations": {
    "development": {
      "fileReplacements": [
          {
            "replace": "src/environments/environment.ts",
            "with": "src/environments/environment.development.ts"
          }
        ],
        &hellip;

</code-example>

This means that when you build your development configuration with `ng build --configuration development`, the `src/environments/environment.ts` file is replaced with the target-specific version of the file, `src/environments/environment.development.ts`.

You can add additional configurations as required.
To add a staging environment, create a copy of `src/environments/environment.ts` called `src/environments/environment.staging.ts`, then add a `staging` configuration to `angular.json`:

<code-example format="json" language="json">

  "configurations": {
    "development": { &hellip; },
    "production": { &hellip; },
    "staging": {
      "fileReplacements": [
        {
          "replace": "src/environments/environment.ts",
          "with": "src/environments/environment.staging.ts"
        }
      ]
    }
  }

</code-example>

You can add more configuration options to this target environment as well.
Any option that your build supports can be overridden in a build target configuration.

To build using the staging configuration, run the following command:

<code-example format="shell" language="shell">

ng build --configuration=staging

</code-example>

You can also configure the `serve` command to use the targeted build configuration if you add it to the "serve:configurations" section of `angular.json`:

<code-example format="json" language="json">

  "serve": {
    "builder": "&commat;angular-devkit/build-angular:dev-server",
    "options": {
      "browserTarget": "your-project-name:build"
    },
    "configurations": {
      "development": {
        "browserTarget": "your-project-name:build:development"
      },
      "production": {
        "browserTarget": "your-project-name:build:production"
      },
      "staging": {
        "browserTarget": "your-project-name:build:staging"
      }
    }
  },

</code-example>

<a id="size-budgets"></a>
<a id="configure-size-budgets"></a>

## Configuring size budgets

As applications grow in functionality, they also grow in size.
The CLI lets you set size thresholds in your configuration to ensure that parts of your application stay within size boundaries that you define.

Define your size boundaries in the CLI configuration file, `angular.json`, in a `budgets` section for each [configured environment](#app-environments).

<code-example format="json" language="json">

{
  &hellip;
  "configurations": {
    "production": {
      &hellip;
      "budgets": []
    }
  }
}

</code-example>

You can specify size budgets for the entire app, and for particular parts.
Each budget entry configures a budget of a given type.
Specify size values in the following formats:

| Size value      | Details                                                                     |
| :-------------- | :-------------------------------------------------------------------------- |
| `123` or `123b` | Size in bytes.                                                              |
| `123kb`         | Size in kilobytes.                                                          |
| `123mb`         | Size in megabytes.                                                          |
| `12%`           | Percentage of size relative to baseline. \(Not valid for baseline values.\) |

When you configure a budget, the build system warns or reports an error when a given part of the application reaches or exceeds a boundary size that you set.

Each budget entry is a JSON object with the following properties:

| Property       | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| type           | The type of budget. One of: <table> <thead> <tr> <th> Value </th> <th> Details </th> </tr> </thead> <tbody> <tr> <td> <code>bundle</code> </td> <td> The size of a specific bundle. </td> </tr> <tr> <td> <code>initial</code> </td> <td> The size of JavaScript needed for bootstrapping the application. Defaults to warning at 500kb and erroring at 1mb. </td> </tr> <tr> <td> <code>allScript</code> </td> <td> The size of all scripts. </td> </tr> <tr> <td> <code>all</code> </td> <td> The size of the entire application. </td> </tr> <tr> <td> <code>anyComponentStyle</code> </td> <td> This size of any one component stylesheet. Defaults to warning at 2kb and erroring at 4kb. </td> </tr> <tr> <td> <code>anyScript</code> </td> <td> The size of any one script. </td> </tr> <tr> <td> <code>any</code> </td> <td> The size of any file. </td> </tr> </tbody> </table> |
| name           | The name of the bundle \(for `type=bundle`\).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| baseline       | The baseline size for comparison.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| maximumWarning | The maximum threshold for warning relative to the baseline.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| maximumError   | The maximum threshold for error relative to the baseline.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| minimumWarning | The minimum threshold for warning relative to the baseline.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| minimumError   | The minimum threshold for error relative to the baseline.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| warning        | The threshold for warning relative to the baseline \(min &amp max\).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| error          | The threshold for error relative to the baseline \(min &amp max\).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

<a id="commonjs "></a>

## Configuring CommonJS dependencies

<div class="alert is-important">

It is recommended that you avoid depending on CommonJS modules in your Angular applications.
Depending on CommonJS modules can prevent bundlers and minifiers from optimizing your application, which results in larger bundle sizes.
Instead, it is recommended that you use [ECMAScript modules](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/import) in your entire application.
For more information, see [How CommonJS is making your bundles larger](https://web.dev/commonjs-larger-bundles).

</div>

The Angular CLI outputs warnings if it detects that your browser application depends on CommonJS modules.
To disable these warnings, add the CommonJS module name to `allowedCommonJsDependencies` option in the `build` options located in `angular.json` file.

<code-example language="json">

"build": {
  "builder": "&commat;angular-devkit/build-angular:browser",
  "options": {
     "allowedCommonJsDependencies": [
        "lodash"
     ]
     &hellip;
   }
   &hellip;
},

</code-example>

<a id="browser-compat"></a>

## Configuring browser compatibility

The Angular CLI uses [Browserslist](https://github.com/browserslist/browserslist) to ensure compatibility with different browser versions. [Autoprefixer](https://github.com/postcss/autoprefixer) is used for CSS vendor prefixing and [@babel/preset-env](https://babeljs.io/docs/en/babel-preset-env) for JavaScript syntax transformations.

Internally, the Angular CLI uses the below `browserslist` configuration which matches the [browsers that are supported](guide/browser-support) by Angular.

  <code-example format="none" language="text">
  last 2 Chrome versions
  last 1 Firefox version
  last 2 Edge major versions
  last 2 Safari major versions
  last 2 iOS major versions
  Firefox ESR
  </code-example>

To override the internal configuration, run [`ng generate config browserslist`](cli/generate#config-command), which generates a `.browserslistrc` configuration file in the the project directory.

See the [browserslist repository](https://github.com/browserslist/browserslist) for more examples of how to target specific browsers and versions.

<div class="alert is-helpful">

Use [browsersl.ist](https://browsersl.ist) to display compatible browsers for a `browserslist` query.

</div>

<a id="proxy"></a>

## Proxying to a backend server

Use the [proxying support](https://webpack.js.org/configuration/dev-server/#devserverproxy) in the `webpack` development server to divert certain URLs to a backend server, by passing a file to the `--proxy-config` build option.
For example, to divert all calls for `http://localhost:4200/api` to a server running on `http://localhost:3000/api`, take the following steps.

1.  Create a file `proxy.conf.json` in your project's `src/` folder.
1.  Add the following content to the new proxy file:

    <code-example format="json" language="json">

    {
      "/api": {
        "target": "http://localhost:3000",
        "secure": false
      }
    }

    </code-example>

1.  In the CLI configuration file, `angular.json`, add the `proxyConfig` option to the `serve` target:

    <code-example format="json" language="json">

      &hellip;
      "architect": {
        "serve": {
          "builder": "&commat;angular-devkit/build-angular:dev-server",
          "options": {
            "browserTarget": "your-application-name:build",
            "proxyConfig": "src/proxy.conf.json"
          },
    &hellip;

    </code-example>

1.  To run the development server with this proxy configuration, call `ng serve`.

Edit the proxy configuration file to add configuration options; following are some examples.
For a description of all options, see [webpack DevServer documentation](https://webpack.js.org/configuration/dev-server/#devserverproxy).

<div class="alert is-helpful">

**NOTE**: <br />
If you edit the proxy configuration file, you must relaunch the `ng serve` process to make your changes effective.

</div>

### Rewrite the URL path

The `pathRewrite` proxy configuration option lets you rewrite the URL path at run time.
For example, specify the following `pathRewrite` value to the proxy configuration to remove "api" from the end of a path.

<code-example format="json" language="json">

{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "pathRewrite": {
      "^/api": ""
    }
  }
}

</code-example>

If you need to access a backend that is not on `localhost`, set the `changeOrigin` option as well.
For example:

<code-example format="json" language="json">

{
  "/api": {
    "target": "http://npmjs.org",
    "secure": false,
    "pathRewrite": {
      "^/api": ""
    },
    "changeOrigin": true
  }
}

</code-example>

To help determine whether your proxy is working as intended, set the `logLevel` option.
For example:

<code-example format="json" language="json">

{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "pathRewrite": {
      "^/api": ""
    },
    "logLevel": "debug"
  }
}

</code-example>

Proxy log levels are `info` \(the default\), `debug`, `warn`, `error`, and `silent`.

### Proxy multiple entries

You can proxy multiple entries to the same target by defining the configuration in JavaScript.

Set the proxy configuration file to `proxy.conf.mjs` \(instead of `proxy.conf.json`\), and specify configuration files as in the following example.

<code-example format="javascript" language="javascript">

export default [
  {
    context: [
        '/my',
        '/many',
        '/endpoints',
        '/i',
        '/need',
        '/to',
        '/proxy'
    ],
    target: 'http://localhost:3000',
    secure: false
  }
];

</code-example>

In the CLI configuration file, `angular.json`, point to the JavaScript proxy configuration file:

<code-example format="json" language="json">

&hellip;
"architect": {
  "serve": {
    "builder": "&commat;angular-devkit/build-angular:dev-server",
    "options": {
      "browserTarget": "your-application-name:build",
      "proxyConfig": "src/proxy.conf.mjs"
    },
&hellip;

</code-example>

### Bypass the proxy

If you need to optionally bypass the proxy, or dynamically change the request before it's sent, add the bypass option, as shown in this JavaScript example.

<code-example format="javascript" language="javascript">

export default {
  '/api/proxy': {
    "target": 'http://localhost:3000',
    "secure": false,
    "bypass": function (req, res, proxyOptions) {
        if (req.headers.accept.includes('html')) {
            console.log('Skipping proxy for browser request.');
            return '/index.html';
        }
        req.headers['X-Custom-Header'] = 'yes';
    }
  }
};

</code-example>

### Using corporate proxy

If you work behind a corporate proxy, the backend cannot directly proxy calls to any URL outside your local network.
In this case, you can configure the backend proxy to redirect calls through your corporate proxy using an agent:

<code-example format="shell" language="shell">

npm install --save-dev https-proxy-agent

</code-example>

When you define an environment variable `http_proxy` or `HTTP_PROXY`, an agent is automatically added to pass calls through your corporate proxy when running `npm start`.

Use the following content in the JavaScript configuration file.

<code-example format="javascript" language="javascript">

import HttpsProxyAgent from 'https-proxy-agent';

const proxyConfig = [{
  context: '/api',
  target: 'http://your-remote-server.com:3000',
  secure: false
}];

export default (proxyConfig) => {
  const proxyServer = process.env.http_proxy &verbar;&verbar; process.env.HTTP_PROXY;
  if (proxyServer) {
    const agent = new HttpsProxyAgent(proxyServer);
    console.log('Using corporate proxy server: ' + proxyServer);

    for (const entry of proxyConfig) {
      entry.agent = agent;
    }
  }

  return proxyConfig;
};

</code-example>

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2023-01-17
