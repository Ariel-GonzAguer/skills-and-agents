# Routing, privacidad y costo

Lee esta referencia cuando el trabajo implique selección de modelo, múltiples proveedores, fallbacks, BYOK, ZDR o presupuesto.

## Contrato antes de elegir modelo

Recoge o infiere de requisitos existentes:

- modalidad de entrada y salida;
- tamaño máximo de contexto y respuesta;
- idiomas y dominio;
- necesidad de JSON estructurado o tools;
- latencia objetivo y concurrencia;
- presupuesto por conversación/mes;
- regiones, proveedores permitidos y política de retención;
- tolerancia a que un fallback responda con estilo o calidad distintos.

No uses popularidad como sustituto de una evaluación. Ejecuta casos representativos y compara calidad, latencia, errores y costo reportado.

## Un modelo o varios

Usa `model` cuando el comportamiento debe ser predecible y un fallo explícito es preferible a cambiar de modelo.

Usa `models` cuando el producto acepta una lista ordenada de alternativas. OpenRouter puede avanzar al siguiente modelo ante rate limits, indisponibilidad, validación de contexto o moderación. El modelo que finalmente respondió determina el precio y aparece en la respuesta.

No combines mecanismos de fallback incompatibles. Mantén una única lista canónica y prueba cada alternativa con los mismos casos.

## Routing de proveedores

Sin preferencias, OpenRouter distribuye entre endpoints estables y económicos y conserva proveedores restantes como fallback. Configura `provider` solo cuando exista un requisito observable:

| Requisito | Control |
| --- | --- |
| Parámetros obligatorios | `requireParameters: true` |
| Solo endpoints ZDR | `zdr: true` |
| Evitar proveedores que recopilan datos | `dataCollection: 'deny'` |
| Priorizar costo, throughput o latencia | `sort` |
| Orden de proveedores | `order` |
| Allowlist estricta | `only` más política de fallback explícita |
| Excluir un proveedor | `ignore` |

Los nombres del SDK suelen ser camelCase y la REST API usa snake_case. Confirma los tipos instalados antes de copiar campos.

Restringir proveedores reduce resiliencia. Si se exige un proveedor o región concreta, verifica que la configuración realmente falle cuando no pueda cumplirla.

## Privacidad

- Decide si basta con impedir entrenamiento (`dataCollection: 'deny'`) o si se exige no retención (`zdr: true`). No son equivalentes.
- ZDR por request solo puede endurecer una política; no desactiva restricciones de cuenta o guardrail.
- La política de inferencia no cubre automáticamente plugins y herramientas de terceros.
- No envíes PII innecesaria. Separa datos públicos del negocio, datos de sesión y secretos.
- Revisa políticas del endpoint/proveedor efectivo y requisitos de residencia antes de usar fallbacks amplios.

## Costos

Controla el gasto en varias capas:

1. límite de caracteres/tokens de input e historial;
2. límite de output soportado por el modelo y SDK;
3. rate limit y concurrencia de la aplicación;
4. allowlist de modelos y fallbacks;
5. límite monetario de la clave/workspace;
6. monitoreo de uso y alertas.

No aceptes desde el navegador valores arbitrarios de modelo, `max_tokens`, reasoning, plugins, tools o routing. Tradúcelos desde opciones públicas a una configuración allowlisted del servidor.

## Atribución

Configura `httpReferer` y `appTitle` cuando el propietario quiera analítica/visibilidad de la app. `HTTP-Referer` identifica la URL para atribución; el título por sí solo no crea la atribución.

No derives estos headers directamente de un `Host`, `Origin` o `Referer` no confiable. Usa configuración del servidor.

## Observabilidad mínima

Registra campos estructurados y sin contenido:

- request/correlation ID y generation ID;
- duración y estado final;
- modelo solicitado y efectivo;
- proveedor efectivo cuando esté disponible;
- tokens de prompt/completion y costo reportado;
- si se usó fallback;
- código/error type normalizado;
- aborto por usuario o timeout.

No habilites `debugLogger`, `OPENROUTER_DEBUG` ni `debug.echo_upstream_body` en producción. Incluso en desarrollo, evita capturar secretos y prompts reales.

## Preguntas de revisión

- ¿El producto puede explicar por qué eligió esos modelos y proveedores?
- ¿Un fallback conserva privacidad, capacidades y presupuesto?
- ¿Un modelo sin soporte de un parámetro puede recibir la petición?
- ¿El límite de crédito contiene un incidente pero permite el tráfico esperado?
- ¿El monitoreo diferencia 402, 429 de la app, 429 de OpenRouter y 429 upstream?
- ¿La cancelación realmente detiene procesamiento/facturación para los proveedores soportados?

