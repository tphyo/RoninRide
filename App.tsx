import React, { useState, useCallback, useEffect } from 'react';
import { UserRole, User } from './types';
import { RiderView } from './components/RiderView';
import { DriverView } from './components/DriverView';
import { Button, Avatar, HistoryIcon } from './components/ui';
import { Map } from './components/Map';
import { AuthView } from './components/AuthView';
import { HistoryView } from './components/HistoryView';
import { db } from './database';


const Header: React.FC<{ onLogout: () => void; onShowHistory: () => void; currentUser: User | null; role: UserRole }> = ({ onLogout, onShowHistory, currentUser, role }) => (
    <header className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white tracking-tight" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.5)'}}>
            Ronin<span className="text-green-400">Ride</span>
        </h1>
        {currentUser && (
             <div className="flex items-center space-x-2">
                {role !== UserRole.HISTORY && (
                     <Button variant="ghost" onClick={onShowHistory} className="px-3">
                        <HistoryIcon />
                    </Button>
                )}
                <Button variant="ghost" onClick={onLogout} className="px-3">
                    Log Out
                </Button>
                <Avatar src={currentUser.avatarUrl} alt={currentUser.name} size="sm"/>
            </div>
        )}
    </header>
);


const RoleSelector: React.FC<{ onSelectRole: (role: UserRole) => void; userName: string; }> = ({ onSelectRole, userName }) => {
    return (
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl animate-fade-in-up">
                <h2 className="text-3xl font-bold mb-2">Welcome, {userName}!</h2>
                <p className="text-gray-300 mb-8">How are you traveling today?</p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    <Button className="w-full sm:w-48 text-lg" onClick={() => onSelectRole(UserRole.RIDER)}>
                        Find a Ride
                    </Button>
                    <Button variant="secondary" className="w-full sm:w-48 text-lg" onClick={() => onSelectRole(UserRole.DRIVER)}>
                        Drive or Deliver
                    </Button>
                </div>
            </div>
            <div className="mt-8 p-4 bg-gray-900/70 rounded-lg w-full max-w-md animate-fade-in-up" style={{animationDelay: '200ms'}}>
                <p className="text-sm text-gray-300 font-medium">To test with two devices, open this exact URL on your other phone:</p>
                <input 
                    type="text" 
                    readOnly 
                    value={window.location.href}
                    className="w-full bg-gray-700 text-green-300 p-2 mt-2 rounded-md text-xs font-mono"
                    onFocus={(e) => e.target.select()}
                />
            </div>
        </div>
    );
};

const LoadingScreen: React.FC<{message: string}> = ({message}) => (
     <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <div className="w-16 h-16 border-4 border-t-green-500 border-gray-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-xl">{message}</p>
    </div>
);


function App() {
    const [sessionState, setSessionState] = useState<'loading' | 'ready' | 'error'>('loading');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole>(UserRole.NONE);
    const [isTripActive, setIsTripActive] = useState(false);
    const [isAwaitingCashPayment, setIsAwaitingCashPayment] = useState(false);

    useEffect(() => {
        const initSession = async () => {
            try {
                const params = new URLSearchParams(window.location.search);
                let id = params.get('session');
                if (!id) {
                    id = await db.createNewDatabase();
                    window.location.search = `?session=${id}`;
                    return;
                }
                db.init(id);
                setSessionState('ready');
            } catch (error) {
                console.error("Failed to initialize session:", error);
                setSessionState('error');
            }
        };
        initSession();
    }, []);

    const handleLoginSuccess = (user: User) => {
        setCurrentUser(user);
    };
    
    const handleLogout = () => {
        setCurrentUser(null);
        setRole(UserRole.NONE);
        setIsTripActive(false);
        setIsAwaitingCashPayment(false);
    }
    
    const handleShowHistory = () => {
        setRole(UserRole.HISTORY);
    }

    const handleSelectRole = (selectedRole: UserRole) => {
        setRole(selectedRole);
    };

    const handleTripStatusChange = useCallback((active: boolean) => {
        setIsTripActive(active);
    }, []);

    const handleCashPaymentSelected = useCallback(() => {
        setIsAwaitingCashPayment(true);
    }, []);

    const handleCashConfirmed = useCallback(() => {
        setIsAwaitingCashPayment(false);
    }, []);

    if (sessionState === 'loading') {
        return <LoadingScreen message="Initializing session..." />;
    }

    if (sessionState === 'error') {
        return <LoadingScreen message="Could not start session. Please refresh." />;
    }

    const renderView = () => {
        if (!currentUser) {
            return <AuthView onLoginSuccess={handleLoginSuccess} />;
        }
        
        switch (role) {
            case UserRole.RIDER:
                return <RiderView
                    user={currentUser}
                    onTripStatusChange={handleTripStatusChange}
                    onCashPaymentSelected={handleCashPaymentSelected}
                    isAwaitingCashConfirmation={isAwaitingCashPayment}
                />;
            case UserRole.DRIVER:
                return <DriverView
                    user={currentUser}
                    onTripStatusChange={handleTripStatusChange}
                    isAwaitingCashPayment={isAwaitingCashPayment}
                    onCashConfirmed={handleCashConfirmed}
                />;
            case UserRole.HISTORY:
                return <HistoryView userId={currentUser.id} onBack={() => setRole(UserRole.NONE)} />;
            default:
                return <RoleSelector onSelectRole={handleSelectRole} userName={currentUser.name.split(' ')[0]} />;
        }
    };

    return (
        <div className="h-screen w-screen bg-gray-900 font-sans antialiased">
            <Map role={role} isTripActive={isTripActive} />
            <Header onLogout={handleLogout} onShowHistory={handleShowHistory} currentUser={currentUser} role={role}/>
            <main className="h-full w-full">
                {renderView()}
            </main>
        </div>
    );
}

export default App;