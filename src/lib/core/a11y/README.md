# MdLiveAnnouncer
`MdLiveAnnouncer` is a service, which announces messages to several screenreaders.

### Methods

| Name |  Description |
| --- | --- |
| `announce(message, politeness)` | This announces a text message to the supported screenreaders. <br><br>The politeness parameter sets the `aria-live` attribute on the announcer element |

### Examples
The service can be injected in a component.
```ts
@Component({
  selector: 'my-component'
  providers: [MdLiveAnnouncer]
})
export class MyComponent {

 constructor(live: MdLiveAnnouncer) {
   live.announce("Hey Google");
 }

}
```

### Supported Screenreaders
- JAWS (Windows)
- NVDA (Windows)
- VoiceOver (OSX and iOS)
- TalkBack (Android)
