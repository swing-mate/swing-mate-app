import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { PastelButton } from './src/components/PastelButton';
import { ScoreCard } from './src/components/ScoreCard';
import { authService } from './src/services/authService';
import { storageService } from './src/services/storageService';
import { AnalysisLoadingScreen } from './src/screens/AnalysisLoadingScreen';
import { AnalysisResultScreen } from './src/screens/AnalysisResultScreen';
import { BestSwingCompareScreen } from './src/screens/BestSwingCompareScreen';
import { CharacterSelectScreen } from './src/screens/CharacterSelectScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { MyPageScreen } from './src/screens/MyPageScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { SwingRecordScreen } from './src/screens/SwingRecordScreen';
import { VideoAnalysisPlayerScreen } from './src/screens/VideoAnalysisPlayerScreen';
import { colors } from './src/theme/colors';
import { radius, spacing } from './src/theme/spacing';
import { CharacterId } from './src/types/character';
import { RootStackParamList, TabParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState<CharacterId | null>(null);

  useEffect(() => {
    const hydrate = async () => {
      const [loggedIn, characterId] = await Promise.all([
        storageService.getIsLoggedIn(),
        storageService.getSelectedCharacterId(),
      ]);
      setIsLoggedIn(loggedIn);
      setSelectedCharacterId(characterId);
      setLoading(false);
    };
    hydrate();
  }, []);

  const handleLogin = async () => {
    await authService.dummyLogin();
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsLoggedIn(false);
  };

  const handleSelectCharacter = async (id: CharacterId) => {
    await storageService.setSelectedCharacterId(id);
    setSelectedCharacterId(id);
  };

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator color={colors.pink} size="large" /><Text style={styles.loadingText}>スイングメイトを準備中...</Text></View>;
  }

  const initialRouteName: keyof RootStackParamList = !isLoggedIn ? 'Login' : selectedCharacterId ? 'MainTabs' : 'CharacterSelect';

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
      <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login">{(props) => <LoginScreen {...props} onLogin={handleLogin} />}</Stack.Screen>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="CharacterSelect">{(props) => <CharacterSelectScreen {...props} selectedCharacterId={selectedCharacterId} onSelectCharacter={handleSelectCharacter} />}</Stack.Screen>
        <Stack.Screen name="MainTabs">{() => <MainTabs selectedCharacterId={selectedCharacterId} onLogout={handleLogout} />}</Stack.Screen>
        <Stack.Screen name="AnalysisLoading">{(props) => <AnalysisLoadingScreen {...props} selectedCharacterId={selectedCharacterId} />}</Stack.Screen>
        <Stack.Screen name="AnalysisResult">{(props) => <AnalysisResultScreen {...props} selectedCharacterId={selectedCharacterId} />}</Stack.Screen>
        <Stack.Screen name="VideoAnalysisPlayer" component={VideoAnalysisPlayerScreen} />
        <Stack.Screen name="BestCompare">{(props) => <BestSwingCompareScreen {...props} selectedCharacterId={selectedCharacterId} />}</Stack.Screen>
      </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function MainTabs({ selectedCharacterId, onLogout }: { selectedCharacterId: CharacterId | null; onLogout: () => Promise<void> }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.pink,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 70, paddingBottom: 10, paddingTop: 8 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '800' },
      }}
    >
      <Tab.Screen name="Home" options={{ tabBarLabel: 'ホーム', tabBarIcon: ({ color }) => <Text style={{ color }}>🏠</Text> }}>{(props) => <HomeScreen {...props} selectedCharacterId={selectedCharacterId} />}</Tab.Screen>
      <Tab.Screen name="Record" options={{ tabBarLabel: '撮影', tabBarIcon: ({ color }) => <Text style={{ color }}>📷</Text> }}>{(props) => <SwingRecordScreen {...props} selectedCharacterId={selectedCharacterId} />}</Tab.Screen>
      <Tab.Screen name="Analysis" options={{ tabBarLabel: '分析', tabBarIcon: ({ color }) => <Text style={{ color }}>📊</Text> }}>{(props) => <AnalysisTab {...props} />}</Tab.Screen>
      <Tab.Screen name="Progress" options={{ tabBarLabel: '成長', tabBarIcon: ({ color }) => <Text style={{ color }}>📈</Text> }}>{(props) => <ProgressScreen {...props} selectedCharacterId={selectedCharacterId} />}</Tab.Screen>
      <Tab.Screen name="MyPage" options={{ tabBarLabel: 'マイページ', tabBarIcon: ({ color }) => <Text style={{ color }}>👤</Text> }}>{(props) => <MyPageScreen {...props} selectedCharacterId={selectedCharacterId} onLogout={onLogout} />}</Tab.Screen>
    </Tab.Navigator>
  );
}

function AnalysisTab({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.analysisTab, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.analysisCard}>
        <Text style={styles.analysisTitle}>最新の分析</Text>
        <ScoreCard score={78} rank="B+" title="ダミースコア" />
        <Text style={styles.analysisText}>撮影後は、ダミーデータでスイング分析結果とベスト比較を確認できます。</Text>
        <PastelButton label="スイングを撮影する" onPress={() => navigation.navigate('Record')} />
        <PastelButton label="ベストスイングと比較" onPress={() => navigation.getParent()?.navigate('BestCompare')} variant="secondary" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center' },
  loadingText: { color: colors.text, fontWeight: '800', marginTop: spacing.md },
  analysisTab: { backgroundColor: colors.background, flex: 1, padding: spacing.lg },
  analysisCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, gap: spacing.md, padding: spacing.lg },
  analysisTitle: { color: colors.text, fontSize: 22, fontWeight: '900', textAlign: 'center' },
  analysisText: { color: colors.muted, fontSize: 14, fontWeight: '700', lineHeight: 22, textAlign: 'center' },
});
