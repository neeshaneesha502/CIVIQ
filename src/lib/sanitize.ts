/**
 * Security Utility: Input Sanitization and Validation
 * Implements strict sanitization for all user-entered text to prevent XSS and injection attacks.
 */

export function sanitizeInput(input: string, maxLength: number = 2000): string {
  if (!input) return "";
  
  // 1. Truncate to maximum length to prevent buffer/DOS style payload sizes
  let text = input.slice(0, maxLength);
  
  // 2. Strip standard HTML tags and script elements
  text = text.replace(/<[^>]*>/g, "");
  
  // 3. Escape common characters that could break parsing or lead to injection
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
    "`": "&#x60;"
  };
  
  // Clean backslashes and potential template literals
  text = text.replace(/[&<>"'`/]/g, (char) => map[char]);
  
  return text.trim();
}

export function validateTitle(title: string): { isValid: boolean; error?: string } {
  const clean = title.trim();
  if (clean.length < 5) {
    return { isValid: false, error: "Title must be at least 5 characters long." };
  }
  if (clean.length > 100) {
    return { isValid: false, error: "Title cannot exceed 100 characters." };
  }
  return { isValid: true };
}

export function validateDescription(desc: string): { isValid: boolean; error?: string } {
  const clean = desc.trim();
  if (clean.length < 15) {
    return { isValid: false, error: "Description must provide at least 15 characters of detail." };
  }
  if (clean.length > 1000) {
    return { isValid: false, error: "Description cannot exceed 1000 characters." };
  }
  return { isValid: true };
}
