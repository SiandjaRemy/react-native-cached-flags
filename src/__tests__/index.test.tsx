import { render, waitFor } from '@testing-library/react-native';
import { CountryFlag } from '../components/CountryFlag';
import * as fetchFlagModule from '../utils/fetchFlag';

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
  getAllKeys: jest.fn().mockResolvedValue([]),
  multiGet: jest.fn().mockResolvedValue([]),
  multiRemove: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('react-native-svg', () => ({
  SvgXml: () => null,
}));

jest.mock('country-code-to-flag-emoji', () => ({
  __esModule: true,
  default: (code: string) => {
    const map: Record<string, string> = {
      US: '🇺🇸',
      CM: '🇨🇲',
      FR: '🇫🇷',
    };
    return map[code] ?? null;
  },
}));

// Spy on fetchFlag so we can control its return value per test
const mockFetchFlag = jest.spyOn(fetchFlagModule, 'fetchFlag');

const MOCK_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg"><rect width="4" height="3"/></svg>';

// ── Helpers ──────────────────────────────────────────────────────────────────

const successResult = (): Promise<fetchFlagModule.FetchFlagResult> =>
  Promise.resolve({ type: 'success', svg: MOCK_SVG });

const offlineResult = (): Promise<fetchFlagModule.FetchFlagResult> =>
  Promise.resolve({ type: 'offline' });

const errorResult = (): Promise<fetchFlagModule.FetchFlagResult> =>
  Promise.resolve({ type: 'error', svg: '<svg/>' });

beforeEach(() => {
  jest.clearAllMocks();
});

// ── Emoji mode ───────────────────────────────────────────────────────────────

describe('Emoji mode (useSvg=false)', () => {
  it('renders the correct emoji for a known country code', () => {
    const { getByText } = render(<CountryFlag isoCode="US" size={32} />);
    expect(getByText('🇺🇸')).toBeTruthy();
  });

  it('renders fallback emoji for an unknown country code', () => {
    const { getByText } = render(<CountryFlag isoCode="ZZ" size={32} />);
    expect(getByText('🏳️')).toBeTruthy();
  });

  it('does not call fetchFlag in emoji mode', () => {
    render(<CountryFlag isoCode="CM" size={32} />);
    expect(mockFetchFlag).not.toHaveBeenCalled();
  });
});

// ── SVG mode — loading ───────────────────────────────────────────────────────

describe('SVG mode — loading state', () => {
  it('shows placeholder while SVG is loading', () => {
    mockFetchFlag.mockReturnValue(new Promise(() => {})); // never resolves
    const { getByTestId } = render(
      <CountryFlag isoCode="CM" size={32} useSvg testID="flag" />
    );
    expect(getByTestId('flag')).toBeTruthy();
  });

  it('applies custom placeholderColor while loading', () => {
    mockFetchFlag.mockReturnValue(new Promise(() => {}));
    const { getByTestId } = render(
      <CountryFlag isoCode="CM" size={32} useSvg placeholderColor="#FF0000" />
    );
    const placeholder = getByTestId('flag-placeholder');
    expect(placeholder.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: '#FF0000' }),
      ])
    );
  });
});

// ── SVG mode — success ───────────────────────────────────────────────────────

describe('SVG mode — success state', () => {
  it('renders SVG after successful fetch', async () => {
    mockFetchFlag.mockImplementation(successResult);
    const { getByTestId } = render(
      <CountryFlag isoCode="CM" size={32} useSvg testID="flag" />
    );
    await waitFor(() => expect(getByTestId('flag')).toBeTruthy());
  });

  it('calls fetchFlag with correct lowerCode and aspectRatio', async () => {
    mockFetchFlag.mockImplementation(successResult);
    render(<CountryFlag isoCode="US" size={32} useSvg aspectRatio="1:1" />);
    await waitFor(() =>
      expect(mockFetchFlag).toHaveBeenCalledWith('us', '1:1', undefined)
    );
  });

  it('defaults to 4:3 aspectRatio when none is provided', async () => {
    mockFetchFlag.mockImplementation(successResult);
    render(<CountryFlag isoCode="FR" size={32} useSvg />);
    await waitFor(() =>
      expect(mockFetchFlag).toHaveBeenCalledWith('fr', '4:3', undefined)
    );
  });

  it('re-fetches when isoCode changes', async () => {
    mockFetchFlag.mockImplementation(successResult);
    const { rerender } = render(<CountryFlag isoCode="US" size={32} useSvg />);
    await waitFor(() =>
      expect(mockFetchFlag).toHaveBeenCalledWith('us', '4:3', undefined)
    );

    rerender(<CountryFlag isoCode="CM" size={32} useSvg />);
    await waitFor(() =>
      expect(mockFetchFlag).toHaveBeenCalledWith('cm', '4:3', undefined)
    );
    expect(mockFetchFlag).toHaveBeenCalledTimes(2);
  });

  it('re-fetches when aspectRatio changes', async () => {
    mockFetchFlag.mockImplementation(successResult);
    const { rerender } = render(
      <CountryFlag isoCode="US" size={32} useSvg aspectRatio="4:3" />
    );
    await waitFor(() =>
      expect(mockFetchFlag).toHaveBeenCalledWith('us', '4:3', undefined)
    );

    rerender(<CountryFlag isoCode="US" size={32} useSvg aspectRatio="1:1" />);
    await waitFor(() =>
      expect(mockFetchFlag).toHaveBeenCalledWith('us', '1:1', undefined)
    );
    expect(mockFetchFlag).toHaveBeenCalledTimes(2);
  });

  it('calls onLoad when SVG is successfully fetched', async () => {
    const onLoadSpy = jest.fn();
    mockFetchFlag.mockResolvedValue({ type: 'success', svg: '<svg />' });

    render(<CountryFlag isoCode="US" size={32} useSvg onLoad={onLoadSpy} />);

    await waitFor(() => {
      expect(onLoadSpy).toHaveBeenCalledTimes(1);
    });
  });
});

