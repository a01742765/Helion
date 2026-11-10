# HELION Solar v2.1 — Investigación, cotizador preliminar y proveedores

**Corte de consulta:** 10 de noviembre de 2026. Producto académico de aprendizaje; no es cotización oficial ni ingeniería de instalación.

## Tipos de sistema

- **Interconectado (on-grid):** generador FV, inversor compatible con interconexión, estructura, cableado, protecciones AC/DC, tierra física, monitoreo, documentación y medidor de la distribuidora conforme a contrato. **Sin baterías obligatorias.** Un inversor interconectado convencional deja de alimentar las cargas ante pérdida de red.
- **Híbrido:** interconectado más baterías compatibles con inversor, BMS, protecciones de batería, circuito de cargas críticas y transferencia según especificación. Debe verificarse que el equipo ofrezca salida de respaldo: no todo inversor “híbrido” funciona como UPS.
- **Aislado:** baterías o respaldo según análisis de autonomía, regulador MPPT si no está integrado, inversor aislado, protecciones, distribución, cableado, estructura y puesta en marcha. No exige medición bidireccional si no hay conexión a red.

## Dimensionamiento simplificado del prototipo

- Consumo diario promedio = `consumo_bimestral_kWh/60` (se usa un bimestre didáctico de 60 días, no cada fecha real de facturación).
- Potencia FV kWp estimada = `consumo_diario/(horas_solares_pico * PR)`, donde PR es un factor de rendimiento global, no una constante universal.
- Número de módulos = `ceil(potencia_FV_kW * 1000/potencia_modulo_W)`.
- Generación demostrativa = `n_modulos * W_modulo / 1000 * HSP * PR * 60` kWh.
- Inversor: referencia orientativa >= `max(kWp_FV/1.2, kW_cargas_criticas)` redondeada hacia arriba en décimas. **No valida** rangos MPPT, tensiones, fase, corrientes, sobredimensionamiento permitido, protecciones ni capacidades comerciales.
- Almacenamiento híbrido nominal = `(W_cargas_criticas/1000 * horas_respaldo) / (0.85 * 0.90)`, usando DoD y eficiencia **demostrativos**, no datos de producto.
- Almacenamiento aislado nominal = `(consumo_diario * dias_autonomia)/(0.85 * 0.90)`. Este resultado **no sustituye** el análisis del mes desfavorable y de arranques.
- Conteo ilustrativo de módulos de batería = `ceil(kWh_nominal / 5.12 kWh)`, que **no garantiza compatibilidad**.

Todos los parámetros deben revisarse con registros de radiación local (por ejemplo, fuente meteorológica/PVGIS o equivalente, con ubicación y orientación), perfil horario de carga, tejas/cubierta, sombras, tarifas, fases, contrato y ficha técnica. La energía generada no equivale automáticamente a energía compensada en el recibo, ni implica ahorros específicos. No se calculan ahorros financieros ni ROI sin tarifa y esquema contractual verificables.

## Presupuesto y fuentes de precios

Se generan renglones de compra y servicio para solicitar precios. Los precios **inician en blanco**; cada precio puede introducirlo el usuario tras obtener una oferta escrita. El total mostrado se marca como **parcial** hasta completar todos los renglones. Puede exportarse CSV o imprimirse el resultado. No existe integración a inventarios, ventas, descuentos, IVA ni APIs de cotización; no simular cotizaciones reales.

**Proveedores/distribuidores localizados (no patrocinados):**

| Proveedor | Catálogo / alcance documentado | Fuente |
|---|---|---|
| Exel Solar | Paneles, inversores, almacenamiento, medidores, protecciones, estructuras, suministros, cotizaciones para canal profesional | https://www.exelsolar.mx/ |
| SYSCOM Solar | Paneles, inversores, BESS, cableado, estructuras, protecciones, calculador de materiales | https://www.syscom.mx/p/syscom-solar y https://www.syscom.mx/calculadoras/calculador_solar |
| Solar Center | Paneles, inversores, microinversores, monitoreo, estructuras, almacenamiento y accesorios | https://ecommerce.solar-center.mx/ |
| Krannich Solar | Distribución para profesionales de equipos y accesorios FV, identificada por fabricantes | https://mx.sungrowpower.com/distributorsresidential |

Para una **cotización final** pedir al integrador: número y modelo exacto de paneles e inversor(es), voltaje/corriente de strings, baterías (si aplica), BMS, estructura/anclajes, protecciones DC/AC, SPD, tierra física, acometida/tablero, medidor e interconexión, diagrama unifilar, instalación, envío, IVA, garantías, seguimiento y fecha de vigencia. Las cotizaciones de un mayorista no son precio instalado a usuario final.

## Medición, interconexión y seguridad

- CNE: información sobre generación distribuida y esquemas de contraprestación (`Net Metering`, `Net Billing`). Los contratos de interconexión y contraprestación **no tienen costo de celebración** según la CNE. La gestión comercial de un instalador podría cobrarse aparte. https://www.gob.mx/cne/es/articulos/preguntas-frecuentes-sobre-generacion-distribuida-406238
- Contrato modelo de CFE: obligaciones de la distribuidora respecto al medidor para instalaciones asociadas a suministro, según las condiciones del contrato. https://www.cfe.gob.mx/hogar/nuevocontrato/Fotovoltaico%20para%20hogar/Modelo%20de%20contrato%20de%20interconexiones%20a%20las%20RGD.pdf
- CFE: requisitos de solicitud (croquis, unifilar, ficha técnica, certificado de inversor, recibo, etc.) https://www.cfe.gob.mx/hogar/infcliente/Documents/contratacionconinterconexion.pdf
- NOM-001-SEDE-2012 en el catálogo oficial de normalización (registrada como vigente en la consulta): https://platiica.economia.gob.mx/normalizacion/nom-001-sede-2012/ ; artículo 690: https://sidof.segob.gob.mx/notas/docFuente/5280619

**Precisión:** un medidor registra importación/exportación, pero el inversor y la instalación gestionan la inyección y la seguridad. No comprar ni instalar un medidor por cuenta propia como sustituto de la medición oficial. Trámite, configuración y esquema de contraprestación dependen de la distribuidora y la normativa aplicable.

## Limitaciones conocidas

1. No usa datos horarios ni radiación real de una ubicación particular, y el periodo de 60 días es una simplificación.
2. La selección de panel, inversor y batería es dimensional, no una validación comercial ni de compatibilidad.
3. No determina interruptores, calibres, protecciones, strings ni acometidas: requiere ingeniería profesional.
4. No incluye precios actuales de comercio, garantías o disponibilidad; se solicitan directamente a proveedores.
5. No promete respaldo total, ahorros específicos, compensación de excedentes ni aprobación CFE.
6. No se ingresan datos personales ni se envían formularios a servidores externos; exportación y cálculos son locales en el navegador.
