import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PROPERTIES } from '../data/properties';
import { getInspections, getIncidents } from '../storage/db';
import { getInspectionFlags } from '../data/summarize';

function buildPropertyStats(property, inspections, incidents) {
  const propInspections = inspections.filter((r) => r.propertyId === property.id);
  const propIncidents = incidents.filter((r) => r.propertyId === property.id);

  const flaggedInspections = propInspections.filter((r) => getInspectionFlags(r).length > 0).length;
  const flagged = flaggedInspections + propIncidents.length;

  const pending = [...propInspections, ...propIncidents].filter((r) => !r.synced && !r.syncError).length;
  const failed = [...propInspections, ...propIncidents].filter((r) => r.syncError).length;

  return { property, flagged, pending, failed };
}

export default function DashboardScreen({ navigation }) {
  const [rows, setRows] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([getInspections(), getIncidents()]).then(([inspections, incidents]) => {
        if (!active) return;
        setRows(PROPERTIES.map((property) => buildPropertyStats(property, inspections, incidents)));
      });
      return () => {
        active = false;
      };
    }, [])
  );

  const totals = rows.reduce(
    (acc, row) => ({
      flagged: acc.flagged + row.flagged,
      pending: acc.pending + row.pending,
      failed: acc.failed + row.failed,
    }),
    { flagged: 0, pending: 0, failed: 0 }
  );

  return (
    <View style={styles.container}>
      <View style={styles.totalsRow}>
        <View style={styles.statTile}>
          <Text style={styles.statValue}>{totals.flagged}</Text>
          <Text style={styles.statLabel}>Flagged issues</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={styles.statValue}>{totals.pending}</Text>
          <Text style={styles.statLabel}>Pending sync</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={[styles.statValue, totals.failed > 0 && styles.statValueAlert]}>
            {totals.failed}
          </Text>
          <Text style={styles.statLabel}>Sync failed</Text>
        </View>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(row) => row.property.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              navigation.navigate('History', { property: item.property })
            }
          >
            <Text style={styles.cardTitle}>{item.property.name}</Text>
            <View style={styles.cardStatsRow}>
              <Text style={styles.cardStat}>
                {item.flagged} flagged issue{item.flagged === 1 ? '' : 's'}
              </Text>
              <Text style={styles.cardStat}>{item.pending} pending</Text>
              {item.failed > 0 && (
                <Text style={[styles.cardStat, styles.cardStatAlert]}>{item.failed} failed</Text>
              )}
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FB' },
  totalsRow: { flexDirection: 'row', padding: 16, gap: 10 },
  statTile: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: '#1E3A5F' },
  statValueAlert: { color: '#A23B3B' },
  statLabel: { fontSize: 11, color: '#5A7184', marginTop: 4, textAlign: 'center' },
  list: { padding: 16, paddingTop: 0 },
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
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1E3A5F' },
  cardStatsRow: { flexDirection: 'row', gap: 14, marginTop: 8 },
  cardStat: { fontSize: 12, color: '#5A7184', fontWeight: '600' },
  cardStatAlert: { color: '#A23B3B' },
});
