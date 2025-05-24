# (Optional) Conditionally enable zoneless

This step describes how to conditionally enable zoneless in the application
providers. This enables testing zoneless in the development environment without
deploying it to production prematurely. Alternatively, skip this step and do one
of the following:

(a) Add the provider to the `ApplicationConfig` whenever you want to test the
application with zoneless enabled or (b) Use existing experiment/toggle
infrastructure that the application supports, such as experiments based on URL
search parameters.

HELPFUL: You may skip this step. If you're only interested enabling Zoneless
ad-hoc during development testing, it can be enabled in the application
providers:

<docs-code language="typescript"> import {ApplicationConfig,
provideZonelessChangeDetection} from '@angular/core';

export const appConfig: ApplicationConfig = { providers:
[provideZonelessChangeDetection()], }; </docs-code>

<hr>

<docs-workflow>

<docs-step title="Import the zoneless provider">

Zoneless will be configured in the application providers. It is available in
`@angular/core`:

<docs-code language="typescript"> import {ApplicationConfig,
provideZoneChangeDetection, provideZonelessChangeDetection} from
'@angular/core'; </docs-code>

</docs-step>

<docs-step title="Check for zoneless=true in the URL">

Application providers are static and must be configured before initialization.
This example uses the presence of `zoneless=true` in the URL search parameters
to determine whether to add the zoneless provider to the application
configuration.

<docs-code language="typescript"> const useZoneless = new
URL(location.href).searchParams.get('zoneless') === 'true'; </docs-code>

</docs-step>

IMPORTANT: This is one example of an experiment toggle for the application's
`EnvironmentProviders`. Production applications often have more robust infrastructure
for experiment toggles. One approach is to restrict this option to development
environments using [environment
variables](/tools/cli/environments#using-environment-specific-variables-in-your-app).

<docs-step title="Conditionally add zoneless to the providers">

The `provideZonelessChangeDetection` function returns a list of providers that
configure Angular to use zoneless updates. Check the `useZoneless` property to
determine whether to use these providers for zoneless updates, or the providers
for zone-based updates.

<docs-code language="typescript"> providers: [ useZoneless ?
provideZonelessChangeDetection() : provideZoneChangeDetection({eventCoalescing:
true}), ] </docs-code>

</docs-step>

</docs-workflow>

After you complete these steps, you will notice that you always have to click
the "force UI update" button after every change. Great job! That's because we
have more more work to do for this application to be compatible with Zoneless.
