# DeWorm App - Development Plan

## Project Summary

DeWorm is a web application designed to help users cure "earworms" (songs stuck in their head) by playing replacement songs that are equally or more catchy. The app features a friendly mascot named "QT" who guides users through the process:

1. User logs in with Spotify
2. User searches for their current earworm
3. App plays the selected earworm
4. App guides user through a playful "cure" process
5. App plays a replacement song from a curated playlist
6. App tracks effectiveness and maintains user history

## Technical Architecture

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS + DaisyUI
- **Backend**: AWS Amplify Gen 2, DynamoDB
- **Authentication**: Spotify OAuth
- **APIs**: Spotify Web Playback SDK
- **Testing**: Vitest (unit), Playwright (E2E)
- **Domain**: deworm.us

## Development Checklist

### Phase 1: Project Setup

- [x] Initialize Next.js 15 project with TypeScript (strict mode)
- [x] Set up directory structure as specified in README
- [x] Configure Tailwind CSS and DaisyUI
- [x] Set up Biome for linting/formatting
- [x] Configure Husky for pre-commit hooks
- [x] Establish test environment with Vitest and Playwright
- [x] Set up Git repository with proper .gitignore file
- [x] Create initial .env.local for environment variables

### Phase 2: Authentication & Infrastructure

- [ ] Set up AWS Amplify Gen 2 project
- [x] Configure DynamoDB tables for users, earworms, and effectiveness data (using local files for now)
- [x] Register app with Spotify Developer Dashboard
- [x] Implement Spotify OAuth flow
- [x] Create typed API client for Spotify interactions
- [x] Set up token refreshing and session management
- [x] Implement login/logout functionality
- [x] Add GDPR compliance and cookie consent

### Phase 3: Core Components Development

- [ ] Develop reusable UI components:
  - [ ] Chat bubble component for QT's messages
  - [ ] Mascot component with different emotional states
  - [ ] Spotify song card component
  - [ ] Button components with proper styling
  - [ ] Search input with autocomplete
- [ ] Implement Spotify Web Playback SDK integration
- [ ] Create API routes for Spotify interactions

### Phase 4: Page Implementation

- [ ] Landing Page:
  - [ ] Conditional rendering based on auth state
  - [ ] Spotify login button
  - [ ] Navigation to earworm search
- [ ] Earworm Search Page:
  - [ ] Search functionality with Spotify API
  - [ ] Autocomplete with album art and song details
  - [ ] Selection and submission of earworm
- [ ] Earworm Solution Steps Page:
  - [ ] Playback of selected earworm
  - [ ] Step-by-step interactive process with animations
  - [ ] Transition controls to replacement song
- [ ] Earworm Replacement Page:
  - [ ] Display and play replacement song
  - [ ] Effectiveness feedback buttons
  - [ ] Results storage in database

### Phase 5: Data Management

- [ ] Create data models for users, earworms, and replacement songs
- [ ] Implement DynamoDB interactions for storing:
  - [ ] User profiles
  - [ ] Earworm history
  - [ ] Replacement song history
  - [ ] Effectiveness data
- [ ] Set up data fetching patterns using Next.js Server Components

### Phase 6: Testing & Quality Assurance

- [ ] Write unit tests for all components and utilities
- [ ] Develop E2E tests for complete user flows
- [ ] Implement error boundaries and fallback UI
- [ ] Test across different devices and screen sizes
- [ ] Verify Spotify API integration edge cases
- [ ] Performance optimization

### Phase 7: Deployment & Launch

- [ ] Set up CI/CD pipeline with GitHub Actions
- [ ] Configure AWS Amplify hosting
- [ ] Set up domain (deworm.us)
- [ ] Implement monitoring and analytics
- [ ] Create documentation
- [ ] Pre-launch QA and testing
- [ ] Launch MVP

### Phase 8: Compliance & Post-Launch

- [ ] Finalize privacy policy and terms of service
- [ ] Ensure full GDPR compliance
- [ ] Implement accessibility improvements (WCAG 2.1 AA)
- [ ] Gather user feedback
- [ ] Plan for Apple Music integration (future roadmap)

## Implementation Notes

1. **Mobile-First Approach**: Design all UI components with mobile as the primary target
2. **Server Components**: Leverage Next.js 15 Server Components wherever possible
3. **Minimal Client-Side State**: Use URL state for shareable states
4. **Type Safety**: Enforce strict TypeScript throughout the codebase
5. **Component Design**: Small, reusable components with DaisyUI styling
6. **Testing**: Follow TDD approach for all features
