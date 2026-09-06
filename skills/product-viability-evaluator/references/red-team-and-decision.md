# Red team, resolución de conflictos y decisión

## Contrato del red team

Asume que el caso de viabilidad inicial está mal. Intenta identificar el mecanismo de falla antes de que el fundador gaste más. No inventes objeciones; cada ataque debe estar fundamentado en evidencia, una inferencia divulgada o un unknown testeable.

Usa una pasada separada o un agente independiente cuando sea posible. No reveles el chain-of-thought privado. Devuelve afirmaciones, evidencia, tests e impactos concisos.

## Superficie de ataque

### Demanda y cliente

- El problema es infrecuente, tolerable o está suficientemente resuelto por la inacción.
- La evidencia de entrevistas o signups es seleccionada, cortés o no conductual.
- Se confunden usuario, comprador, aprobador y pagador.
- El presupuesto existe en teoría pero no en la cuenta objetivo ni en el ciclo actual.
- El segmento combina compradores con necesidades y canales distintos.

### Mercado y competencia

- El TAM sustituye el gasto de categoría amplio por compradores alcanzables.
- El SOM ignora capacidad de venta, geografía, regulación o límites de implementación.
- Un incumbente empaqueta la funcionalidad o es dueño de la distribución.
- Una hoja de cálculo, mano de obra, agencia, open source o no hacer nada es suficiente.
- El costo de cambio excede el valor incremental.

### Producto y diferenciación

- Una mejor UI no crea valor económico medible.
- La moat es un prompt, funcionalidad o integración de modelo fácil de copiar.
- El workflow depende de trabajo manual operado por el fundador.
- La confianza, precisión, latencia, accesibilidad, seguridad o integraciones bloquean la adopción.
- La novedad del producto se confunde con retención.

### Monetización y adquisición

- La disposición a pagar declarada no sobrevive a una solicitud de pago.
- La métrica de precio entra en conflicto con el valor entregado o el costo variable.
- Freemium atrae no-compradores y aumenta el soporte.
- Los primeros clientes vienen de relaciones del fundador que no escalan.
- La economía de canal omite mano de obra, ciclo de venta, desfase de contenido, comisiones de plataforma o saturación.

### Economía y ejecución

- El churn está subestimado o no observado.
- El CAC excluye tiempo del fundador, leads fallidos, comisiones, onboarding o descuentos.
- El costo de IA/API, soporte, refunds, cumplimiento o pagos destruye el margen de contribución.
- El runway requerido excede el capital disponible antes de que llegue el aprendizaje.
- La regulación, certificación, procurement, derechos de datos o política de plataforma bloquean la venta.
- Un solo proveedor, plataforma, cliente o fundador es una dependencia existencial.

### Fit del fundador y costo de oportunidad

- El fundador evita el trabajo vinculante, usualmente ventas, soporte u operaciones.
- La credibilidad de dominio o la red faltan y son caras de adquirir.
- Las horas semanales no pueden sostener el ciclo de venta ni el nivel de servicio.
- Una alternativa más pequeña tiene mejor retorno por hora y mejor downside.
- El interés del fundador no sobrevivirá al mantenimiento repetitivo.

## Registro de ataques

Para cada ataque material registra:

- ID y afirmación desafiada;
- IDs de evidencia contraria;
- etiqueta: `FACT`, `EVIDENCE`, `ASSUMPTION`, `INFERENCE` o `UNKNOWN`;
- mecanismo de falla;
- probabilidad y severidad;
- dimensiones afectadas;
- cambios de score;
- implicación de deal breaker;
- test de falsificación más barato.

El red team puede subir, bajar o dejar una dimensión sin cambios. La evidencia negativa debe tener el mismo pie, pero el pesimismo forzado también es sesgo.

## Resolución de conflictos

Cuando el analista y el skeptic discrepan:

1. Enuncia la afirmación disputada con precisión.
2. Lista evidencia para cada posición y compara alcance, calidad de fuente, fecha y proximidad conductual.
3. Identifica si usan definiciones, segmentos, horizontes o supuestos distintos.
4. Busca una fuente adicional de alto valor si las herramientas y el tiempo lo permiten.
5. Define una hipótesis falsificable y un umbral.
6. Re-puntúa las dimensiones afectadas.
7. Preserva el desacuerdo sin resolver y baja la confianza.

No promedies opiniones contradictorias. Resuelve con evidencia o mantén la incertidumbre visible.

## Gates de veredicto

Verifica esto antes de `BUILD`:

- La evidencia del problema es conductual o suficientemente fuerte para el tamaño del compromiso.
- El ICP, usuario, comprador y pagador son concretos.
- Al menos un camino de adquisición alcanzable tiene evidencia o un experimento acotado.
- El precio o la disposición a pagar tienen evidencia conductual acorde a la etapa.
- La economía tiene un camino plausible sin contribución negativa estructural.
- Los riesgos críticos de producto, legal, seguridad, cumplimiento y dependencias son remediables dentro de las restricciones.
- El fit del fundador respalda el trabajo vinculante.
- La cobertura de evidencia normalmente es al menos 70 y la confianza al menos 60.

Los proyectos en etapa temprana rara vez pueden satisfacer `BUILD` para un producto completo. Interpreta `BUILD` como permiso para el próximo compromiso acotado, como un piloto pagado o un MVP acotado, y declara ese alcance.

Usa `PIVOT` solo cuando la evidencia respalda el problema/oportunidad pero rechaza la solución, segmento, precio o canal actuales. Usa `RECONSIDER` cuando la oportunidad en sí o el retorno específico del fundador es débil. Usa `ABANDON` solo con evidencia negativa fuerte o un bloqueador no remediable; la falta de evidencia sola normalmente significa `VALIDATE` o `RECONSIDER`.

## Calidad del experimento de validación

Prefiere tests que expongan el proyecto a la realidad:

- preventa pagada, depósito o piloto firmado;
- outbound a una lista de compradores definida con umbrales de respuesta y reuniones;
- compromiso de migración o integración;
- uso repetido y cohorte de retención;
- test de precio atado a checkout o llamada de venta;
- entrega concierge midiendo esfuerzo y resultado reales;
- test de canal con conversión rastreada y costo completo.

Evita experimentos de vanidad que pueden pasar sin probar la hipótesis. Un clic en la landing page no prueba la disposición a pagar. Define éxito y fracaso antes de ejecutar el experimento.