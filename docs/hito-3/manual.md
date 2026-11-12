# Manual de uso e instalación · Rutia v1.0.0

Rutia arma en minutos una ruta turística por Santiago según tu tiempo, tu presupuesto y tus intereses.
Este manual tiene tres partes: usar la app (cualquier persona), levantar el proyecto en otro computador
(desarrollo) y publicar el backend (mantención).

## 1. Usar la app en Android

### Requisitos

- Celular Android 8 o superior, con internet.
- Nada más: el backend ya está publicado en `https://rutia-api.onrender.com/api/v1`.

### Instalar

1. En el celular, abre la página de releases del repositorio:
   <https://github.com/Sxnr/Rutia/releases/latest>.
2. Descarga el archivo `rutia-v1.0.0.apk`.
3. Ábrelo. Android pedirá permiso para instalar apps desde el navegador: acéptalo y pulsa **Instalar**.
4. Abre **Rutia**.

### Datos de prueba

Usuario ficticio, con la ruta de Daniel ya guardada:

| Correo | Contraseña |
|---|---|
| `demo@rutia.test` | `rutia-demo-2026` |

También puedes crear tu propia cuenta en **Perfil → Crear cuenta**. Usa datos ficticios.

### Recorrido principal (caso de Daniel)

1. **Perfil:** inicia sesión con el usuario de prueba.
2. **Crear ruta:** 4 horas, $15.000, Museos y Restaurantes → **Generar ruta**.
3. La app muestra 4 lugares, 3 h 49 min y $4.590: Bellas Artes → MAC → Emporio La Rosa → GAM.
4. **Guardar ruta** con un nombre.
5. Cierra la app por completo y ábrela de nuevo: la sesión sigue abierta y la ruta está en **Guardados**.
6. En la ruta guardada, marca un lugar como **visitado**.
7. **Perfil → Mis datos:** corrige, descarga o elimina tus datos (Ley 21.719). Cada acción pide tu contraseña.

## 2. Levantar el proyecto en otro computador

### Requisitos

- Git, Python 3.12 o superior y Node.js 22 o superior.
- Una base PostgreSQL: el proyecto de Supabase del equipo o PostgreSQL local.
- Para la app en desarrollo: un Android con **Expo Go para SDK 57** (el de Google Play ya es la 58; el APK
  de la versión 57 está en <https://expo.dev/go?sdkVersion=57&platform=android&device=true>).

### Pasos

```bash
git clone https://github.com/Sxnr/Rutia.git
cd Rutia
cp .env.example .env              # completa DATABASE_URL con tu conexión
cd backend
python3 -m venv .venv
source .venv/bin/activate         # en fish: source .venv/bin/activate.fish
pip install -r requirements.txt
python -m scripts.crear_base      # crea las tablas y carga los 9 lugares (borra la base: confirma con "s")
python -m scripts.crear_usuario_demo
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Comprueba `http://localhost:8000/api/v1/health`: debe decir `{"estado":"ok","base_de_datos":"ok"}`.

En otra terminal, la app:

```bash
cd mobile
npm install
npx expo start                    # escanea el QR con Expo Go, en la misma red wifi
```

Pruebas: `cd backend && pytest` (49) y `cd mobile && npm test` (23, con el backend levantado).

## 3. Publicar el backend y compilar el APK (mantención)

- **Backend:** Render lee `render.yaml` (New → Blueprint → este repositorio). `DATABASE_URL` se escribe en el
  panel de Render, nunca en el repositorio. Un monitor de disponibilidad consulta `/api/v1/health` cada
  5 minutos para que el plan gratuito no se duerma.
- **APK:** lo compila GitHub Actions (`.github/workflows/apk-android.yml`), sin cuenta de Expo. Al subir una
  etiqueta de versión (`git tag v1.0.0 && git push origin v1.0.0`), el workflow genera el proyecto Android,
  compila el APK apuntando al backend publicado y crea el release con el APK adjunto. También se puede lanzar a mano desde GitHub: Actions → APK Android →
  Run workflow, con «publicar» marcado. En cada pull request que
  toca `mobile/` también compila, y deja el APK como artefacto para probarlo. Como alternativa, `eas.json`
  permite compilarlo con EAS Build (`npx eas-cli build -p android --profile preview`, cuenta gratuita de Expo).

## 4. Fallas frecuentes

| Qué pasa | Causa | Solución |
|---|---|---|
| `/health` responde 503 o las peticiones dan error 500 | El proyecto de Supabase se pausó tras 7 días sin uso | En supabase.com/dashboard, abre el proyecto y pulsa **Restore project**; espera 2 o 3 minutos y reinicia el backend |
| La app dice «el servidor tardó demasiado en responder» | El backend de Render estaba dormido y tarda cerca de un minuto en despertar | Espera un minuto y pulsa **Reintentar**; revisa que el monitor de disponibilidad esté activo |
| Expo Go dice «Project is incompatible with this version of Expo Go» | El Expo Go de Google Play es SDK 58 y el proyecto usa SDK 57 | Desinstala Expo Go e instala el de SDK 57 desde el enlace de la sección 2 (o usa el APK) |
| `fish: Unknown command: uvicorn` o `externally-managed-environment` | El entorno virtual no está activo en esa terminal | `cd backend` y `source .venv/bin/activate.fish` (o `activate` en bash) |
| Android dice «No se instaló la app» | Hay otra versión de Rutia instalada con otra firma | Desinstala la versión anterior y vuelve a instalar el APK |

### Fallas encontradas en la prueba de instalación en limpio

Las agrega quien hizo la prueba en un computador y un celular que no habían usado el proyecto
(ver `docs/hito-3/qa.md`).
