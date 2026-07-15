# Settings mechanism

Angular DevTools keeps a set of user-selected settings that are persistently stored. The following sections describe the internal mechanism and how you can update these settings if needed.

## Mechanism

The core of the settings mechanism is the `SettingsStore`. It provides an API for creating settings option items. Since these items are represented by writable signals, you can freely use them across the app. Any changes to these signals will be immediately reflected in the persistent storage, meaning that the signal and the storage are always in sync.

> [!NOTE]
> Depending on the environment, the DevTools app uses either `window.localStorage` in dev mode, or the browser's extension storage API (`chrome.storage` in the case of Chrome) in prod mode for persistent storage.

As for the items themselves, each one should be composed of the mandatory `key`, `category`, and `initialValue`. Each `key` should be unique for its `category`, meaning that we can have the same key across different categories.

While the `SettingsStore` is a tool for creating option items, the concrete set of options for the Angular DevTools is kept in the `Settings` class.

## Updating the settings

With the growing number of features, the DevTools settings options expand proportionally – we add new items or change existing ones. This is why the settings mechanism incorporates a versioning system that should handle the cases when the user's storage diverges from what the app expects.

### Updating the options & Versioning

As you may have already noticed, `SettingsStore` accepts a template type – the settings version. In [`settings_versions.ts`](https://github.com/angular/angular/blob/main/devtools/projects/ng-devtools/src/lib/application-providers/settings_versions.ts) you can explore the current and all previous versions. They are needed both for implementing the required migrations and as a historical record of what the app used to support.

We can separate the updates to the settings into two types:

1. Adding a new option item.
2. Changing or removing an existing option item.

#### 1. Adding a new option item

In order to add a new item, you can simply update the latest version interface (check [`settings_versions.ts`](https://github.com/angular/angular/blob/main/devtools/projects/ng-devtools/src/lib/application-providers/settings_versions.ts)) and then reflect the change in the `Settings` class by adding a new property. After that, you can safely introduce and use the new option item in your app via the `Settings` instance.

Keep in mind that you have to update the existing migration validation tests in [`settings_provider_spec.ts`](https://github.com/angular/angular/blob/main/devtools/projects/ng-devtools/src/lib/application-providers/settings_provider_spec.ts) by adding the newly introduced item to the test suites, which brings us to the next section:

#### 2. Changing or removing an existing option item

Changing or removing an existing item requires slightly more steps. Unlike the addition of new items, we need to introduce a new version interface in [`settings_versions.ts`](https://github.com/angular/angular/blob/main/devtools/projects/ng-devtools/src/lib/application-providers/settings_versions.ts).

> [!NOTE]
> Naively changing `Settings` items and/or the latest version interface may lead to the loss of user data due to the mismatching schemas between what the app expects and what the persistent storage keeps.

For example, if the latest version interface is:

```typescript
interface SettingsDataV2 {
  // Note: V2
  'foo@bar': boolean;
  'baz@qux': string;
}
```

and we want to update `baz@qux` to `baz@quux`, we have to create a new interface:

```typescript
interface SettingsDataV3 {
  // Note: V3
  'foo@bar': boolean;
  'baz@quux': string;
}
```

> [!IMPORTANT]
> You have to update the `LATEST_DATA_VERSION` const as well. In our case, that should be `3`.

After the introduction of the new interface, that same interface should be provided (in place of the old one) to the `SettingsStore` instance template type in `Settings`, that is:

```typescript
settingsStore = inject(SettingsStore<SettingsDataV3>);
```

Accordingly, you'll need to update the existing class prop that calls `SettingsStore.create` with the relevant data (e.g. `category: 'quux'`).

After that, we need to verify that any user whose persistent storage is still using the old item will not lose that piece of data when they update their DevTools extension. To do this, we need to add a migration in the `applyMigration` function in [`settings_provider.ts`](https://github.com/angular/angular/blob/main/devtools/projects/ng-devtools/src/lib/application-providers/settings_provider.ts). You can find relevant information about how migrations should be implemented along with existing examples in the file itself.

Finally, you need to add a test to [`settings_provider_spec.ts`](https://github.com/angular/angular/blob/main/devtools/projects/ng-devtools/src/lib/application-providers/settings_provider_spec.ts) that ensures the migration is applied correctly.

In a similar fashion, you can remove an existing item – create a new interface, substitute it in `Settings` and remove the relevant property, create a migration, and then verify that it works as expected by adding a test.
