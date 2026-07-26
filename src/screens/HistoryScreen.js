import React, { useCallback, useState } from 'react';
import { View, Text, SectionList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getInspections, getIncidents } from '../storage/db';
import { TEMPLATES_BY_ID } from '../data/inspectionTemplates';

function summarizeSiteAudit(answers) {
  const flags = [];
  if (answers.exterior_condition === 'Needs attention') flags.push('Exterior issue');
  if (answers.security_check === false) flags.push('Security issue');
  if (answers.hvac_functioning === false) flags.push('HVAC issue');
  return flags;
}

function summarizeFireSafety(answers) {
  const flags = [];
  if (answers.extinguishers_present === false) flags.push('Extinguisher issue');
  if (answers.alarms_tested === false) flags.push('Alarm testing overdue');
  if (answers.exits_clear === false) flags.push('Exit obstructed');
  if (answers.sprinkler_system === 'Not operational' || answers.sprinkler_system === 'Partially operational') {
    flags.push('Sprinkler issue');
  }
  return flags;
}

function summarizeInspection(record) {
  const flags =
    record.templateId === 'fire-safety-v1'
      ? summarizeFireSafety(record.answers)
      : summarizeSiteAudit(record.answers);
  const templateTitle = TEMPLATES_BY_ID[record.templateId]?.title;
  const flagText = flags.length ? flags.join(', ') : 'No issues found';
  return templateTitle ? `${templateTitle} — ${flagText}` : flagText;
}

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
            <View style={[styles.badge, item.synced ? styles.badgeSynced : styles.badgePending]}>
              <Text style={styles.badgeText}>{item.synced ? 'Synced' : 'Pending'}</Text>
            </View>
          </View>
          <Text style={styles.summary}>
            {section.type === 'inspection'
              ? summarizeInspection(item)
              : `${item.answers.category} · ${item.answers.severity}`}
          </Text>
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
  badgeText: { fontSize: 11, fontWeight: '700', color: '#3B5A46' },
  empty: { fontSize: 13, color: '#8A99A8', fontStyle: 'italic', marginBottom: 8 },
});
