# DeWorm App Implementation Checklist

## Project Setup

- [x] Initialize Next.js 15 project with TypeScript, Tailwind CSS, and App Router
- [x] Set up GitHub repository
- [x] Create initial project structure and README
- [x] Install and configure additional dependencies:
  - [x] DaisyUI
  - [x] Font Awesome
  - [x] Biome for linting and formatting
  - [x] Vitest for unit testing
  - [x] Playwright for E2E testing
  - [x] Spotify Web Playback SDK
- [x] Set up directory structure:
  - [x] `/src/app` for main application code
  - [x] `/src/app/components` for reusable components
  - [x] `/tests` for unit tests
  - [x] `/tests/e2e` for end-to-end tests
  - [x] `/tests/test-results` for test reports
- [x] Update `.gitignore` to exclude test reports and environment files
- [x] Configure Tailwind with DaisyUI and design tokens
- [x] Enable strict TypeScript configuration
- [x] Set up Biome for linting and formatting
- [-] Configure Git pre-commit hooks for linting (temporarily disabled, to be revisited)

## Authentication and API Setup

- [x] Set up Spotify OAuth authentication:
  - [x] Create Spotify Developer account and register application
  - [x] Implement OAuth flow API routes
  - [x] Store and manage authentication tokens securely
  - [x] Display logout button on every page - perhaps in the header
- [x] Create API routes for interacting with Spotify:
  - [x] Search for tracks
    - [x] Search box should replace the login button when login is complete. No need for a button to search
      - [x] Only one search field is necessary - please remove the non-type-ahead non-autocomplete version.
    - [x] Please use a dynamic search component that shows the song options while you are typing. This should be a standard daisyUI element or a standard well known pre-built React component
    - [x] When the earworm song is found and clicked on, please play that song using the Spotify Web Playback SDK
    - [x] Change QT's response to sad and tell the user the he's going to fix it with a replacement song from the Spotify playlist https://open.spotify.com/playlist/0E9WYGYWZBqfmp6eJ0Nl1t?si=55d3bde342094dc2
    - [x] Allow the user to play pause the replacement song
    - [x] Add the earworm song to the Spotify playlist if it isn't already in the playlist.
- [ ] Set up AWS resources:
  - [ ] Configure AWS Amplify for hosting
  - [ ] Set up DynamoDB tables for user data and song history
  - [ ] Create deployment workflows

## UI Components and Pages

- [ ] Create the QT mascot component with different emotional states:
  - [x] Happy (default) - added to home page
  - [x] Sad - available in public/images
  - [x] Create reusable Mascot component with tests
  - [ ] Thinking
  - [ ] Excited
  - [ ] Confused
- [ ] Implement core pages:
  - [x] Homepage/welcome screen (with mascot and styled button)
  - [x] Spotify login page/component
  - [x] Search page for finding earworm songs
  - [x] Player page for playing replacement songs
  - [x] Results/feedback page
- [x] Build reusable components:
  - [x] Mascot component (supports happy/sad variants)
  - [x] Spotify player component
  - [x] Search input with autocomplete
  - [x] Song info display
  - [x] Loading states and error handling components
  - [x] Navigation components

## Core Functionality

- [x] Implement Spotify search functionality with live results
- [x] Create earworm replacement algorithm or selection mechanism
- [x] Build Spotify player integration with playback controls
- [ ] Implement user data persistence with DynamoDB:
  - [ ] Store user profiles
  - [ ] Save earworm history
  - [ ] Record replacement songs
  - [ ] Track effectiveness ratings
- [ ] Build feedback collection system

## Testing

- [x] Set up testing framework and configuration:
  - [x] Configure Vitest for unit tests
  - [x] Set up Playwright for E2E tests
  - [x] Create test utilities and mocks
- [ ] Write unit tests for:
  - [ ] API functions and utilities
  - [ ] Authentication flows
  - [x] UI components
    - [x] SearchAutocomplete tests
    - [x] SpotifyPlayer tests
  - [ ] State management
- [ ] Create end-to-end tests for:
  - [ ] Complete user journey
  - [ ] Authentication flows
  - [ ] Search and playback features
  - [ ] Responsive design and mobile compatibility

## Deployment and DevOps

- [ ] Set up AWS Amplify Gen 2 deployment
- [ ] Configure DynamoDB tables and permissions
- [ ] Set up CI/CD pipeline for automated testing and deployment
- [ ] Configure DNS for deworm.us domain
- [ ] Implement monitoring and error tracking

## Compliance and Best Practices

- [ ] Add privacy policy and terms of service
- [ ] Implement cookie consent/management
- [ ] Add appropriate GDPR compliance measures
- [ ] Ensure accessibility (WCAG 2.1 AA compliance)
- [ ] Optimize for Core Web Vitals
- [ ] Add appropriate SEO metadata

## Documentation

- [x] Create project documentation:
  - [x] Implementation checklist
  - [x] Technical requirements
  - [x] Spotify API integration guide
  - [x] DynamoDB schema design
  - [x] Component usage guide
- [ ] Complete code documentation with JSDoc
- [ ] Document API endpoints
- [ ] Write deployment instructions
- [ ] Create user manual/instructions

## Future Roadmap Items (Post-MVP)

- [ ] Apple Music integration
- [ ] Mobile app versions (iOS and Android)
- [ ] Chatbot integration via text/iMessage
- [ ] Enhanced analytics and recommendation algorithms
