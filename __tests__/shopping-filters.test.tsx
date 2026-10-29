import { render, screen, userEvent } from '@testing-library/react-native';
import { ShoppingListScreen } from '../src/screens/ShoppingListScreen';

jest.mock('@expo/vector-icons/Ionicons', () => () => null);
jest.mock('../src/hooks/useTranslations', () => ({
  useTranslations: () =>
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('../src/constants/translations').translations.en,
}));
jest.mock('../src/stores/shoppingListStore', () => ({
  useShoppingListStore: (select: (state: object) => unknown) =>
    select({
      busy: false,
      lists: [{ id: 1, name: 'Supermarket', category: 'supermarket' }],
      activeListId: 1,
      generalCatalog: [],
      personalCatalog: [],
      generalCategories: [],
      personalCategories: [],
      skipProductDelete: false,
      products: [
        { id: 1, name: 'Milk', quantity: 1, isChecked: false },
        { id: 2, name: 'Bread', quantity: 2, isChecked: true },
      ],
    }),
}));
jest.useFakeTimers();

test('search combines with purchase filters and clearing restores results', async () => {
  const user = userEvent.setup();
  await render(<ShoppingListScreen />);
  expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({
    min: 0,
    max: 2,
    now: 1,
  });
  await user.press(screen.getByRole('button', { name: 'Purchased' }));
  expect(screen.getByRole('button', { name: 'Purchased' })).toBeSelected();
  expect(
    screen.queryByRole('checkbox', { name: 'Milk' }),
  ).not.toBeOnTheScreen();
  expect(screen.getByRole('checkbox', { name: 'Bread' })).toBeChecked();
  await user.type(screen.getByLabelText('Search products'), 'milk');
  expect(
    screen.getByText('No products match. Try another search or filter.'),
  ).toBeOnTheScreen();
  await user.press(screen.getByRole('button', { name: 'All' }));
  expect(screen.getByRole('checkbox', { name: 'Milk' })).toBeOnTheScreen();
  await user.press(screen.getByRole('button', { name: 'Clear search' }));
  expect(screen.getAllByRole('checkbox')).toHaveLength(2);
});
