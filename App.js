import { useEffect, useRef, useState } from 'react';
import { Alert, SafeAreaView, Dimensions, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { Camera } from 'expo-camera';
import { useKeepAwake } from 'expo-keep-awake';

export default function WebApp() {
  const webViewRef = useRef(null);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useKeepAwake();

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    (async () => {
      const { status: camStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: micStatus } = await requestAudioPermissionsAsync();

      if (camStatus !== 'granted' || micStatus !== 'granted') {
        Alert.alert('Permissões necessárias', 'Este app precisa de acesso à câmera e microfone.');
      }
    })();
  }, []);

  // User-Agent para simular Chrome no iOS
  const customUserAgent =
    Platform.OS === 'ios'
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/109.0.0.0 Mobile/15E148 Safari/604.1'
      : 'Mozilla/5.0 (Linux; Android 12; Pixel 6 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <WebView
        ref={webViewRef}
        source={{ uri: 'https://www.plataformajornada.com.br/index.php?r=site/logout' }}
        style={{ flex: 1 }}
        javaScriptEnabled
        domStorageEnabled
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        allowsFullscreenVideo
        originWhitelist={['*']}
        useWebKit
        userAgent={customUserAgent} // Aqui força o navegador
      />
    </SafeAreaView>
  );
}
