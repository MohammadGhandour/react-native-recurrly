import SubscriptionCard from "@/components/SubscriptionCard";
import { SafeAreaView } from "@/components/ui/SafeAreaView";
import { useSubscriptionsStore } from "@/store/useSubscriptionsStore";
import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";

export default function Subscriptions() {
  const [query, setQuery] = useState("");
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);
  const { subscriptions } = useSubscriptionsStore();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return subscriptions;
    return subscriptions.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q) ||
        s.plan?.toLowerCase().includes(q)
    );
  }, [query, subscriptions]);

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={
          <>
            <Text className="text-3xl font-bold mb-5">Subscriptions</Text>
            <View className="search-bar">
              <TextInput
                className="search-input"
                placeholder="Search subscriptions..."
                placeholderTextColor="rgba(0,0,0,0.35)"
                value={query}
                onChangeText={setQuery}
                autoCapitalize="none"
                autoCorrect={false}
                // spellCheck={true}
                returnKeyType="search"
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery("")} hitSlop={8}>
                  <Text className="text-sm font-sans-semibold text-accent">Clear</Text>
                </Pressable>
              )}
            </View>
          </>
        }
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubId === item.id}
            onPress={() => setExpandedSubId((p) => (p === item.id ? null : item.id))}
          />
        )}
        extraData={expandedSubId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="subs-empty">
            <Text className="subs-empty-text">
              No subscriptions found for "{query}"
            </Text>
          </View>
        }
        contentContainerClassName="pb-20"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
      />
    </SafeAreaView>
  );
}
