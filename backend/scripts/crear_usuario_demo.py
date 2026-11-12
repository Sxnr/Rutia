"""Crea el usuario de prueba de la revisión, con la ruta de Daniel ya guardada.

Uso (desde la carpeta backend/, con DATABASE_URL en el .env):
    python -m scripts.crear_usuario_demo

Es un usuario FICTICIO para que el profesor entre sin registrarse (no hay datos personales reales).
Se puede repetir: si el usuario ya existe, no lo duplica y solo revisa que tenga su ruta.
"""
from app.business.rutas_service import RutasServicio
from app.business.usuarios_service import UsuariosServicio
from app.core.database import SessionLocal
from app.core.errores import Conflicto

EMAIL = "demo@rutia.test"  # .test es un dominio reservado: nunca llega a un correo real
CONTRASENA = "rutia-demo-2026"
NOMBRE = "Daniel (prueba)"
NOMBRE_RUTA = "Ruta de Daniel"


def main() -> None:
    sesion = SessionLocal()
    try:
        usuarios = UsuariosServicio(sesion)
        rutas = RutasServicio(sesion)
        try:
            usuario = usuarios.registrar(NOMBRE, EMAIL, CONTRASENA, "es")
            print(f"✓ Usuario creado: {EMAIL}")
        except Conflicto:
            usuario = usuarios.iniciar_sesion(EMAIL, CONTRASENA)
            print(f"✓ El usuario {EMAIL} ya existía")

        if any(r.nombre == NOMBRE_RUTA for r in rutas.listar_de_usuario(usuario.id)):
            print(f"✓ Ya tenía guardada la «{NOMBRE_RUTA}»")
        else:
            # El caso de Daniel del Hito 1: 4 horas, $15.000, museos y restaurantes
            sugerida = rutas.generar(4, 15000, ["museos", "restaurantes"], None, False, None)
            lugar_ids = [p.lugar.id for p in sugerida.resultado.paradas]
            rutas.crear(usuario.id, NOMBRE_RUTA, lugar_ids, 4, 15000)
            print(f"✓ «{NOMBRE_RUTA}» guardada con {len(lugar_ids)} lugares")
        print(f"\nPara entrar en la app: {EMAIL} / {CONTRASENA}")
    finally:
        sesion.close()


if __name__ == "__main__":
    main()
