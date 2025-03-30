import {
  User,
  Earworm,
  UserEarworm,
  ReplacementSong,
  EffectivenessData,
} from "@/app/models/app";
import fs from "node:fs/promises";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";

// Local file paths for development
const USERS_FILE = path.join(process.cwd(), "data", "users.json");
const EARWORMS_FILE = path.join(process.cwd(), "data", "earworms.json");
const USER_EARWORMS_FILE = path.join(
  process.cwd(),
  "data",
  "user-earworms.json"
);
const REPLACEMENT_SONGS_FILE = path.join(
  process.cwd(),
  "data",
  "replacement-songs.json"
);
const EFFECTIVENESS_DATA_FILE = path.join(
  process.cwd(),
  "data",
  "effectiveness-data.json"
);

// Ensure the data directory exists
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), "data");
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    console.error("Error creating data directory:", error);
  }
}

// Generic read function
async function readData<T>(filePath: string): Promise<T[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as T[];
  } catch {
    // If file doesn't exist, return empty array
    return [];
  }
}

// Generic write function
async function writeData<T>(filePath: string, data: T[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// User operations
export async function getUserBySpotifyId(
  spotifyId: string
): Promise<User | null> {
  const users = await readData<User>(USERS_FILE);
  return users.find((user) => user.spotifyId === spotifyId) || null;
}

export async function createUser(
  userData: Omit<User, "id" | "createdAt" | "updatedAt">
): Promise<User> {
  const users = await readData<User>(USERS_FILE);

  const newUser: User = {
    ...userData,
    id: uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  users.push(newUser);
  await writeData(USERS_FILE, users);

  return newUser;
}

// Earworm operations
export async function getEarwormByTrackId(
  trackId: string
): Promise<Earworm | null> {
  const earworms = await readData<Earworm>(EARWORMS_FILE);
  return earworms.find((earworm) => earworm.trackId === trackId) || null;
}

export async function createEarworm(
  earwormData: Omit<Earworm, "id" | "createdAt">
): Promise<Earworm> {
  const earworms = await readData<Earworm>(EARWORMS_FILE);

  const newEarworm: Earworm = {
    ...earwormData,
    id: uuidv4(),
    createdAt: new Date(),
  };

  earworms.push(newEarworm);
  await writeData(EARWORMS_FILE, earworms);

  return newEarworm;
}

// User Earworm operations
export async function createUserEarworm(
  userId: string,
  earwormId: string
): Promise<UserEarworm> {
  const userEarworms = await readData<UserEarworm>(USER_EARWORMS_FILE);

  const newUserEarworm: UserEarworm = {
    id: uuidv4(),
    userId,
    earwormId,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  userEarworms.push(newUserEarworm);
  await writeData(USER_EARWORMS_FILE, userEarworms);

  return newUserEarworm;
}

export async function updateUserEarworm(
  id: string,
  updates: Partial<Omit<UserEarworm, "id" | "createdAt" | "updatedAt">>
): Promise<UserEarworm | null> {
  const userEarworms = await readData<UserEarworm>(USER_EARWORMS_FILE);
  const index = userEarworms.findIndex((uw) => uw.id === id);

  if (index === -1) {
    return null;
  }

  const updatedUserEarworm: UserEarworm = {
    ...userEarworms[index],
    ...updates,
    updatedAt: new Date(),
  };

  userEarworms[index] = updatedUserEarworm;
  await writeData(USER_EARWORMS_FILE, userEarworms);

  return updatedUserEarworm;
}

// Replacement Song operations
export async function getRandomReplacementSong(): Promise<ReplacementSong | null> {
  const replacementSongs = await readData<ReplacementSong>(
    REPLACEMENT_SONGS_FILE
  );

  if (replacementSongs.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * replacementSongs.length);
  return replacementSongs[randomIndex];
}

export async function saveEffectivenessData(
  data: Omit<EffectivenessData, "id" | "createdAt">
): Promise<EffectivenessData> {
  const effectivenessData = await readData<EffectivenessData>(
    EFFECTIVENESS_DATA_FILE
  );

  const newData: EffectivenessData = {
    ...data,
    id: uuidv4(),
    createdAt: new Date(),
  };

  effectivenessData.push(newData);
  await writeData(EFFECTIVENESS_DATA_FILE, effectivenessData);

  return newData;
}
