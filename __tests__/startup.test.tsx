import { Text, AccessibilityInfo } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import App from '../src/bootstrap/App';

const mockState = {
  ready: false,
  error: false,
  busy: false,
  initialize: jest.fn().mockResolvedValue(undefined),
  clearError: jest.fn(),
};
jest.mock('../src/stores/shoppingListStore', () => ({
  useShoppingListStore: Object.assign(
    (select: (state: typeof mockState) => unknown) => select(mockState),
    { getState: () => mockState },
  ),
}));
jest.mock('../src/hooks/useTranslations', () => ({
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  useTranslations: () =>
    require('../src/constants/translations').translations.en,
}));
jest.mock('expo-font', () => ({ useFonts: jest.fn() }));
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn().mockResolvedValue(true),
  hideAsync: jest.fn().mockResolvedValue(undefined),
  setOptions: jest.fn(),
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: 'View',
  SafeAreaView: 'View',
}));
jest.mock('@expo/vector-icons/Ionicons', () => () => null);

beforeEach(() => {
  mockState.ready = false;
  mockState.error = false;
  mockState.busy = false;
  mockState.initialize.mockClear();
  jest.mocked(useFonts).mockReturnValue([true, null]);
  jest
    .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
    .mockResolvedValue(true);
});
afterEach(() => jest.restoreAllMocks());

test('branded startup hides the native splash after layout and reveals content only when ready', async () => {
  await render(
    <App>
      <Text>Shopping home</Text>
    </App>,
  );
  expect(screen.getByText('Shopping, made simple.')).toBeOnTheScreen();
  expect(screen.queryByText('Shopping home')).not.toBeOnTheScreen();
  await fireEvent(screen.getByRole('header'), 'layout', {
    nativeEvent: { layout: { x: 0, y: 0, width: 393, height: 800 } },
  });
  expect(SplashScreen.hideAsync).toHaveBeenCalled();
  expect(SplashScreen.setOptions).toHaveBeenCalledWith({
    duration: 0,
    fade: false,
  });
  mockState.ready = true;
  await screen.rerender(
    <App>
      <Text>Shopping home</Text>
    </App>,
  );
  expect(screen.getByText('Shopping home')).toBeOnTheScreen();
});

test('startup failures show a working retry action instead of trapping the user behind the native splash', async () => {
  mockState.error = true;
  await render(
    <App>
      <Text>Shopping home</Text>
    </App>,
  );
  expect(screen.getByRole('alert')).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
  expect(mockState.initialize).toHaveBeenCalledTimes(2);
});

test('font loading holds the startup screen, but a font failure allows system fallback', async () => {
  mockState.ready = true;
  jest.mocked(useFonts).mockReturnValue([false, null]);
  await render(
    <App>
      <Text>Shopping home</Text>
    </App>,
  );
  expect(screen.queryByText('Shopping home')).not.toBeOnTheScreen();
  jest.mocked(useFonts).mockReturnValue([false, new Error('Font unavailable')]);
  await screen.rerender(
    <App>
      <Text>Shopping home</Text>
    </App>,
  );
  expect(screen.getByText('Shopping home')).toBeOnTheScreen();
});
