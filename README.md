# DeWorm - Earworm Cure App

**DeWorm** is an app that helps with songs stuck in your head (referred to as an "earworm"). The app will ask you to search for the song that's stuck in your head and then play a song that is equally or even more catchy - with the idea that this new song will replace the stuck song and "fix" your problem. The app acts as a guided "Expert System" who's mascot a worm wearing headphones named "QT" walks the user through the earworm replacement process.

## App Overview

The opening page features our mascot "QT" - "public/images/mascot.svg" , a cute pink worm character with a happy face and friendly outgoing demeanor. QT will:

1. Greet you and sympathize with your earworm problem
2. Ask you to log into Spotify account (Apple Music in the future)
3. Help you find the song that's stuck in your head

   - this should be implemented by searching the music streaming service library
   - this should be a live search that allows the user to find the song from a drop down list

4. Play a replacement song from the playlist https://open.spotify.com/playlist/0E9WYGYWZBqfmp6eJ0Nl1t?si=55d3bde342094dc2
5. Follow up to see if the solution worked

The database keeps a record of users' earworm history and replacement songs, with a database tracking:

- Users
- Earworms
- Users Earworms
- Users Replacement Songs
- Earworm Replacement Effectiveness Data

## Technology Stack

### Frontend

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **React Version**: React 19
- **CSS Framework**: Tailwind CSS with DaisyUI components
- **Icons**: Font Awesome (avoid inline SVGs)
- **Spotify Playback**: use the Spotify Web Playback API - not embedded iFrame

#### User Experience

- Mobile-first responsive design
- Quick, intuitive interaction flow
- Cute, friendly mascot to guide users
- Clear feedback on all actions
- Graceful error handling

#### Styling / Images / Icons

- Primarily use DaisyUI components
- Customize DaisyUI components only when necessary
- Define and use design tokens in tailwind.config.js
- Maintain consistent order of utility CSS classes
- Avoid custom CSS unless absolutely necessary
- Use Font Awesome for all icons
- Do not create inline SVG

####API Integration

- Create typed API client for Spotify
- Handle rate limiting and token refreshes
- Implement proper error handling
- Cache API responses where appropriate

### Backend / Infrastructure

- **Hosting**: AWS Amplify Gen 2
- **Database**: Amazon DynamoDB
- **Authentication**: Spotify OAuth
- **Domain**: deworm.us

### Development Considerations

- **Unit Testing**: Vitest
- **E2E Testing**: Playwright
- **Approach**: Test-Driven Development (TDD)
- **Linting / Formating**: Biome
- **Source Code Control**: GitHub
- **Source Code Commit Hooks**: Husky

### Node.js Version Management

This project uses [Node Version Manager (NVM)](https://github.com/nvm-sh/nvm) to ensure consistent Node.js versions across development environments.

- **Node.js Version**: v22.14.0 (LTS)
- **NVM Configuration**: Included in `.nvmrc` file

To use the correct Node.js version with NVM:

```bash
# Install the correct version (if not already installed)
nvm install

# Use the version specified in .nvmrc
nvm use
```

#### TypeScript / React / Next.js

- Enable strict mode (`strict: true` in tsconfig.json)
- target ES6
- Explicitly type all variables, parameters, and return values
- Use interfaces for object shapes
- Use type aliases for unions and complex types
- Avoid any types; use unknown with runtime checks
- Use type guards for runtime type checking
- Use discriminated unions for complex state management
- Prefer React Server Components (RSC) where possible
- Minimize 'use client' directives
- Use Next.js data fetching patterns (Server Components)
- Implement proper error boundaries and loading states
- Use Suspense for asynchronous operations
- Leverage Next.js metadata API for SEO
- Use React Hooks for local state management
- Use URL state (with 'nuqs') for shareable state
- Implement form state using useActionState
- Minimize client-side state

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
  /images                  # Static image assets
```

### User Flow and Page Elements

Wireframe example can be viewed here: https://www.figma.com/design/nARkpaeQ6wIhWWL7innLDr/Testing-Figma-with-Paper-Kit?node-id=7575-1466&t=8uZur4nQUUzTaMaI-1 - only use for layout, not color or font choice.

#### Universal Site-Wide Elements

- Header - DeWorm logo
- Footer - TBD

#### Landing Page

- Sad Mascot
- If not logged into Spotify:
  - daisyUI Chat Bubble Text - "Oh no I know why you're here. You've got a pesky song stuck in your mellon! Well, I know just what to do. Please log into your Spotify account and we'll take care of that right away!"
  - daisyUI login button to Spotify which starts the spotify login process
- If logged into Spotify:
  - daisyUI Chat Bubble Text if logged into Spotify - "Oh no you're back! Sure hope it wasn't my fault... Let's get that annoying song out of your dome."
  - daisyUI button that take the user to the earworm search page.
  - daisyUI button that logs the user out of Spotify

#### Earworm Search Page

- Happy Mascot
- daisyUI Chat Bubble Text - "Great! Now lets find that nasty ear worm..."
- daisyUI input component - initial text - "What's Stuck In Your Noggin?"
- Search input form with Autocomplete functionality.
  - shows Spotify album art, track name and artist

#### Earworm Solution Steps page

> NOTE: Earworm song selected should start playing.

- Happy Mascot
- daisyUI Chat Bubble Text - "Oh My! What a a real brain bug! Let's see what we can do about it. Follow these steps and I'm somewhat certain that you probably won't have this sticker in you ear anymore..."
- daisyUI card with Spotify album art on side and song title and artist next to it
- daisyUI button "Take a deep breath"
- daisyUI button "Count to three"
- daisyUI button "Stick your fingers in you ears"
- daisyUI button "GO!"

#### Earworm replacement page

> NOTE: Earworm song should continue playing

- Happy Mascot
- daisyUI Chat Bubble Text - "HERE IT IS! I've found your CURE!!!"
- daisyUI card with
  - Spotify album art
  - song title
  - artist
  - large daisyUI play / pause control button
    - earworm song should stop playing and new song should play
- daisyUI button group
  - daisyUI button "I'M CURED!"
  - daisyUI button "UGH!! Try again"
  -

### Compliance and Legal Requirements

- Implement GDPR-compliant user data handling
- Create clear privacy policy and terms of service
- Implement cookie consent mechanism
- Ensure Spotify API Terms of Service compliance
- Meet accessibility requirements (WCAG 2.1 AA)
