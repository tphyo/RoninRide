
import React, { useState } from 'react';
import { Card, Button, CashIcon, CreditCardIcon, PayPalIcon, ApplePayIcon, GooglePayIcon } from './ui';
import { PaymentMethod, Trip } from '../types';

interface PaymentModalProps {
  trip: Trip;
  onConfirmPayment: (method: PaymentMethod) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ trip, onConfirmPayment }) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  const paymentMethods = [
    { id: PaymentMethod.CREDIT_CARD, icon: <CreditCardIcon />, name: "Credit Card", details: "Visa **** 4242" },
    { id: PaymentMethod.PAYPAL, icon: <PayPalIcon />, name: "PayPal", details: "user@example.com" },
    { id: PaymentMethod.APPLE_PAY, icon: <ApplePayIcon />, name: "Apple Pay" },
    { id: PaymentMethod.GOOGLE_PAY, icon: <GooglePayIcon />, name: "Google Pay" },
    { id: PaymentMethod.CASH, icon: <CashIcon />, name: "Cash" },
  ];

  const handlePayment = () => {
    if (!selectedMethod) return;
    setIsPaying(true);
    // Simulate API call for payment
    setTimeout(() => {
      onConfirmPayment(selectedMethod);
      // Parent component will handle unmounting, so no need to setIsPaying(false)
    }, 1500);
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md animate-fade-in-up">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Trip Completed</h2>
          <p className="text-gray-400 mb-1">Your ride from {trip.pickup} to {trip.destination}.</p>
          <p className="text-4xl font-extrabold text-green-400 my-4">${trip.fare.toFixed(2)}</p>
        </div>
        
        <div className="space-y-3 my-6">
          <h3 className="text-lg font-semibold text-gray-200">Select Payment Method</h3>
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`w-full flex items-center p-4 rounded-lg border-2 transition-all ${selectedMethod === method.id ? 'bg-green-500/20 border-green-500' : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'}`}
            >
              <div className="text-green-400">{method.icon}</div>
              <div className="ml-4 text-left">
                <p className="font-bold text-white">{method.name}</p>
                {method.details && <p className="text-sm text-gray-400">{method.details}</p>}
              </div>
              <div className="ml-auto">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === method.id ? 'border-green-500 bg-green-500' : 'border-gray-400'}`}>
                   {selectedMethod === method.id && <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                </div>
              </div>
            </button>
          ))}
        </div>
        
        <Button onClick={handlePayment} disabled={!selectedMethod || isPaying} className="w-full text-lg">
          {isPaying ? 'Processing...' : `Pay $${trip.fare.toFixed(2)}`}
        </Button>
      </Card>
    </div>
  );
};