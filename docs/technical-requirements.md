# DeWorm Technical Requirements

## Technology Stack

### Frontend

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **React Version**: React 19
- **CSS Framework**: Tailwind CSS with DaisyUI components
- **Icons**: Font Awesome (avoid inline SVGs)
- **Code Quality**:
  - Biome for linting and formatting
  - Conventional Commits for version control
  - JSDoc for documentation

### Backend/Infrastructure

- **Hosting**: AWS Amplify Gen 2
- **Database**: Amazon DynamoDB
- **Authentication**: Spotify OAuth
- **Domain**: deworm.us

### Testing

- **Unit Testing**: Vitest
- **E2E Testing**: Playwright
- **Approach**: Test-Driven Development (TDD)

## Architecture

### Directory Structure

```
/src
  /app                     # Main application code with App Router
    /api                   # API routes
      /auth                # Authentication endpoints
      /spotify             # Spotify API integration
    /components            # Reusable UI components
    /lib                   # Utility functions and shared logic
    /models                # TypeScript interfaces and types
    /styles                # Global styles (minimal, prefer DaisyUI)
/tests
  /unit                    # Unit tests
  /e2e                     # End-to-end tests
  /test-results            # Test reports (gitignored)
/docs                      # Project documentation
/public                    # Static assets
```

### Data Model

#### DynamoDB Tables

1. **Users Table**:

   - PartitionKey: `userId` (Spotify user ID)
   - Attributes: displayName, email, lastLogin, preferences

2. **Earworms Table**:
   - PartitionKey: `userId`
   - SortKey: `timestamp`
   - Attributes: earwormTrackId, earwormTrackName, earwormArtist, replacementTrackId, replacementTrackName, replacementArtist, effectiveRating, feedback

## Development Practices

### TypeScript

- Enable strict mode (`strict: true` in tsconfig.json)
- Explicitly type all variables, parameters, and return values
- Use interfaces for object shapes
- Use type aliases for unions and complex types
- Avoid any types; use unknown with runtime checks
- Use type guards for runtime type checking
- Use discriminated unions for complex state management

### React & Next.js

- Prefer React Server Components (RSC) where possible
- Minimize 'use client' directives
- Use Next.js data fetching patterns (Server Components)
- Implement proper error boundaries and loading states
- Use Suspense for asynchronous operations
- Leverage Next.js metadata API for SEO

### State Management

- Use React Hooks for local state management
- Use URL state (with 'nuqs') for shareable state
- Implement form state using useActionState
- Minimize client-side state

### Styling

- Leverage DaisyUI components for rapid development
- Customize DaisyUI components only when necessary
- Define and use design tokens in tailwind.config.js
- Maintain consistent order of utility CSS classes
- Avoid custom CSS unless absolutely necessary

### Performance Optimization

- Implement proper code splitting
- Optimize images using next/image
- Preload critical resources
- Implement proper caching strategies
- Monitor Core Web Vitals

### Authentication & Security

- Implement secure OAuth flow with PKCE
- Store tokens securely
- Implement proper CSRF protection
- Follow OAuth best practices
- Implement proper error handling for authentication failures

### API Integration

- Create typed API client for Spotify
- Handle rate limiting and token refreshes
- Implement proper error handling
- Cache API responses where appropriate

## User Features

### Core Features

1. **Spotify Authentication**: Allow users to log in with their Spotify account
2. **Earworm Search**: Live search of Spotify's catalog for the song stuck in user's head
3. **Earworm Replacement**: Play a replacement song from curated playlist
4. **Playback Control**: Allow users to control playback (play, pause, seek)
5. **Effectiveness Tracking**: Ask users if the replacement worked and track results
6. **History**: Show users their earworm history and successful replacements

### User Experience

- Mobile-first responsive design
- Quick, intuitive interaction flow
- Cute, friendly mascot to guide users
- Clear feedback on all actions
- Graceful error handling

## Compliance and Legal Requirements

- Implement GDPR-compliant user data handling
- Create clear privacy policy and terms of service
- Implement cookie consent mechanism
- Ensure Spotify API Terms of Service compliance
- Meet accessibility requirements (WCAG 2.1 AA)
