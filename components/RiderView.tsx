
import React, { useState, useEffect, useCallback } from 'react';
import { RiderStatus, VehicleType, Trip, User, PaymentMethod, TripStatus } from '../types';
import { Card, Button, Avatar, StarIcon, CarIcon } from './ui';
import { PaymentModal } from './PaymentModal';
import { db } from '../database';
import { formatRating } from '../utils';

// --- Sub-components for different rider states ---

const RideRequestForm: React.FC<{ onRideRequest: (destination: string, vehicleType: VehicleType) => void }> = ({ onRideRequest }) => {
    const [destination, setDestination] = useState('Downtown Center');
    const [vehicleType, setVehicleType] = useState<VehicleType>(VehicleType.HOME_CAR);
    const [isRequesting, setIsRequesting] = useState(false);
    
    const vehicleTypes = [
        { type: VehicleType.HOME_CAR, name: 'Home Car', eta: '3 min', price: '$20-24' },
        { type: VehicleType.TAXI, name: 'Taxi', eta: '5 min', price: '$22-26' },
        { type: VehicleType.PREMIUM, name: 'Premium', eta: '6 min', price: '$35-42', iconClass: 'text-yellow-400' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!destination) return;
        setIsRequesting(true);
        // Simulate a small delay for better UX
        setTimeout(() => {
            onRideRequest(destination, vehicleType);
        }, 500);
    };

    return (
        <Card className="w-full max-w-sm animate-fade-in-up">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-gray-400">PICKUP</label>
                    <input
                        type="text"
                        value="123 Main St, Anytown"
                        readOnly
                        className="w-full bg-gray-700 p-3 rounded-lg text-gray-300 cursor-not-allowed"
                    />
                </div>
                 <div>
                    <label className="text-xs font-bold text-gray-400">DESTINATION</label>
                    <input
                        type="text"
                        placeholder="Where to?"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        required
                        className="w-full bg-gray-900/50 p-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>

                <div className="space-y-2">
                    {vehicleTypes.map((v) => (
                        <button
                            key={v.type}
                            type="button"
                            onClick={() => setVehicleType(v.type)}
                            className={`w-full flex items-center p-3 rounded-lg border-2 transition-all ${vehicleType === v.type ? 'bg-green-500/20 border-green-500' : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'}`}
                        >
                            <CarIcon className={`w-10 h-10 mr-4 ${v.iconClass || ''}`} />
                            <div className="text-left">
                                <span className="font-bold text-white">{v.name}</span>
                                <span className="text-sm text-gray-400 ml-3">{v.eta}</span>
                            </div>
                            <p className="ml-auto font-bold text-white">{v.price}</p>
                        </button>
                    ))}
                </div>

                <Button type="submit" className="w-full text-lg" disabled={isRequesting || !destination}>
                    {isRequesting ? "Requesting..." : "Request Ride"}
                </Button>
            </form>
        </Card>
    );
};

const AwaitingDriver: React.FC<{ onCancel: () => void }> = ({ onCancel }) => (
    <Card className="w-full max-w-sm text-center animate-fade-in-up">
        <h2 className="text-2xl font-bold">Finding your ride...</h2>
        <div className="w-16 h-16 border-4 border-t-green-500 border-gray-600 rounded-full animate-spin mx-auto my-8"></div>
        <p className="text-gray-400 mb-6">We're connecting you with a nearby driver.</p>
        <Button onClick={onCancel} variant="secondary">Cancel Request</Button>
    </Card>
);

const DriverInfo: React.FC<{ trip: Trip, statusText: string }> = ({ trip, statusText }) => {
    const { driver, vehicle } = trip;
    if (!driver || !vehicle) return null;

    return (
         <Card className="w-full max-w-sm animate-fade-in-up">
            <p className="text-center font-bold text-lg text-green-400 mb-4">{statusText}</p>
            <div className="flex items-center space-x-4">
                <Avatar src={driver.avatarUrl} alt={driver.name} size="md" />
                <div>
                    <p className="font-bold text-xl">{driver.name}</p>
                    <div className="flex items-center">
                        <StarIcon />
                        <span className="ml-1 font-semibold">{formatRating(driver.rating)}</span>
                    </div>
                </div>
                <div className="ml-auto text-right">
                    <p className="font-bold text-lg">{vehicle.make} {vehicle.model}</p>
                    <p className="text-gray-300 bg-gray-900 px-2 py-1 rounded-md text-sm font-mono tracking-wider">{vehicle.licensePlate}</p>
                </div>
            </div>
        </Card>
    );
};

const AwaitingConfirmation: React.FC = () => (
    <Card className="w-full max-w-sm text-center animate-fade-in-up">
        <h2 className="text-2xl font-bold">Awaiting Confirmation</h2>
        <p className="text-gray-400 my-4">Waiting for the driver to confirm cash payment.</p>
        <div className="w-16 h-16 border-4 border-t-green-500 border-gray-600 rounded-full animate-spin mx-auto my-6"></div>
    </Card>
);

const RatingView: React.FC<{ trip: Trip; onSubmitRating: (rating: number) => void }> = ({ trip, onSubmitRating }) => {
    const [rating, setRating] = useState(5);

    const handleSubmit = () => {
        onSubmitRating(rating);
    };

    return (
        <Card className="w-full max-w-sm animate-fade-in-up">
            <h2 className="text-2xl font-bold text-center mb-2">Rate Your Trip</h2>
            <p className="text-gray-400 text-center mb-4">How was your ride with {trip.driver?.name}?</p>
            <div className="flex justify-center space-x-2 my-6">
                {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => setRating(star)}>
                        <StarIcon className={`w-10 h-10 transition-colors ${star <= rating ? 'text-yellow-400' : 'text-gray-600'}`} />
                    </button>
                ))}
            </div>
            <Button onClick={handleSubmit} className="w-full text-lg">Submit Rating</Button>
        </Card>
    );
};

