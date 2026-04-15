export function maskPan(value) {
  if (!value) {
    return "";
  }
  const normalized = String(value).toUpperCase();
  return `${normalized.slice(0, 2)}***${normalized.slice(-2)}`;
}

export function maskAccountNumber(value) {
  if (!value) {
    return "";
  }
  const text = String(value);
  return `${"*".repeat(Math.max(text.length - 4, 4))}${text.slice(-4)}`;
}

export function sanitizeUser(user, { includeSensitive = false } = {}) {
  if (!user) {
    return null;
  }
  const source = typeof user.toObject === "function" ? user.toObject() : user;
  const sanitized = {
    id: String(source._id || source.id),
    name: source.name,
    email: source.email,
    companyId: source.companyId,
    role: source.role,
    employmentStatus: source.employmentStatus,
    joiningDate: source.joiningDate,
    dateOfBirth: source.dateOfBirth,
    panNumber: source.panNumber,
    bankAccountNumber: source.bankAccountNumber,
    bankName: source.bankName,
    ifscCode: source.ifscCode,
    accountHolderName: source.accountHolderName,
    location: source.location,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt
  };

  if (!includeSensitive) {
    sanitized.panNumber = maskPan(source.panNumber);
    sanitized.bankAccountNumber = maskAccountNumber(source.bankAccountNumber);
  }

  return sanitized;
}
