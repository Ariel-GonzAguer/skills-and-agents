# Perfiles de modelo de negocio y pesos adaptativos

Los pesos son hipótesis de partida, no verdad universal. Selecciona el perfil más cercano y luego mueve como máximo 5 puntos por dimensión salvo que el marco de decisión claramente requiera más. Cada conjunto final debe sumar 100 e incluir el fit del fundador.

Las dimensiones usan estos IDs estables:

- `problem`
- `customer`
- `market`
- `competition`
- `differentiation`
- `product`
- `monetization`
- `acquisition`
- `economics`
- `execution_risk`
- `founder_fit`

## Default

| Dimensión | Peso |
| --- | ---: |
| Problem | 14 |
| Customer | 9 |
| Market | 9 |
| Competition | 8 |
| Differentiation | 9 |
| Product / UX | 9 |
| Monetization / pricing | 9 |
| Acquisition | 10 |
| Economics | 10 |
| Execution risk | 6 |
| Founder fit / personal ROI | 7 |

El modelo original de diez dimensiones omitía el fit del fundador. Este perfil lo crea explícitamente y reduce levemente las dimensiones que de otro modo cuentan dos veces el atractivo.

## SaaS B2B

`problem 15, customer 11, market 7, competition 7, differentiation 8, product 7, monetization 11, acquisition 12, economics 10, execution_risk 5, founder_fit 7`

Enfócate en la separación comprador/usuario, dueño del presupuesto, ciclo de venta, procurement, onboarding, retención, expansión, churn, ACV, capacidad de venta y payback. Un producto fuerte sin una ruta creíble a los primeros 10 clientes no es viable.

## SaaS B2C y app de consumo

`problem 11, customer 7, market 9, competition 7, differentiation 8, product 12, monetization 8, acquisition 15, economics 9, execution_risk 5, founder_fit 9`

Enfócate en activación, cohortes de retención, frecuencia, hábito, loops orgánicos, política de plataforma, disposición a pagar del consumidor, CAC y soporte a ARPU bajo. Los downloads y signups son débiles sin uso retenido.

## Marketplace

`problem 10, customer 9, market 8, competition 7, differentiation 7, product 7, monetization 8, acquisition 16, economics 10, execution_risk 10, founder_fit 8`

Evalúa oferta y demanda por separado. Modela densidad geográfica/de categoría, tiempo hasta el match, tasa de fill, desintermediación, confianza, fraude, take rate y CAC en ambos lados. Un mercado grande no resuelve el cold start.

## Herramienta de desarrollador o API

`problem 13, customer 8, market 8, competition 9, differentiation 11, product 10, monetization 8, acquisition 10, economics 8, execution_risk 7, founder_fit 8`

Enfócate en tiempo ahorrado, confiabilidad, docs, esfuerzo de integración, ecosistema, distribución por comunidades o plataformas, alternativas gratuitas, costo por uso y riesgo de migración.

## Open source

`problem 12, customer 7, market 6, competition 8, differentiation 9, product 10, monetization 10, acquisition 8, economics 9, execution_risk 10, founder_fit 11`

Separa usuarios, contribuidores, sponsors y compradores. Evalúa calidad de adopción, carga del maintainer, gobernanza, licencia, concentración de contribuidores, rutas hosted/open-core/servicios, disparador de conversión y dependencia de sponsors. Las estrellas son evidencia débil sin uso activo y un camino de pago.

## Software enterprise

`problem 13, customer 11, market 6, competition 7, differentiation 8, product 7, monetization 10, acquisition 12, economics 8, execution_risk 11, founder_fit 7`

Enfócate en presupuesto, procurement, seguridad, cumplimiento, integración, servicios de implementación, referencias, data residency, SLA, ciclo de venta, costo de cambio y runway. Un fundador sin acceso o capacidad de venta enterprise enfrenta una restricción de fit seria.

## Producto de IA

Usa el perfil comercial más cercano y luego ajusta por dependencia de modelo. Típicamente aumenta `economics`, `differentiation` y `execution_risk` de 1 a 3 puntos cada uno, financiado con pesos menores en `market` o `product`. Evalúa costo de modelo, confiabilidad, latencia, evals, derechos de datos, fallback, commoditización, concentración de proveedores y si la IA crea ventaja propietaria o solo conveniencia de implementación.

## Agencia o servicio

`problem 14, customer 11, market 7, competition 7, differentiation 8, product 4, monetization 11, acquisition 14, economics 9, execution_risk 6, founder_fit 9`

Reemplaza la retención de producto por negocio repetido, referidos, utilización, capacidad de entrega, control de alcance, margen bruto después de mano de obra, dependencia del fundador y el camino de los primeros clientes a una adquisición repetible.

## E-commerce

`problem 8, customer 9, market 9, competition 10, differentiation 10, product 8, monetization 8, acquisition 14, economics 12, execution_risk 7, founder_fit 5`

Modela landed cost, inventario, devoluciones, fulfillment, margen de contribución, compra repetida, concentración de canal, ciclo de conversión de caja y fatiga creativa/clics.

## Hardware/software

`problem 12, customer 8, market 8, competition 7, differentiation 10, product 9, monetization 7, acquisition 8, economics 10, execution_risk 14, founder_fit 7`

Incluye BOM, yield de manufactura, certificación, garantía, logística, financiamiento de inventario, lead times, soporte y exposición de capital irreversible.

## Herramienta interna

`problem 17, customer 10, market 2, competition 7, differentiation 5, product 10, monetization 2, acquisition 4, economics 17, execution_risk 12, founder_fit 14`

Reemplaza el ingreso externo por mano de obra ahorrada, reducción de errores, reducción de riesgo, adopción, propiedad de mantenimiento, integración y payback. El cliente es la organización; los usuarios internos y el dueño del presupuesto pueden diferir.

## Producto de contenido o comunidad

`problem 9, customer 9, market 8, competition 8, differentiation 10, product 8, monetization 9, acquisition 15, economics 8, execution_risk 5, founder_fit 11`

Enfócate en confianza, acceso a audiencia, cadencia, retención, dependencia del creador, concentración de plataforma, conversión, durabilidad de suscripción/patrocinio y retorno sobre el tiempo del fundador.

## Preguntas de escala

Para adquisición, describe los primeros 10, 100 y 1.000 clientes cuando esos números encajen en el modelo. Reemplázalos con hitos equivalentes para enterprise, marketplaces, open source, herramientas internas o servicios de ticket alto. Cada etapa debe incluir canal, volumen alcanzable, supuestos de conversión, dueño, costo, tiempo y cuello de botella.