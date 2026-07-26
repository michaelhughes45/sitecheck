import { TEMPLATES_BY_ID } from './inspectionTemplates';

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

// Returns the list of flagged-issue strings for an inspection record,
// regardless of which template it was filled out with.
export function getInspectionFlags(record) {
  return record.templateId === 'fire-safety-v1'
    ? summarizeFireSafety(record.answers)
    : summarizeSiteAudit(record.answers);
}

export function summarizeInspection(record) {
  const flags = getInspectionFlags(record);
  const templateTitle = TEMPLATES_BY_ID[record.templateId]?.title;
  const flagText = flags.length ? flags.join(', ') : 'No issues found';
  return templateTitle ? `${templateTitle} — ${flagText}` : flagText;
}
