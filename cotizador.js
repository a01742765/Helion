(() => {
  'use strict';
  const form = document.getElementById('planner-form');
  if (!form) return;
  const $ = (id) => document.getElementById(id);
  const fmt = (n, digits = 0) => Number(n).toLocaleString('es-MX', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const money = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
  const quoteInputs = new Map();
  const maxAllowed = { 'p-consumption': 25000, 'p-module-w': 800, 'p-sun': 8, 'p-pr': 0.95, 'p-critical-w': 20000, 'p-backup-hours': 72, 'p-offgrid-days': 5 };
  let latestRows = [];
  let latestSummary = null;
  let latestSystem = 'on-grid';

  const getNumber = (id) => {
    const el = $(id);
    const val = Number(el.value);
    const min = Number(el.min || 0);
    if (!Number.isFinite(val) || val < min || val > maxAllowed[id] || el.value.trim() === '') throw new Error(`Revisa el valor de «${el.closest('label')?.firstChild?.textContent?.trim() || id}».`);
    return val;
  };

  const modeText = { 'on-grid': 'Sistema interconectado', hybrid: 'Sistema híbrido', 'off-grid': 'Sistema aislado' };
  const chooseMode = () => document.querySelector('input[name="planner-mode"]:checked')?.value || 'on-grid';

  function makeRows(mode, count, batteryCount, inverterKw) {
    const lines = [
      ['panels', 'Panel fotovoltaico', `Módulos de potencia indicada en la calculadora; confirmar modelo y voltajes Voc/Vmp`, count, 'pieza'],
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
      const moduleW = getNumber('p-module-w');
      const sun = getNumber('p-sun');
      const pr = getNumber('p-pr');
      // Diseño preliminar: promedio energético en 60 días, no simulación meteorológica.
      const daily = consumption / 60;
      const panels = Math.ceil((daily / (sun * pr)) * (1000 / moduleW));
      const kwp = panels * moduleW / 1000;
      const produced = kwp * sun * pr * 60;
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
      latestSummary = { mode, consumption, moduleW, sun, pr, panels, kwp, produced, batteryNeeded, batteryModules, inverterKw };
      $('p-result-title').textContent = modeText[mode];
      $('p-panels').textContent = fmt(panels);
      $('p-kwp').textContent = fmt(kwp, 2);
      $('p-gen').textContent = fmt(Math.round(produced));
      $('p-battery').textContent = mode === 'on-grid' ? 'No requiere' : fmt(batteryNeeded, 2);
      $('p-path-arrow').textContent = mode === 'off-grid' ? '↔' : '↔';
      $('p-path-last').innerHTML = mode === 'off-grid' ? '▤ <small>Batería</small>' : mode === 'hybrid' ? '▤ <small>Batería + red</small>' : '⇄ <small>Red CFE</small>';
      $('p-overview').textContent = `${fmt(panels)} paneles de ${fmt(moduleW)} W suman ${fmt(kwp, 2)} kWp. La referencia de inversor es ≥ ${fmt(inverterKw, 1)} kW AC; debe definirse con la curva de cargas, características de los módulos, servicio eléctrico y fichas técnicas. La generación estimada (${fmt(Math.round(produced))} kWh/60 días) supone las horas solares y pérdidas indicadas; no garantiza ese resultado ni el ahorro en el recibo.`;
      $('p-alert').textContent = mode === 'on-grid'
        ? 'No necesitas batería para un sistema interconectado convencional. El medidor de la distribuidora permite registrar los intercambios autorizados con la red; debes tramitar interconexión y contraprestación. Sin sistema de respaldo diseñado para ello, un apagón desconecta la generación.'
        : mode === 'hybrid'
          ? `El cálculo energético exige ≈ ${fmt(batteryNeeded, 2)} kWh nominales (${batteryModules} módulos de referencia de 5.12 kWh), para la potencia y horas de cargas críticas que ingresaste. La autonomía real depende de picos, profundidad de descarga, temperatura, BMS y transferencia. La interconexión requiere el trámite correspondiente.`
          : `Se estiman ≈ ${fmt(batteryNeeded, 2)} kWh nominales (${batteryModules} módulos de referencia de 5.12 kWh) para la autonomía seleccionada. Un sistema aislado exige análisis de peor mes solar, días nublados, picos de arranque y respaldo adicional; el consumo bimestral por sí solo no basta para el diseño definitivo.`;
      $('planner-error').hidden = true;
      drawRows(makeRows(mode, panels, batteryModules, inverterKw));
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

  const csvEscape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  $('p-download').addEventListener('click', () => {
    if (!latestSummary) calculate();
    if (!latestSummary) return;
    const rows = [
      ['HELION Solar · Listado para solicitar cotización · NO OFERTA COMERCIAL'],
      ['Configuración', modeText[latestSystem]],
      ['Paneles', latestSummary.panels, 'unidades'],
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
    rows.push(['Nota', 'No incluye precios automáticos ni respaldo de tarifas CFE. Ingeniería y cotización formal pendientes.']);
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
