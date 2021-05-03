consts:
    function() {
      __i18nMsg__('Content A', [], {id: 'idA', meaning: 'meaningA', desc: 'descA'})
      __i18nMsg__('Title B', [], {id: 'idB', meaning: 'meaningB', desc: 'descB'})
      __i18nMsg__('Title C', [], {meaning: 'meaningC'})
      __i18nMsg__('Title D', [], {meaning: 'meaningD', desc: 'descD'})
      __i18nMsg__('Title E', [], {id: 'idE', desc: 'meaningE'})
      __i18nMsg__('Title F', [], {id: 'idF'})

      // NOTE: Keeping this block as a raw string, since it checks escaping of special chars.
      let $i18n_23$;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @desc [BACKUP_${MESSAGE}_ID:idH]`desc
         */
        const $MSG_EXTERNAL_idG$$APP_SPEC_TS_24$ = goog.getMsg("Title G");
        $i18n_23$ = $MSG_EXTERNAL_idG$$APP_SPEC_TS_24$;
      } else {
        $i18n_23$ = $localize`:[BACKUP_$\{MESSAGE}_ID\:idH]\`desc@@idG:Title G`;
      }

      // NOTE: Keeping this block as a raw string, since it checks escaping of special chars.
      let $i18n_7$;
      if (typeof ngI18nClosureMode !== "undefined" && ngI18nClosureMode) {
        /**
         * @desc Some text \' [BACKUP_MESSAGE_ID: xxx]
         */
        const $MSG_EXTERNAL_idG$$APP_SPEC_TS_21$ = goog.getMsg("Content H");
        $i18n_7$ = $MSG_EXTERNAL_idG$$APP_SPEC_TS_21$;
      } else {
        $i18n_7$ = $localize`:Some text \\' [BACKUP_MESSAGE_ID\: xxx]:Content H`;
      }

      return [
        $i18n_0$, ["title", $i18n_1$], ["title", $i18n_2$], ["title", $i18n_3$],
        ["title", $i18n_4$], ["title", $i18n_5$], ["title", $i18n_6$], $i18n_7$
      ];
    },

    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        $r3$.ɵɵelementStart(0, "div");
        $r3$.ɵɵi18n(1, 0);
        $r3$.ɵɵelementEnd();
        $r3$.ɵɵelementStart(2, "div", 1);
        $r3$.ɵɵtext(3, "Content B");
        $r3$.ɵɵelementEnd();
        $r3$.ɵɵelementStart(4, "div", 2);
        $r3$.ɵɵtext(5, "Content C");
        $r3$.ɵɵelementEnd();
        $r3$.ɵɵelementStart(6, "div", 3);
        $r3$.ɵɵtext(7, "Content D");
        $r3$.ɵɵelementEnd();
        $r3$.ɵɵelementStart(8, "div", 4);
        $r3$.ɵɵtext(9, "Content E");
        $r3$.ɵɵelementEnd();
        $r3$.ɵɵelementStart(10, "div", 5);
        $r3$.ɵɵtext(11, "Content F");
        $r3$.ɵɵelementEnd();
        $r3$.ɵɵelementStart(12, "div", 6);
        $r3$.ɵɵtext(13, "Content G");
        $r3$.ɵɵelementEnd();
        $r3$.ɵɵelementStart(14, "div");
        $r3$.ɵɵi18n(15, 7);
        $r3$.ɵɵelementEnd();
      }
    }