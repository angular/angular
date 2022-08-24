`<mat-card>` is a content container for text, photos, and actions in the context of a single subject.

<!-- example(card-overview) -->

### Basic card sections

The most basic card needs only an `<mat-card>` element with some content. However, Angular Material
provides a number of preset sections that you can use inside a `<mat-card>`:

| Element                  | Description                                                    |
|--------------------------|----------------------------------------------------------------|
| `<mat-card-header>`      | Section anchored to the top of the card (adds padding)         |
| `<mat-card-content>`     | Primary card content (adds padding)                            |
| `<img mat-card-image>`   | Card image. Stretches the image to the container width         |
| `<mat-card-actions>`     | Container for buttons at the bottom of the card (adds padding) |
| `<mat-card-footer>`      | Section anchored to the bottom of the card                     |

These elements primary serve as pre-styled content containers without any additional APIs. 
However, the `align` property on `<mat-card-actions>` can be used to position the actions at the 
`'start'` or `'end'` of the container.

### Card padding

The `<mat-card>` element itself does not add any padding around its content. This allows developers
to customize the padding to their liking by applying padding to the elements they put in the card.

In many cases developers may just want the standard padding specified in the Material Design spec.
In this case, the `<mat-card-header>`, `<mat-card-content>`, and `<mat-card-footer>` sections can be
used.

* `<mat-card-content>` adds standard padding along its sides, as well as along the top if it is the
  first element in the `<mat-card>`, and along the bottom if it is the last element in the
  `<mat-card>`.
* `<mat-card-header>` adds standard padding along its sides and top.
* `<mat-card-actions>` adds padding appropriate for the action buttons at the bottom of a card. 

### Card headers

A `<mat-card-header>` can contain any content, but there are several predefined elements
that can be used to create a rich header to a card. These include:

| Element                  | Description                                          |
|--------------------------|------------------------------------------------------|
| `<mat-card-title>`       | A title within the header                            |
| `<mat-card-subtitle>`    | A subtitle within the header                         |
| `<img mat-card-avatar>`  | An image used as an avatar within the header         |

In addition to using `<mat-card-title>` and `<mat-card-subtitle>` directly within the
`<mat-card-header>`, they can be further nested inside a `<mat-card-title-group>` in order arrange
them with a (non-avatar) image.

### Title groups

`<mat-card-title-group>` can be used to combine a title, subtitle, and image into a single section.
This element can contain:
* `<mat-card-title>`
* `<mat-card-subtitle>`
* One of:
    * `<img mat-card-sm-image>`
    * `<img mat-card-md-image>`
    * `<img mat-card-lg-image>`

### Accessibility

Cards serve a wide variety of scenarios and may contain many different types of content.
Due to this flexible nature, the appropriate accessibility treatment depends on how you use
`<mat-card>`.

#### Group, region, and landmarks

There are several ARIA roles that communicate that a portion of the UI represents some semantically
meaningful whole. Depending on what the content of the card means to your application, you can apply
one of [`role="group"`][role-group], [`role="region"`][role-region], or
[one of the landmark roles][aria-landmarks] to the `<mat-card>` element.

You do not need to apply a role when using a card as a purely decorative container that does not
convey a meaningful grouping of related content for a single subject. In these cases, the content
of the card should follow standard practices for document content.

#### Focus

Depending on how cards are used, it may be appropriate to apply a `tabindex` to the `<mat-card>`
element. 

* If cards are a primary mechanism through which user interacts with the application, `tabindex="0"`
  may be appropriate. 
* If attention can be sent to the card, but it's not part of the document flow, `tabindex="-1"` may
  be appropriate.
* If the card acts as a purely decorative container, it does not need to be tabbable. In this case,
  the card content should follow normal best practices for tab order.

Always test your application to verify the behavior that works best for your users.

[role-group]: https://www.w3.org/TR/wai-aria/#group
[role-region]: https://www.w3.org/TR/wai-aria/#region
[aria-landmarks]: https://www.w3.org/TR/wai-aria/#landmark
