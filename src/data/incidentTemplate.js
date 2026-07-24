export const INCIDENT_TEMPLATE = {
  id: 'incident-v1',
  title: 'Report Incident',
  questions: [
    {
      id: 'category',
      type: 'select',
      label: 'What kind of incident is this?',
      options: ['Facility damage', 'Workplace injury', 'Vehicle accident', 'Other'],
    },
    {
      id: 'category_other',
      type: 'text',
      label: 'Describe the incident type',
      conditionalOn: { questionId: 'category', equals: 'Other' },
    },
    {
      id: 'severity',
      type: 'select',
      label: 'Severity',
      options: ['Low', 'Medium', 'High - needs immediate attention'],
    },
    {
      id: 'photo',
      type: 'photo',
      label: 'Photo of the incident',
    },
    {
      id: 'notes',
      type: 'text',
      label: 'What happened?',
    },
  ],
};
