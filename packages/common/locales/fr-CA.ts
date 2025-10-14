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
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length, e = parseInt(val.toString().replace(/^[^e]*(e([-+]?\d+))?/, '$2')) || 0;

if (i === 0 || i === 1)
    return 1;
if (e === 0 && (!(i === 0) && (i % 1000000 === 0 && v === 0)) || !(e >= 0 && e <= 5))
    return 4;
return 5;
}

export default ["fr-CA",[["a","p"],["a.m.","p.m."]],[["a.m.","p.m."]],[["D","L","M","M","J","V","S"],["dim.","lun.","mar.","mer.","jeu.","ven.","sam."],["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"],["di","lu","ma","me","je","ve","sa"]],u,[["J","F","M","A","M","J","J","A","S","O","N","D"],["janv.","févr.","mars","avr.","mai","juin","juill.","août","sept.","oct.","nov.","déc."],["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"]],u,[["av. J.-C.","ap. J.-C."],u,["avant Jésus-Christ","après Jésus-Christ"]],0,[6,0],["y-MM-dd","d MMM y","d MMMM y","EEEE d MMMM y"],["HH 'h' mm","HH 'h' mm 'min' ss 's'","HH 'h' mm 'min' ss 's' z","HH 'h' mm 'min' ss 's' zzzz"],["{1} {0}","{1}, {0}","{1} 'à' {0}",u],[","," ",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0 %","#,##0.00 ¤","#E0"],"CAD","$","dollar canadien",{"AUD":["$ AU","$"],"BEF":["FB"],"BYN":[u,"Br"],"CAD":["$"],"CYP":["£CY"],"EGP":[u,"£E"],"FRF":["F"],"GEL":[],"HKD":["$ HK","$"],"IEP":["£IE"],"ILP":["£IL"],"ILS":[u,"₪"],"INR":[u,"₹"],"ITL":["₤IT"],"KRW":[u,"₩"],"LBP":[u,"£L"],"MTP":["£MT"],"MXN":[u,"$"],"NZD":["$ NZ","$"],"PHP":[u,"₱"],"RHD":["$RH"],"RON":[u,"L"],"RWF":[u,"FR"],"SGD":["$ SG","$"],"TOP":[u,"$T"],"TWD":[u,"NT$"],"USD":["$ US","$"],"VND":[u,"₫"],"XAF":[],"XCD":[u,"$"],"XOF":[],"XPF":[]},"ltr", plural];
