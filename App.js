import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation';
import { watchConnectivityAndSync } from './src/storage/sync';

export default function App() {
  useEffect(() => {
    const unsubscribe = watchConnectivityAndSync((result) => {
      if (result.synced > 0) {
        console.log(`Synced ${result.synced} record(s). ${result.remaining} still pending.`);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <RootNavigator />
    </>
  );
}