// --- Main Component ---

interface RiderViewProps {
  user: User;
  onTripStatusChange: (isTripActive: boolean) => void;
  onCashPaymentSelected: () => void;
  isAwaitingCashConfirmation: boolean;
}

export const RiderView: React.FC<RiderViewProps> = ({ user, onTripStatusChange, onCashPaymentSelected, isAwaitingCashConfirmation }) => {
    const [status, setStatus] = useState<RiderStatus>(RiderStatus.IDLE);
    const [trip, setTrip] = useState<Trip | null>(null);

    // Effect to handle trip status changes for the map
    useEffect(() => {
        const isActive = [RiderStatus.AWAITING_DRIVER, RiderStatus.ON_TRIP].includes(status) && !!trip?.driver;
        onTripStatusChange(isActive);
    }, [status, trip, onTripStatusChange]);

    // Effect to poll for trip updates
    useEffect(() => {
        const shouldTrackTrip = trip && (status === RiderStatus.AWAITING_DRIVER || status === RiderStatus.ON_TRIP);
        if (!shouldTrackTrip) return;

        const checkTripStatus = async () => {
            if (!trip) return;
            const updatedTrip = await db.getTripById(trip.id);
            if (updatedTrip) {
                // Update trip object in state if it has changed
                if (JSON.stringify(updatedTrip) !== JSON.stringify(trip)) {
                    setTrip(updatedTrip);
                }

                // Transition state based on trip status from DB
                if (updatedTrip.status === TripStatus.ON_TRIP && status !== RiderStatus.ON_TRIP) {
                    setStatus(RiderStatus.ON_TRIP);
                } else if (updatedTrip.status === TripStatus.COMPLETED) {
                    setStatus(RiderStatus.PAYMENT);
                } else if (updatedTrip.status === TripStatus.CANCELLED) {
                    setStatus(RiderStatus.IDLE);
                    setTrip(null);
                }
            }
        };
        
        const intervalId = setInterval(checkTripStatus, 3000); // Poll every 3 seconds

        return () => {
            clearInterval(intervalId);
        };
    }, [status, trip]);
    
    // Effect to listen for cash confirmation from App state
    useEffect(() => {
        if (status === RiderStatus.AWAITING_CASH_CONFIRMATION && !isAwaitingCashConfirmation) {
            setStatus(RiderStatus.RATING_DRIVER);
        }
    }, [isAwaitingCashConfirmation, status]);
    
    const handleRideRequest = useCallback(async (destination: string, vehicleType: VehicleType) => {
        setStatus(RiderStatus.REQUESTING);
        const fare = 20 + Math.random() * 20; // Mock fare calculation
        const newTrip = await db.createTrip({ riderId: user.id, pickup: '123 Main St, Anytown', destination, fare });
        setTrip(newTrip);
        setStatus(RiderStatus.AWAITING_DRIVER);
    }, [user.id]);
    
    const handleCancelRequest = useCallback(async () => {
        if (trip) {
            await db.updateTripStatus(trip.id, TripStatus.CANCELLED);
        }
        setTrip(null);
        setStatus(RiderStatus.IDLE);
    }, [trip]);

    const handleConfirmPayment = useCallback(async (method: PaymentMethod) => {
        if (!trip) return;
        
        await db.createTransaction(trip, method);

        if (method === PaymentMethod.CASH) {
            onCashPaymentSelected();
            setStatus(RiderStatus.AWAITING_CASH_CONFIRMATION);
        } else {
            // For digital payments, we can go straight to rating
            setStatus(RiderStatus.RATING_DRIVER);
        }
    }, [trip, onCashPaymentSelected]);

    const handleFinish = () => {
        setTrip(null);
        setStatus(RiderStatus.IDLE);
    };

    const handleSubmitRating = async (rating: number) => {
        if (!trip?.driver) return;
        try {
            await db.updateUserRating(trip.driver.id, rating);
        } catch(error) {
            console.error("Failed to submit rating:", error);
        } finally {
            handleFinish();
        }
    };

    const renderContent = () => {
        switch (status) {
            case RiderStatus.IDLE:
                return <RideRequestForm onRideRequest={handleRideRequest} />;
            case RiderStatus.REQUESTING:
            case RiderStatus.AWAITING_DRIVER:
                 if (trip?.driver) {
                    return <DriverInfo trip={trip} statusText={`${trip.driver.name} is on their way!`} />;
                 }
                return <AwaitingDriver onCancel={handleCancelRequest} />;
            case RiderStatus.ON_TRIP:
                if (!trip) return null;
                return <DriverInfo trip={trip} statusText={`On trip to ${trip.destination}`} />;
            case RiderStatus.PAYMENT:
                if (!trip) return null;
                return <PaymentModal trip={trip} onConfirmPayment={handleConfirmPayment} />;
            case RiderStatus.AWAITING_CASH_CONFIRMATION:
                return <AwaitingConfirmation />;
            case RiderStatus.RATING_DRIVER:
                if (!trip) return null;
                return <RatingView trip={trip} onSubmitRating={handleSubmitRating} />;
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
