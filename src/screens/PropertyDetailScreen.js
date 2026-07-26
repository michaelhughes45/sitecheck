import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SITE_AUDIT_TEMPLATE, FIRE_SAFETY_TEMPLATE } from '../data/inspectionTemplates';

export default function PropertyDetailScreen({ route, navigation }) {
  const { property } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{property.name}</Text>
      <Text style={styles.subtitle}>{property.address}</Text>

      <View style={styles.actions}>
        <Pressable
          style={[styles.actionButton, styles.primary]}
          onPress={() => navigation.navigate('InspectionForm', { property, templateId: SITE_AUDIT_TEMPLATE.id })}
        >
          <Text style={styles.actionTextPrimary}>Start Site Audit</Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, styles.primary]}
          onPress={() => navigation.navigate('InspectionForm', { property, templateId: FIRE_SAFETY_TEMPLATE.id })}
        >
          <Text style={styles.actionTextPrimary}>Fire Safety Inspection</Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, styles.danger]}
          onPress={() => navigation.navigate('IncidentReport', { property })}
        >
          <Text style={styles.actionTextPrimary}>Report Incident</Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, styles.secondary]}
          onPress={() => navigation.navigate('History', { property })}
        >
          <Text style={styles.actionTextSecondary}>View History</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FB', padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#1E3A5F' },
  subtitle: { fontSize: 14, color: '#5A7184', marginTop: 4, marginBottom: 28 },
  actions: { gap: 12 },
  actionButton: { borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  primary: { backgroundColor: '#1E3A5F' },
  danger: { backgroundColor: '#B4432D' },
  secondary: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#C9D6E3' },
  actionTextPrimary: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  actionTextSecondary: { color: '#1E3A5F', fontWeight: '700', fontSize: 15 },
});
