// src/utils/nullSafety.ts

/**
 * Utility functions for handling null and undefined values safely
 * These functions provide a consistent approach to null safety across the application
 */

/**
 * Ensures a value is a string, returning an empty string if null or undefined
 * @param value The value to check
 * @returns A guaranteed string
 */
export const ensureString = (value: string | null | undefined): string => {
  return value ?? '';
};

/**
 * Ensures a value is a number, returning 0 if null or undefined
 * @param value The value to check
 * @returns A guaranteed number
 */
export const ensureNumber = (value: number | null | undefined): number => {
  return value ?? 0;
};

/**
 * Ensures a value is an array, returning an empty array if null or undefined
 * @param value The array to check
 * @returns A guaranteed array
 */
export const ensureArray = <T>(value: T[] | null | undefined): T[] => {
  return value ?? [];
};

/**
 * Ensures a value is an object, returning the provided default if null or undefined
 * @param value The object to check
 * @param defaultValue The default object to return if value is null or undefined
 * @returns A guaranteed object
 */
export const ensureObject = <T extends object>(value: T | null | undefined, defaultValue: T): T => {
  return value ?? defaultValue;
};

/**
 * Ensures a value is a boolean, returning false if null or undefined
 * @param value The value to check
 * @returns A guaranteed boolean
 */
export const ensureBoolean = (value: boolean | null | undefined): boolean => {
  return value ?? false;
};

/**
 * Safely accesses a property of an object that might be null or undefined
 * @param obj The object to access
 * @param accessor A function that accesses the desired property
 * @param defaultValue The default value to return if the object or property is null/undefined
 * @returns The property value or the default value
 */
export const safeAccess = <T, R>(
  obj: T | null | undefined,
  accessor: (obj: T) => R,
  defaultValue: R
): R => {
  if (obj == null) {
    return defaultValue;
  }
  
  try {
    const result = accessor(obj);
    return result ?? defaultValue;
  } catch (e) {
    return defaultValue;
  }
};
