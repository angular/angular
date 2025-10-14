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
const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length, f = parseInt(val.toString().replace(/^[^.]*\.?/, ''), 10) || 0;

if (v === 0 && (i === 1 || (i === 2 || i === 3)) || (v === 0 && !(i % 10 === 4 || (i % 10 === 6 || i % 10 === 9)) || !(v === 0) && !(f % 10 === 4 || (f % 10 === 6 || f % 10 === 9))))
    return 1;
return 5;
}

export default ["ceb",[["a","p"],["AM","PM"]],[["AM","PM"]],[["D","L","M","M","H","B","S"],["Dom","Lun","Mar","Miy","Huw","Biy","Sab"],["Domingo","Lunes","Martes","Miyerkules","Huwebes","Biyernes","Sabado"],["Dom","Lun","Mar","Miy","Huw","Biy","Sab"]],u,[["E","P","M","A","M","H","H","A","S","O","N","D"],["Ene","Peb","Mar","Abr","May","Hun","Hul","Ago","Set","Okt","Nob","Dis"],["Enero","Pebrero","Marso","Abril","Mayo","Hunyo","Hulyo","Agosto","Setyembre","Oktubre","Nobyembre","Disyembre"]],u,[["BC","AD"],u,["Sa Wala Pa Si Kristo","Anno Domini"]],0,[6,0],["M/d/yy","MMM d, y","MMMM d, y","EEEE, MMMM d, y"],["h:mm a","h:mm:ss a","h:mm:ss a z","h:mm:ss a zzzz"],["{1}, {0}",u,"{1} 'sa' {0}",u],[".",",",";","%","+","-","E","×","‰","∞","NaN",":"],["#,##0.###","#,##0%","¤#,##0.00","#E0"],"PHP","₱","Philippine Piso",{"JPY":["JP¥","¥"],"USD":["US $","$"]},"ltr", plural];
