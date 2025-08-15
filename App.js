import React, { useEffect, useRef, useState } from 'react';
import { Alert, SafeAreaView, Dimensions, Platform, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';
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
      try {
        const { status: camStatus } = await Camera.requestCameraPermissionsAsync();
        const { status: audioStatus } = await Audio.requestPermissionsAsync();

        if (camStatus !== 'granted' || audioStatus !== 'granted') {
          Alert.alert(
            'Permissões necessárias',
            'O app precisa de acesso à câmera e ao microfone para funcionar corretamente. Vá em Ajustes → Jornada e habilite as permissões, ou permita quando o sistema perguntar.',
            [
              { text: 'Abrir Ajustes', onPress: () => Linking.openSettings() },
              { text: 'Fechar', style: 'cancel' },
            ]
          );
        }
      } catch (err) {
        console.warn('Erro ao solicitar permissões:', err);
      }
    })();
  }, []);

  // User-Agent para simular Chrome no iOS
  const customUserAgent =
    Platform.OS === 'ios'
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/109.0.0.0 Mobile/15E148 Safari/604.1'
      : 'Mozilla/5.0 (Linux; Android 12; Pixel 6 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36';

  // Bloqueia navegações para domínios não autorizados (segurança)
  const allowedOrigin = 'https://www.plataformajornada.com.br';

  const shouldStartLoad = (request) => {
    try {
      const url = request.url || '';
      // permite navegação interna para o domínio principal
      if (url.startsWith(allowedOrigin)) return true;
      // permite deep links do próprio app (se houver) e skippable https
      // caso contrário, bloqueia e abre no Safari
      Linking.openURL(url).catch(() => {});
      return false;
    } catch (e) {
      return false;
    }
  };

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
        originWhitelist={[allowedOrigin]}
        useWebKit
        userAgent={customUserAgent}
        onShouldStartLoadWithRequest={shouldStartLoad}
        // evita que a página force o reload total com URL de logout acidental
        startInLoadingState
      />
    </SafeAreaView>
  );
}