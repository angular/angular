# Deploy multiple locales

If `myapp` is the directory that contains the distributable files of your project, you typically make different versions available for different locales in locale directories.
For example, your French version is located in the `myapp/fr` directory and the Spanish version is located in the `myapp/es` directory.

The HTML `base` tag with the `href` attribute specifies the base URI, or URL, for relative links.
If you set the `"localize"` option in [`angular.json`][GuideWorkspaceConfig] workspace build configuration file to `true` or to an array of locale IDs, the CLI adjusts the base `href` for each version of the application.
To adjust the base `href` for each version of the application, the CLI adds the locale to the configured `"subPath"`.
Specify the `"subPath"` for each locale in your [`angular.json`][GuideWorkspaceConfig] workspace build configuration file.
The following example displays `"subPath"` set to an empty string.

<docs-code header="angular.json" path="adev/src/content/examples/i18n/angular.json" visibleRegion="i18n-subPath"/>

## Configure a server

Typical deployment of multiple languages serve each language from a different subdirectory.
Users are redirected to the preferred language defined in the browser using the `Accept-Language` HTTP header.
If the user has not defined a preferred language, or if the preferred language is not available, then the server falls back to the default language.
To change the language, change your current location to another subdirectory.
The change of subdirectory often occurs using a menu implemented in the application.

For more information on how to deploy apps to a remote server, see [Deployment][GuideDeployment].

IMPORTANT: If you are using [Server rendering](guide/ssr) with `outputMode` set to `server`, Angular automatically handles redirection dynamically based on the `Accept-Language` HTTP header. This simplifies deployment by eliminating the need for manual server or configuration adjustments.

### Nginx example

The following example displays an Nginx configuration.

<docs-code path="adev/src/content/examples/i18n/doc-files/nginx.conf" language="nginx"/>

### Apache example

The following example displays an Apache configuration.

<docs-code path="adev/src/content/examples/i18n/doc-files/apache2.conf" language="apache"/>

[CliBuild]: cli/build "ng build | CLI | Angular"

[GuideDeployment]: tools/cli/deployment "Deployment | Angular"

[GuideWorkspaceConfig]: reference/configs/workspace-config "Angular workspace configuration | Angular"
