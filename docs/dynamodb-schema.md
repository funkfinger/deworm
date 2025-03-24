# DynamoDB Schema Design for DeWorm

## Overview

DeWorm uses Amazon DynamoDB as its primary database to store user information, earworm songs, replacement songs, and effectiveness tracking. This document outlines the schema design and access patterns.

## Table Designs

### Users Table

Stores information about users who have logged in with Spotify.

**Table Name**: `DeWormUsers`

**Primary Key**:

- Partition Key: `userId` (String) - The Spotify user ID

**Attributes**:

- `email` (String) - User's email address from Spotify
- `displayName` (String) - User's display name from Spotify
- `profileImage` (String, optional) - URL to user's Spotify profile image
- `country` (String) - User's country code
- `createdAt` (Number) - Timestamp of first login
- `lastLoginAt` (Number) - Timestamp of most recent login
- `prefersDarkMode` (Boolean, optional) - User preference for dark mode

**Example Item**:

```json
{
  "userId": "spotify:user:123456789",
  "email": "user@example.com",
  "displayName": "Music Lover",
  "profileImage": "https://profile-images.scdn.co/images/userprofile/default/123abc.jpg",
  "country": "US",
  "createdAt": 1658341234567,
  "lastLoginAt": 1658841234567,
  "prefersDarkMode": true
}
```

### Earworms Table

Stores information about earworms and their replacements.

**Table Name**: `DeWormEarworms`

**Primary Key**:

- Partition Key: `userId` (String) - The Spotify user ID
- Sort Key: `timestamp` (Number) - When the earworm was reported

**Attributes**:

- `earwormTrackId` (String) - Spotify track ID of the earworm
- `earwormTrackName` (String) - Name of the earworm track
- `earwormArtists` (List[String]) - Artists of the earworm
- `earwormImageUrl` (String) - Album art URL
- `replacementTrackId` (String) - Spotify track ID of the replacement song
- `replacementTrackName` (String) - Name of the replacement track
- `replacementArtists` (List[String]) - Artists of the replacement
- `replacementImageUrl` (String) - Album art URL for replacement
- `effectivenessRating` (Number, optional) - Rating of how effective the replacement was (1-5)
- `feedback` (String, optional) - User feedback on the replacement
- `feedbackTimestamp` (Number, optional) - When feedback was provided

**GSI 1**: Track Index

- Partition Key: `earwormTrackId` (String)
- Sort Key: `timestamp` (Number)

**GSI 2**: Effectiveness Index

- Partition Key: `replacementTrackId` (String)
- Sort Key: `effectivenessRating` (Number)

**Example Item**:

```json
{
  "userId": "spotify:user:123456789",
  "timestamp": 1658345678901,
  "earwormTrackId": "spotify:track:4cOdK2wGLETKBW3PvgPWqT",
  "earwormTrackName": "Never Gonna Give You Up",
  "earwormArtists": ["Rick Astley"],
  "earwormImageUrl": "https://i.scdn.co/image/ab67616d00001e02c5eaeb2c49416fe9098fdf98",
  "replacementTrackId": "spotify:track:4uLU6hMCjMI75M1A2tKUQC",
  "replacementTrackName": "Never Gonna Give You Up",
  "replacementArtists": ["Barry White"],
  "replacementImageUrl": "https://i.scdn.co/image/ab67616d00001e02abc123def456ghi789",
  "effectivenessRating": 4,
  "feedback": "This actually worked really well!",
  "feedbackTimestamp": 1658346678901
}
```

### PlaybackSessions Table (Optional)

For detailed analytics, we can track playback sessions.

**Table Name**: `DeWormPlaybackSessions`

**Primary Key**:

- Partition Key: `sessionId` (String) - UUID for session
- Sort Key: `userId` (String) - The Spotify user ID

**Attributes**:

- `timestamp` (Number) - When session started
- `earwormTrackId` (String) - Spotify track ID of earworm
- `replacementTrackId` (String) - Spotify track ID of replacement
- `playDuration` (Number) - How long replacement was played (seconds)
- `playedToCompletion` (Boolean) - Whether song was played to completion
- `deviceType` (String) - Type of device used

**GSI 1**: User Index

- Partition Key: `userId` (String)
- Sort Key: `timestamp` (Number)

## Access Patterns

1. **Get user by ID**

   - Direct lookup on Users table with userId

2. **Get user's earworm history**

   - Query Earworms table using userId as partition key
   - Sort by timestamp (descending) for latest entries

3. **Get details about a specific earworm session**

   - Query Earworms table using userId and timestamp

4. **Find patterns in earworm frequency**

   - Query Earworms table using userId
   - Analyze frequency of earwormTrackId

5. **Find most effective replacement songs**

   - Query Earworms GSI 2 (Effectiveness Index)
   - Filter by effectivenessRating > 3

6. **Find how often a specific song becomes an earworm**

   - Query Earworms GSI 1 (Track Index) with earwormTrackId

7. **Get user's playback history** (if using PlaybackSessions)
   - Query PlaybackSessions GSI 1 (User Index) with userId

## Data TTL and Cleanup

- No automatic TTL on user data
- Consider implementing a data retention policy for inactive users
- Regularly backup data to S3 for long-term storage
- Implement GDPR-compliant data deletion functionality

## Deployment with AWS Amplify

AWS Amplify Gen 2 can be used to deploy these table definitions:

```typescript
// Example Amplify Gen 2 schema definition
import {
  schema,
  id,
  string,
  timestamp,
  number,
  boolean,
  list,
} from "@aws-amplify/data-schema";

const UsersSchema = schema({
  userId: id(),
  email: string(),
  displayName: string(),
  profileImage: string().optional(),
  country: string(),
  createdAt: timestamp(),
  lastLoginAt: timestamp(),
  prefersDarkMode: boolean().optional(),
});

const EarwormsSchema = schema({
  userId: id(),
  timestamp: timestamp().sortKey(),
  earwormTrackId: string(),
  earwormTrackName: string(),
  earwormArtists: list(string()),
  earwormImageUrl: string(),
  replacementTrackId: string(),
  replacementTrackName: string(),
  replacementArtists: list(string()),
  replacementImageUrl: string(),
  effectivenessRating: number().optional(),
  feedback: string().optional(),
  feedbackTimestamp: timestamp().optional(),
});

// Set up indexes
EarwormsSchema.index({
  name: "trackIndex",
  partitionKey: "earwormTrackId",
  sortKey: "timestamp",
});

EarwormsSchema.index({
  name: "effectivenessIndex",
  partitionKey: "replacementTrackId",
  sortKey: "effectivenessRating",
});
```

## Security Considerations

- Implement fine-grained access control using IAM policies
- Only allow users to access their own data
- Encrypt data at rest using AWS KMS
- Implement appropriate CloudWatch alarms for monitoring
- Set up regular backups
