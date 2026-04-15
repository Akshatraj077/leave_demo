import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/appError.js";

export function signToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      role: user.role
    },
    env.jwtSecret,
    {
      expiresIn: "7d"
    }
  );
}

// export function setAuthCookie(res, token) {
//   res.cookie("lms_token", token, {
//     httpOnly: true,
//     sameSite: env.cookieSecure ? "none" : "lax",
//     secure: env.cookieSecure,
//     maxAge: 7 * 24 * 60 * 60 * 1000
//   });
// }

// export function clearAuthCookie(res) {
//   res.clearCookie("lms_token", {
//     httpOnly: true,
//     sameSite: env.cookieSecure ? "none" : "lax",
//     secure: env.cookieSecure
//   });
// }

export function setAuthCookie(res, token) {
  res.cookie("lms_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    domain: "leave-demo-back.onrender.com",   // 👈 ADD THIS LINE
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

export function clearAuthCookie(res) {
  res.clearCookie("lms_token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    domain: "leave-demo-back.onrender.com"
  });
}

export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization;
    const bearer = header?.startsWith("Bearer ") ? header.slice(7) : null;
    const token = req.cookies?.lms_token || bearer;

    if (!token) {
      throw new AppError("Authentication required", 401);
    }

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub);
    if (!user) {
      throw new AppError("Authentication required", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error.name === "JsonWebTokenError" ? new AppError("Invalid session", 401) : error);
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action", 403));
    }
    return next();
  };
}
