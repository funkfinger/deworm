import { registerRootComponent } from 'expo';
import TrackPlayer from 'react-native-track-player';
import { PlaybackService } from './utils/player/trackPlayerService';

import App from './App';

// Register the app
registerRootComponent(App);

// Register the playback service
TrackPlayer.registerPlaybackService(() => PlaybackService);
