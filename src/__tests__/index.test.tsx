import { render } from '@testing-library/react-native';
import { CountryFlag } from '../components/CountryFlag';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
}));

jest.mock('react-native-svg', () => ({
  SvgUri: 'SvgUri',
  SvgXml: 'SvgXml',
  SvgCssUri: 'SvgCssUri',
}));

jest.mock('country-code-to-flag-emoji', () => ({
  __esModule: true,
  default: (code: string) => (code === 'US' ? '🇺🇸' : null),
}));

describe('CountryFlag', () => {
  it('renders without crashing in emoji mode', () => {
    const { getByText } = render(<CountryFlag isoCode="US" size={32} />);
    expect(getByText('🇺🇸')).toBeTruthy();
  });

  it('renders fallback emoji for unknown country code', () => {
    const { getByText } = render(<CountryFlag isoCode="ZZ" size={32} />);
    expect(getByText('🏳️')).toBeTruthy();
  });

  it('renders placeholder view in SVG mode before fetch resolves', () => {
    const { getByTestId } = render(
      <CountryFlag isoCode="CM" size={32} useSvg testID="flag-placeholder" />
    );
    expect(getByTestId('flag-placeholder')).toBeTruthy();
  });
});
