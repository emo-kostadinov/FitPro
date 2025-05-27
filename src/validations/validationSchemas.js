import * as yup from 'yup';

const nameRegex = /^[A-ZА-Я][a-zа-яA-ZА-Я0-9 \-()]*$/;

export const workoutSchema = yup.object().shape({
  name: yup
    .string()
    .required('Workout name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Workout name cannot exceed 50 characters')
    .matches(nameRegex, 'Name must start with a capital letter'),
});

export const exerciseSchema = yup.object().shape({
  name: yup
    .string()
    .required('Exercise name is required')
    .min(2, 'Name must be at least 2 characters')
    .matches(nameRegex, 'Exercise name must start with a capital letter'),

  primary_muscle_group: yup
    .string()
    .required('Primary muscle group is required'),

  secondary_muscle_group: yup
    .string()
    .nullable()
    .transform((value) => value || null),

  notes: yup
    .string()
    .nullable()
    .transform((value) => value || null),
});

export const logSchema = yup.object().shape({
  reps: yup
    .number()
    .typeError('Reps must be a number')
    .required('Reps are required')
    .min(1, 'Must be at least 1')
    .integer('Must be a whole number'),

  weight: yup
    .number()
    .typeError('Weight must be a number')
    .min(0, 'Weight cannot be negative')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value),

  // These are for reference only, no validation needed
  workoutName: yup.string(),
  exerciseName: yup.string(),
  primaryMuscleGroup: yup.string(),
  secondaryMuscleGroup: yup.string().nullable(),
  notes: yup.string().nullable()
});

export const singleSetLogSchema = yup.object().shape({
  reps: yup
    .number()
    .typeError('Reps must be a number')
    .required('Reps are required')
    .min(1, 'Must be at least 1')
    .integer('Must be a whole number'),

  weight: yup
    .number()
    .typeError('Weight must be a number')
    .nullable()
    .min(0, 'Weight cannot be negative')
    .transform((value, originalValue) => originalValue === '' ? null : value),
});

export const biometricSchema = yup.object().shape({
  name: yup
    .string()
    .notRequired()
    .nullable()
    .min(2, 'The name must be at least 2 characters')
    .matches(nameRegex, 'The name must start with a capital letter and contain only letters and spaces'),

  weight: yup
    .number()
    .typeError('Weight must be a number')
    .nullable()
    .min(0, 'Weight cannot be negative')
    .transform((value, originalValue) => originalValue === '' ? null : value),

  height: yup
    .number()
    .typeError('Height must be a number')
    .nullable()
    .min(0, 'Height cannot be negative')
    .transform((value, originalValue) => originalValue === '' ? null : value),
});

export const profileSchema = yup.object().shape({
  name: yup
    .string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .matches(nameRegex, 'Name must start with a capital letter and contain only letters and spaces'),

  age: yup
    .number()
    .typeError('Age must be a number')
    .required('Age is required')
    .min(1, 'Age must be at least 1')
    .max(120, 'Age cannot exceed 120')
    .integer('Age must be a whole number'),

  height: yup
    .number()
    .typeError('Height must be a number')
    .required('Height is required')
    .min(50, 'Height must be at least 50cm')
    .max(300, 'Height cannot exceed 300cm'),

  weight: yup
    .number()
    .typeError('Weight must be a number')
    .required('Weight is required')
    .min(20, 'Weight must be at least 20kg')
    .max(500, 'Weight cannot exceed 500kg'),
});