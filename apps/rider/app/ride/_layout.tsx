import { Stack } from 'expo-router'

export default function RideLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="request" />
      <Stack.Screen name="tracking" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="rating" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="panic" />
      <Stack.Screen name="share" />
    </Stack>
  )
}
