import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PROPERTIES } from '../data/properties';
import { getSyncQueue } from '../storage/db';

export default function HomeScreen({ navigation }) {
  const [pendingCount, setPendingCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getSyncQueue().then((q) => active && setPendingCount(q.length));
      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      {pendingCount > 0 && (
        <View style={styles.syncBanner}>
          <Text style={styles.syncBannerText}>
            {pendingCount} record{pendingCount > 1 ? 's' : ''} waiting to sync — will upload when back online
          </Text>
        </View>
      )}

      <FlatList
        data={PROPERTIES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('PropertyDetail', { property: item })}
          >
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>{item.address}</Text>
            <Text style={styles.cardMeta}>
              {item.units} units · {item.sqft.toLocaleString()} sq ft
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FB' },
  list: { padding: 16 },
  syncBanner: {
    backgroundColor: '#FFF4D6',
    padding: 10,
    paddingHorizontal: 16,
  },
  syncBannerText: { color: '#8A6D00', fontSize: 13, fontWeight: '500' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#1E3A5F' },
  cardSubtitle: { fontSize: 13, color: '#5A7184', marginTop: 2 },
  cardMeta: { fontSize: 12, color: '#8A99A8', marginTop: 8 },
});
