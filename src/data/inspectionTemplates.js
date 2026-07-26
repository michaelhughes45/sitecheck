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
      required: true,
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
      required: true,
    },
    {
      id: 'security_check',
      type: 'boolean',
      label: 'Are all gates, locks, and cameras functioning?',
      required: true,
    },
    {
      id: 'security_issue_type',
      type: 'select',
      label: 'What type of security issue?',
      options: ['Broken lock', 'Camera offline', 'Gate malfunction', 'Other'],
      conditionalOn: { questionId: 'security_check', equals: false },
      required: true,
    },
    {
      id: 'security_issue_other',
      type: 'text',
      label: 'Describe the issue',
      conditionalOn: { questionId: 'security_issue_type', equals: 'Other' },
      required: true,
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
      required: true,
    },
    {
      id: 'hvac_severity',
      type: 'select',
      label: 'How severe is the HVAC issue?',
      options: ['Minor - monitor', 'Moderate - schedule repair', 'Urgent - unit affected'],
      conditionalOn: { questionId: 'hvac_functioning', equals: false },
      required: true,
    },
    {
      id: 'unit_count_affected',
      type: 'number',
      label: 'How many units are affected?',
      conditionalOn: { questionId: 'hvac_severity', equals: 'Urgent - unit affected' },
      required: true,
    },
    {
      id: 'general_notes',
      type: 'text',
      label: 'Any other notes from this walkthrough?',
    },
  ],
};

export const FIRE_SAFETY_TEMPLATE = {
  id: 'fire-safety-v1',
  title: 'Fire Safety Inspection',
  questions: [
    {
      id: 'extinguishers_present',
      type: 'boolean',
      label: 'Are fire extinguishers present and accessible at all required locations?',
      required: true,
    },
    {
      id: 'extinguishers_missing_count',
      type: 'number',
      label: 'How many locations are missing an extinguisher or have one blocked?',
      conditionalOn: { questionId: 'extinguishers_present', equals: false },
      required: true,
    },
    {
      id: 'extinguishers_photo',
      type: 'photo',
      label: 'Photo of the missing or inaccessible location',
      conditionalOn: { questionId: 'extinguishers_present', equals: false },
    },
    {
      id: 'alarms_tested',
      type: 'boolean',
      label: 'Have fire alarms been tested in the last 12 months?',
      required: true,
    },
    {
      id: 'alarm_issue_severity',
      type: 'select',
      label: 'How severe is the alarm testing gap?',
      options: ['Minor - schedule test', 'Moderate - some units untested', 'Urgent - system may be non-functional'],
      conditionalOn: { questionId: 'alarms_tested', equals: false },
      required: true,
    },
    {
      id: 'evacuation_confidence',
      type: 'rating',
      label: 'On a scale of 1-5, how confident is on-site staff in evacuating without a working alarm system?',
      conditionalOn: { questionId: 'alarm_issue_severity', equals: 'Urgent - system may be non-functional' },
      required: true,
    },
    {
      id: 'exits_clear',
      type: 'boolean',
      label: 'Are all emergency exits clear and unobstructed?',
      required: true,
    },
    {
      id: 'exits_issue_notes',
      type: 'text',
      label: 'Describe the obstruction',
      conditionalOn: { questionId: 'exits_clear', equals: false },
      required: true,
    },
    {
      id: 'exits_photo',
      type: 'photo',
      label: 'Photo of the obstruction',
      conditionalOn: { questionId: 'exits_clear', equals: false },
    },
    {
      id: 'sprinkler_system',
      type: 'select',
      label: 'Sprinkler system status',
      options: ['Fully operational', 'Partially operational', 'Not operational', 'Not applicable'],
      required: true,
    },
    {
      id: 'sprinkler_notes',
      type: 'text',
      label: 'Describe the sprinkler system issue',
      conditionalOn: { questionId: 'sprinkler_system', equals: 'Not operational' },
      required: true,
    },
    {
      id: 'general_notes',
      type: 'text',
      label: 'Any other fire safety notes from this walkthrough?',
    },
  ],
};

export const TEMPLATES_BY_ID = {
  [SITE_AUDIT_TEMPLATE.id]: SITE_AUDIT_TEMPLATE,
  [FIRE_SAFETY_TEMPLATE.id]: FIRE_SAFETY_TEMPLATE,
};
