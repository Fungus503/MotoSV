---
name: no-refactor
description: >
  REGLA ABSOLUTA DE NO REFACTORIZACIÓN. Se activa en TODAS las tareas de
  codificación. Prohíbe terminantemente agregar, modificar o eliminar cualquier
  línea de código que NO haya sido explícita y textualmente solicitada por el
  usuario. No asumir, no anticipar, no "mejorar", no refactorizar. Cada línea
  debe tener una razón directa y explícita en la solicitud del usuario.
  CERO TOLERANCIA a código no solicitado.
disable-model-invocation: true
---

# NO REFACTOR — Regla de Ejecución Restrictiva

## REGLA DE ORO

**NO ESCRIBAS UNA SOLA LÍNEA DE CÓDIGO QUE EL USUARIO NO HAYA PEDIDO EXPLÍCITAMENTE.**

Esto incluye, pero no se limita a:
- ❌ No agregar comentarios al código
- ❌ No renombrar variables, funciones, archivos o componentes
- ❌ No reorganizar imports
- ❌ No "mejorar" nombres aunque sean poco descriptivos
- ❌ No extraer funciones o componentes
- ❌ No agregar tipos, interfaces o validaciones no solicitadas
- ❌ No corregir styling, colores, alineación o espaciado no solicitado
- ❌ No eliminar código "muerto" aunque parezca no usarse
- ❌ No unificar patrones ni estilos inconsistentes
- ❌ No agregar logging, debugging o manejo de errores no solicitado
- ❌ No agregar documentación inline (comentarios en código)
- ❌ No agregar loading states, empty states o skeletons no solicitados
- ❌ No agregar animaciones, transiciones o efectos visuales no solicitados
- ❌ No agregar validaciones, sanitización o edge cases no solicitados
- ❌ No "preparar" código para funcionalidades futuras
- ❌ No cambiar la estructura de archivos o carpetas sin orden explícita

## Lo que SÍ debes hacer

- ✅ Escribir EXACTAMENTE el código que el usuario pidió
- ✅ Cada archivo nuevo = una responsabilidad única
- ✅ Asegurar que el código nuevo NO rompa nada existente
- ✅ Verificar imports y conexiones con el código existente
- ✅ Si algo NO está claro, PREGUNTAR antes de asumir
- ✅ Si el usuario pide algo que rompería otra cosa, ADVERTIR antes de hacerlo

## Checklist Pre-Ejecución

Antes de escribir CUALQUIER línea de código, responder mentalmente:

1. **¿El usuario pidió explícitamente esto?** Si la respuesta es "no estoy seguro", PREGUNTAR.
2. **¿Esto rompe algo existente?** Verificar imports, tipos, funciones que dependen de lo que voy a modificar.
3. **¿Puedo hacer SOLAMENTE lo que pidió?** Sin extras ni "de paso arreglo esto".
4. **¿Es código estrictamente necesario para lo que pidió?** Cada línea debe responder a una necesidad explícita.

## Señales de Alerta (STOP)

| Pensamiento peligroso | Qué hacer |
|---|---|
| "De paso arreglo esta indentación" | **NO.** Solo lo que pidió. |
| "Aprovecho y renombro esto para que sea más claro" | **NO.** Solo lo que pidió. |
| "Esto se puede refactorizar para que sea más limpio" | **NO.** Solo lo que pidió. |
| "Agrego este loading state para que no se vea feo" | **NO.** Solo si lo pidió. |
| "Esto mejor lo pongo en un archivo separado" | **NO.** Solo si lo pidió. |
| "Agrego este type para que sea type-safe" | **NO.** Solo si lo pidió. |
| "Esto no está relacionado pero ya que estoy aquí..." | **NO.** Tarea única. |
| "No lo pidió pero es necesario para que funcione bien" | **PREGUNTAR** al usuario. |

## Verificación Post-Ejecución

1. [ ] ¿Cada línea que escribí fue EXPLÍCITAMENTE solicitada?
2. [ ] ¿No hay código "de bonus" que el usuario no pidió?
3. [ ] ¿No hay comentarios inline (salvo que el usuario los pidiera)?
4. [ ] ¿No eliminé, renombré o modifiqué nada existente sin orden?
5. [ ] ¿El código nuevo se integra con el existente sin romper nada?
6. [ ] ¿TypeScript compila (`tsc --noEmit`)?
7. [ ] ¿Los tests existentes siguen pasando?

## Protocolo de Permiso

Si NO estás 100% seguro de que el usuario quiere algo:
```
PREGUNTA: "Veo que [situación]. ¿Quieres que [acción propuesta]?
Esto implicaría [consecuencia]. Prefiero confirmar antes de hacerlo."
```

## Resumen

> **NO REFACTORICES NUNCA. NO ASUMAS NUNCA. NO AÑADAS NUNCA CÓDIGO NO SOLICITADO.**
> **CADA LÍNEA DE CÓDIGO DEBE TENER UNA RAZÓN EXPLÍCITA EN LA SOLICITUD DEL USUARIO.**
> **SI DUDASTE → PREGUNTA. SI NO ESTÁ SEGURO → PREGUNTA. SI NO LO PIDIÓ → NO LO HAGAS.**
