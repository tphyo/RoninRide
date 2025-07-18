import React, { useState, useEffect, useCallback } from 'react';
import { DriverStatus, Trip, User, Vehicle, VehicleType, TripStatus, PaymentMethod } from '../types';
import { Card, Button, Avatar, StarIcon } from './ui';
import { db } from '../database';

const mockVehicle: Vehicle = {
    make: 'Honda',
    model: 'Accord',
    licensePlate: 'DRV-456',
    type: VehicleType.HOME_CAR
};

// --- UI Sub-components ---

const Offline: React.FC<{ onGoOnline: () => void }> = ({ onGoOnline }) => (
    <Card className="w-full max-w-sm text-center animate-fade-in-up">
        <h2 className="text-2xl font-bold">You are Offline</h2>
        <p className="text-gray-400 my-4">Go online to start receiving ride requests.</p>
        <Button onClick={onGoOnline} className="w-full text-lg">Go Online</Button>
    </Card>
);

const Online: React.FC<{ onGoOffline: () => void }> = ({ onGoOffline }) => (
    <Card className="w-full max-w-sm text-center animate-fade-in-up">
        <div className="flex items-center justify-center space-x-3 mb-4">
             <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </div>
            <h2 className="text-2xl font-bold">You are Online</h2>
        </div>
        <p className="text-gray-400 my-4">Waiting for a ride request...</p>
        <Button onClick={onGoOffline} variant="secondary" className="w-full">Go Offline</Button>
    </Card>
);

const RideRequest: React.FC<{ rider: User, trip: Trip, onAccept: () => void, onDecline: () => void }> = ({ rider, trip, onAccept, onDecline }) => (
    <Card className="w-full max-w-sm animate-fade-in-up">
        <h2 className="text-xl font-bold text-center mb-4">New Ride Request</h2>
        <div className="flex items-center space-x-4">
            <Avatar src={rider.avatarUrl} alt={rider.name} />
            <div>
                <p className="font-bold text-lg">{rider.name}</p>
                <div className="flex items-center">
                    <StarIcon/>
                    <span className="ml-1 font-semibold">{rider.rating.toFixed(1)}</span>
                </div>
            </div>
            <div className="ml-auto text-right">
                <p className="font-bold text-xl text-green-400">${trip.fare.toFixed(2)}</p>
                <p className="text-gray-400 text-sm">Est. Fare</p>
            </div>
        </div>
        <div className="my-4 space-y-2 text-sm bg-gray-700/50 p-3 rounded-lg">
            <p><strong>From:</strong> {trip.pickup}</p>
            <p><strong>To:</strong> {trip.destination}</p>
        </div>
        <div className="flex space-x-4">
            <Button onClick={onDecline} variant="secondary" className="w-1/2">Decline</Button>
            <Button onClick={onAccept} className="w-1/2">Accept</Button>
        </div>
    </Card>
);

const RiderInfo: React.FC<{ trip: Trip, rider: User | null, onAction: () => void, actionText: string }> = ({ trip, rider, onAction, actionText }) => {
    if (!rider) return null;
    return (
        <Card className="w-full max-w-sm animate-fade-in-up">
            <div className="flex items-center space-x-4 mb-4">
                <Avatar src={rider.avatarUrl} alt={rider.name} size="md" />
                <div>
                    <p className="font-bold text-xl">{rider.name}</p>
                     <div className="flex items-center">
                        <StarIcon />
                        <span className="ml-1 font-semibold">{rider.rating.toFixed(1)}</span>
                    </div>
                </div>
            </div>
            <div className="my-4 space-y-2 text-sm bg-gray-700/50 p-3 rounded-lg">
                <p><strong>Pickup:</strong> {trip.pickup}</p>
                <p><strong>Destination:</strong> {trip.destination}</p>
            </div>
            <Button onClick={onAction} className="w-full text-lg">{actionText}</Button>
        </Card>
    );
};

