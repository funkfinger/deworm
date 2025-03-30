import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getUserBySpotifyId,
  createUser,
  getEarwormByTrackId,
  createEarworm,
  createUserEarworm,
  updateUserEarworm,
  getRandomReplacementSong,
  saveEffectivenessData,
} from "@/app/lib/db";

// Mock Node.js fs and path modules
vi.mock("node:fs/promises", () => ({
  default: {
    mkdir: vi.fn().mockResolvedValue(undefined),
    readFile: vi.fn().mockImplementation((filePath) => {
      // Return different mock data based on the file path
      if (filePath.includes("users.json")) {
        return Promise.resolve(
          JSON.stringify([
            {
              id: "test-user-id",
              spotifyId: "test-spotify-id",
              email: "test@example.com",
              displayName: "Test User",
              profileImageUrl: "test-image-url",
              createdAt: "2023-01-01T00:00:00.000Z",
              updatedAt: "2023-01-01T00:00:00.000Z",
            },
          ])
        );
      } else if (filePath.includes("earworms.json")) {
        return Promise.resolve(
          JSON.stringify([
            {
              id: "test-earworm-id",
              trackId: "test-track-id",
              trackName: "Test Track",
              artistName: "Test Artist",
              albumName: "Test Album",
              albumImageUrl: "test-album-image",
              spotifyUri: "spotify:track:test-track-id",
              createdAt: "2023-01-01T00:00:00.000Z",
            },
          ])
        );
      } else if (filePath.includes("user-earworms.json")) {
        return Promise.resolve(
          JSON.stringify([
            {
              id: "test-user-earworm-id",
              userId: "test-user-id",
              earwormId: "test-earworm-id",
              status: "active",
              createdAt: "2023-01-01T00:00:00.000Z",
              updatedAt: "2023-01-01T00:00:00.000Z",
            },
          ])
        );
      } else if (filePath.includes("replacement-songs.json")) {
        return Promise.resolve(
          JSON.stringify([
            {
              id: "test-replacement-id",
              trackId: "test-replacement-track-id",
              trackName: "Test Replacement",
              artistName: "Test Artist",
              albumName: "Test Album",
              albumImageUrl: "test-album-image",
              spotifyUri: "spotify:track:test-replacement-track-id",
              usageCount: 10,
              successRate: 0.8,
              createdAt: "2023-01-01T00:00:00.000Z",
              updatedAt: "2023-01-01T00:00:00.000Z",
            },
          ])
        );
      } else if (filePath.includes("effectiveness-data.json")) {
        return Promise.resolve(
          JSON.stringify([
            {
              id: "test-effectiveness-id",
              userEarwormId: "test-user-earworm-id",
              rating: 5,
              feedback: "It worked great!",
              createdAt: "2023-01-01T00:00:00.000Z",
            },
          ])
        );
      }

      // Default for any other file
      return Promise.resolve("[]");
    }),
    writeFile: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("node:path", () => ({
  default: {
    join: vi.fn().mockImplementation((...args) => args.join("/")),
  },
}));

vi.mock("uuid", () => ({
  v4: vi.fn().mockReturnValue("mocked-uuid"),
}));

describe("Database Utilities", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2023-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  describe("User functions", () => {
    it("should get user by Spotify ID", async () => {
      const user = await getUserBySpotifyId("test-spotify-id");
      expect(user).toBeDefined();
      expect(user?.id).toBe("test-user-id");
      expect(user?.spotifyId).toBe("test-spotify-id");
    });

    it("should return null if user not found", async () => {
      const user = await getUserBySpotifyId("non-existent-id");
      expect(user).toBeNull();
    });

    it("should create a new user", async () => {
      const userData = {
        spotifyId: "new-spotify-id",
        email: "new@example.com",
        displayName: "New User",
      };

      const newUser = await createUser(userData);
      expect(newUser).toBeDefined();
      expect(newUser.id).toBe("mocked-uuid");
      expect(newUser.spotifyId).toBe("new-spotify-id");
      expect(newUser.createdAt).toBeInstanceOf(Date);
      expect(newUser.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("Earworm functions", () => {
    it("should get earworm by track ID", async () => {
      const earworm = await getEarwormByTrackId("test-track-id");
      expect(earworm).toBeDefined();
      expect(earworm?.id).toBe("test-earworm-id");
      expect(earworm?.trackName).toBe("Test Track");
    });

    it("should return null if earworm not found", async () => {
      const earworm = await getEarwormByTrackId("non-existent-id");
      expect(earworm).toBeNull();
    });

    it("should create a new earworm", async () => {
      const earwormData = {
        trackId: "new-track-id",
        trackName: "New Track",
        artistName: "New Artist",
        albumName: "New Album",
        spotifyUri: "spotify:track:new-track-id",
      };

      const newEarworm = await createEarworm(earwormData);
      expect(newEarworm).toBeDefined();
      expect(newEarworm.id).toBe("mocked-uuid");
      expect(newEarworm.trackId).toBe("new-track-id");
      expect(newEarworm.createdAt).toBeInstanceOf(Date);
    });
  });

  describe("User Earworm functions", () => {
    it("should create a new user earworm", async () => {
      const newUserEarworm = await createUserEarworm(
        "test-user-id",
        "test-earworm-id"
      );
      expect(newUserEarworm).toBeDefined();
      expect(newUserEarworm.id).toBe("mocked-uuid");
      expect(newUserEarworm.userId).toBe("test-user-id");
      expect(newUserEarworm.earwormId).toBe("test-earworm-id");
      expect(newUserEarworm.status).toBe("active");
    });

    it("should update a user earworm", async () => {
      const updatedUserEarworm = await updateUserEarworm(
        "test-user-earworm-id",
        {
          status: "cured",
          replacementId: "test-replacement-id",
        }
      );

      expect(updatedUserEarworm).toBeDefined();
      expect(updatedUserEarworm?.id).toBe("test-user-earworm-id");
      expect(updatedUserEarworm?.status).toBe("cured");
      expect(updatedUserEarworm?.replacementId).toBe("test-replacement-id");
    });

    it("should return null when updating non-existent user earworm", async () => {
      const updatedUserEarworm = await updateUserEarworm("non-existent-id", {
        status: "cured",
      });

      expect(updatedUserEarworm).toBeNull();
    });
  });

  describe("Replacement Song functions", () => {
    it("should get a random replacement song", async () => {
      const replacementSong = await getRandomReplacementSong();
      expect(replacementSong).toBeDefined();
      expect(replacementSong?.id).toBe("test-replacement-id");
      expect(replacementSong?.trackName).toBe("Test Replacement");
    });
  });

  describe("Effectiveness Data functions", () => {
    it("should save effectiveness data", async () => {
      const effectivenessData = {
        userEarwormId: "test-user-earworm-id",
        rating: 4 as const,
        feedback: "Pretty good!",
      };

      const savedData = await saveEffectivenessData(effectivenessData);
      expect(savedData).toBeDefined();
      expect(savedData.id).toBe("mocked-uuid");
      expect(savedData.userEarwormId).toBe("test-user-earworm-id");
      expect(savedData.rating).toBe(4);
      expect(savedData.createdAt).toBeInstanceOf(Date);
    });
  });
});
