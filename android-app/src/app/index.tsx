
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const WEBSITE_URL =
  'https://sam29w.github.io/nexora-robotics-webview/';

export default function HomeScreen() {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (canGoBack) {
          webViewRef.current?.goBack();
          return true;
        }

        // Let Android handle the back action when
        // the WebView is already on its first page.
        return false;
      },
    );

    return () => backHandler.remove();
  }, [canGoBack]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.webViewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: WEBSITE_URL }}
          style={styles.webView}
          javaScriptEnabled
          domStorageEnabled
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onNavigationStateChange={(navState) =>
            setCanGoBack(navState.canGoBack)
          }
          onError={() => setIsLoading(false)}
          onHttpError={() => setIsLoading(false)}
        />

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#39D9FF" />
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
    backgroundColor: '#07111F',
  },
});