// ── SVG mode — aspect ratios ─────────────────────────────────────────────────

describe('SVG mode — aspect ratios', () => {
  const cases: Array<[string, number]> = [
    ['4:3', 0.75],
    ['1:1', 1],
  ];

  it.each(cases)(
    'applies correct height for aspectRatio %s (size=100 → height=%s*100)',
    async (ratio, multiplier) => {
      mockFetchFlag.mockImplementation(successResult);
      const { getByTestId } = render(
        <CountryFlag
          isoCode="US"
          size={100}
          useSvg
          aspectRatio={ratio as any}
          testID="flag"
        />
      );
      await waitFor(() => {
        const el = getByTestId('flag');
        expect(el.props.style).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ height: 100 * multiplier }),
          ])
        );
      });
    }
  );
});

// ── SVG mode — offline ───────────────────────────────────────────────────────

describe('SVG mode — offline state', () => {
  it('shows dashed placeholder when offline and useFallbackEmoji is false', async () => {
    mockFetchFlag.mockImplementation(offlineResult);
    const { getByTestId } = render(
      <CountryFlag isoCode="CM" size={32} useSvg useFallbackEmoji={false} />
    );
    await waitFor(() => {
      const el = getByTestId('flag-offline');
      expect(el.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ borderStyle: 'dashed' }),
        ])
      );
    });
  });

  it('shows emoji fallback when offline and useFallbackEmoji is true', async () => {
    mockFetchFlag.mockImplementation(offlineResult);
    const { getByText } = render(
      <CountryFlag isoCode="CM" size={32} useSvg useFallbackEmoji />
    );
    await waitFor(() => expect(getByText('🇨🇲')).toBeTruthy());
  });

  it('shows generic fallback emoji for unknown code when offline', async () => {
    mockFetchFlag.mockImplementation(offlineResult);
    const { getByText } = render(
      <CountryFlag isoCode="ZZ" size={32} useSvg useFallbackEmoji />
    );
    await waitFor(() => expect(getByText('🏳️')).toBeTruthy());
  });
});

// ── SVG mode — error ─────────────────────────────────────────────────────────

describe('SVG mode — error state', () => {
  it('renders default SVG on fetch error', async () => {
    mockFetchFlag.mockImplementation(errorResult);
    const { getByTestId } = render(
      <CountryFlag isoCode="CM" size={32} useSvg />
    );
    await waitFor(() => expect(getByTestId('flag-error')).toBeTruthy());
  });
});

// ── SVG mode — empty isoCode ─────────────────────────────────────────────────

describe('SVG mode — edge cases', () => {
  it('shows error state when isoCode is empty string', async () => {
    const { getByTestId } = render(<CountryFlag isoCode="" size={32} useSvg />);
    await waitFor(() => expect(getByTestId('flag-error')).toBeTruthy());
  });

  it('switches from SVG to emoji mode when useSvg changes to false', async () => {
    mockFetchFlag.mockImplementation(successResult);
    const { rerender, getByText } = render(
      <CountryFlag isoCode="US" size={32} useSvg />
    );
    rerender(<CountryFlag isoCode="US" size={32} useSvg={false} />);
    expect(getByText('🇺🇸')).toBeTruthy();
  });
});