const CashConfirmation: React.FC<{ trip: Trip, onConfirm: () => void }> = ({ trip, onConfirm }) => (
    <Card className="w-full max-w-sm text-center animate-fade-in-up">
        <h2 className="text-2xl font-bold">Confirm Payment</h2>
        <p className="text-gray-400 my-4">Did you receive cash payment of</p>
        <p className="text-4xl font-extrabold text-green-400 my-4">${trip.fare.toFixed(2)}?</p>
        <Button onClick={onConfirm} className="w-full text-lg">Confirm Cash Received</Button>
    </Card>
);

const WaitingForPayment: React.FC = () => (
    <Card className="w-full max-w-sm text-center animate-fade-in-up">
        <h2 className="text-2xl font-bold">Trip Complete</h2>
        <p className="text-gray-400 my-4">Waiting for rider to complete payment.</p>
        <div className="w-12 h-12 border-4 border-t-green-500 border-gray-600 rounded-full animate-spin mx-auto my-6"></div>
    </Card>
);

const RatingView: React.FC<{ trip: Trip; rider: User | null; onSubmitRating: (rating: number) => void }> = ({ trip, rider, onSubmitRating }) => {
    const [rating, setRating] = useState(5);
    if(!rider) return null;

    return (
        <Card className="w-full max-w-sm animate-fade-in-up">
            <h2 className="text-2xl font-bold text-center mb-2">Rate Your Rider</h2>
            <p className="text-gray-400 text-center mb-4">How was your trip with {rider.name}?</p>
            <div className="flex justify-center space-x-2 my-6">
                {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => setRating(star)}>
                        <StarIcon className={`w-10 h-10 transition-colors ${star <= rating ? 'text-yellow-400' : 'text-gray-600'}`} />
                    </button>
                ))}
            </div>
            <Button onClick={() => onSubmitRating(rating)} className="w-full text-lg">Submit Rating</Button>
        </Card>
    );
};

// --- Main Component ---

interface DriverViewProps {
  user: User;
  onTripStatusChange: (isTripActive: boolean) => void;
  isAwaitingCashPayment: boolean;
  onCashConfirmed: () => void;
}

