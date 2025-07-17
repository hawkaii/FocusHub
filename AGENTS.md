# Agent Development Guide

## Build/Test Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run format` - Format code with Prettier
- No test framework configured

## Code Style Guidelines

- **Formatting**: Prettier with 2-space tabs, 120 char width, double quotes, trailing commas (ES5)
- **TypeScript**: Strict mode disabled, React JSX transform, ESNext target
- **Imports**: Use path aliases (`@App/*`, `@Components/*`, `@Store`, `@Utils/*`, `@Root/*`)
- **State Management**: Zustand with persist middleware for global state
- **Naming**: PascalCase for components, interfaces prefixed with `I`, enum values UPPERCASE
- **File Structure**: Component folders with `.tsx` + `.scss` files, utilities in `@Utils`
- **Styling**: SCSS modules + Tailwind CSS, `clsx` for conditional classes
- **Error Handling**: `react-hot-toast` for notifications, try/catch for async operations
- **Exports**: Named exports for components, default exports for pages
- **Hooks**: Custom hooks in `@App/utils/hooks/`, destructure store hooks

## Tech Stack

React 17, TypeScript, Vite, Zustand, SCSS, Tailwind, React Hot Toast
