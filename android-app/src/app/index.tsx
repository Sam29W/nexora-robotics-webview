
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  BackHandler,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

const WEBSITE_URL =
  'https://sam29w.github.io/nexora-robotics-webview/';

export default function HomeScreen() {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [refreshKey, setRefreshKey] = useState(() => Date.now());

  const refreshWebsite = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    setRefreshKey(Date.now());
  }, []);

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

  useEffect(() => {
    let previousState = AppState.currentState;

    const subscription = AppState.addEventListener(
      'change',
      (nextState) => {
        if (
          previousState.match(/inactive|background/) &&
          nextState === 'active'
        ) {
          refreshWebsite();
        }
        previousState = nextState;
      },
    );

    return () => subscription.remove();
  }, [refreshWebsite]);

  useEffect(() => {
    let isMounted = true;

    async function registerForNotifications() {
      try {
        if (Platform.OS !== 'android') {
          return;
        }

        await Notifications.setNotificationChannelAsync('default', {
  name: 'NEXORA Notifications',
  importance: Notifications.AndroidImportance.MAX,
  vibrationPattern: [0, 250, 250, 250],
  lightColor: '#39D9FF',
});

        const existing = await Notifications.getPermissionsAsync();
        let finalStatus = existing.status;

        if (finalStatus !== 'granted') {
          const requested = await Notifications.requestPermissionsAsync();
          finalStatus = requested.status;
        }

        if (finalStatus !== 'granted') {
          console.log('Notification permission was not granted.');
          return;
        }

        const projectId =
          Constants.easConfig?.projectId ??
          Constants.expoConfig?.extra?.eas?.projectId;

        if (!projectId) {
          throw new Error('EAS project ID was not found.');
        }

        const tokenData = await Notifications.getDevicePushTokenAsync();

        if (isMounted) {
          console.log('FCM device token:', tokenData.data);
          console.log('EAS project ID:', projectId);
        }
      } catch (error) {
        console.error('Notification registration failed:', error);
      }
    }

    void registerForNotifications();

    const receivedSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log('Notification received:', notification);
      });

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('Notification tapped:', response);
      });

    return () => {
      isMounted = false;
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}
    >
      <View style={styles.webViewContainer}>
        <WebView
          key={refreshKey}
          ref={webViewRef}
          source={{ uri: `${WEBSITE_URL}?refresh=${refreshKey}` }}
          style={styles.webView}
          javaScriptEnabled
          domStorageEnabled
          cacheEnabled={false}
          cacheMode="LOAD_NO_CACHE"
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

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Refresh website"
          onPress={refreshWebsite}
          style={styles.refreshButton}
        >
          <Text style={styles.refreshButtonText}>↻ Refresh</Text>
        </Pressable>

        {isLoading && !hasError && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#39D9FF" />
            <Text style={styles.loadingText}>Loading NEXORA...</Text>
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
              onPress={refreshWebsite}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>Try again</Text>
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
  refreshButton: {
    position: 'absolute',
    top: 10,
    right: 12,
    zIndex: 2,
    elevation: 3,
    backgroundColor: '#10283B',
    borderColor: '#39D9FF',
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  refreshButtonText: {
    color: '#39D9FF',
    fontSize: 13,
    fontWeight: '700',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
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
    ...StyleSheet.absoluteFill,
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
