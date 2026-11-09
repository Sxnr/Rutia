// Barra inferior con las 4 pestañas del prototipo: Explorar, Crear ruta, Guardados y Perfil.
import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router/js-tabs'

import { useIdioma } from '../../estado/IdiomaContexto'
import { colores } from '../../tema'

function icono(nombre) {
  return ({ color, size, focused }) => <Ionicons name={focused ? nombre : `${nombre}-outline`} color={color} size={size} />
}

export default function LayoutPestanas() {
  const { t } = useIdioma()
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colores.azul,
        tabBarInactiveTintColor: colores.gris,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '800' },
        tabBarStyle: { backgroundColor: colores.blanco, borderTopColor: colores.borde },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.explorar'), tabBarIcon: icono('compass') }} />
      <Tabs.Screen name="crear" options={{ title: t('tabs.crear'), tabBarIcon: icono('map') }} />
      <Tabs.Screen name="guardados" options={{ title: t('tabs.guardados'), tabBarIcon: icono('bookmark') }} />
      <Tabs.Screen name="perfil" options={{ title: t('tabs.perfil'), tabBarIcon: icono('person') }} />
    </Tabs>
  )
}
