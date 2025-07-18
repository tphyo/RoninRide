
import React, { useState, useEffect } from 'react';
import { Trip, TripStatus } from '../types';
import { db } from '../database';
import { Card, Button, StarIcon } from './ui';

interface HistoryViewProps {
    userId: string;
    onBack: () => void;
}

const TripHistoryCard: React.FC<{ trip: Trip }> = ({ trip }) => {
    const tripDate = new Date(trip.createdAt).toLocaleDateString();
    const tripTime = new Date(trip.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const statusColor = {
        [TripStatus.COMPLETED]: 'text-green-400',
        [TripStatus.CANCELLED]: 'text-red-400',
        [TripStatus.REQUESTED]: 'text-yellow-400',
    }

    return (
        <Card className="w-full mb-4">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-lg text-white">To: {trip.destination}</p>
                    <p className="text-sm text-gray-400">{tripDate} at {tripTime}</p>
                     {trip.driver && (
                        <div className="flex items-center mt-2">
                           <p className="text-sm text-gray-300">Driver: {trip.driver.name}</p>
                           <StarIcon className="ml-2 w-4 h-4" /> 
                           <span className="ml-1 text-sm">{trip.driver.rating}</span>
                        </div>
                    )}
                </div>
                <div className="text-right">
                    <p className="font-extrabold text-xl text-green-400">${trip.fare.toFixed(2)}</p>
                    <p className={`text-sm font-bold ${statusColor[trip.status] || 'text-gray-400'}`}>{trip.status}</p>
                </div>
            </div>
        </Card>
    )
}


export const HistoryView: React.FC<HistoryViewProps> = ({ userId, onBack }) => {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        db.getTripsForUser(userId)
          .then(userTrips => {
              setTrips(userTrips);
          })
          .finally(() => {
              setIsLoading(false);
          });
    }, [userId]);

    return (
        <div className="relative z-10 h-full flex flex-col items-center p-4">
            <div className="w-full max-w-md mt-20">
                <div className="flex justify-between items-center mb-6">
                     <h2 className="text-3xl font-bold">Ride History</h2>
                     <Button variant="secondary" onClick={onBack}>Back</Button>
                </div>

                {isLoading ? (
                     <p className="text-center text-gray-400">Loading history...</p>
                ) : trips.length > 0 ? (
                    <div className="overflow-y-auto" style={{maxHeight: 'calc(100vh - 150px)'}}>
                        {trips.map(trip => <TripHistoryCard key={trip.id} trip={trip} />)}
                    </div>
                ) : (
                    <Card className="text-center">
                        <p className="text-gray-400">No ride history yet.</p>
                    </Card>
                )}
            </div>
        </div>
    );
};
