/**
 * Precision formatting utilities for SVG export
 * Rounds numeric values to specified decimal places and formats them compactly
 */

/**
 * Round a number to specified precision
 */
export function roundToPrecision(value: number, precision: number): number {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
}

/**
 * Format a numeric value for SVG attribute
 * Removes trailing zeros and unnecessary decimals
 */
export function formatSVGAttribute(value: number, precision: number): string {
  const rounded = roundToPrecision(value, precision);
  // If precision is 0, return integer
  if (precision === 0) {
    return Math.round(rounded).toString();
  }
  // Format with precision, then remove trailing zeros and unnecessary decimal point
  return rounded.toFixed(precision).replace(/\.?0+$/, '');
}

/**
 * Format transform values (translation, scale, etc.)
 * Handles arrays of numbers (e.g., translate(10.123 20.456))
 */
export function formatTransformValue(value: number, precision: number): string {
  return formatSVGAttribute(value, precision);
}

