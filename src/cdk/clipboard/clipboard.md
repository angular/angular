The clipboard package provides helpers for working with the system clipboard.

### Click an element to copy

The `cdkCopyToClipboard` directive can be used to easily add copy-on-click functionality to an
existing element. The directive selector doubles as an `@Input()` for the text to be copied.

```html
<img src="avatar.jpg" alt="Hero avatar" [cdkCopyToClipboard]="getShortBio()">
```

<!-- example(cdk-clipboard-overview) -->

### Programmatically copy a string

The `Clipboard` service copies text to the user's clipboard. It has two methods: `copy` and
`beginCopy`. For cases where you are copying a relatively small amount of text, you can call `copy`
directly to place it on the clipboard.

```typescript
import {Clipboard} from '@angular/cdk/clipboard';

class HeroProfile {
  constructor(private clipboard: Clipboard) {}

  copyHeroName() {
    this.clipboard.copy('Alphonso');
  }
}
```

However, for longer text the browser needs time to fill an intermediate textarea element and copy
the content. Directly calling `copy` may fail in this case, so you can pre-load the text by calling
`beginCopy`. This method returns a `PendingCopy` object that has a `copy` method to finish copying
the text that was buffered. Please note, if you call `beginCopy`, you must clean up the
`PendingCopy` object by calling `destroy` on it after you are finished.

```typescript
import {Clipboard} from '@angular/cdk/clipboard';

class HeroProfile {
  lifetimeAchievements: string;

  constructor(private clipboard: Clipboard) {}

  copyAchievements() {
    const pending = this.clipboard.beginCopy(this.lifetimeAchievements);
    let remainingAttempts = 3;
    const attempt = () => {
      const result = pending.copy();
      if (!result && --remainingAttempts) {
        setTimeout(attempt);
      } else {
        // Remember to destroy when you're done!
        pending.destroy();
      }
    };
    attempt();
  }
}
```

If you're using the `cdkCopyToClipboard` you can pass in the `cdkCopyToClipboardAttempts` input
to automatically attempt to copy some text a certain number of times.

```html
<button [cdkCopyToClipboard]="longText" [cdkCopyToClipboardAttempts]="5">Copy text</button>
```
