# Deploy multiple locales

{@a deploy-locales}

If `myapp` is the directory containing the distributable files of your application, you would typically make available different versions for different locales in locale directories such as `myapp/fr` for the French version and `myapp/es` for the Spanish version.

The HTML `base` tag with the `href` attribute specifies the base URI, or URL, for relative links.
If you set the `"localize"` option in `angular.json` to `true` or to an array of locale IDs, the CLI adjusts the base `href` for each version of the application.
To adjust the base `href` for each version of the application, the CLI adds the locale to the configured `"baseHref"`.
Specify the `"baseHref"` for each locale in your workspace configuration file (`angular.json`).
The following example displays `"baseHref"` set to an empty string.

<code-example language="json" header="angular.json" path="i18n/angular.json" region="i18n-baseHref" ></code-example>

Also, to declare the base `href` at compile time, use the CLI `--baseHref` option with [`ng build`][AioCliBuild].

### Configuring servers

Typical deployment of multiple languages serve each language from a different subdirectory.
Users are redirected to the preferred language defined in the browser using the `Accept-Language` HTTP header.
If the user has not defined a preferred language, or if the preferred language is not available, then the server falls back to the default language.
To change the language, see another subdirectory.  
The change of subdirectory often occurs using a menu implemented in the application.

For more information on how to deploy apps to a remote server, see [Deployment][AioGuideDeployment].

#### Nginx

The following example displays an Nginx configuration.

<code-example path="i18n/doc-files/nginx.conf" language="nginx"></code-example>

#### Apache

The following example displays an Apache configuration.

<code-example path="i18n/doc-files/apache2.conf" language="apache"></code-example>

<!-- links -->

[AioCliBuild]: cli/build "ng build | CLI | Angular"

[AioGuideDeployment]: guide/deployment "Deployment | Angular"

<!-- external links -->

<!-- end links -->

@reviewed 2021-09-15
