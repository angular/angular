`<mat-card>` is a content container for text, photos, and actions in the context of a single subject.

<!-- example(card-overview) -->


### Basic card sections
The most basic card needs only an `<mat-card>` element with some content. However, Angular Material
provides a number of preset sections that you can use inside of an `<mat-card>`:


| Element                | Description                                            |
| ---------------------- | ------------------------------------------------------ |
| `<mat-card-title>`     | Card title                                             |
| `<mat-card-subtitle>`  | Card subtitle                                          |
| `<mat-card-content>`   | Primary card content. Intended for blocks of text      |
| `<img mat-card-image>` | Card image. Stretches the image to the container width |
| `<mat-card-actions>`   | Container for buttons at the bottom of the card        |
| `<mat-card-footer>`    | Section anchored to the bottom of the card             |

These elements primary serve as pre-styled content containers without any additional APIs. 
However, the `align` property on `<mat-card-actions>` can be used to position the actions at the 
`'start'` or `'end'` of the container.  


### Card headers
In addition to the aforementioned sections, `<mat-card-header>` gives the ability to add a rich
header to a card. This header can contain:

| Element                 | Description                                  |
| ----------------------- | -------------------------------------------- |
| `<mat-card-title>`      | A title within the header                    |
| `<mat-card-subtitle>`   | A subtitle within the header                 |
| `<img mat-card-avatar>` | An image used as an avatar within the header |


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
