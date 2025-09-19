# Copilot Instructions for SupplySync

## Project Context

This is SupplySync Version 10.0.6, a comprehensive supply chain management system built with Vite, React, TypeScript, and the @github/spark framework.

## Core Requirements

- **Theme Preservation**: Never modify theme.css, tailwind.config.js, or theme.json
- **Version References**: All commits must reference "Version 10.0.6" in footers
- **Conventional Commits**: Use format: `type(scope): description (Version 10.0.6)`
- **Project Documentation**: Reference `SupplySync Version 10.md` for comprehensive project specs
- **Branch Strategy**: Commit directly to main branch unless specifically requested otherwise

## Architecture Guidelines

- **Framework**: Vite + React + TypeScript with @github/spark integration
- **Component Structure**: Follow existing patterns in `src/components/`
- **State Management**: Use built-in React hooks and @github/spark/hooks
- **Styling**: Tailwind CSS with custom theme - preserve existing design system
- **Version Management**: Use VERSION file as single source of truth

## Development Patterns

- **Import Aliases**: Use `@/` for `src/` directory references
- **Component Organization**: UI components in `src/components/ui/`, feature components in respective folders
- **Type Safety**: Maintain TypeScript strict mode compliance
- **Error Handling**: Include proper error boundaries and user feedback

## File Modifications

- **Safe to Edit**: Component files, utilities, hooks, business logic
- **Requires Caution**: Configuration files (vite.config.ts, tsconfig.json)
- **Do Not Modify**: Theme files, package.json dependencies without explicit request

## Testing & Quality

- **Lint Compliance**: Follow existing ESLint configuration
- **Accessibility**: Maintain ARIA compliance and keyboard navigation
- **Performance**: Consider component lazy loading and optimization
- **Security**: Follow security best practices for authentication and data handling

## Version Display

The app includes a non-intrusive version display component showing the current version in the bottom-right corner with `text-xs opacity-60` styling.
