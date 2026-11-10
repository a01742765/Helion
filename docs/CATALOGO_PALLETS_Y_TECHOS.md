# HELION Solar — Catálogo por pallet y cálculo de techos (v2.2)

**Fuente comercial:** capturas de productos aportadas el 10 de noviembre de 2026. Precios listados en MXN por pallet **más IVA**, sin envío ni verificación de stock; **NO son cotizaciones vigentes automáticas**. El modelo LEAPTON 630 W no tiene precio visible.

**Dimensiones:** datos preliminares de referencia empleados para comparar; verificar contra la ficha técnica específica del fabricante de cada SKU antes de vender, montar o determinar superficie real.

## Geometría

Se recibe un rectángulo libre y continuo (largo y ancho medidos sobre el plano de la cubierta, sin obstáculos). Se resta por los cuatro lados el margen configurable; se aplica una separación entre módulos.

Para cada orientación: `filas=floor((largo útil + separación)/(largo panel + separación))`, `columnas=floor((ancho útil + separación)/(ancho panel + separación))`, `caben=filas × columnas`. Se compara con la orientación girada. No comprueba resistencia del techo, viento, sombras horarias, inclinación de racks, caminos, varias pendientes, torres, chimeneas ni reglas locales.

## Compras

`paneles_necesarios = ceil((consumo_bimestral/60)/(HSP×PR)×(1000/potencia_módulo_W))`. `paneles_a_instalar=min(necesarios,caben)`. `pallets_comprados=ceil(paneles_a_instalar/piezas_por_pallet)`; `sobrantes=pallets_comprados×piezas_por_pallet−paneles_a_instalar`. Nunca se presupuestan piezas sueltas. La capacidad real por configuraciones de strings, curvas del inversor y normativa debe verificarse.

Recomendación automática: primero se eligen modelos que caben y cubren la meta energética; de ellos se selecciona el de menor costo referencial por pedido de pallets completos. En caso de no poder cubrir la meta se indica explícitamente. Los modelos sin precio quedan en la tabla para cotización, pero no lideran una recomendación cuando existe una opción con precio.

Los clientes pequeños pueden requerir adquirir un pallet entero aunque instalen muy pocos módulos: HELION advierte los sobrantes; no debe presentarse como alternativa económicamente óptima frente a comprar unidades con otro distribuidor.
