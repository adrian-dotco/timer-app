# CLAUDE.md - Timer App Guidelines

## Commands
- **Build**: `npm run build`
- **Dev**: `npm run dev`
- **Lint**: `npm run lint`
- **Test**: `npm run test`
- **Test Single File**: `npm test -- path/to/test`
- **Typecheck**: `npm run typecheck`

## Code Style Guidelines
- **Framework**: React with TypeScript
- **Formatting**: Use Prettier with 2-space indentation
- **Imports**: Group imports by: React, third-party, local components, styles
- **Naming**: 
  - Components: PascalCase
  - Functions/variables: camelCase
  - Constants: UPPER_SNAKE_CASE
- **Error Handling**: Use try/catch for async operations, display user-friendly messages
- **State Management**: Use React hooks (useState, useReducer) for component state
- **Types**: Prefer explicit typing over inferred types when appropriate
- **CSS**: Use CSS modules or directly imported CSS files for component styling
- **Architecture**: Keep the app simple and minimalist, focusing on robust functionality