// Each question can declare `conditionalOn`, pointing at another question's id
// and the answer value that must be present for this question to render.
// The form engine (src/components/DynamicForm.js) walks this list top to
// bottom and evaluates visibility live as answers change, so a chain of
// several dependent questions can unfold naturally as the user answers.

export const SITE_AUDIT_TEMPLATE = {
  id: 'site-audit-v1',
  title: 'Routine Site Audit',
  questions: [
    {
      id: 'exterior_condition',
      type: 'select',
      label: 'Overall exterior condition',
      options: ['Good', 'Fair', 'Needs attention'],
    },
    {
      id: 'exterior_photo',
      type: 'photo',
      label: 'Photo of exterior',
      conditionalOn: { questionId: 'exterior_condition', equals: 'Needs attention' },
    },
    {
      id: 'exterior_notes',
      type: 'text',
      label: 'Describe the exterior issue',
      conditionalOn: { questionId: 'exterior_condition', equals: 'Needs attention' },
    },
    {
      id: 'security_check',
      type: 'boolean',
      label: 'Are all gates, locks, and cameras functioning?',
    },
    {
      id: 'security_issue_type',
      type: 'select',
      label: 'What type of security issue?',
      options: ['Broken lock', 'Camera offline', 'Gate malfunction', 'Other'],
      conditionalOn: { questionId: 'security_check', equals: false },
    },
    {
      id: 'security_issue_other',
      type: 'text',
      label: 'Describe the issue',
      conditionalOn: { questionId: 'security_issue_type', equals: 'Other' },
    },
    {
      id: 'security_photo',
      type: 'photo',
      label: 'Photo of the security issue',
      conditionalOn: { questionId: 'security_check', equals: false },
    },
    {
      id: 'hvac_functioning',
      type: 'boolean',
      label: 'Is HVAC / climate control functioning normally?',
    },
    {
      id: 'hvac_severity',
      type: 'select',
      label: 'How severe is the HVAC issue?',
      options: ['Minor - monitor', 'Moderate - schedule repair', 'Urgent - unit affected'],
      conditionalOn: { questionId: 'hvac_functioning', equals: false },
    },
    {
      id: 'unit_count_affected',
      type: 'number',
      label: 'How many units are affected?',
      conditionalOn: { questionId: 'hvac_severity', equals: 'Urgent - unit affected' },
    },
    {
      id: 'general_notes',
      type: 'text',
      label: 'Any other notes from this walkthrough?',
    },
  ],
};

export const TEMPLATES_BY_ID = {
  [SITE_AUDIT_TEMPLATE.id]: SITE_AUDIT_TEMPLATE,
};
