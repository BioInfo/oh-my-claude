# Example TypeScript Project

This is a sample TypeScript application for testing **The Oh-My-Claude Council**.

## Purpose

This example project demonstrates:
- TypeScript code organization
- Common patterns (services, controllers, database)
- Areas where The Oh-My-Claude Council can assist:
  - Planning new features
  - Code review and refactoring
  - Documentation generation
  - Bug fixing
  - Test writing

## Structure

```
src/
├── index.ts              # Application entry point
├── server.ts             # HTTP server setup
├── database/
│   └── service.ts        # Database service
├── auth/
│   └── service.ts        # Authentication service
└── controllers/
    └── user.ts           # User controller
```

## Testing The Oh-My-Claude Council

### Try These Commands

1. **Plan a new feature:**
   ```
   @plan add JWT token refresh functionality
   ```

2. **Full orchestration:**
   ```
   ulw implement password reset functionality
   ```

3. **Code review:**
   ```
   Review the auth service for security issues
   ```

4. **Find code:**
   ```
   Find all files that handle user authentication
   ```

5. **Refactor:**
   ```
   Refactor the database service to use a connection pool
   ```

## Expected Council Behavior

### Seer (Planner)
- Interviews you about requirements
- Explores the codebase structure
- Creates detailed implementation plan in `.keepers/plans/`

### Warden (Orchestrator)
- Executes the plan step by step
- Delegates to specialists
- Tracks progress in `.keepers/boulder.json`
- Never stops until complete

### Sage (Advisor)
- Provides architectural guidance
- Suggests best practices
- Reviews security implications

### Chronicler (Documenter)
- Generates documentation
- Writes JSDoc comments
- Creates README files

### Pathfinder (Scout)
- Finds relevant files quickly
- Searches for patterns
- Maps code structure

## Example Workflows

### 1. Add New Feature

```
You: ulw add password reset functionality

Seer: I see your intent. Let me gather context:
1. Should we send reset links via email?
2. Do you have an email service configured?
3. What should the reset link expiration be?

[After answers...]

Seer: Plan created at .keepers/plans/password-reset.md
Handing off to Warden for execution.

Warden: I stand watch. Loading plan...
Step 1/5: Create password reset token table
Step 2/5: Add reset token generation
...
My watch is complete.
```

### 2. Code Review

```
You: Review the UserController for issues

Sage: Let me share ancient wisdom on this code...

Analysis:
1. Email validation is basic - recommend validator.js
2. No rate limiting on createUser (vulnerability)
3. Error messages leak information (security)
4. No input sanitization

Recommendations:
- Add rate limiting middleware
- Use generic error messages
- Validate and sanitize all inputs
- Add logging for security events
```

### 3. Find and Fix Bugs

```
You: The database connection keeps failing

Warden: Spawning Sage for deep analysis...

Sage: Analyzing database service...
Issue found: No connection retry logic
Root cause: Single connection attempt with no error recovery

Warden: Implementing fix with retry logic...
[Adds exponential backoff retry]
Tests added and passing.
My watch is complete.
```

## TODOs (Try asking Council to implement these!)

- [ ] Add JWT token refresh
- [ ] Implement password reset
- [ ] Add rate limiting
- [ ] Write comprehensive tests
- [ ] Add API documentation
- [ ] Implement user roles/permissions
- [ ] Add logging service
- [ ] Implement email service

## Notes

This is a **minimal example** - not production ready!
Use it to test The Oh-My-Claude Council's capabilities.
