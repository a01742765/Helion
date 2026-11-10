# HELION Solar — v2.1 · Cotizador didáctico y ecosistema HELION

Landing inmersiva original HELION con capítulo de dimensionamiento preliminar, lista completa de equipos y directorio de proveedores en México. Conserva el estilo y la identidad HELION; vincula al proyecto [HELION Atlas](https://a01742765.github.io/Helion-Atlas-Electrico/).

## Nuevo en v2.1

- Selección **interconectado / híbrido / aislado**, con explicaciones técnicas sencillas.
- **Estimador preliminar** de número de paneles, kWp, generación estimada y batería cuando aplica.
- **Lista de materiales (BOM)** con paneles, inversor, estructura, cableado, conectores, protecciones, puesta a tierra, monitoreo, ingeniería, instalación, baterías y respaldo según modalidad.
- Casillas para **introducir precios reales** y total parcial o completo. Sin precios inventados ni cotización automática de proveedores.
- Exportar la lista en **CSV** y usar **Imprimir → Guardar PDF** desde el navegador.
- Guía del medidor de interconexión y enlaces a fuentes CNE/CFE/DOF y mayoristas verificados.
- Sin servidor ni dependencias externas de JavaScript.

## Archivos modificados

- `index.html` y `script.js` (navegación).
- `cotizador.css` (visual responsiva), `cotizador.js` (calculadora y BOM).
- `docs/COTIZADOR_METODOLOGIA.md` (fórmulas, fuentes, condiciones y limitaciones).
- Los recursos y animaciones de v2.0 permanecen iguales.

## Probar

Abrir esta carpeta en VS Code y ejecutar `python -m http.server 8000` (en Windows también `py -m http.server 8000` si está disponible); visitar `http://localhost:8000/#cotizador`.

Verificar las tres modalidades, cantidades y exportación. Pruebas iniciales orientativas:
- Consumo bimestral 600 kWh, 550 W, 4.5 HSP, PR 0.8: 6 paneles, 3.30 kWp, 712.8 kWh en 60 días.
- Híbrido, 1500 W críticos durante 4 h: 7.84 kWh nominales y 2 módulos orientativos de 5.12 kWh.
- Aislado con 1 día autonomía: 13.07 kWh nominales y 3 módulos orientativos.

**No es un proyecto constructivo ni una cotización comercial.** No se ha subido a GitHub.
