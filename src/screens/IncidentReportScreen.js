import React from 'react';
import { Alert } from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import DynamicForm from '../components/DynamicForm';
import { INCIDENT_TEMPLATE } from '../data/incidentTemplate';
import { saveIncident } from '../storage/db';

export default function IncidentReportScreen({ route, navigation }) {
  const { property } = route.params;

  const handleSubmit = async (answers) => {
    const record = {
      id: uuidv4(),
      propertyId: property.id,
      propertyName: property.name,
      answers,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await saveIncident(record);

    Alert.alert('Incident logged', 'Saved on your device and queued to sync.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <DynamicForm
      template={INCIDENT_TEMPLATE}
      onSubmit={handleSubmit}
      submitLabel="Submit Incident"
    />
  );
}
