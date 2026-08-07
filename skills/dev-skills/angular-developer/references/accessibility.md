# Accessibility

This reference describes Angular accessibility best practices for semantic markup, ARIA, focus management, keyboard navigation, forms, dialogs, and testing.

## 1. Prefer semantic HTML

- Use native HTML elements first: `<button>`, `<a>`, `<input>`, `<textarea>`, `<select>`, `<fieldset>`, `<legend>`.
- Use heading elements in document order (`<h1>` to `<h6>`).
- Use landmarks like `<main>`, `<nav>`, `<header>`, `<footer>`, `<aside>` to help screen reader navigation.
- Avoid creating custom controls from generic non-interactive elements unless needed.

## 2. Keyboard accessibility

- Ensure all interactive controls are reachable with `Tab`.
- Custom widgets must support the expected keyboard interactions for their role.
  - Buttons: `Enter`, `Space`
  - Menus: `ArrowUp`, `ArrowDown`, `Home`, `End`, `Escape`
  - Dialogs: `Escape` to close and focus trap inside the dialog
- Use `tabindex="0"` only for custom interactive elements and avoid `tabindex="-1"` except to move focus programmatically.
- Maintain logical tab order and avoid focus traps.

## 3. Focus management

- Always show a clear focus indicator on focusable controls.
- Move focus into overlays, dialogs, menus, and drawers when they open.
- Restore focus to the element that triggered the overlay when it closes.
- After navigation or major content change, ensure focus lands on meaningful content such as a page heading or live region.

## 4. ARIA usage

- Use ARIA only to enhance semantics when native HTML is insufficient.
- Keep ARIA state in sync with application state.
- Common ARIA attributes:
  - `aria-label`
  - `aria-labelledby`
  - `aria-describedby`
  - `aria-expanded`
  - `aria-hidden`
  - `aria-live`
  - `aria-invalid`
  - `aria-required`
  - `aria-controls`
- Prefer `role="button"` only when using a non-button element for an interactive control, and ensure keyboard handling matches.
- Avoid redundant ARIA attributes when native semantics already convey the state.

## 5. Accessible patterns and components

- Use `@angular/aria` directives for headless patterns such as accordions, comboboxes, listboxes, menus, tabs, toolbars, and trees.
- Implement accessible custom controls by following the WAI-ARIA Authoring Practices for the widget pattern.
- Provide visible text labels for icons and icon-only buttons:
  - `aria-label="Close"`
  - `aria-labelledby="close-label"`
  - visually hidden text inside the element
- When building custom form fields, use `label` and `aria-describedby` to associate help text and error messages.

## 6. Forms and validation

- Associate each form control with a visible `<label>`.
- Use `fieldset` and `legend` for groups of related controls such as radio buttons or checkboxes.
- Display validation messages near the invalid field and link them with `aria-describedby`.
- Mark invalid inputs with `aria-invalid="true"`.
- Use `role="alert"` or `aria-live="assertive"` for important validation feedback that appears after submission.

## 7. Dialogs and overlays

- Announce dialogs using `role="dialog"` or `role="alertdialog"`.
- Include `aria-modal="true"` for modal dialogs and trap focus within the dialog.
- Set a meaningful accessible name with `aria-labelledby` and/or `aria-label`.
- Hide background content from assistive technology with `aria-hidden="true"` when a modal is open.

## 8. Live regions and announcements

- Use `aria-live` regions for content updates that should be announced by screen readers.
- Prefer `aria-live="polite"` for non-critical updates and `aria-live="assertive"` for urgent messages.
- On route change, update the page title and move focus to the main heading or a live region so the change is announced.

## 9. Images and graphical content

- Provide alternative text with `alt` for meaningful images.
- Use `alt=""` for decorative images.
- For complex images or diagrams, provide a description via nearby text or `aria-describedby`.
- Ensure icons used as buttons or links have an accessible name.

## 10. Accessibility testing

- Test with keyboard-only navigation and confirm all interactive elements are reachable.
- Use browser accessibility tools and screen readers to verify semantics, roles, labels, and reading order.
- Add automated accessibility checks with tools such as `axe-core`, `pa11y`, or similar.
- Write unit tests that verify ARIA attributes, focus handling, and visible labels where appropriate.

## 11. Angular-specific guidance

- Prefer native HTML semantics in Angular templates and avoid unnecessary `role` or `aria-*` attributes.
- Use `@angular/aria` for accessible widget patterns instead of reinventing ARIA logic.
- When writing reusable components or libraries, expose accessible API surface and document required labels and roles.
- Keep the accessibility implementation in sync with component state and Angular reactivity.

## 12. Angular CDK A11Y

- Use `@angular/cdk/a11y` for advanced accessibility helpers that complement native semantics and ARIA.
- `LiveAnnouncer`, `CdkAriaLive`, and `announce()` help announce dynamic content updates to screen readers.
- `FocusMonitor`, `FocusTrap`, and `FocusKeyManager` provide robust focus handling for overlays, dialogs, menus, and custom controls.
- `CdkObserveContent` and the `A11yModule` help keep application state in sync with assistive technology.
- Refer to the Angular CDK A11Y overview: https://material.angular.dev/cdk/a11y/overview
