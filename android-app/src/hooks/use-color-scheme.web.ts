
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * Use the system color scheme on web.
 */
export function useColorScheme() {
  return useRNColorScheme() ?? 'light';
}
