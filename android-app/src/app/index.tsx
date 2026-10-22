import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const DEFAULT_WEBSITE_URL =
  process.env.EXPO_PUBLIC_WEBSITE_URL ||
  'https://sam29w.github.io/nexora-robotics-webview/';

// Custom Mobile Chrome UserAgent to allow Google OAuth flows and prevent "disallowed_useragent" errors
const WEBVIEW_USER_AGENT =
  'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36';

export default function HomeScreen() {
  const webViewRef = useRef<WebView>(null);
  const [currentUrl, setCurrentUrl] = useState(DEFAULT_WEBSITE_URL);
  const [tempUrl, setTempUrl] = useState(DEFAULT_WEBSITE_URL);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [canGoBack, setCanGoBack] = useState(false);

  // Safety timer: Never allow the loading overlay to get stuck indefinitely
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (isLoading) {
      timer = setTimeout(() => {
        // If still loading after 7 seconds, dismiss full-screen blocker to reveal rendered page
        setIsLoading(false);
      }, 7000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading]);

  // Hardware Android Back Button Handler
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

  const retryLoading = () => {
    setHasError(false);
    setIsLoading(true);
    setLoadProgress(0);
    webViewRef.current?.reload();
  };

  const handleSaveCustomUrl = () => {
    let cleanUrl = tempUrl.trim();
    if (cleanUrl && !cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }
    setCurrentUrl(cleanUrl);
    setIsUrlModalOpen(false);
    setHasError(false);
    setIsLoading(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Top Network Indicator / Mini Header */}
      <View style={styles.topStatusHeader}>
        <View style={styles.urlIndicator}>
          <View style={[styles.statusDot, hasError ? styles.dotError : styles.dotActive]} />
          <Text style={styles.urlText} numberOfLines={1}>
            {currentUrl}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => setIsUrlModalOpen(true)}
          style={styles.changeUrlBtn}
        >
          <Text style={styles.changeUrlText}>⚙️ URL</Text>
        </Pressable>
      </View>

      {/* Slim Top Progress Bar (Non-blocking) */}
      {isLoading && (
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.max(15, loadProgress * 100)}%` },
            ]}
          />
        </View>
      )}

      <View style={styles.webViewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: currentUrl }}
          style={styles.webView}
          userAgent={WEBVIEW_USER_AGENT}
          // Enable full JavaScript and DOM LocalStorage
          javaScriptEnabled={true}
          domStorageEnabled={true}
          // Network independence & Offline caching
          cacheEnabled={true}
          cacheMode="LOAD_DEFAULT"
          originWhitelist={['*']}
          mixedContentMode="always"
          allowsInlineMediaPlayback={true}
          // Loading event handlers
          onLoadStart={() => {
            setIsLoading(true);
            setHasError(false);
          }}
          onLoadProgress={({ nativeEvent }) => {
            setLoadProgress(nativeEvent.progress);
            // Once 70% loaded, dismiss blocking overlay so user can interact
            if (nativeEvent.progress >= 0.7) {
              setIsLoading(false);
            }
          }}
          onLoadEnd={() => {
            setIsLoading(false);
            setLoadProgress(1);
          }}
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
          }}
          onError={(event) => {
            setIsLoading(false);
            setHasError(true);
            setErrorMessage(event.nativeEvent.description || 'Failed to connect to web server.');
          }}
          onHttpError={(event) => {
            if (event.nativeEvent.statusCode >= 400) {
              setIsLoading(false);
              setHasError(true);
              setErrorMessage(`Server responded with HTTP ${event.nativeEvent.statusCode}`);
            }
          }}
        />

        {/* Initial Spinner (only shows for the first 2 seconds or until progress reaches 70%) */}
        {isLoading && loadProgress < 0.4 && !hasError && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#39D9FF" />
            <Text style={styles.loadingText}>Connecting to NEXORA...</Text>
            <Text style={styles.loadingSubtext}>Loading across active networks</Text>
          </View>
        )}

        {/* Error and Offline Fallback Screen */}
        {hasError && (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorIcon}>📡</Text>
            <Text style={styles.errorTitle}>Unable to Reach Server</Text>
            <Text style={styles.errorMessage}>
              {errorMessage || 'The app could not connect to the remote website. Please verify internet access or switch the server URL.'}
            </Text>

            <View style={styles.errorActionRow}>
              <Pressable
                accessibilityRole="button"
                onPress={retryLoading}
                style={styles.retryButton}
              >
                <Text style={styles.retryButtonText}>🔄 Try Again</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => setIsUrlModalOpen(true)}
                style={styles.switchUrlButton}
              >
                <Text style={styles.switchUrlButtonText}>⚙️ Switch Server</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {/* URL Configuration Modal */}
      <Modal
        visible={isUrlModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsUrlModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Network & Server URL</Text>
            <Text style={styles.modalSubtitle}>
              Configure which web address this mobile app connects to:
            </Text>

            <TextInput
              style={styles.modalInput}
              value={tempUrl}
              onChangeText={setTempUrl}
              placeholder="https://your-site.github.io"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />

            <View style={styles.presetContainer}>
              <Text style={styles.presetLabel}>Quick Presets:</Text>
              <Pressable
                style={styles.presetBadge}
                onPress={() => setTempUrl(DEFAULT_WEBSITE_URL)}
              >
                <Text style={styles.presetBadgeText}>🌐 Deployed (GitHub Pages)</Text>
              </Pressable>
              <Pressable
                style={styles.presetBadge}
                onPress={() => setTempUrl('http://10.0.2.2:5500')}
              >
                <Text style={styles.presetBadgeText}>💻 Android Emulator (10.0.2.2:5500)</Text>
              </Pressable>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancelBtn}
                onPress={() => setIsUrlModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.modalSaveBtn}
                onPress={handleSaveCustomUrl}
              >
                <Text style={styles.modalSaveText}>Connect</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07111F',
  },
  topStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#0a1626',
    borderBottomWidth: 1,
    borderBottomColor: '#1a2a40',
  },
  urlIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: '#34d399',
  },
  dotError: {
    backgroundColor: '#f87171',
  },
  urlText: {
    color: '#94a3b8',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    flex: 1,
  },
  changeUrlBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#1e293b',
  },
  changeUrlText: {
    color: '#39D9FF',
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarBackground: {
    height: 3,
    backgroundColor: '#0f172a',
    width: '100%',
  },
  progressBarFill: {
    height: 3,
    backgroundColor: '#39D9FF',
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: '#07111F',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#07111F',
    zIndex: 10,
  },
  loadingText: {
    color: '#D8E8F5',
    fontSize: 15,
    fontWeight: '600',
  },
  loadingSubtext: {
    color: '#64748b',
    fontSize: 12,
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#07111F',
    zIndex: 20,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorMessage: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  errorActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    backgroundColor: '#39D9FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#07111F',
    fontWeight: '700',
    fontSize: 14,
  },
  switchUrlButton: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  switchUrlButtonText: {
    color: '#e2e8f0',
    fontWeight: '600',
    fontSize: 14,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#334155',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 14,
  },
  presetContainer: {
    gap: 6,
    marginBottom: 20,
  },
  presetLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 2,
  },
  presetBadge: {
    backgroundColor: '#1e293b',
    padding: 8,
    borderRadius: 6,
  },
  presetBadgeText: {
    color: '#38bdf8',
    fontSize: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  modalCancelText: {
    color: '#94a3b8',
    fontWeight: '600',
    fontSize: 14,
  },
  modalSaveBtn: {
    backgroundColor: '#39D9FF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 6,
  },
  modalSaveText: {
    color: '#07111F',
    fontWeight: '700',
    fontSize: 14,
  },
});
