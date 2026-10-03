import { useEffect } from 'react';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import { ShoppingListScreen } from '../screens/ShoppingListScreen';
import { useShoppingListStore } from '../stores/shoppingListStore';
export default function ShoppingListRoute() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const id = Number(listId),
    active = useShoppingListStore((s) => s.activeListId),
    list = useShoppingListStore((s) => s.lists.find((l) => l.id === id));
  useEffect(() => {
    if (!Number.isInteger(id) || !list) router.replace('/');
    else if (active !== id) void useShoppingListStore.getState().openList(id);
  }, [id, active, list]);
  if (!list || active !== id) return <ActivityIndicator />;
  return (
    <>
      <Stack.Screen options={{ title: list.name }} />
      <ShoppingListScreen />
    </>
  );
}
