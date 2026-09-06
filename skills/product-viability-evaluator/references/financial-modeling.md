# Modelado financiero y retorno sobre el tiempo

## Reglas de modelado

1. Separa inputs `FACT`, `ESTIMATE` y `ASSUMPTION`.
2. Usa una moneda, período, geografía y base impositiva por modelo.
3. Prefiere rangos y análisis de sensibilidad sobre precisión puntual sin respaldo.
4. Distingue ingreso, utilidad bruta, utilidad de contribución, utilidad operativa y flujo de caja.
5. No calcules LTV cuando el comportamiento de churn/retención es desconocido sin etiquetarlo como supuesto.
6. Ajusta el modelo al negocio. Las fórmulas de suscripción no encajan en marketplaces, proyectos, hardware o negocios de publicidad sin adaptación.

## Fórmulas centrales de suscripción

- `MRR = paying_customers x monthly_ARPU`
- `ARR = MRR x 12`
- `gross_profit = revenue - COGS`
- `gross_margin_pct = gross_profit / revenue x 100`
- `contribution_profit = revenue - variable_costs - variable_support - payment_fees - variable_sales_cost`
- `CAC = acquisition_spend / new_customers`, incluyendo mano de obra de ventas atribuible cuando es material
- `monthly_logo_churn = lost_customers / starting_customers`
- LTV simple de churn constante: `ARPU x gross_margin_ratio / monthly_churn`
- El LTV por ingreso puede requerir contribución de margen bruto por cohorte en lugar de logo churn.
- `LTV_CAC = LTV / CAC`
- `CAC_payback_months = CAC / monthly_gross_profit_per_customer`

Declara que el modelo simple de LTV es inestable cuando el churn es bajo, las cohortes son jóvenes, la expansión es material, los contratos son anuales o la retención no es geométrica. Prefiere la contribución de cohorte observada cuando esté disponible.

## Otros modelos

Marketplace:

- `GMV = transactions x average_order_value`
- `net_revenue = GMV x take_rate`
- resta incentivos, pérdidas de pago, refunds, fraude, soporte y adquisición en ambos lados.

E-commerce y hardware:

- la contribución por pedido/unidad incluye landed cost, empaque, fulfillment, comisiones de pago, devoluciones/garantía esperadas, descuentos y soporte variable.
- incluye ciclo de caja de inventario, cantidades mínimas de pedido, certificación y riesgo de write-off.

Agencia/servicio:

- `gross_margin = revenue - delivery_labor - subcontractors - delivery tools`
- incluye utilización facturable, bench time, tiempo de venta del fundador, rework, scope creep y demora de cobranza.

API o IA basada en uso:

- modela ingreso y costo por tier de uso;
- incluye llamadas de modelo/API, reintentos, latencia de inferencia, almacenamiento, egress, abuso, free tier, soporte y cambios de precio del proveedor;
- testea el margen bruto en percentiles de uso intensivo, no solo en el uso promedio.

Herramienta interna:

- el beneficio anual incluye horas de mano de obra evitadas, errores reducidos, ciclo más rápido, reducción de riesgo o costo de software evitado;
- resta implementación, entrenamiento, integración, mantenimiento y pérdida de adopción;
- reporta payback y ahorro neto anual en lugar de MRR.

## Tres escenarios

Usa `pessimistic`, `base` y `optimistic`, todos plausibles. Para cada uno muestra:

- horizonte de tiempo y cantidad de clientes;
- precio/ARPU e ingreso;
- volumen de adquisición, CAC y ciclo de venta cuando aplique;
- supuesto de churn o retención;
- COGS y margen bruto;
- costos operativos fijos;
- utilidad de contribución y operativa ganancia/pérdida;
- capital único requerido y timing de caja;
- horas del fundador/equipo en desarrollo, ventas, marketing, soporte y administración;
- retorno por hora y tiempo hasta el break-even.

El caso optimista debe permanecer restringido por capacidad. No puede asumir simultáneamente mejor caso de conversión, retención, precio, costo y velocidad sin evidencia.

## Retorno sobre el tiempo

Reporta al menos:

- horas de build hasta el próximo hito de decisión;
- horas totales hasta el primer ingreso;
- horas mensuales del fundador en marcha;
- utilidad de contribución u operativa mensual;
- `cash_return_per_ongoing_hour = monthly_profit / monthly_founder_hours`;
- `economic_return_per_hour = (monthly_profit - founder_time_cost) / monthly_founder_hours` cuando existe una tasa de costo de oportunidad;
- payback del tiempo de build y del capital invertido;
- tiempo esperado hasta el ingreso objetivo.

No dividas por cero. Un producto que parece pasivo a menudo esconde soporte, ventas, cumplimiento y mantenimiento; inclúyelos.

## Costo de oportunidad del fundador

Compara contra la alternativa creíble del fundador, no contra un salario máximo abstracto. Incluye:

- ingreso pre-impuesto o post-impuesto sacrificado de forma consistente;
- aprendizaje, red, opciones estratégicas o beneficios de estilo de vida perdidos cuando son materiales;
- downside y reversibilidad;
- probabilidad y timing de los retornos.

Para comparaciones de proyectos, calcula valor esperado ajustado por riesgo solo cuando las probabilidades de escenario se provean explícitamente o se estimen de forma defendible. Si no, muestra los rangos de escenario sin valores esperados falsos.

## Análisis de sensibilidad

Testea las variables con más probabilidad de cambiar el veredicto:

- precio o ARPU;
- conversión;
- CAC y ciclo de venta;
- churn/retención;
- margen bruto y costo de IA/API;
- horas de soporte;
- tiempo hasta el lanzamiento;
- cantidad de clientes alcanzable;
- requerimiento de capital.

Identifica umbrales de break-even, por ejemplo el CAC máximo viable, los clientes retenidos mínimos, el precio mínimo o las horas máximas de soporte. Esto es más útil para la decisión que un pronóstico único.

## Salvedades de impuestos y finanzas

Muestra cifras pre-impuestos salvo que se conozcan jurisdicción, entidad, costos deducibles y tratamiento impositivo. Etiqueta financiamiento, depreciación, capital de trabajo, refunds, chargebacks e IVA/impuesto a las ventas cuando corresponda. No presentes este análisis como asesoría contable, impositiva o de inversión.