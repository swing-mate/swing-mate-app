import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthInput } from '../components/AuthInput';
import { PastelButton } from '../components/PastelButton';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'> & { onLogin: () => Promise<void> };

export function LoginScreen({ navigation, onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    await onLogin();
    navigation.replace('Onboarding');
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroCard}>
          <View style={styles.caddies}>
            <Text style={styles.caddie}>🌿</Text><Text style={styles.caddie}>💗</Text><Text style={styles.caddie}>💜</Text>
          </View>
          <Text style={styles.english}>Swing Mate</Text>
          <Text style={styles.title}>スイングメイト</Text>
          <Text style={styles.catch}>かわいいキャディとスイング上達</Text>
          <Text style={styles.sub}>撮影・分析・比較を、パステルなキャディたちと楽しく。</Text>
        </View>

        <View style={styles.form}>
          <AuthInput value={email} onChangeText={setEmail} placeholder="メールアドレス" autoCapitalize="none" keyboardType="email-address" />
          <AuthInput value={password} onChangeText={setPassword} placeholder="パスワード" secureTextEntry />
          <PastelButton label="ログイン" onPress={handleLogin} />
          <PastelButton label="新規登録" onPress={handleLogin} variant="ghost" />
          <PastelButton label="ゲストではじめる" onPress={handleLogin} variant="secondary" />
          <Text style={styles.link}>パスワードを忘れた方</Text>
          <View style={styles.socialRow}>
            <PastelButton label="Googleで続ける" onPress={() => undefined} variant="secondary" style={styles.social} />
            <PastelButton label="Appleで続ける" onPress={() => undefined} variant="secondary" style={styles.social} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, padding: spacing.lg, paddingTop: spacing.xxl, gap: spacing.lg },
  heroCard: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, borderWidth: 1, borderColor: colors.border },
  caddies: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  caddie: { backgroundColor: colors.pinkLight, borderRadius: 35, fontSize: 34, overflow: 'hidden', padding: spacing.md },
  english: { color: colors.mint, fontSize: 18, fontWeight: '900' },
  title: { color: colors.pink, fontSize: 34, fontWeight: '900', marginTop: spacing.sm },
  catch: { color: colors.lavender, fontSize: 20, fontWeight: '900', marginTop: spacing.sm, textAlign: 'center' },
  sub: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: spacing.md, textAlign: 'center' },
  form: { gap: spacing.md },
  link: { color: colors.pink, fontWeight: '800', textAlign: 'center' },
  socialRow: { flexDirection: 'row', gap: spacing.sm },
  social: { flex: 1, paddingHorizontal: spacing.sm },
});
