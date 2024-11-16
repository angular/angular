// Different interpolation values will not affect message text
const a = $localize`:@@message-1:message ${10} contents`;
const b = $localize`:@@message-1:message ${20} contents`;

// But different actual text content will
const c = $localize`:@@message-2:message contents`;
const d = $localize`:@@message-2:different message contents`;