export const DriverView: React.FC<DriverViewProps> = ({ user, onTripStatusChange, isAwaitingCashPayment, onCashConfirmed }) => {
    const [status, setStatus] = useState<DriverStatus>(DriverStatus.OFFLINE);
    const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
    const [riderDetails, setRiderDetails] = useState<User | null>(null);
    const [snoozedTripIds, setSnoozedTripIds] = useState<string[]>([]);

    // Effect to control map visibility
    useEffect(() => {
        const isActive = status === DriverStatus.EN_ROUTE_TO_PICKUP || status === DriverStatus.ON_TRIP;
        onTripStatusChange(isActive);
    }, [status, onTripStatusChange]);

    // Effect to poll for new rides when online
    useEffect(() => {
        if (status !== DriverStatus.ONLINE) return;

        let isMounted = true;
        const findRide = async () => {
            if (!isMounted) return;
            try {
                const trip = await db.findOpenTrip(snoozedTripIds);
                if (trip && isMounted) {
                    const rider = await db.getUserById(trip.riderId);
                    if (rider) {
                        setCurrentTrip(trip);
                        setRiderDetails(rider);
                        setStatus(DriverStatus.REQUEST_RECEIVED);
                    }
                }
            } catch (error) {
                console.error("Polling for rides failed:", error);
            }
        };

        const intervalId = setInterval(findRide, 5000);
        findRide(); // Initial check

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [status, snoozedTripIds]);
    
    // Effect to check for digital payment after trip completion
    useEffect(() => {
        if (status !== DriverStatus.TRIP_COMPLETED || !currentTrip) return;

        const checkPayment = async () => {
            const transaction = await db.getTransactionByTripId(currentTrip.id);
            if (transaction && transaction.method !== PaymentMethod.CASH) {
                // Digital payment confirmed, move to rating
                setStatus(DriverStatus.RATING_RIDER);
            }
        };

        const intervalId = setInterval(checkPayment, 3000);
        return () => clearInterval(intervalId);
    }, [status, currentTrip]);
    
    // Effect to listen for cash payment selection from App
    useEffect(() => {
        if (isAwaitingCashPayment && status === DriverStatus.TRIP_COMPLETED) {
            setStatus(DriverStatus.AWAITING_CASH_PAYMENT);
        }
    }, [isAwaitingCashPayment, status]);

    const resetState = () => {
        setCurrentTrip(null);
        setRiderDetails(null);
        setStatus(DriverStatus.ONLINE);
    };

    const handleAcceptRide = useCallback(async () => {
        if (!currentTrip) return;
        try {
            await db.acceptTrip(currentTrip.id, user, mockVehicle);
            setStatus(DriverStatus.EN_ROUTE_TO_PICKUP);
        } catch (error) {
            console.error("Failed to accept trip:", error);
            // Trip might have been taken by another driver, reset to find a new one.
            resetState();
        }
    }, [currentTrip, user]);

    const handleDeclineRide = useCallback(() => {
        if (!currentTrip) return;
        // Snooze this trip ID so we don't see it again for a while
        const tripIdToSnooze = currentTrip.id;
        setSnoozedTripIds(prev => [...prev, tripIdToSnooze]);
        resetState();
        
        // Clear the snooze after a while so the request can be seen again if it's still available
        setTimeout(() => {
            setSnoozedTripIds(prev => prev.filter(id => id !== tripIdToSnooze));
        }, 60000); // Snooze for 1 minute
    }, [currentTrip]);

    const handlePickupRider = useCallback(async () => {
        if (!currentTrip) return;
        await db.updateTripStatus(currentTrip.id, TripStatus.ON_TRIP);
        setStatus(DriverStatus.ON_TRIP);
    }, [currentTrip]);

    const handleCompleteTrip = useCallback(async () => {
        if (!currentTrip) return;
        await db.updateTripStatus(currentTrip.id, TripStatus.COMPLETED);
        setStatus(DriverStatus.TRIP_COMPLETED);
    }, [currentTrip]);

    const handleConfirmCash = useCallback(() => {
        onCashConfirmed();
        setStatus(DriverStatus.RATING_RIDER);
    }, [onCashConfirmed]);

    const handleSubmitRating = useCallback(async (rating: number) => {
        if (!currentTrip?.riderId) return;
        await db.updateUserRating(currentTrip.riderId, rating);
        resetState();
    }, [currentTrip]);


    const renderContent = () => {
        switch (status) {
            case DriverStatus.OFFLINE:
                return <Offline onGoOnline={() => setStatus(DriverStatus.ONLINE)} />;
            case DriverStatus.ONLINE:
                return <Online onGoOffline={() => setStatus(DriverStatus.OFFLINE)} />;
            case DriverStatus.REQUEST_RECEIVED:
                if (!currentTrip || !riderDetails) return <Online onGoOffline={() => setStatus(DriverStatus.OFFLINE)} />;
                return <RideRequest rider={riderDetails} trip={currentTrip} onAccept={handleAcceptRide} onDecline={handleDeclineRide} />;
            case DriverStatus.EN_ROUTE_TO_PICKUP:
                if (!currentTrip || !riderDetails) return null;
                return <RiderInfo trip={currentTrip} rider={riderDetails} onAction={handlePickupRider} actionText="Pick Up Rider" />;
            case DriverStatus.ON_TRIP:
                if (!currentTrip || !riderDetails) return null;
                return <RiderInfo trip={currentTrip} rider={riderDetails} onAction={handleCompleteTrip} actionText="Complete Trip" />;
            case DriverStatus.TRIP_COMPLETED:
                return <WaitingForPayment />;
            case DriverStatus.AWAITING_CASH_PAYMENT:
                if (!currentTrip) return null;
                return <CashConfirmation trip={currentTrip} onConfirm={handleConfirmCash} />;
            case DriverStatus.RATING_RIDER:
                if (!currentTrip || !riderDetails) return null;
                return <RatingView trip={currentTrip} rider={riderDetails} onSubmitRating={handleSubmitRating} />;
            default:
                return null;
        }
    };

    return (
        <div className="relative z-10 h-full flex items-end justify-center p-4 pb-8">
            {renderContent()}
        </div>
    );
};