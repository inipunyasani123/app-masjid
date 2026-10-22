import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { W } from '@/ui/tema';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: W.kertas }, animation: 'slide_from_right' }} />
    </>
  );
}
