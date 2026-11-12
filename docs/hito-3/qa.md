# Plan de QA · Rutia v1.0.0 (APK Android)

Pruebas manuales de la app instalada desde el APK del release, contra el backend publicado en Render.
Quien prueba anota el resultado de cada caso y sube este archivo con sus resultados.

## Antes de empezar

- Celular Android con el APK del release v1.0.0 instalado (permitir "instalar apps de origen desconocido").
- Abrir `https://rutia-api.onrender.com/api/v1/health` en el navegador: debe decir `"base_de_datos":"ok"`.
  Si tarda cerca de un minuto, el servicio estaba dormido: esperar y repetir.
- Usar solo datos ficticios (por ejemplo, `prueba.qa@rutia.test`). Nunca datos personales reales.

Anotar en cada caso: ✅ pasa · ❌ falla (con qué pasó) · ⚠️ pasa con un detalle.

## 1. Flujo principal (caso de Daniel)

| ID | Pasos | Resultado esperado | Resultado | Nota |
|---|---|---|---|---|
| F1 | Abrir la app por primera vez | Se ve Explorar con los 9 lugares y sus fotos | | |
| F2 | Perfil → Crear cuenta con nombre, correo ficticio y contraseña | Entra con la cuenta nueva | | |
| F3 | Crear ruta: 4 horas, $15.000, Museos y Restaurantes → Generar | 4 lugares, 3 h 49 min, $4.590 | | |
| F4 | Revisar el orden de la ruta | Bellas Artes → MAC → Emporio La Rosa → GAM | | |
| F5 | Guardar la ruta con el nombre «Ruta de Daniel» | Aparece en Guardados | | |
| F6 | Cerrar la app por completo (quitarla de recientes) y volver a abrirla | La sesión sigue abierta y la ruta sigue en Guardados | | |
| F7 | Abrir la ruta guardada y marcar un lugar como visitado | Queda marcado y aparece en Lugares visitados | | |

## 2. Validación y mensajes

| ID | Pasos | Resultado esperado | Resultado | Nota |
|---|---|---|---|---|
| V1 | Crear cuenta con un correo sin @ | Mensaje claro bajo el campo, no se envía | | |
| V2 | Crear cuenta con un correo que ya existe | Mensaje «ese correo ya está registrado», no un error técnico | | |
| V3 | Iniciar sesión con contraseña incorrecta | Mensaje claro; tras 5 intentos, aviso de esperar | | |
| V4 | Crear ruta sin elegir intereses | El botón no avanza o muestra qué falta | | |
| V5 | Crear ruta con presupuesto $0 y solo Restaurantes | Mensaje de que no caben lugares, sin cerrarse la app | | |

## 3. Estados de la interfaz

| ID | Pasos | Resultado esperado | Resultado | Nota |
|---|---|---|---|---|
| E1 | Abrir Explorar y Crear ruta | Se ve un indicador de carga mientras llegan los datos | | |
| E2 | Guardados con una cuenta nueva | Mensaje de lista vacía, no una pantalla en blanco | | |
| E3 | Activar modo avión y abrir Explorar | Mensaje de sin conexión con opción de reintentar | | |
| E4 | Desactivar modo avión y reintentar | Los datos cargan | | |

## 4. Datos personales (Ley 21.719)

| ID | Pasos | Resultado esperado | Resultado | Nota |
|---|---|---|---|---|
| L1 | Perfil → corregir el nombre (pide contraseña) | El nombre nuevo se ve al volver a Perfil | | |
| L2 | Perfil → descargar mis datos (pide contraseña) | Entrega perfil, rutas y visitas, sin la contraseña | | |
| L3 | Perfil → eliminar cuenta con contraseña incorrecta | No se elimina y avisa | | |
| L4 | Perfil → eliminar cuenta con la contraseña correcta | Cierra sesión; al iniciar sesión otra vez, la cuenta no existe | | |

## 5. Idioma y detalles

| ID | Pasos | Resultado esperado | Resultado | Nota |
|---|---|---|---|---|
| I1 | Cambiar el idioma a inglés | Pantallas, lugares y mensajes de error en inglés | | |
| I2 | Abrir el detalle de un lugar | Foto con su crédito, horario, costo y dirección | | |
| I3 | Girar el celular y usar letra grande del sistema | Nada se corta ni se superpone | | |

## Resultado

- Fecha y hora de la prueba:
- Celular y versión de Android:
- Quién probó:
- Casos que fallaron y qué se corrigió:
