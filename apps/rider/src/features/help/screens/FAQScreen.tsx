import { useState, useMemo, useCallback } from 'react'
import { View, Text, TextInput, FlatList, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GlassCard } from '@motosv/ui'
import { useFaqs } from '@motosv/api'

const categories = [
  { id: '', label: 'Todas' },
  { id: 'general', label: 'General' },
  { id: 'viajes', label: 'Viajes' },
  { id: 'pagos', label: 'Pagos' },
  { id: 'seguridad', label: 'Seguridad' },
  { id: 'cuenta', label: 'Cuenta' },
]

export function FAQScreen() {
  const insets = useSafeAreaInsets()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const { data: faqs } = useFaqs(selectedCategory || undefined)

  const filtered = useMemo(() => {
    if (!faqs) return []
    if (!search.trim()) return faqs
    const q = search.toLowerCase()
    return faqs.filter(
      (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
    )
  }, [faqs, search])

  const renderCategory = useCallback(({ item }: { item: (typeof categories)[0] }) => (
    <Pressable
      onPress={() => setSelectedCategory(item.id)}
      className={`px-4 py-2 rounded-full mr-2 ${selectedCategory === item.id ? 'bg-primary' : 'bg-surfaceContainerLow'}`}
    >
      <Text className={selectedCategory === item.id ? 'text-onPrimary text-sm' : 'text-on-surface text-sm'}>
        {item.label}
      </Text>
    </Pressable>
  ), [selectedCategory])

  const renderFaq = useCallback(({ item }: { item: any }) => (
    <GlassCard className="mb-3">
      <Pressable
        onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
        className="p-4"
      >
        <View className="flex-row items-center">
          <Text className="flex-1 text-on-surface font-medium">{item.question}</Text>
          <Text className="text-onSurfaceVariant text-lg ml-2">
            {expandedId === item.id ? '−' : '+'}
          </Text>
        </View>
        {expandedId === item.id && (
          <Text className="text-onSurfaceVariant text-sm mt-3 leading-5">
            {item.answer}
          </Text>
        )}
      </Pressable>
    </GlassCard>
  ), [expandedId])

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      <View className="px-4 py-4">
        <Text className="text-on-surface text-2xl font-bold mb-1">Ayuda</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar preguntas..."
          placeholderTextColor="#9ca3af"
          className="bg-surfaceContainerLow rounded-xl px-4 py-3 text-on-surface text-base mt-2"
        />
      </View>

      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, marginBottom: 12 }}
        renderItem={renderCategory}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        renderItem={renderFaq}
        ListEmptyComponent={
          <View className="py-12 items-center">
            <Text className="text-onSurfaceVariant text-base">
              {search ? 'No se encontraron resultados' : 'No hay preguntas disponibles'}
            </Text>
          </View>
        }
      />
    </View>
  )
}
