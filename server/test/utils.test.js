import assert from "node:assert/strict";
import test from "node:test";
import { durationToAmount, getFinancialYear, isSunday, normalizeDate } from "../src/utils/date.js";
import {
  isAdult,
  isStrongPassword,
  isValidAccountNumber,
  isValidCompanyId,
  isValidIfsc,
  isValidPan
} from "../src/utils/validators.js";

test("financial year runs from April to March", () => {
  assert.equal(getFinancialYear("2026-04-01"), "2026-2027");
  assert.equal(getFinancialYear("2027-03-31"), "2026-2027");
});

test("duration amounts match assignment rules", () => {
  assert.equal(durationToAmount("FULL"), 1);
  assert.equal(durationToAmount("HALF"), 0.5);
});

test("Sunday is detected in UTC date-only values", () => {
  assert.equal(isSunday("2026-04-19"), true);
  assert.equal(isSunday("2026-04-20"), false);
});

test("validation rules accept assignment formats", () => {
  assert.equal(isStrongPassword("Employee@123"), true);
  assert.equal(isValidCompanyId("EMP001"), true);
  assert.equal(isValidPan("ABCDE1234F"), true);
  assert.equal(isValidIfsc("HDFC0001234"), true);
  assert.equal(isValidAccountNumber("123456789"), true);
  assert.equal(isAdult("2000-01-01", 18, normalizeDate("2026-04-14")), true);
});

test("validation rules reject invalid data", () => {
  assert.equal(isStrongPassword("password"), false);
  assert.equal(isValidCompanyId("EMP"), false);
  assert.equal(isValidPan("BADPAN"), false);
  assert.equal(isValidIfsc("HDFC123"), false);
  assert.equal(isValidAccountNumber("12345"), false);
  assert.equal(isAdult("2010-01-01", 18, normalizeDate("2026-04-14")), false);
});
