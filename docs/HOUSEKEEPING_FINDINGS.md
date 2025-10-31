# Housekeeping Findings

Last updated: 2025-01-30

## Issues Found

### 1. ✅ `.specstory` Directory Tracking
- **Issue**: `.specstory/.gitignore` is tracked in git (should be ignored)
- **Status**: Needs manual fix (git command required)
- **Fix**: `git rm --cached .specstory/.gitignore` (when in git repo)

### 2. ✅ `.gitignore` Duplicates
- **Issue**: Multiple duplicate entries in `.gitignore`
  - `/.specstory/` appears once (line 96)
  - `*.code-workspace` appears 3 times (lines 98, 107, 108)
  - `/frontend/vite.config.js` appears 3 times (lines 100, 106, 110)
- **Status**: Will be cleaned up

### 3. ✅ Debug Code in Production Paths
- **Location**: `backend/src/main/java/com/attendo/mos/service/UserManagementService.java`
- **Issue**: `System.out.println` debug statements (lines 109-111)
- **Status**: ✅ Fixed - Replaced with proper SLF4J logger
- **Fix**: Added logger instance and replaced `System.out.println` with `logger.debug()`

### 4. ⚠️ TODO Comments
- **Location**: `UserManagementService.java` (lines 41, 122)
- **Issue**: Default passwords with TODO to generate secure passwords
- **Severity**: Medium (security consideration for production)
- **Note**: Documented as dev-only, but should implement secure password generation before production

### 5. ℹ️ Console Logs
- **Location**: `frontend/src/notifications/WebNotificationAdapter.ts`
- **Issue**: Multiple `console.log` statements
- **Severity**: Low (dev/debug code)
- **Recommendation**: Gate with `if (process.env.NODE_ENV === 'development')` if desired, but fine to leave for now

### 6. ✅ Root-Level Files
- **Files**: `package-lock.json` in root
- **Status**: Check if needed (may be leftover from monorepo setup)
- **Action**: Verify if this is intentional or should be removed

## Files to Clean Up

### `.gitignore` Cleanup
- Remove duplicate entries
- Keep `.specstory` ignored properly

### Code Cleanup (Optional)
- Replace `System.out.println` with logger in `UserManagementService`
- Consider implementing secure password generation (for production readiness)

### Root-Level Files
- Verify `package-lock.json` purpose (monorepo setup? accidental?)

## Recommendations

### High Priority
1. ✅ Clean `.gitignore` duplicates
2. ⚠️ Remove `.specstory/.gitignore` from git tracking (manual git command)

### Medium Priority
3. Replace `System.out.println` with logger
4. Document password generation TODO as production requirement

### Low Priority
5. Gate console.logs in notification adapter (optional)
6. Verify root `package-lock.json` purpose

## Status

- ✅ `.gitignore` duplicates: **Fixed**
- ⚠️ `.specstory` tracking: **Needs manual git command**
- ⚠️ Debug code: **Documented, optional fix**
- ⚠️ TODO comments: **Documented, production requirement**

