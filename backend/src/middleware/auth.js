import { ApiError } from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/token.js";
import { User } from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Verifies access token from cookie or Authorization header
export const authenticate = asyncHandler(async (req, _res, next) => {
  let token = null;

  // Check cookie first
  if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  } else if (
    req.headers.authorization?.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw ApiError.unauthorized("Authentication required");
  }

  const decoded = verifyAccessToken(token);
  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    throw ApiError.unauthorized("User not found");
  }

  if (user.status !== "Active") {
    throw ApiError.forbidden("Account is suspended or inactive");
  }

  req.user = user;
  next();
});

// Restricts access to specific roles
export const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw ApiError.forbidden("You do not have permission to perform this action");
    }
    next();
  };
};

// Optional auth — attaches user if token present, but doesn't require it
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  try {
    let token = null;

    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select("-password");
      if (user && user.status === "Active") {
        req.user = user;
      }
    }
  } catch {
    // Silently continue without user
  }
  next();
});
