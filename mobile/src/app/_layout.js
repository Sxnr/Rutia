// Layout raíz: proveedores de estado compartido y navegación en pila.
// Las pestañas viven en (tabs); las pantallas de detalle se abren encima.
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { ProveedorIdioma } from '../estado/IdiomaContexto'
import { ProveedorRuta } from '../estado/RutaContexto'
import { ProveedorSesion } from '../estado/SesionContexto'
import { colores } from '../tema'

export default function LayoutRaiz() {
  return (
    <SafeAreaProvider>
      <ProveedorIdioma>
        <ProveedorSesion>
          <ProveedorRuta>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colores.crema } }} />
          </ProveedorRuta>
        </ProveedorSesion>
      </ProveedorIdioma>
    </SafeAreaProvider>
  )
}
