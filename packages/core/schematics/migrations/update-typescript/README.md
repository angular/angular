## Update TypeScript migration

Automatically updates TypeScript in `package.json` to match the version that Angular version 9 supports.
Also updates `@types/node` if present because older versions are incompatible with newer TypeScript releases.

#### Before
```json
{
  "devDependencies": {
    "@types/node": "^8.9.4",
    "typescript": "~3.5.3"
  }
}
```

#### After
```json
{
  "devDependencies": {
    "@types/node": "^12.11.1",
    "typescript": "~3.6.4"
  }
}
```