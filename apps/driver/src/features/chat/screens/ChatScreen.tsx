import { useState, useRef } from 'react'
import { View, Text, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams } from 'expo-router'
import { useSession, useMessages, useSendMessage } from '@motosv/api'
import { useRideChatChannel } from '@motosv/realtime'

export function DriverChatScreen() {
  const insets = useSafeAreaInsets()
  const { rideId } = useLocalSearchParams<{ rideId: string }>()
  const { data: session } = useSession()
  const { data: messages } = useMessages(rideId)
  const sendMessage = useSendMessage()
  const [input, setInput] = useState('')
  const flatListRef = useRef<FlatList>(null)

  useRideChatChannel(rideId)

  function handleSend() {
    if (!input.trim() || !rideId) return
    sendMessage.mutate({ ride_id: rideId, content: input.trim() })
    setInput('')
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-surface"
      style={{ paddingTop: insets.top }}
    >
      <View className="px-4 py-3 border-b border-surfaceContainerHighest">
        <Text className="text-on-surface text-lg font-bold">Chat con pasajero</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isMine = item.sender_id === session?.user?.id
          return (
            <View className={`px-4 py-1 ${isMine ? 'items-end' : 'items-start'}`}>
              <View
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${isMine ? 'bg-primary rounded-tr-sm' : 'bg-surfaceContainerHigh rounded-tl-sm'}`}
              >
                <Text className={isMine ? 'text-onPrimary' : 'text-on-surface'}>{item.content}</Text>
                <Text className={`text-xs mt-1 ${isMine ? 'text-onPrimary/60' : 'text-onSurfaceVariant'}`}>
                  {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          )
        }}
        contentContainerStyle={{ paddingVertical: 16 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View className="flex-row items-center px-4 py-2 border-t border-surfaceContainerHighest" style={{ paddingBottom: insets.bottom + 8 }}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Escribe un mensaje..."
          placeholderTextColor="#9ca3af"
          className="flex-1 bg-surfaceContainerLow rounded-full px-4 py-3 text-on-surface text-base mr-2"
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!input.trim() || sendMessage.isPending}
          className="bg-primary w-10 h-10 rounded-full items-center justify-center"
        >
          <Text className="text-onPrimary text-lg">→</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}
