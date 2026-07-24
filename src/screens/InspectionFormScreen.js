import React from 'react';
import { Alert } from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import DynamicForm from '../components/DynamicForm';
import { SITE_AUDIT_TEMPLATE } from '../data/inspectionTemplates';
import { saveInspection } from '../storage/db';

export default function InspectionFormScreen({ route, navigation }) {
  const { property } = route.params;

  const handleSubmit = async (answers) => {
    const record = {
      id: uuidv4(),
      propertyId: property.id,
      propertyName: property.name,
      templateId: SITE_AUDIT_TEMPLATE.id,
      answers,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await saveInspection(record);

    Alert.alert(
      'Audit saved',
      'This audit is saved on your device and will sync automatically once you\'re back online.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <DynamicForm
      template={SITE_AUDIT_TEMPLATE}
      onSubmit={handleSubmit}
      submitLabel="Complete Audit"
    />
  );
}
