import { PANEL_CATALOG, evaluateCatalog } from './catalogo-paneles.mjs';
(() => {
  'use strict';
  const form = document.getElementById('planner-form');
  if (!form) return;
  const $ = (id) => document.getElementById(id);
  const fmt = (n, digits = 0) => Number(n).toLocaleString('es-MX', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const money = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
  const quoteInputs = new Map();
  const maxAllowed = { 'p-consumption': 25000, 'p-module-w': 800, 'p-sun': 8, 'p-pr': 0.95, 'p-critical-w': 20000, 'p-backup-hours': 72, 'p-offgrid-days': 5, 'p-roof-length':100, 'p-roof-width':100, 'p-margin':5, 'p-gap':1 };
  let latestRows = [];
  let latestSummary = null;
  let latestSystem = 'on-grid';
  PANEL_CATALOG.forEach(p=>{$('p-model').add(new Option(`${p.brand} ${p.w} W · ${p.qty} pzas/pallet`,p.id))});

  const getNumber = (id) => {
    const el = $(id);
    const val = Number(el.value);
    const min = Number(el.min || 0);
    if (!Number.isFinite(val) || val < min || val > maxAllowed[id] || el.value.trim() === '') throw new Error(`Revisa el valor de «${el.closest('label')?.firstChild?.textContent?.trim() || id}».`);
    return val;
  };

  const modeText = { 'on-grid': 'Sistema interconectado', hybrid: 'Sistema híbrido', 'off-grid': 'Sistema aislado' };
  const chooseMode = () => document.querySelector('input[name="planner-mode"]:checked')?.value || 'on-grid';

  function makeRows(mode, count, batteryCount, inverterKw, selected) {
    const lines = [
      ['panels', `Pallet de módulos ${selected.brand} ${selected.w} W`, `${selected.model}; ${selected.qty} unidades por pallet · instalar ${count}; sobrantes ${selected.surplus}; validar Voc/Vmp y disponibilidad`, selected.pallets, 'pallet'],
      ['inverter', mode === 'on-grid' ? 'Inversor de interconexión / microinversores' : mode === 'hybrid' ? 'Inversor híbrido con salida de respaldo' : 'Inversor/cargador aislado', `1 conjunto orientativo; referencia de salida AC ≥ ${fmt(inverterKw, 1)} kW, sujeto a validación`, 1, 'conjunto'],
      ['mount', 'Estructura, rieles, anclajes y sellado', 'Para el tipo de cubierta y condiciones de viento del inmueble', 1, 'lote'],
      ['dcp', 'Protecciones y seccionamiento DC', 'Fusibles, interruptores, combinadora y SPD según topología / ficha técnica', 1, 'lote'],
      ['acp', 'Protecciones y seccionamiento AC', 'Interruptores, SPD y medios de desconexión conforme a ingeniería', 1, 'lote'],
      ['wire', 'Cable fotovoltaico y cableado AC', 'Longitudes y calibres según recorrido, tensión y condiciones reales', 1, 'lote'],
      ['connectors', 'Conectores y canalizaciones', 'Conectores compatibles, conduit, cajas y terminaciones', 1, 'lote'],
      ['earth', 'Puesta a tierra y equipotencialidad', 'Dimensionamiento y cumplimiento de norma por instalador', 1, 'lote'],
      ['monitor', 'Monitoreo y comunicaciones', 'Compatible con el inversor seleccionado; confirmar licencias', 1, 'sistema'],
      ['engineering', 'Visita, ingeniería y diseño unifilar', 'Incluye revisión de techumbre, tablero, fases y sombras', 1, 'servicio'],
      ['install', 'Montaje, pruebas y puesta en marcha', 'Personal competente, verificación y documentación', 1, 'servicio'],
    ];
    if (mode !== 'on-grid') {
      lines.splice(2, 0, ['battery', 'Batería LiFePO₄ y BMS compatible', 'Referencia de módulo 5.12 kWh; validar capacidad utilizable, comunicación y corrientes', batteryCount, 'módulo']);
      lines.splice(3, 0, ['battery-protection', 'Protecciones y cableado de batería', 'Fusibles y seccionamiento según fabricante, no usar diseño genérico', 1, 'lote']);
      if (mode === 'hybrid') lines.splice(4, 0, ['backup', 'Tablero de cargas críticas y transferencia', 'Circuitos de respaldo y conmutación según especificación del inversor', 1, 'lote']);
      if (mode === 'off-grid') lines.splice(4, 0, ['charge', 'Controlador MPPT (si no está integrado)', 'Cotizar por separado solo si el inversor no incluye controlador compatible', 1, 'revisar']);
    }
    if (mode !== 'off-grid') lines.push(['cfe', 'Servicio de gestión y documentación de interconexión', 'Precio opcional del instalador; los contratos oficiales no tienen costo por sí mismos', 1, 'servicio']);
    return lines.map(([id, name, desc, qty, unit]) => ({ id, name, desc, qty, unit }));
  }

  function refreshTotal() {
    let total = 0;
    let priced = 0;
    for (const row of latestRows) {
      const input = document.querySelector(`[data-price-id="${row.id}"]`);
      const raw = input?.value?.trim() ?? '';
      if (raw) {
        const price = Number(raw);
        if (Number.isFinite(price) && price >= 0) {
          quoteInputs.set(row.id, raw);
          const subtotal = row.qty * price;
          const cell = document.querySelector(`[data-total-id="${row.id}"]`);
          if (cell) cell.textContent = money(subtotal);
          total += subtotal;
          priced++;
          continue;
        }
      } else quoteInputs.delete(row.id);
      const cell = document.querySelector(`[data-total-id="${row.id}"]`);
      if (cell) cell.textContent = 'Pendiente';
    }
    const complete = priced === latestRows.length && latestRows.length > 0;
    $('p-total-info').textContent = complete ? 'Total de renglones ingresados · validar IVA, envíos y condiciones' : `${priced} de ${latestRows.length} conceptos con precio · falta cotización`;
    $('p-total').textContent = complete ? money(total) : `Parcial ${money(total)} · NO final`;
    $('p-total').dataset.complete = String(complete);
    return { total, complete, priced };
  }

  function drawRows(rows) {
    latestRows = rows;
    $('p-items').replaceChildren();
    rows.forEach((row) => {
      const tr = document.createElement('tr');
      const title = document.createElement('td');
      const strong = document.createElement('strong');
      strong.textContent = row.name;
      const small = document.createElement('small');
      small.textContent = row.desc;
      title.append(strong, small);
      const qty = document.createElement('td');
      qty.textContent = `${fmt(row.qty)} ${row.unit}`;
      const priceCell = document.createElement('td');
      const inp = document.createElement('input');
      inp.type = 'number'; inp.min = '0'; inp.max = '100000000'; inp.step = '0.01';
      inp.inputMode = 'decimal'; inp.placeholder = 'Por cotizar';
      inp.dataset.priceId = row.id;
      inp.setAttribute('aria-label', `Precio unitario MXN de ${row.name}`);
      inp.value = quoteInputs.get(row.id) ?? '';
      inp.addEventListener('input', refreshTotal);
      priceCell.append(inp);
      const subtotal = document.createElement('td');
      subtotal.dataset.totalId = row.id;
      subtotal.textContent = 'Pendiente';
      tr.append(title, qty, priceCell, subtotal);
      $('p-items').append(tr);
    });
    refreshTotal();
  }

  function calculate(event) {
    if (event) event.preventDefault();
    try {
      const mode = chooseMode();
      const consumption = getNumber('p-consumption');
      const sun = getNumber('p-sun');
      const pr = getNumber('p-pr');
      const roofLength = getNumber('p-roof-length');
      const roofWidth = getNumber('p-roof-width');
      const margin = getNumber('p-margin');
      const gap = getNumber('p-gap');
      const candidates = evaluateCatalog({consumption,sun,pr,roofLength,roofWidth,margin,gap});
      const chosenId = $('p-model').value;
      const selected = chosenId === 'auto' ? (candidates.find(c=>c.fit>0 && c.price!==null) || candidates.find(c=>c.fit>0)) : candidates.find(c=>c.id===chosenId);
      if (!selected || !selected.installed) throw new Error('Ningún módulo cabe en el área despejada. Revisa largo/ancho/márgenes.');
      const panels = selected.installed;
      const moduleW = selected.w;
      $('p-module-w').value = moduleW;
      const kwp = panels * moduleW / 1000;
      const produced = selected.generated;
      // Consumo medio a 60 días, dimensiones de referencia y pedido solo por pallet.
      let criticalW = 0;
      let batteryNeeded = 0;
      let batteryModules = 0;
      if (mode !== 'on-grid') {
        criticalW = getNumber('p-critical-w');
        if (mode === 'hybrid') batteryNeeded = ((criticalW / 1000) * getNumber('p-backup-hours')) / (0.85 * 0.9);
        else batteryNeeded = (daily * getNumber('p-offgrid-days')) / (0.85 * 0.9);
        batteryModules = Math.ceil(batteryNeeded / 5.12);
      }
      // Sólo una referencia de categoría comercial, sin validar compatibilidad eléctrica de un modelo.
      const inverterKw = Math.ceil(Math.max(kwp / 1.20, criticalW / 1000) * 10) / 10;
      latestSystem = mode;
      latestSummary = { mode, consumption, moduleW, sun, pr, panels, kwp, produced, batteryNeeded, batteryModules, inverterKw, selected, roofLength, roofWidth, margin, gap };
      $('p-result-title').textContent = modeText[mode];
      const netL = Math.max(0,roofLength-2*margin),netW=Math.max(0,roofWidth-2*margin);
      $('p-roof-result').textContent = `${fmt(netL,2)} × ${fmt(netW,2)} m útiles (${fmt(netL*netW,1)} m²). Con ${selected.brand} ${selected.w} W caben hasta ${selected.fit} paneles en orientación ${selected.orientation.toLowerCase()} y se instalarían ${panels}.`;
      $('p-pallet-result').textContent = `Comprar ${selected.pallets} pallet(s) de ${selected.qty} paneles cada uno: ${selected.bought} adquiridos, ${selected.surplus} sobrantes. ${selected.meetsGoal?'Meta de consumo estimada cubierta.':'ATENCIÓN: el techo no permite cubrir toda la meta con este modelo.'} ${selected.price!==null?'Costo referencial de módulos '+money(selected.procurementCost)+' + IVA; sin flete ni instalación.':'Precio de pallet pendiente de proveedor.'}`;
      const tbody=$('p-catalog-body');tbody.replaceChildren();
      for(const c of candidates){
        const tr=document.createElement('tr');if(c.id===selected.id)tr.className='is-recommended';
        const fields=[`${c.brand} ${c.model} · ${c.qty}/pallet`,c.price===null?'Por cotizar':money(c.price),fmt(c.length*c.width,2),String(c.w),String(c.fit),`${c.installed} / ${c.pallets} pallet(s) · sobran ${c.surplus}`,c.fit===0?'No cabe':c.meetsGoal?'Cubre meta':'No cubre meta'];
        fields.forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.append(td)});tbody.append(tr);
      }
      $('p-panels').textContent = fmt(panels);
      $('p-kwp').textContent = fmt(kwp, 2);
      $('p-gen').textContent = fmt(Math.round(produced));
      $('p-battery').textContent = mode === 'on-grid' ? 'No requiere' : fmt(batteryNeeded, 2);
      $('p-path-arrow').textContent = mode === 'off-grid' ? '↔' : '↔';
      $('p-path-last').innerHTML = mode === 'off-grid' ? '▤ <small>Batería</small>' : mode === 'hybrid' ? '▤ <small>Batería + red</small>' : '⇄ <small>Red CFE</small>';
      $('p-overview').textContent = `${fmt(panels)} paneles instalados (${selected.brand} ${selected.model}) de ${fmt(moduleW)} W suman ${fmt(kwp, 2)} kWp. La referencia de inversor es ≥ ${fmt(inverterKw, 1)} kW AC; debe definirse con la curva de cargas, características de los módulos, servicio eléctrico y fichas técnicas. La generación estimada (${fmt(Math.round(produced))} kWh/60 días) supone las horas solares y pérdidas indicadas; no garantiza ese resultado ni el ahorro en el recibo.`;
      $('p-alert').textContent = mode === 'on-grid'
        ? 'No necesitas batería para un sistema interconectado convencional. El medidor de la distribuidora permite registrar los intercambios autorizados con la red; debes tramitar interconexión y contraprestación. Sin sistema de respaldo diseñado para ello, un apagón desconecta la generación.'
        : mode === 'hybrid'
          ? `El cálculo energético exige ≈ ${fmt(batteryNeeded, 2)} kWh nominales (${batteryModules} módulos de referencia de 5.12 kWh), para la potencia y horas de cargas críticas que ingresaste. La autonomía real depende de picos, profundidad de descarga, temperatura, BMS y transferencia. La interconexión requiere el trámite correspondiente.`
          : `Se estiman ≈ ${fmt(batteryNeeded, 2)} kWh nominales (${batteryModules} módulos de referencia de 5.12 kWh) para la autonomía seleccionada. Un sistema aislado exige análisis de peor mes solar, días nublados, picos de arranque y respaldo adicional; el consumo bimestral por sí solo no basta para el diseño definitivo.`;
      $('planner-error').hidden = true;
      quoteInputs.delete('panels');
      if (selected.price!==null) quoteInputs.set('panels',String(selected.price));
      drawRows(makeRows(mode, panels, batteryModules, inverterKw, selected));
    } catch (error) {
      $('planner-error').textContent = error.message || 'Revisa los datos ingresados.';
      $('planner-error').hidden = false;
    }
  }

  document.querySelectorAll('input[name="planner-mode"]').forEach((input) => {
    input.addEventListener('change', () => {
      const mode = chooseMode();
      document.querySelectorAll('.planner-system-card').forEach((card) => card.classList.toggle('is-selected', card.querySelector('input')?.checked));
      $('planner-backup-fields').hidden = mode === 'on-grid';
      $('p-hours-wrap').hidden = mode !== 'hybrid';
      $('p-days-wrap').hidden = mode !== 'off-grid';
      calculate();
    });
  });
  form.addEventListener('submit', calculate);
  $('p-model').addEventListener('change',calculate);

  const csvEscape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  $('p-download').addEventListener('click', () => {
    if (!latestSummary) calculate();
    if (!latestSummary) return;
    const rows = [
      ['HELION Solar · Listado para solicitar cotización · NO OFERTA COMERCIAL'],
      ['Configuración', modeText[latestSystem]],
      ['Modelo comercial', latestSummary.selected.model],
      ['Compra mínima', latestSummary.selected.pallets, 'pallet(s)'],
      ['Paneles comprados', latestSummary.selected.bought, 'unidades'],
      ['Paneles sobrantes', latestSummary.selected.surplus, 'unidades'],
      ['Área despejada del techo', `${latestSummary.roofLength} × ${latestSummary.roofWidth}`, 'm'],
      ['Margen por borde', latestSummary.margin, 'm'],
      ['Separación entre módulos', latestSummary.gap, 'm'],
      ['Paneles instalados', latestSummary.panels, 'unidades'],
      ['Potencia fotovoltaica', latestSummary.kwp, 'kWp'],
      ['Generación supuesta en 60 días', Math.round(latestSummary.produced), 'kWh'],
      ['Almacenamiento calculado', latestSummary.batteryNeeded.toFixed(2), 'kWh nominales'],
      ['Concepto', 'Cantidad', 'Unidad', 'Precio unitario (MXN)', 'Subtotal (MXN)'],
    ];
    latestRows.forEach((r) => {
      const raw = quoteInputs.get(r.id) || '';
      rows.push([r.name, r.qty, r.unit, raw, raw === '' ? '' : (Number(raw) * r.qty).toFixed(2)]);
    });
    rows.push(['', '', 'El total solo es completo si todos los precios están ingresados']);
    rows.push(['Nota', 'Precio de pallet de captura de pantalla 10-nov-2026; no es oferta vigente ni incluye IVA o envío. Dimensiones referenciales sujetas a ficha técnica; verificar diseño real del techo.']);
    const body = '\ufeff' + rows.map((r) => r.map(csvEscape).join(',')).join('\r\n');
    const blob = new Blob([body], {type:'text/csv;charset=utf-8'});
    const uri = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = uri;
    anchor.download = 'HELION_lista_materiales_cotizacion.csv';
    document.body.appendChild(anchor);
    anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(uri), 1000);
  });
  $('p-print').addEventListener('click', () => window.print());
  calculate();
})();
