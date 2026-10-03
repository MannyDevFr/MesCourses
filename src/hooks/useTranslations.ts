import { translations } from '../constants/translations';
import { useShoppingListStore } from '../stores/shoppingListStore';
export function useTranslations() {
  return translations[useShoppingListStore((state) => state.language)];
}
