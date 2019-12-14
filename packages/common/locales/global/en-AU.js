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
        let i = Math.floor(Math.abs(n)), v = n.toString().replace(/^[^.]*\.?/, '').length;
        if (i === 1 && v === 0) return 1;
        return 5;
      }
      global.ng.common.locales['en-au'] = ['en-AU',[['am','pm'],u,u],u,[['Su.','M.','Tu.','W.','Th.','F.','Sa.'],['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],['Su','Mon','Tu','Wed','Th','Fri','Sat']],u,[['J','F','M','A','M','J','J','A','S','O','N','D'],['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],['January','February','March','April','May','June','July','August','September','October','November','December']],u,[['B','A'],['BC','AD'],['Before Christ','Anno Domini']],0,[6,0],['d/M/yy','d MMM y','d MMMM y','EEEE, d MMMM y'],['h:mm a','h:mm:ss a','h:mm:ss a z','h:mm:ss a zzzz'],['{1}, {0}',u,'{1} \'at\' {0}',u],['.',',',';','%','+','-','e','×','‰','∞','NaN',':'],['#,##0.###','#,##0%','¤#,##0.00','#E0'],'AUD','$','Australian Dollar',{'AUD':['$'],'BDT':[u,'Tk'],'BOB':[u,'$b'],'BRL':[u,'R$'],'CAD':[u,'$'],'CNY':[u,'¥'],'CUP':[u,'₱'],'EGP':[u,'£'],'EUR':[u,'€'],'GBP':[u,'£'],'HKD':[u,'$'],'ILS':[u,'₪'],'INR':[u,'₹'],'ISK':[u,'Kr'],'JPY':[u,'¥'],'KRW':[u,'₩'],'MXN':[u,'$'],'NZD':[u,'$'],'PYG':[u,'Gs'],'SCR':['Rs'],'SEK':[u,'Kr'],'TWD':[u,'$'],'USD':[u,'$'],'UYU':[u,'$U'],'VND':[u,'₫'],'XAF':[],'XCD':[u,'$'],'XOF':[],'XPF':['CFP']}, plural, [[['midnight','midday','morning','afternoon','evening','night'],u,['midnight','midday','in the morning','in the afternoon','in the evening','at night']],[['midnight','midday','morning','afternoon','evening','night'],u,u],['00:00','12:00',['06:00','12:00'],['12:00','18:00'],['18:00','21:00'],['21:00','06:00']]]];
    })(
    typeof globalThis !== 'undefined' && globalThis || typeof global !== 'undefined' && global ||
    typeof window !== 'undefined' && window);
