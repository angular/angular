### LiveAnnouncer
`LiveAnnouncer` is used to announce messages for screen-reader users using an `aria-live` region.
See [the W3C's WAI-ARIA](https://www.w3.org/TR/wai-aria/states_and_properties#aria-live)
for more information on aria-live regions. 

#### Methods

##### `announce(message: string, politeness?: 'off' | 'polite' | 'assertive'): void`
Announce the given message via aria-live region. The politeness argument determines the 
`aria-live` attribute on the announcer element, defaulting to 'polite'.

#### Examples
The LiveAnnouncer is injected into a component:
```ts
@Component({
  selector: 'my-component'
  providers: [LiveAnnouncer]
})
export class MyComponent {

 constructor(liveAnnouncer: LiveAnnouncer) {
   liveAnnouncer.announce("Hey Google");
 }

}
```
