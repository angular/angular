**Warning: this service is still experimental. It may have bugs and the API may change at any
time**

The clipboard package provides helpers for working with the system clipboard.

## `Clipboard` service

The `Clipboard` service copies text to the
user's clipboard. It has two methods: `copy` and `beginCopy`. For cases where
you are copying a relatively small amount of text, you can call `copy` directly
to place it on the clipboard.

```typescript
class HeroProfile {
  constructor(private clipboard: Clipboard) {}

  copyHeroName() {
    this.clipboard.copy('Alphonso');
  }
}
```

However, for longer text the browser needs time to fill an intermediate
textarea element and copy the content. Directly calling `copy` may fail
in this case, so you can pre-load the text by calling `beginCopy`. This method
returns a `PendingCopy` object that has a `copy` method to finish copying the
text that was buffered. Please note, if you call `beginCopy`, you must
clean up the `PendingCopy` object by calling `destroy` on it after you are
finished.

```typescript
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
    }
    setTimeout(attempt);
  }
}
```

## `cdkCopyToClipboard` directive

The `cdkCopyToClipboard` directive can be used to easily add copy-on-click
functionality to an existing element. The directive selector doubles as an
`@Input()` for the text to be copied.

```html
<img src="avatar.jpg" alt="Hero avatar" [cdkCopyToClipboard]="getShortBio()">
```
