import runMigrations, { MIGRATIONS_PATH } from '$lib/database/database';
import { io, type Socket as ClientSocket } from 'socket.io-client';
import type {
	UserRepository as UserRepositoryType,
	UserWithoutProfileSetup
} from '$lib/userRepository';
import path from 'path';
import { UserRepository } from '$lib/userRepository';
import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import temp from 'temp';
import { it } from 'vitest';
import type { ImageRepository as ImageRepositoryType } from '$lib/imageRepository';
import { ImageRepository } from '$lib/imageRepository';
import type { User } from 'lucia';
import { anyUser } from './testHelpers';
import { ProfileVisitRepository } from '$lib/profileVisitRepository';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { ConnectionRepository } from '$lib/connectionRepository';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { NotificationClient } from '$lib/notificationClient';
import { NoticiationService } from '$lib/server/notificationService';
import type { HttpServer } from 'vite';
import type { AddressInfo } from 'net';
import { WebsocketServer } from '$lib/server/websocketServer';
import { AuthService } from '$lib/server/authService';

interface MyFixtures {
	db: DatabaseType;
	userRepository: UserRepositoryType;
	imageRepository: ImageRepositoryType;
	savedUser: User;
	profileVisitRepository: ProfileVisitRepository;
	savedUserFactory: (n: number, overrides?: Partial<User>) => Promise<UserWithoutProfileSetup[]>;
	image: Buffer;
	connectionRepository: ConnectionRepository;
	websocketServer: WebsocketServer;
	clientSocket: ClientSocket;
	notificationService: NoticiationService;
	notificationClient: NotificationClient;
	httpServer: HttpServer;
	authService: AuthService;
}

export const DEFAULT_PASSWORD = 'password';

export const itWithFixtures = it.extend<MyFixtures>({
	db: async ({}, use) => {
		const tempMigrationsDir = temp.mkdirSync('migrations');
		const db = new Database(':memory:');
		await runMigrations(db, MIGRATIONS_PATH, path.join(tempMigrationsDir, 'migrations.lock'), true);
		await use(db);
		temp.cleanupSync();
	},
	imageRepository: async ({ db }, use) => {
		const tempMigrationsDir = temp.mkdirSync('images');
		await use(new ImageRepository(tempMigrationsDir, db));
		temp.cleanupSync();
	},
	userRepository: async ({ db, imageRepository }, use) => {
		await use(new UserRepository(db, imageRepository));
	},
	savedUser: async ({ userRepository }, use) => {
		const user = anyUser();
		await userRepository.createUser(user, 'password');
		await use(user);
	},
	profileVisitRepository: async ({ db }, use) => {
		await use(new ProfileVisitRepository(db));
	},
	savedUserFactory: async ({ userRepository }, use) => {
		const createUser = async (n: number, overrides: Partial<User> = {}) => {
			return Promise.all(
				Array.from({ length: n }, async () => {
					const user = anyUser(overrides);
					return await userRepository.createUser(user, DEFAULT_PASSWORD);
				})
			);
		};
		use(createUser);
	},
	image: async ({}, use) => {
		const __filename = fileURLToPath(import.meta.url);
		const __dirname = dirname(__filename);

		const imagePath = path.join(__dirname, 'test-image.jpg');
		const image = fs.readFileSync(imagePath);
		use(image);
	},
	connectionRepository: async ({ db }, use) => {
		use(new ConnectionRepository(db));
	},
	httpServer: async ({}, use) => {
		const server = createServer();
		server.listen();
		await use(server);
		server.close();
	},
	websocketServer: async ({ httpServer }, use) => {
		const io = new Server(httpServer);
		const server = new WebsocketServer(io);
		await use(server);
		io.close();
	},
	clientSocket: async ({ httpServer }, use) => {
		const port = (httpServer.address() as AddressInfo).port;
		const socket = io(`http://localhost:${port}`);
		await use(socket);
		socket.disconnect();
	},
	notificationService: async ({ websocketServer }, use) => {
		await use(new NoticiationService(websocketServer));
	},
	notificationClient: async ({ clientSocket }, use) => {
		await use(new NotificationClient(clientSocket));
	},
	authService: async ({ userRepository }, use) => {
		const authService = new AuthService(userRepository);
		await use(authService);
	}
});
