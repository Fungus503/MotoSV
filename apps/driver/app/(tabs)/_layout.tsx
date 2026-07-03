import { Tabs } from 'expo-router'
import { Text } from 'react-native'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#f7f9fc',
          borderTopColor: '#e0e3e6',
          paddingBottom: 8,
          height: 64,
        },
        tabBarActiveTintColor: '#006e2a',
        tabBarInactiveTintColor: '#6c7b6a',
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Ganancias',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>💰</Text>,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Billetera',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>💳</Text>,
        }}
      />
      <Tabs.Screen
        name="promotions"
        options={{
          title: 'Ofertas',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>🏷️</Text>,
        }}
      />
      <Tabs.Screen
        name="referrals"
        options={{
          title: 'Referidos',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>👥</Text>,
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: 'Documentos',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>📄</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>👤</Text>,
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          title: 'Ayuda',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>❓</Text>,
        }}
      />
    </Tabs>
  )
}
