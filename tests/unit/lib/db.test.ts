import { beforeEach, describe, expect, it, vi } from "vitest";
import * as dbModule from "../../../src/app/lib/db";
import type {
  Earworm,
  EffectivenessData,
  ReplacementSong,
  User,
  UserEarworm,
} from "../../../src/app/models/app";

// Create mock test data
const mockUser: User = {
  id: "test-user-id",
  spotifyId: "test-spotify-id",
  email: "test@example.com",
  displayName: "Test User",
  profileImageUrl: "https://example.com/profile.jpg",
  createdAt: new Date("2023-01-01T00:00:00.000Z"),
  updatedAt: new Date("2023-01-01T00:00:00.000Z"),
};

const mockEarworm: Earworm = {
  id: "test-earworm-id",
  trackId: "test-track-id",
  trackName: "Test Earworm",
  artistName: "Test Artist",
  albumName: "Test Album",
  albumImageUrl: "https://example.com/album.jpg",
  spotifyUri: "spotify:track:test-track-id",
  createdAt: new Date("2023-01-01T00:00:00.000Z"),
};

const mockUserEarworm: UserEarworm = {
  id: "test-user-earworm-id",
  userId: "test-user-id",
  earwormId: "test-earworm-id",
  status: "active",
  createdAt: new Date("2023-01-01T00:00:00.000Z"),
  updatedAt: new Date("2023-01-01T00:00:00.000Z"),
};

const mockReplacementSong: ReplacementSong = {
  id: "test-replacement-song-id",
  trackId: "test-replacement-track-id",
  trackName: "Test Replacement Song",
  artistName: "Test Replacement Artist",
  albumName: "Test Replacement Album",
  albumImageUrl: "https://example.com/replacement-album.jpg",
  spotifyUri: "spotify:track:test-replacement-track-id",
  usageCount: 5,
  successRate: 0.8,
  createdAt: new Date("2023-01-01T00:00:00.000Z"),
  updatedAt: new Date("2023-01-01T00:00:00.000Z"),
};

const mockEffectivenessData: EffectivenessData = {
  id: "test-effectiveness-data-id",
  userEarwormId: "test-user-earworm-id",
  rating: 4,
  feedback: "Great replacement song",
  createdAt: new Date("2023-01-01T00:00:00.000Z"),
};

// Mock the individual exports of the db module
vi.mock("../../../src/app/lib/db", () => {
  return {
    getUserBySpotifyId: vi.fn(async (spotifyId: string) => {
      if (spotifyId === "test-spotify-id") {
        return mockUser;
      }
      return null;
    }),

    createUser: vi.fn(async (userData) => {
      return {
        ...userData,
        id: "mocked-uuid",
        createdAt: new Date("2023-01-01T00:00:00.000Z"),
        updatedAt: new Date("2023-01-01T00:00:00.000Z"),
      };
    }),

    getEarwormByTrackId: vi.fn(async (trackId: string) => {
      if (trackId === "test-track-id") {
        return mockEarworm;
      }
      return null;
    }),

    createEarworm: vi.fn(async (earwormData) => {
      return {
        ...earwormData,
        id: "mocked-uuid",
        createdAt: new Date("2023-01-01T00:00:00.000Z"),
      };
    }),

    createUserEarworm: vi.fn(async (userId: string, earwormId: string) => {
      return {
        id: "mocked-uuid",
        userId,
        earwormId,
        status: "active",
        createdAt: new Date("2023-01-01T00:00:00.000Z"),
        updatedAt: new Date("2023-01-01T00:00:00.000Z"),
      };
    }),

    updateUserEarworm: vi.fn(async (id: string, updates) => {
      if (id === "test-user-earworm-id") {
        return {
          ...mockUserEarworm,
          ...updates,
          updatedAt: new Date("2023-01-01T00:00:00.000Z"),
        };
      }
      return null;
    }),

    getRandomReplacementSong: vi.fn(async () => {
      return mockReplacementSong;
    }),

    saveEffectivenessData: vi.fn(async (data) => {
      return {
        ...data,
        id: "mocked-uuid",
        createdAt: new Date("2023-01-01T00:00:00.000Z"),
      };
    }),
  };
});

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

describe("Database Utility Functions", () => {
  describe("User functions", () => {
    it("should get a user by Spotify ID", async () => {
      const user = await dbModule.getUserBySpotifyId("test-spotify-id");
      expect(user?.id).toBe("test-user-id");
    });

    it("should create a new user", async () => {
      const newUser = {
        spotifyId: "new-spotify-id",
        email: "new@example.com",
        displayName: "New User",
        profileImageUrl: "https://example.com/new-profile.jpg",
      };

      const user = await dbModule.createUser(newUser);
      expect(user.id).toBe("mocked-uuid");
      expect(user.spotifyId).toBe("new-spotify-id");
    });
  });

  describe("Earworm functions", () => {
    it("should get an earworm by track ID", async () => {
      const earworm = await dbModule.getEarwormByTrackId("test-track-id");
      expect(earworm?.id).toBe("test-earworm-id");
    });

    it("should create a new earworm", async () => {
      const newEarworm = {
        trackId: "new-track-id",
        trackName: "New Earworm",
        artistName: "New Artist",
        albumName: "New Album",
        albumImageUrl: "https://example.com/new-album.jpg",
        spotifyUri: "spotify:track:new-track-id",
      };

      const earworm = await dbModule.createEarworm(newEarworm);
      expect(earworm.id).toBe("mocked-uuid");
      expect(earworm.trackId).toBe("new-track-id");
    });
  });

  describe("User Earworm functions", () => {
    it("should create a new user earworm", async () => {
      const userEarworm = await dbModule.createUserEarworm(
        "test-user-id",
        "test-earworm-id"
      );
      expect(userEarworm.id).toBe("mocked-uuid");
      expect(userEarworm.userId).toBe("test-user-id");
      expect(userEarworm.earwormId).toBe("test-earworm-id");
    });

    it("should update a user earworm", async () => {
      const updatedUserEarworm = await dbModule.updateUserEarworm(
        "test-user-earworm-id",
        {
          status: "cured",
          replacementId: "test-replacement-song-id",
        }
      );
      expect(updatedUserEarworm?.id).toBe("test-user-earworm-id");
      expect(updatedUserEarworm?.status).toBe("cured");
    });
  });

  describe("Replacement Song functions", () => {
    it("should get a random replacement song", async () => {
      const replacementSong = await dbModule.getRandomReplacementSong();
      expect(replacementSong?.id).toBe("test-replacement-song-id");
    });
  });

  describe("Effectiveness Data functions", () => {
    it("should save effectiveness data", async () => {
      const data = {
        userEarwormId: "test-user-earworm-id",
        rating: 5 as const,
        feedback: "Very effective",
      };

      const effectivenessData = await dbModule.saveEffectivenessData(data);
      expect(effectivenessData.id).toBe("mocked-uuid");
      expect(effectivenessData.rating).toBe(5);
    });
  });
});
