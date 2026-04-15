import bcrypt from "bcryptjs";
import { connectDb, disconnectDb } from "./config/db.js";
import { User } from "./models/User.js";
import { Leave } from "./models/Leave.js";
import { LeaveBalance } from "./models/LeaveBalance.js";
import { Holiday } from "./models/Holiday.js";
import { getDayName, getFinancialYear, normalizeDate } from "./utils/date.js";

const DEFAULT_PASSWORD = "Employee@123";

const users = [
  {
    name: "MagiCalabs Admin",
    email: "info@magicalabs.com",
    companyId: "ADMIN001",
    password: "Admin@123",
    role: "ADMIN",
    employmentStatus: "ACTIVE",
    joiningDate: "2020-04-01",
    dateOfBirth: "1990-05-12",
    panNumber: "AAAAA1234A",
    bankAccountNumber: "123456789012",
    bankName: "HDFC Bank",
    ifscCode: "HDFC0001234",
    accountHolderName: "MagiCalabs Admin",
    location: "Kolkata"
  },
  {
    name: "Arjun Sen",
    email: "arjun@magicalabs.com",
    companyId: "EMP001",
    password: DEFAULT_PASSWORD,
    role: "EMPLOYEE",
    employmentStatus: "ACTIVE",
    joiningDate: "2023-06-05",
    dateOfBirth: "1998-07-18",
    panNumber: "ABCDE1234F",
    bankAccountNumber: "987654321001",
    bankName: "ICICI Bank",
    ifscCode: "ICIC0002345",
    accountHolderName: "Arjun Sen",
    location: "Kolkata"
  },
  {
    name: "Neha Roy",
    email: "neha@magicalabs.com",
    companyId: "EMP002",
    password: DEFAULT_PASSWORD,
    role: "EMPLOYEE",
    employmentStatus: "PROBATION",
    joiningDate: "2024-01-15",
    dateOfBirth: "1999-02-22",
    panNumber: "BCDEF2345G",
    bankAccountNumber: "987654321002",
    bankName: "Axis Bank",
    ifscCode: "UTIB0003456",
    accountHolderName: "Neha Roy",
    location: "Kolkata"
  },
  {
    name: "Rahul Das",
    email: "rahul@magicalabs.com",
    companyId: "EMP003",
    password: DEFAULT_PASSWORD,
    role: "EMPLOYEE",
    employmentStatus: "NOTICE_PERIOD",
    joiningDate: "2022-09-10",
    dateOfBirth: "1996-11-03",
    panNumber: "CDEFG3456H",
    bankAccountNumber: "987654321003",
    bankName: "State Bank of India",
    ifscCode: "SBIN0004567",
    accountHolderName: "Rahul Das",
    location: "Bengaluru"
  }
];

const holidays = [
  {
    name: "Republic Day",
    date: "2026-01-26",
    occasion: "National Holiday",
    location: "All"
  },
  {
    name: "Holi",
    date: "2026-03-04",
    occasion: "Festival",
    location: "Kolkata"
  },
  {
    name: "Bengali New Year",
    date: "2026-04-15",
    occasion: "Regional Festival",
    location: "Kolkata"
  },
  {
    name: "May Day",
    date: "2026-05-01",
    occasion: "Labour Day",
    location: "All"
  },
  {
    name: "Independence Day",
    date: "2026-08-15",
    occasion: "National Holiday",
    location: "All"
  }
];

async function seed() {
  await connectDb();

  await Promise.all([
    User.deleteMany({}),
    Leave.deleteMany({}),
    LeaveBalance.deleteMany({}),
    Holiday.deleteMany({})
  ]);

  const createdUsers = [];
  for (const user of users) {
    createdUsers.push(
      await User.create({
        ...user,
        joiningDate: normalizeDate(user.joiningDate),
        dateOfBirth: normalizeDate(user.dateOfBirth),
        passwordHash: await bcrypt.hash(user.password, 12),
        password: undefined
      })
    );
  }

  const financialYear = getFinancialYear();
  const employees = createdUsers.filter((user) => user.role === "EMPLOYEE");
  await LeaveBalance.insertMany(
    employees.map((user, index) => ({
      user: user._id,
      financialYear,
      totalLeaves: 12,
      usedLeaves: index === 0 ? 1 : 0,
      remainingLeaves: index === 0 ? 11 : 12
    }))
  );

  await Holiday.insertMany(
    holidays.map((holiday) => {
      const date = normalizeDate(holiday.date);
      return {
        ...holiday,
        date,
        day: getDayName(date)
      };
    })
  );

  const arjun = employees.find((user) => user.companyId === "EMP001");
  const neha = employees.find((user) => user.companyId === "EMP002");
  await Leave.insertMany([
    {
      user: arjun._id,
      date: normalizeDate("2026-04-16"),
      leaveType: "CL",
      duration: "FULL",
      status: "APPROVED",
      financialYear
    },
    {
      user: neha._id,
      date: normalizeDate("2026-04-17"),
      leaveType: "CL",
      duration: "HALF",
      status: "APPLIED",
      financialYear
    }
  ]);

  console.log("Seed complete");
  console.log("Admin: info@magicalabs.com / ADMIN001 / Admin@123");
  console.log("Employee: arjun@magicalabs.com / EMP001 / Employee@123");
  await disconnectDb();
}

seed().catch(async (error) => {
  console.error(error);
  await disconnectDb();
  process.exit(1);
});
