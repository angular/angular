$localize `  pre-title ${
    "\uFFFD0\uFFFD" // SOURCE: "/i18n_message_interpolation_whitespace.ts" "{{titleValue}}"
    }:INTERPOLATION:  post-title` // SOURCE: "/i18n_message_interpolation_whitespace.ts" "  post-title"
    …
    $localize ` pre-body ${
    "\uFFFD0\uFFFD" // SOURCE: "/i18n_message_interpolation_whitespace.ts" "{{bodyValue}}"
    }:INTERPOLATION: post-body` // SOURCE: "/i18n_message_interpolation_whitespace.ts" "  post-body"
    …
    i0.ɵɵelementStart(0, "div", 2) // SOURCE: "/i18n_message_interpolation_whitespace.ts" "<div i18n title=\""
    …
    i0.ɵɵelementEnd() // SOURCE: "/i18n_message_interpolation_whitespace.ts" "</div>"
    