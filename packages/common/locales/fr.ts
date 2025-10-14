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

export default ["fr",[["AM","PM"]],u,[["D","L","M","M","J","V","S"],["dim.","lun.","mar.","mer.","jeu.","ven.","sam."],["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"],["di","lu","ma","me","je","ve","sa"]],u,[["J","F","M","A","M","J","J","A","S","O","N","D"],["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."],["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"]],u,[["av. J.-C.","ap. J.-C."],u,["avant Jésus-Christ","après Jésus-Christ"]],1,[6,0],["dd/MM/y","d MMM y","d MMMM y","EEEE d MMMM y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1} {0}","{1}, {0}","{1} 'à' {0}",u],[","," ",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0 %","#,##0.00 ¤","#E0"],"EUR","€","euro",{"ARS":["$AR","$"],"AUD":["$AU","$"],"BEF":["FB"],"BMD":["$BM","$"],"BND":["$BN","$"],"BYN":[u,"р."],"BZD":["$BZ","$"],"CAD":["$CA","$"],"CLP":["$CL","$"],"CNY":[u,"¥"],"COP":["$CO","$"],"CYP":["£CY"],"EGP":[u,"£E"],"FJD":["$FJ","$"],"FKP":["£FK","£"],"FRF":["F"],"GBP":["£GB","£"],"GIP":["£GI","£"],"HKD":[u,"$"],"IEP":["£IE"],"ILP":["£IL"],"ITL":["₤IT"],"JPY":[u,"¥"],"KMF":[u,"FC"],"LBP":["£LB","£L"],"MTP":["£MT"],"MXN":["$MX","$"],"NAD":["$NA","$"],"NIO":[u,"$C"],"NZD":["$NZ","$"],"PHP":[u,"₱"],"RHD":["$RH"],"RON":[u,"L"],"RWF":[u,"FR"],"SBD":["$SB","$"],"SGD":["$SG","$"],"SRD":["$SR","$"],"TOP":[u,"$T"],"TTD":["$TT","$"],"TWD":[u,"NT$"],"USD":["$US","$"],"UYU":["$UY","$"],"WST":["$WS"],"XCD":[u,"$"],"XPF":["FCFP"],"ZMW":[u,"Kw"]},"ltr", plural];
