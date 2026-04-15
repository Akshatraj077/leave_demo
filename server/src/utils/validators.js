import { normalizeDate } from "./date.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COMPANY_ID_PATTERN = /^[A-Za-z0-9]{6,12}$/;
const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const ACCOUNT_PATTERN = /^[0-9]{9,18}$/;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export function isValidEmail(value) {
  return EMAIL_PATTERN.test(String(value || "").trim());
}

export function isValidCompanyId(value) {
  return COMPANY_ID_PATTERN.test(String(value || "").trim());
}

export function isStrongPassword(value) {
  return PASSWORD_PATTERN.test(String(value || ""));
}

export function isValidPan(value) {
  return PAN_PATTERN.test(String(value || "").trim().toUpperCase());
}

export function isValidIfsc(value) {
  return IFSC_PATTERN.test(String(value || "").trim().toUpperCase());
}

export function isValidAccountNumber(value) {
  return ACCOUNT_PATTERN.test(String(value || "").trim());
}

export function isAdult(dateOfBirth, minAge = 18, now = new Date()) {
  const dob = normalizeDate(dateOfBirth);
  if (!dob) {
    return false;
  }
  const today = normalizeDate(now);
  let age = today.getUTCFullYear() - dob.getUTCFullYear();
  const beforeBirthday =
    today.getUTCMonth() < dob.getUTCMonth() ||
    (today.getUTCMonth() === dob.getUTCMonth() && today.getUTCDate() < dob.getUTCDate());
  if (beforeBirthday) {
    age -= 1;
  }
  return age >= minAge;
}

export function isNotFuture(value, now = new Date()) {
  const date = normalizeDate(value);
  const today = normalizeDate(now);
  return Boolean(date && date.getTime() <= today.getTime());
}

export function requiredFields(payload, fields) {
  return fields.filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === "");
}

export function validatePasswordOrThrow(password) {
  if (!isStrongPassword(password)) {
    return "Password must contain at least 8 characters with uppercase, lowercase, number, and special character.";
  }
  return null;
}

export function validateEmployeePayload(payload, { partial = false } = {}) {
  const errors = {};
  const required = [
    "name",
    "email",
    "companyId",
    "joiningDate",
    "dateOfBirth",
    "panNumber",
    "bankAccountNumber",
    "bankName",
    "ifscCode",
    "accountHolderName",
    "location"
  ];

  if (!partial) {
    for (const field of requiredFields(payload, required)) {
      errors[field] = "Required";
    }
  }

  if (payload.email !== undefined && !isValidEmail(payload.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (payload.companyId !== undefined && !isValidCompanyId(payload.companyId)) {
    errors.companyId = "Company ID must be 6-12 alphanumeric characters.";
  }
  if (payload.joiningDate !== undefined && !isNotFuture(payload.joiningDate)) {
    errors.joiningDate = "Joining date cannot be in the future.";
  }
  if (payload.dateOfBirth !== undefined && !isAdult(payload.dateOfBirth)) {
    errors.dateOfBirth = "Employee must be at least 18 years old.";
  }
  if (payload.panNumber !== undefined && !isValidPan(payload.panNumber)) {
    errors.panNumber = "PAN must match ABCDE1234F format.";
  }
  if (payload.ifscCode !== undefined && !isValidIfsc(payload.ifscCode)) {
    errors.ifscCode = "IFSC must match valid bank format.";
  }
  if (payload.bankAccountNumber !== undefined && !isValidAccountNumber(payload.bankAccountNumber)) {
    errors.bankAccountNumber = "Account number must be 9-18 digits.";
  }

  return errors;
}
