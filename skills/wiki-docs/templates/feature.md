# {Nombre de la funcionalidad}

Una oración que explica qué hace y por qué es relevante en este proyecto.

## ¿Qué es y por qué está aquí?

Contexto de negocio: por qué se implementó esta funcionalidad, qué problema resuelve. Si la decisión de implementación no es trivial, explicarla aquí.

## Cómo funciona (flujo técnico)

Diagrama ASCII del flujo completo, desde el trigger hasta el resultado.

```
[Trigger] → [Componente A] → [Servicio B] → [Resultado]
```

Descripción paso a paso de cada etapa. Incluir ejemplos de código reales cuando sea necesario.

## Archivos involucrados

| Archivo | Rol en esta funcionalidad |
|---------|---------------------------|
| `src/components/Ejemplo.tsx` | Componente UI, accede a la cámara |
| `src/services/ejemplo.service.ts` | Procesa datos y valida formato |

## API / Interfaz pública

Si la funcionalidad expone una API (hook, componente, función), documentarla.

```ts
// Firma real extraída del código fuente
useEjemplo(options: EjemploOptions): { data: string | null; error: Error | null }
```

Tabla de props/parámetros con tipo, descripción y si es requerido.

| Prop/Parámetro | Tipo | Requerido | Descripción |
|----------------|------|-----------|-------------|
| `options` | `EjemploOptions` | Sí | Configuración de la funcionalidad |

## Dependencias externas

Listar librerías de terceros involucradas, con versión y link a docs si aplica.

## Limitaciones y consideraciones

- Lo que NO hace esta implementación.
- Limitaciones de hardware/browser conocidas.
- Edge cases importantes.

## Referencias

- [Componente relacionado](../components/overview.md)
- Librería: `nombre-libreria@version`
- Archivo fuente: `src/...`
