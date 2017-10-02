### MediaMatcher
 
When including the CDK's `LayoutModule`, components can inject `MediaMatcher` to access the 
matchMedia method, if available on the platform.

#### Example
```ts
@Component({ ... }) 
export class MyWidget {  
  constructor(mm: MediaMatcher) {
    mm.matchMedia('(orientation: landscape)').matches ? 
      this.setLandscapeMode() :
      this.setPortraitMode();
  }
}  
```

