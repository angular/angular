/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// THIS CODE IS GENERATED - DO NOT MODIFY.
const u = undefined;

function plural(val: number): number {
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length;

if (i === 1 && v === 0)
    return 1;
if (i === Math.floor(i) && (i >= 2 && i <= 4) && v === 0)
    return 3;
if (!(v === 0))
    return 4;
return 5;
}

export default ["sk",[["AM","PM"]],u,[["n","p","u","s","š","p","s"],["ne","po","ut","st","št","pi","so"],["nedeľa","pondelok","utorok","streda","štvrtok","piatok","sobota"],["ne","po","ut","st","št","pi","so"]],u,[["j","f","m","a","m","j","j","a","s","o","n","d"],["jan","feb","mar","apr","máj","jún","júl","aug","sep","okt","nov","dec"],["januára","februára","marca","apríla","mája","júna","júla","augusta","septembra","októbra","novembra","decembra"]],[["j","f","m","a","m","j","j","a","s","o","n","d"],["jan","feb","mar","apr","máj","jún","júl","aug","sep","okt","nov","dec"],["január","február","marec","apríl","máj","jún","júl","august","september","október","november","december"]],[["pred Kr.","po Kr."],u,["pred Kristom","po Kristovi"]],1,[6,0],["d. M. y",u,"d. MMMM y","EEEE d. MMMM y"],["H:mm","H:mm:ss","H:mm:ss z","H:mm:ss zzzz"],["{1} {0}","{1}, {0}",u,u],[","," ",";","%","+","-","e","×","‰","∞","NaN",":"],["#,##0.###","#,##0 %","#,##0.00 ¤","#E0"],"EUR","€","euro",{"AUD":[u,"$"],"BRL":[u,"R$"],"BYN":[u,"р."],"CAD":[u,"$"],"CNY":[u,"¥"],"GBP":[u,"£"],"HKD":[u,"$"],"ILS":["NIS","₪"],"INR":[u,"₹"],"JPY":[u,"¥"],"KRW":[u,"₩"],"NZD":[u,"$"],"PHP":[u,"₱"],"RUR":[u,"р."],"TWD":[u,"NT$"],"USD":[u,"$"],"VND":[u,"₫"],"XXX":[]},"ltr", plural];
