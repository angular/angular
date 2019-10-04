## Postinstall ngcc migration

Automatically adds a postinstall script to `package.json` to run `ngcc`.
If a postinstall script is already there and does not call `ngcc`, the call will be prepended.

#### Before
```json
{
  "scripts": {
    "postinstall": "do-something"
  }
}
```

#### After
```json
{
  "scripts": {
    "postinstall": "ngcc ... && do-something"
  }
}
```