/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// THIS CODE IS GENERATED - DO NOT MODIFY
// See angular/tools/gulp-tasks/cldr/extract.js

(
    function(global) {
      global.ng = global.ng || {};
      global.ng.common = global.ng.common || {};
      global.ng.common.locales = global.ng.common.locales || {};
      const u = undefined;
      function plural(n) {
        let f = parseInt(n.toString().replace(/^[^.]*\.?/, ''), 10) || 0;
        if (n % 10 === 1 && !(n % 100 >= 11 && n % 100 <= 19)) return 1;
        if (n % 10 === Math.floor(n % 10) && n % 10 >= 2 && n % 10 <= 9 &&
            !(n % 100 >= 11 && n % 100 <= 19))
          return 3;
        if (!(f === 0)) return 4;
        return 5;
      }
      global.ng.common.locales['lt'] = ['lt',[['pr. p.','pop.'],['priešpiet','popiet'],u],u,[['S','P','A','T','K','P','Š'],['sk','pr','an','tr','kt','pn','št'],['sekmadienis','pirmadienis','antradienis','trečiadienis','ketvirtadienis','penktadienis','šeštadienis'],['Sk','Pr','An','Tr','Kt','Pn','Št']],u,[['S','V','K','B','G','B','L','R','R','S','L','G'],['saus.','vas.','kov.','bal.','geg.','birž.','liep.','rugp.','rugs.','spal.','lapkr.','gruod.'],['sausio','vasario','kovo','balandžio','gegužės','birželio','liepos','rugpjūčio','rugsėjo','spalio','lapkričio','gruodžio']],[['S','V','K','B','G','B','L','R','R','S','L','G'],['saus.','vas.','kov.','bal.','geg.','birž.','liep.','rugp.','rugs.','spal.','lapkr.','gruod.'],['sausis','vasaris','kovas','balandis','gegužė','birželis','liepa','rugpjūtis','rugsėjis','spalis','lapkritis','gruodis']],[['pr. Kr.','po Kr.'],u,['prieš Kristų','po Kristaus']],1,[6,0],['y-MM-dd',u,'y \'m\'. MMMM d \'d\'.','y \'m\'. MMMM d \'d\'., EEEE'],['HH:mm','HH:mm:ss','HH:mm:ss z','HH:mm:ss zzzz'],['{1} {0}',u,u,u],[',',' ',';','%','+','−','×10^','×','‰','∞','NaN',':'],['#,##0.###','#,##0 %','#,##0.00 ¤','#E0'],'EUR','€','Euras',{'AUD':[u,'$'],'BDT':[],'BRL':[u,'R$'],'BYN':[u,'Br'],'CAD':[u,'$'],'CNY':[u,'¥'],'GBP':[u,'£'],'HKD':[u,'$'],'ILS':[],'INR':[],'JPY':[u,'¥'],'KHR':[],'KRW':[u,'₩'],'LAK':[],'MNT':[],'MXN':[u,'$'],'NZD':[u,'$'],'PLN':[u,'zl'],'PYG':[u,'Gs'],'RUB':[u,'rb'],'TWD':[u,'$'],'USD':[u,'$'],'VND':[],'XAF':[],'XCD':[u,'$'],'XOF':[],'XPF':[]}, plural, [[['vidurnaktis','perpiet','rytas','popietė','vakaras','naktis'],u,u],[['vidurnaktis','vidurdienis','rytas','diena','vakaras','naktis'],u,u],['00:00','12:00',['06:00','12:00'],['12:00','18:00'],['18:00','24:00'],['00:00','06:00']]]];
    })(
    typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
    typeof window !== 'undefined' && window);
