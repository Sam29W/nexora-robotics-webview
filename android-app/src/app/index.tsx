
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const WEBSITE_URL =
  'https://sam29w.github.io/nexora-robotics-webview/';

export default function HomeScreen() {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);

  // Preserve Android's normal back-button navigation.
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (canGoBack) {
          webViewRef.current?.goBack();
          return true;
        }

        return false;
      },
    );

    return () => subscription.remove();
  }, [canGoBack]);

  // Reload the website when NEXORA returns to the foreground.
  useEffect(() => {
    let previousState = AppState.currentState;

    const subscription = AppState.addEventListener(
      'change',
      (nextState) => {
        if (
          previousState.match(/inactive|background/) &&
          nextState === 'active'
        ) {
          webViewRef.current?.reload();
        }

        previousState = nextState;
      },
    );

    return () => subscription.remove();
  }, []);

  const retryLoading = () => {
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}
    >
      <View style={styles.webViewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: WEBSITE_URL }}
          style={styles.webView}
          javaScriptEnabled
          domStorageEnabled
          cacheEnabled={false}
          cacheMode="LOAD_NO_CACHE"
          pullToRefreshEnabled
          onLoadStart={() => {
            setIsLoading(true);
            setHasError(false);
          }}
          onLoadEnd={() => setIsLoading(false)}
          onNavigationStateChange={(navState) =>
            setCanGoBack(navState.canGoBack)
          }
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          onHttpError={(event) => {
            if (event.nativeEvent.statusCode >= 400) {
              setIsLoading(false);
              setHasError(true);
            }
          }}
        />

        {isLoading && !hasError && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator
              size="large"
              color="#39D9FF"
            />
            <Text style={styles.loadingText}>
              Loading NEXORA...
            </Text>
          </View>
        )}

        {hasError && (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorTitle}>
              Unable to load NEXORA
            </Text>

            <Text style={styles.errorMessage}>
              Check your internet connection and try again.
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={retryLoading}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>
                Try again
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07111F',
  },
  webViewContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: '#07111F',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#07111F',
  },
  loadingText: {
    color: '#D8E8F5',
    fontSize: 14,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    backgroundColor: '#07111F',
  },
  errorTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorMessage: {
    color: '#B8C8D9',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#39D9FF',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#07111F',
    fontWeight: '700',
    fontSize: 15,
  },
});
