import React, { useCallback, useState } from 'react';
import { View, Text, SectionList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getInspections, getIncidents } from '../storage/db';
import { summarizeInspection } from '../data/summarize';

export default function HistoryScreen({ route }) {
  const { property } = route.params;
  const [sections, setSections] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([getInspections(property.id), getIncidents(property.id)]).then(
        ([inspections, incidents]) => {
          if (!active) return;
          setSections([
            { title: 'Inspections', data: inspections, type: 'inspection' },
            { title: 'Incidents', data: incidents, type: 'incident' },
          ]);
        }
      );
      return () => {
        active = false;
      };
    }, [property.id])
  );

  return (
    <SectionList
      style={styles.container}
      sections={sections}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      renderSectionHeader={({ section }) => (
        <Text style={styles.sectionHeader}>
          {section.title} ({section.data.length})
        </Text>
      )}
      renderItem={({ item, section }) => (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
            <View
              style={[
                styles.badge,
                item.syncError ? styles.badgeFailed : item.synced ? styles.badgeSynced : styles.badgePending,
              ]}
            >
              <Text style={[styles.badgeText, item.syncError && styles.badgeTextFailed]}>
                {item.syncError ? 'Sync failed' : item.synced ? 'Synced' : 'Pending'}
              </Text>
            </View>
          </View>
          <Text style={styles.summary}>
            {section.type === 'inspection'
              ? summarizeInspection(item)
              : `${item.answers.category} · ${item.answers.severity}`}
          </Text>
          {item.syncError && <Text style={styles.syncErrorText}>{item.syncError}</Text>}
        </View>
      )}
      renderSectionFooter={({ section }) =>
        section.data.length === 0 ? <Text style={styles.empty}>None yet</Text> : null
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FB' },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5A7184',
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 12, color: '#8A99A8' },
  summary: { fontSize: 14, color: '#1E3A5F', marginTop: 6, fontWeight: '500' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeSynced: { backgroundColor: '#E2F1E8' },
  badgePending: { backgroundColor: '#FFF4D6' },
  badgeFailed: { backgroundColor: '#FBE1E1' },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#3B5A46' },
  badgeTextFailed: { color: '#8A2C2C' },
  syncErrorText: { fontSize: 12, color: '#A23B3B', marginTop: 4, fontStyle: 'italic' },
  empty: { fontSize: 13, color: '#8A99A8', fontStyle: 'italic', marginBottom: 8 },
});
