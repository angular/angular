# Labs

Labs are a place where Angular team can test out new ideas for Angular APIs, get community feedback in a way which allows us to quickly iterate, experiment and throw away ideas. As such this is meant to solicit feedback and is not meant for production use.

## DISCLAIMER

The `@angular/labs` contains code which is **NOT** production ready! 
Its intent is to try out new ideas, and make it available on experimental basis to get feedback without being committed to anything.

Specifically:
- It does **NOT** follow any version scheme.
- We make no guarantees about any APIs being stable between any two versions.
  - specifically we can at any time delete API, change API names, API semantics, API arguments and or return types which will most likely result in your experimental app being broken. 

Use at your own risk, and give us feedback. 

## How to use

To use `@angular/core/labs` you have to agree to the above disclaimer in the code before the APIs can be used.

```
import {iWantToUseExperimentalAPIs} from `@angular/labs/core`

iWantToUseExperimentalAPIs({
  iUnderstand: ['not ready for production', 'unstable API']
})
```
The above code will need to execute before any other APIs are enabled and can be used in your experiments. 
The act of agreeing will create a disclaimer banner in your console, reminding you that this is not meant for production.