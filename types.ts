
export enum UserRole {
  NONE,
  RIDER,
  DRIVER,
  HISTORY,
}

export enum RiderStatus {
  IDLE,
  REQUESTING,
  AWAITING_DRIVER,
  ON_TRIP,
  PAYMENT,
  AWAITING_CASH_CONFIRMATION,
  RATING_DRIVER,
}

export enum DriverStatus {
  OFFLINE,
  ONLINE,
  REQUEST_RECEIVED,
  EN_ROUTE_TO_PICKUP,
  ON_TRIP,
  TRIP_COMPLETED,
  AWAITING_CASH_PAYMENT,
  RATING_RIDER,
}

export enum PaymentMethod {
  CASH = 'Cash',
  CREDIT_CARD = 'Credit Card',
  PAYPAL = 'PayPal',
  APPLE_PAY = 'Apple Pay',
  GOOGLE_PAY = 'Google Pay',
}

export enum VehicleType {
    TAXI = 'Taxi',
    HOME_CAR = 'Home Car',
    PREMIUM = 'Premium'
}

export enum TripStatus {
    REQUESTED = 'Requested',
    DRIVER_ASSIGNED = 'Driver Assigned',
    EN_ROUTE_TO_PICKUP = 'En Route to Pickup',
    ON_TRIP = 'On Trip',
    COMPLETED = 'Completed',
    CANCELLED = 'Cancelled',
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // In a real app, this would be a hash
  avatarUrl: string;
  rating: number;
  numRatings: number;
}

export interface Vehicle {
  make: string;
  model: string;
  licensePlate: string;
  type: VehicleType;
}

export interface Trip {
  id: string;
  riderId: string;
  driverId: string | null;
  pickup: string;
  destination: string;
  fare: number;
  driver: User | null;
  vehicle: Vehicle | null;
  status: TripStatus;
  createdAt: number;
}

export interface Transaction {
    id: string;
    tripId: string;
    userId: string;
    amount: number;
    method: PaymentMethod;
    timestamp: number;
}