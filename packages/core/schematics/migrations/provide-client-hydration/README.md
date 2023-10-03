## provideClientHydration migration

Angular v17 changes the api for `provideClientHydration` by replacing the `HydrationFeature` arguments with
an option object. This object allows to configure the domReuse and the httpTransferCache

#### Before
```ts
import {provideClientHydration} from '@angular/platformBrowser';

provideClientHydration(withNoDomReuse(), withNoHttpTransferCache())
```

#### After
```ts
import {provideClientHydration} from '@angular/platformBrowser';

provideClientHydration({
  domReuse: false,
  transferCache: false,
})
```
