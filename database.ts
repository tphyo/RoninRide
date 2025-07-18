import { User, Trip, Transaction, TripStatus, PaymentMethod, Vehicle } from './types';

// This will be set by the init() function
let DATABASE_URL = '';

interface DatabaseSchema {
    users: User[];
    trips: Trip[];
    transactions: Transaction[];
}

// Helper to fetch the entire database state
const getDatabase = async (): Promise<DatabaseSchema> => {
    if (!DATABASE_URL) throw new Error('Database not initialized. Call db.init() first.');
    try {
        const response = await fetch(DATABASE_URL, {
            cache: 'no-cache', // Ensure we always get the latest data
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
        });
        if (!response.ok) {
            throw new Error(`Database request failed: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        // Ensure the response has the correct structure
        if (data && Array.isArray(data.users) && Array.isArray(data.trips) && Array.isArray(data.transactions)) {
            return data;
        }
        throw new Error('Database response is malformed.');
    } catch (error) {
        console.error('Error getting database:', error);
        throw error;
    }
};

// Helper to save the entire database state
const saveDatabase = async (data: DatabaseSchema): Promise<void> => {
    if (!DATABASE_URL) throw new Error('Database not initialized. Call db.init() first.');
    try {
        const response = await fetch(DATABASE_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`Failed to save to database: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error saving database:', error);
        throw error;
    }
};


// --- DB API ---
export const db = {
    init: (sessionId: string) => {
        DATABASE_URL = `https://jsonblob.com/api/jsonBlob/${sessionId}`;
    },

    createNewDatabase: async (): Promise<string> => {
        const initialSchema = { users: [], trips: [], transactions: [] };
        const response = await fetch('https://jsonblob.com/api/jsonBlob', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(initialSchema),
        });
        if (!response.ok) {
            throw new Error('Failed to create a new database session.');
        }
        const locationHeader = response.headers.get('Location');
        if (!locationHeader) {
            throw new Error('Could not get new database session ID from response.');
        }
        const sessionId = locationHeader.split('/').pop();
        if (!sessionId) {
            throw new Error('Could not parse session ID from location header.');
        }
        return sessionId;
    },

    registerUser: async (name: string, email: string, password: string): Promise<User> => {
        const dbState = await getDatabase();
        if (dbState.users.some(u => u.email === email)) {
            throw new Error('Email already in use.');
        }
        const id = `user_${Date.now()}`;
        const newUser: User = {
            id,
            name,
            email,
            password, // In a real app, hash this password!
            avatarUrl: `https://i.pravatar.cc/150?u=${id}`,
            rating: 5.0,
            numRatings: 0,
        };
        dbState.users.push(newUser);
        await saveDatabase(dbState);
        return newUser;
    },

    loginUser: async (email: string, password: string): Promise<User> => {
        const dbState = await getDatabase();
        const user = dbState.users.find(u => u.email === email && u.password === password);
        if (user) {
            return user;
        } else {
            throw new Error('Invalid email or password.');
        }
    },
    
    getUserById: async (userId: string): Promise<User | undefined> => {
        const dbState = await getDatabase();
        return dbState.users.find(u => u.id === userId);
    },

    updateUserRating: async (userId: string, newRating: number): Promise<User> => {
        const dbState = await getDatabase();
        const userIndex = dbState.users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            throw new Error('User not found');
        }

        const user = dbState.users[userIndex];
        const totalRating = user.rating * user.numRatings;
        const newNumRatings = user.numRatings + 1;
        const newAverageRating = (totalRating + newRating) / newNumRatings;
        
        dbState.users[userIndex] = {
            ...user,
            rating: newAverageRating,
            numRatings: newNumRatings,
        };

        await saveDatabase(dbState);
        return dbState.users[userIndex];
    },

    createTrip: async (tripData: Omit<Trip, 'id' | 'driverId' | 'driver' | 'vehicle' | 'status' | 'createdAt'>): Promise<Trip> => {
        const dbState = await getDatabase();
        const newTrip: Trip = {
            ...tripData,
            id: `trip_${Date.now()}`,
            driverId: null,
            driver: null,
            vehicle: null,
            status: TripStatus.REQUESTED,
            createdAt: Date.now(),
        };
        dbState.trips.push(newTrip);
        await saveDatabase(dbState);
        return newTrip;
    },
    
    getTripById: async (tripId: string): Promise<Trip | undefined> => {
        const dbState = await getDatabase();
        return dbState.trips.find(t => t.id === tripId);
    },

    findOpenTrip: async (ignoreTripIds: string[] = []): Promise<Trip | undefined> => {
        const dbState = await getDatabase();
        const openTrips = dbState.trips
            .filter(t => t.status === TripStatus.REQUESTED && !ignoreTripIds.includes(t.id))
            .sort((a,b) => b.createdAt - a.createdAt);
        return openTrips[0];
    },

    acceptTrip: async (tripId: string, driver: User, vehicle: Vehicle): Promise<Trip> => {
        const dbState = await getDatabase();
        const tripIndex = dbState.trips.findIndex(t => t.id === tripId);
        if (tripIndex === -1) throw new Error("Trip not found");

        // Add a check to prevent accepting an already accepted trip
        if(dbState.trips[tripIndex].status !== TripStatus.REQUESTED) {
            throw new Error("Trip is no longer available");
        }

        dbState.trips[tripIndex] = {
            ...dbState.trips[tripIndex],
            driverId: driver.id,
            driver: driver,
            vehicle: vehicle,
            status: TripStatus.DRIVER_ASSIGNED,
        };
        await saveDatabase(dbState);
        return dbState.trips[tripIndex];
    },
    
    updateTripStatus: async (tripId: string, status: TripStatus): Promise<Trip> => {
        const dbState = await getDatabase();
        const tripIndex = dbState.trips.findIndex(t => t.id === tripId);
        if (tripIndex === -1) throw new Error("Trip not found");

        dbState.trips[tripIndex].status = status;
        await saveDatabase(dbState);
        return dbState.trips[tripIndex];
    },

    getTripsForUser: async (userId: string): Promise<Trip[]> => {
        const dbState = await getDatabase();
        const userTrips = dbState.trips
            .filter(t => t.riderId === userId || t.driverId === userId)
            .sort((a, b) => b.createdAt - a.createdAt);
        return userTrips;
    },

    createTransaction: async (trip: Trip, method: PaymentMethod): Promise<Transaction> => {
        const dbState = await getDatabase();
        const newTransaction: Transaction = {
            id: `txn_${Date.now()}`,
            tripId: trip.id,
            userId: trip.riderId,
            amount: trip.fare,
            method,
            timestamp: Date.now(),
        };
        dbState.transactions.push(newTransaction);
        await saveDatabase(dbState);
        return newTransaction;
    },

    getTransactionByTripId: async (tripId: string): Promise<Transaction | undefined> => {
        const dbState = await getDatabase();
        return dbState.transactions.find(t => t.tripId === tripId);
    },
};