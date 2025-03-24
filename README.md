# DeWorm - Earworm Cure App

**DeWorm** is an app that helps with songs stuck in your head (referred to as an "ear worm"). The app will ask you to search for the song that's stuck in your head and then play a song that is equally or even more catchy - with the idea that this new song will replace the stuck song and "fix" your problem. The app acts as a guided "Expert System" that attempts to replace a song stuck in your heat with an equally catchy one from a playlist of known catchy earworm songs.

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
- Earworm Replacement Effectiveness
