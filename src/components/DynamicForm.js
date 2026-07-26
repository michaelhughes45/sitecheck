import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// Decides whether a question should currently be visible, given the
// answers collected so far. A question with no `conditionalOn` is
// always visible. Otherwise it's visible only if the referenced parent
// question's current answer matches `equals`.
function isVisible(question, answers) {
  if (!question.conditionalOn) return true;
  const { questionId, equals } = question.conditionalOn;
  return answers[questionId] === equals;
}

// Type-aware "no answer given yet" check, used to validate required fields.
function isAnswerEmpty(question, value) {
  switch (question.type) {
    case 'boolean':
    case 'rating':
      return value == null;
    case 'text':
      return !value || !value.trim();
    case 'number':
      return value === undefined || value === null || value === '';
    case 'select':
    case 'photo':
    default:
      return !value;
  }
}

function BooleanField({ question, value, onChange }) {
  return (
    <View style={styles.row}>
      <Pressable
        style={[styles.pillButton, value === true && styles.pillButtonActive]}
        onPress={() => onChange(true)}
      >
        <Text style={[styles.pillText, value === true && styles.pillTextActive]}>Yes</Text>
      </Pressable>
      <Pressable
        style={[styles.pillButton, value === false && styles.pillButtonActive]}
        onPress={() => onChange(false)}
      >
        <Text style={[styles.pillText, value === false && styles.pillTextActive]}>No</Text>
      </Pressable>
    </View>
  );
}

function SelectField({ question, value, onChange }) {
  return (
    <View style={styles.wrapRow}>
      {question.options.map((opt) => (
        <Pressable
          key={opt}
          style={[styles.pillButton, value === opt && styles.pillButtonActive]}
          onPress={() => onChange(opt)}
        >
          <Text style={[styles.pillText, value === opt && styles.pillTextActive]}>{opt}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function RatingField({ question, value, onChange }) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable
          key={n}
          style={[styles.ratingButton, value === n && styles.pillButtonActive]}
          onPress={() => onChange(n)}
        >
          <Text style={[styles.pillText, value === n && styles.pillTextActive]}>{n}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function TextField({ question, value, onChange }) {
  return (
    <TextInput
      style={styles.textInput}
      placeholder="Type here..."
      value={value || ''}
      onChangeText={onChange}
      multiline
    />
  );
}

function NumberField({ question, value, onChange }) {
  return (
    <TextInput
      style={styles.textInput}
      placeholder="0"
      value={value != null ? String(value) : ''}
      onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ''))}
      keyboardType="number-pad"
    />
  );
}

function PhotoField({ question, value, onChange }) {
  const takePhoto = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (!result.canceled && result.assets?.[0]?.uri) {
      onChange(result.assets[0].uri);
    }
  }, [onChange]);

  return (
    <View>
      {value ? (
        <Image source={{ uri: value }} style={styles.photoPreview} />
      ) : (
        <Pressable style={styles.photoButton} onPress={takePhoto}>
          <Text style={styles.photoButtonText}>📷 Take Photo</Text>
        </Pressable>
      )}
      {value && (
        <Pressable onPress={takePhoto}>
          <Text style={styles.retakeText}>Retake</Text>
        </Pressable>
      )}
    </View>
  );
}

const FIELD_COMPONENTS = {
  boolean: BooleanField,
  select: SelectField,
  text: TextField,
  number: NumberField,
  photo: PhotoField,
  rating: RatingField,
};

/**
 * DynamicForm renders a template's questions in order, hiding/showing
 * follow-ups live based on the answers collected so far. When a parent
 * answer changes such that a child question becomes hidden, that
 * child's stored answer is cleared so stale data never gets submitted.
 */
export default function DynamicForm({ template, onSubmit, submitLabel = 'Submit' }) {
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});

  const visibleQuestions = useMemo(
    () => template.questions.filter((q) => isVisible(q, answers)),
    [template.questions, answers]
  );

  const handleChange = useCallback((questionId, value) => {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: value };

      // Clear answers for any question that depends on this one and is
      // no longer satisfied, plus anything that depends on those, etc.
      let changed = true;
      while (changed) {
        changed = false;
        for (const q of template.questions) {
          if (q.conditionalOn && q.conditionalOn.questionId in next) {
            const stillVisible = next[q.conditionalOn.questionId] === q.conditionalOn.equals;
            if (!stillVisible && q.id in next) {
              delete next[q.id];
              changed = true;
            }
          }
        }
      }
      return next;
    });

    setErrors((prev) => {
      if (!(questionId in prev)) return prev;
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  }, [template.questions]);

  const handleSubmit = () => {
    const newErrors = {};
    for (const question of visibleQuestions) {
      if (question.required && isAnswerEmpty(question, answers[question.id])) {
        newErrors[question.id] = 'This field is required.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit(answers);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {visibleQuestions.map((question) => {
        const Field = FIELD_COMPONENTS[question.type];
        if (!Field) return null;
        return (
          <View key={question.id} style={styles.questionBlock}>
            <Text style={styles.label}>
              {question.label}
              {question.required && <Text style={styles.requiredMark}> *</Text>}
            </Text>
            <View style={errors[question.id] && styles.fieldErrorBorder}>
              <Field
                question={question}
                value={answers[question.id]}
                onChange={(val) => handleChange(question.id, val)}
              />
            </View>
            {errors[question.id] && <Text style={styles.errorText}>{errors[question.id]}</Text>}
          </View>
        );
      })}

      <Pressable style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>{submitLabel}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48 },
  questionBlock: { marginBottom: 20 },
  label: { fontSize: 15, fontWeight: '600', color: '#1E3A5F', marginBottom: 8 },
  requiredMark: { color: '#B4432D' },
  fieldErrorBorder: {
    borderWidth: 1,
    borderColor: '#B4432D',
    borderRadius: 10,
    padding: 4,
  },
  errorText: { color: '#B4432D', fontSize: 12, marginTop: 6 },
  row: { flexDirection: 'row', gap: 10 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pillButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C9D6E3',
    backgroundColor: '#F5F8FB',
  },
  pillButtonActive: { backgroundColor: '#1E3A5F', borderColor: '#1E3A5F' },
  ratingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#C9D6E3',
    backgroundColor: '#F5F8FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: { color: '#1E3A5F', fontWeight: '500' },
  pillTextActive: { color: '#FFFFFF' },
  textInput: {
    borderWidth: 1,
    borderColor: '#C9D6E3',
    borderRadius: 10,
    padding: 12,
    minHeight: 44,
    backgroundColor: '#FFFFFF',
  },
  photoButton: {
    borderWidth: 1,
    borderColor: '#C9D6E3',
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#F5F8FB',
  },
  photoButtonText: { color: '#1E3A5F', fontWeight: '600' },
  photoPreview: { width: '100%', height: 180, borderRadius: 10 },
  retakeText: { color: '#3B6EA5', marginTop: 6, textAlign: 'center' },
  submitButton: {
    backgroundColor: '#2E7D5B',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  submitText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});
