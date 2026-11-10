import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { colors } from './src/theme/theme';
import { TabKey } from './src/types';
import FloatingNavBar from './src/components/FloatingNavBar';
import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import SpecsScreen from './src/screens/SpecsScreen';
import DiagnosticsScreen from './src/screens/DiagnosticsScreen';
import StoreScreen from './src/screens/StoreScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [tab, setTab] = useState<TabKey>('home');

  // Switching is instant; each screen's cards play their own subtle entrance,
  // so there's no competing fade layer (which caused the flicker).
  const switchTab = (next: TabKey) => setTab(next);

  const renderScreen = () => {
    switch (tab) {
      case 'home':
        return <HomeScreen onNavigate={switchTab} />;
      case 'specs':
        return <SpecsScreen />;
      case 'diagnostics':
        return <DiagnosticsScreen />;
      case 'store':
        return <StoreScreen />;
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar style="light" />
        <SafeAreaView style={styles.safe} edges={['top']}>
          {/* key remounts the screen on tab change so its entrance replays cleanly */}
          <View key={tab} style={styles.screen}>
            {renderScreen()}
          </View>
        </SafeAreaView>

        {!showSplash && <FloatingNavBar active={tab} onChange={switchTab} />}

        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  safe: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
});
