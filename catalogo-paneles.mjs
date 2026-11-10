// HELION Solar v2.2 — catálogo de ventas únicamente por pallet.
// Precios observados en capturas aportadas por el usuario el 10-nov-2026;
// MXN más IVA, sin flete, stock o garantía de vigencia. Dimensiones de
// REFERENCIA: contrastar con ficha técnica exacta ANTES de propuesta formal.
export const PANEL_CATALOG = Object.freeze([
  {id:'longi540',brand:'LONGi',model:'LR7-60HVHL-540M Hi-MO X10',w:540,length:1.990,width:1.134,qty:36,price:90169.52},
  {id:'leapton660',brand:'LEAPTON',model:'LP182*210M66QNB660W',w:660,length:2.382,width:1.134,qty:37,price:88422.44},
  {id:'longi645explorer',brand:'LONGi',model:'LR7-72HVH-645M Explorer',w:645,length:2.382,width:1.134,qty:36,price:82709.37},
  {id:'leapton730',brand:'LEAPTON',model:'LP210*210M66NB730W',w:730,length:2.384,width:1.303,qty:34,price:80362.30},
  {id:'longi645antidust',brand:'LONGi',model:'LR7-72HVHF-645M Anti-Dust',w:645,length:2.382,width:1.134,qty:35,price:80333.18},
  {id:'leapton620',brand:'LEAPTON',model:'LP182*210M66NB620WBLK',w:620,length:2.382,width:1.134,qty:37,price:76037.30},
  {id:'leapton630',brand:'LEAPTON',model:'LP182*210M66NB630W',w:630,length:2.382,width:1.134,qty:37,price:null}
]);
// Entradas largo/ancho medidos sobre el plano de una sola superficie despejada.
// La separación se aplica ENTRE módulos. El margen se aplica por los cuatro lados.
export function roofCapacity(roofLength,roofWidth,margin,gap,panel){
  const L=Math.max(0,roofLength-2*margin),W=Math.max(0,roofWidth-2*margin);
  const fit=(pl,pw)=>Math.max(0,Math.floor((L+gap)/(pl+gap)))*Math.max(0,Math.floor((W+gap)/(pw+gap)));
  const portrait=fit(panel.length,panel.width),landscape=fit(panel.width,panel.length);
  return {count:Math.max(portrait,landscape),orientation:portrait>=landscape?'Vertical':'Horizontal',usableArea:L*W,usableLength:L,usableWidth:W};
}
export function evaluateCatalog({consumption,sun,pr,roofLength,roofWidth,margin,gap}){
  if(![consumption,sun,pr,roofLength,roofWidth,margin,gap].every(Number.isFinite)||consumption<=0||sun<=0||pr<=0||roofLength<=0||roofWidth<=0||margin<0||gap<0)throw new Error('Datos fuera de rango.');
  return PANEL_CATALOG.map(panel=>{
    const target=Math.ceil((consumption/60)/(sun*pr)*(1000/panel.w));
    const capacity=roofCapacity(roofLength,roofWidth,margin,gap,panel);
    const installed=Math.min(target,capacity.count);
    const pallets=installed>0?Math.ceil(installed/panel.qty):0;
    const bought=pallets*panel.qty;
    const surplus=bought-installed;
    const generated=installed*panel.w/1000*sun*pr*60;
    return {...panel,target,fit:capacity.count,orientation:capacity.orientation,installed,pallets,bought,surplus,generated,meetsGoal:installed>=target,occupancy:installed*panel.length*panel.width,procurementCost:panel.price===null?null:panel.price*pallets};
  }).sort((a,b)=>{
    // Primero que cubra el objetivo con los módulos instalables; luego menor
    // costo del pedido completo, finalmente menos sobrantes y más producción.
    const k=(x)=>[x.fit>0?0:1,x.meetsGoal?0:1,x.procurementCost===null?1:0,x.procurementCost??Number.MAX_SAFE_INTEGER,x.surplus,-x.generated];
    const aa=k(a),bb=k(b);for(let i=0;i<aa.length;i++){if(aa[i]!==bb[i])return aa[i]-bb[i]}return 0;
  });
}
