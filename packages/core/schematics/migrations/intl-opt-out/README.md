## Opt-out of the Date Intl impelementation for the i18n sub-system

Your application will retain the CLDR-based logic for the i18n subsystem when formating dates.
This will be achieved by invoking the opt-out `useLegacyDateFormatting()` function.

#### Before
```ts
bootstrapApplication(AppComponent, appConfig)
```

#### After
```ts
// TODO: Remove this opt-out to enable the Intl based implementation for date formatting'
useLegacyDateFormatting()

bootstrapApplication(AppComponent, appConfig)
```