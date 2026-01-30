# CSS IntelliSense Module

This module provides CSS property completions, validation, color picker, and quick fixes for Angular's style bindings in all contexts:

- HTML templates (`[style.propertyName]`)
- Inline TypeScript templates (`` template: `...` ``)
- `@HostBinding('style.propertyName')`
- `host: { '[style.prop]': ... }` metadata

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Angular Language Service                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────┐    ┌──────────────────────────────────────────┐│
│  │   css_diagnostics   │    │      css_language_service.ts             ││
│  │   css_completions   │◄───│  (vscode-css-languageservice adapter)    ││
│  │   css_properties    │    │                                          ││
│  └─────────────────────┘    └──────────────────────────────────────────┘│
│           │                              │                               │
│           │                              ▼                               │
│           │               ┌──────────────────────────────────────────┐  │
│           │               │     vscode-css-languageservice           │  │
│           │               │  - 2000+ CSS properties (W3C/MDN)        │  │
│           │               │  - Complete value completions            │  │
│           │               │  - Angular custom data (:host, etc.)     │  │
│           │               │  - SCSS/LESS support                     │  │
│           │               │  - Color detection and presentations     │  │
│           │               └──────────────────────────────────────────┘  │
│           │                                                              │
│           ▼                                                              │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     LSP Responses                                 │   │
│  │  - Diagnostics (unknown property, obsolete, conflicts)           │   │
│  │  - Completions (properties, values, units)                       │   │
│  │  - Hover/QuickInfo (MDN documentation)                           │   │
│  │  - Code Fixes (typo corrections, migrations, value fixes)        │   │
│  │  - Color Provider (detection, color picker, format conversions)  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Features

### ✅ Property Validation (IMPLEMENTED)

- **2000+ CSS properties** from W3C/MDN data via vscode-css-languageservice
- Vendor-prefixed property support (`-webkit-`, `-moz-`, etc.)
- CSS custom property (variable) support (`--my-color`)
- Obsolete/deprecated property detection with MDN links

**Coverage:**
| Context | Status |
|---------|--------|
| HTML templates `[style.prop]` | ✅ |
| Inline TS templates | ✅ |
| `[style]="{prop: value}"` objects | ✅ |
| `[ngStyle]="{prop: value}"` | ✅ |
| `host: { '[style.prop]': ... }` | ✅ |
| `@HostBinding('style.prop')` | ✅ |

### ✅ Value Completions (IMPLEMENTED)

- Complete value completions for all CSS properties
- Color name completions with 150+ named colors
- Keyword completions (e.g., `flex`, `grid`, `block` for `display`)
- Unit suggestions based on property context

### ✅ Value Hover Documentation (IMPLEMENTED - css-tree + vscode-css-languageservice) ⚠️ **TEMPORARY**

Using css-tree for tokenization and vscode-css-languageservice for MDN documentation, we provide context-aware documentation for individual tokens within CSS values:

- **Compound value parsing**: `border: 1px solid red` → `1px` (length), `solid` (line-style), `red` (color)
- **Semantic type detection**: css-tree identifies what each token represents in the CSS grammar
- **MDN documentation**: vscode-css-languageservice provides rich value documentation from MDN

**Approach:**

- **css-tree**: Tokenizes values, provides positions, identifies semantic types (length, color, line-style, etc.)
- **vscode-css-languageservice**: Provides MDN documentation for value keywords from completion items

**Detected Types:**
| Value Type | Examples |
|------------|----------|
| Length | `10px`, `1em`, `100%` |
| Color | `red`, `#ff0000`, `rgb(255,0,0)` |
| Line style | `solid`, `dashed`, `dotted` |
| Display | `flex`, `block`, `grid` |
| CSS functions | `calc()`, `var()`, `url()` |
| Math functions | `calc()`, `min()`, `max()` |

**Note:** This is a temporary implementation. It will be simplified when vscode-css-languageservice implements native value hover support.

### ✅ Color Picker (IMPLEMENTED)

Color detection and picker support for:

**Coverage:**
| Context | Status |
|---------|--------|
| `[style.color]="'red'"` | ✅ |
| `[style.backgroundColor]="'#ff0000'"` | ✅ |
| `[style]="{color: 'red'}"` | ✅ |
| `[ngStyle]="{color: 'blue'}"` | ✅ |
| `style="color: red"` (static) | ✅ |
| `host: { '[style.color]': "'red'" }` | ✅ |
| Hex colors (#rgb, #rrggbb, #rgba) | ✅ |
| RGB/RGBA colors | ✅ |
| HSL/HSLA colors | ✅ |
| Named colors (150+) | ✅ |
| Color format conversions | ✅ |

### ✅ Style Binding Support (IMPLEMENTED)

- `[style.propertyName]="value"` - Individual bindings
- `[style.propertyName.unit]="number"` - Unit suffix bindings
- `[style]="{ prop: value }"` - Style object bindings
- `[ngStyle]="{ prop: value }"` - ngStyle directive
- `host: { '[style.prop]': 'expr' }` - Host style bindings
- `@HostBinding('style.prop')` - HostBinding decorator

### ✅ Diagnostics (IMPLEMENTED - Error Codes 99001-99019)

| Code  | Description                       | Status |
| ----- | --------------------------------- | ------ |
| 99001 | Unknown CSS property name         | ✅     |
| 99002 | Invalid CSS unit suffix           | ✅     |
| 99003 | Unknown property in style object  | ✅     |
| 99004 | Duplicate CSS property            | ✅     |
| 99005 | Conflicting style binding         | ✅     |
| 99006 | Unknown property in host metadata | ✅     |
| 99007 | Invalid unit in host metadata     | ✅     |
| 99008 | Obsolete CSS property             | ✅     |
| 99009 | Obsolete property in host         | ✅     |
| 99010 | Obsolete property in object       | ✅     |
| 99011 | Invalid unit value type           | ✅     |
| 99012 | Invalid unit value in host        | ✅     |
| 99013 | Invalid unit value in object      | ✅     |
| 99014 | Shorthand override conflict       | ✅     |
| 99015 | Prefer numeric for unit binding   | ✅     |
| 99016 | Missing unit for number           | ✅     |
| 99017 | Invalid CSS value                 | ✅     |
| 99018 | Invalid value in style object     | ✅     |
| 99019 | Invalid value in host binding     | ✅     |

### ⚠️ CSS Value Validation (css-tree)

**TEMPORARY IMPLEMENTATION:** Value validation for error codes 99017-99019 is implemented using the `css-tree` library.
This is a temporary solution until `vscode-css-languageservice` implements native value validation upstream.

When to replace: Monitor [Issue #457](https://github.com/microsoft/vscode-css-languageservice/issues/457) and [Issue #442](https://github.com/microsoft/vscode-css-languageservice/issues/442).

### ✅ Code Fixes (IMPLEMENTED)

| Fix                                | Contexts | Status |
| ---------------------------------- | -------- | ------ |
| Typo correction (property names)   | All      | ✅     |
| Migration from obsolete properties | All      | ✅     |
| Suggest valid CSS values           | All      | ✅     |
| Fix shorthand/longhand conflicts   | All      | ✅     |
| Remove invalid unit suffix         | All      | ✅     |

## Files

| File                      | Purpose                                   |
| ------------------------- | ----------------------------------------- |
| `index.ts`                | Module exports                            |
| `css_language_service.ts` | vscode-css-languageservice adapter        |
| `css_properties.ts`       | Property data, validation, fuzzy matching |
| `css_completions.ts`      | Completion generation                     |
| `css_diagnostics.ts`      | Diagnostic collection                     |

## Code Fix Files

| File                            | Purpose                          |
| ------------------------------- | -------------------------------- |
| `fix_css_property.ts`           | Fix unknown CSS property names   |
| `fix_css_value.ts`              | Fix invalid CSS values           |
| `fix_css_unit_value.ts`         | Fix invalid unit suffixes        |
| `fix_css_shorthand_conflict.ts` | Fix shorthand/longhand conflicts |

## Dependencies

- **vscode-css-languageservice** (^6.3.9) - Microsoft's CSS language service
  - Provides W3C/MDN-accurate CSS property/value data
  - Supports CSS, SCSS, and LESS
  - Includes Angular-specific custom data provider
  - **Provides MDN documentation** for value completions

- **css-tree** (^3.1.0) - CSS parser with value validation ⚠️ **TEMPORARY**
  - **Value validation**: Validates property values like `display: flexx`
  - **Value tokenization**: Parses compound values into individual tokens with positions
  - **Semantic type detection**: Identifies token types (length, color, line-style, etc.)
  - **Will be removed** when vscode-css-languageservice implements value validation/hover
  - Track upstream: [Issue #457](https://github.com/microsoft/vscode-css-languageservice/issues/457)

## Angular-Specific Extensions

The module includes custom data for Angular-specific pseudo-classes:

```css
/* Component host selector */
:host {
  display: block;
}

/* Host with condition */
:host(.active) {
  background: blue;
}

/* Ancestor-based styling */
:host-context(.dark-theme) {
  color: white;
}

/* Deprecated deep selector */
::ng-deep .child {
  color: red;
} /* ⚠️ */
```

## Known Limitations

### CSS Custom Properties

CSS variables (`--my-var`) are always considered valid as they can have any value.

## Future Work

- [ ] Validation of CSS class names that exist in component styles
- [ ] CSS variable autocomplete from component styles
- [ ] SCSS variable support in style bindings
- [ ] Hover documentation for CSS values (not just properties) - **[Pending upstream: Issue #457](https://github.com/microsoft/vscode-css-languageservice/issues/457)**
- [ ] Remove css-tree dependency when vscode-css-languageservice adds value validation

## Upstream Dependencies

Some features depend on upstream implementation in vscode-css-languageservice:

| Feature                     | Upstream Issue                                                             | Status |
| --------------------------- | -------------------------------------------------------------------------- | ------ |
| Value hover documentation   | [#457](https://github.com/microsoft/vscode-css-languageservice/issues/457) | Open   |
| Value browser/baseline info | [#442](https://github.com/microsoft/vscode-css-languageservice/issues/442) | Open   |

When these features are implemented upstream, Angular LS will automatically receive them via dependency update.

## Known Limitations

### Wide-Gamut Color Space Approximation

The LSP `Color` interface (from vscode-languageserver-types) only supports sRGB color values with `red`, `green`, `blue`, `alpha` fields. Modern CSS color spaces like `oklab()`, `oklch()`, `lab()`, `lch()` have a wider gamut than sRGB and may contain colors that cannot be accurately represented.

**Current behavior:**

- All CSS color formats are supported for parsing and detection
- Colors are converted to sRGB by vscode-css-languageservice
- Wide-gamut colors are approximated (may lose precision or be clipped)
- Color presentations show all modern formats including oklab/oklch

**Impact:**

- Color pickers in editors show sRGB-approximated values
- Round-tripping wide-gamut colors may result in slight color shifts
- This is a limitation of the LSP protocol, not our implementation

**Potential future improvement:**

- Track vscode-css-languageservice and LSP for wide-gamut color support
- Consider creating an issue upstream if one doesn't exist

## Related Documentation

- [Angular Component Styling](https://angular.dev/guide/components/styling)
- [MDN CSS Reference](https://developer.mozilla.org/docs/Web/CSS/Reference)
- [vscode-css-languageservice](https://github.com/microsoft/vscode-css-languageservice)
