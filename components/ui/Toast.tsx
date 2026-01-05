import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
    onClose: (id: string) => void;
}

const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
};

const bgColors = {
    success: 'bg-white dark:bg-slate-800 border-l-4 border-green-500',
    error: 'bg-white dark:bg-slate-800 border-l-4 border-red-500',
    info: 'bg-white dark:bg-slate-800 border-l-4 border-blue-500'
};

const Toast: React.FC<ToastProps> = ({ id, message, type, duration = 3000, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        requestAnimationFrame(() => setIsVisible(true));

        const timer = setTimeout(() => {
            setIsVisible(false); // Trigger exit animation
            setTimeout(() => onClose(id), 300); // Remove after animation
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    return (
        <div
            className={`
                flex items-center gap-3 p-4 rounded shadow-lg border border-slate-200 dark:border-slate-700 
                transform transition-all duration-300 ease-in-out
                ${bgColors[type]}
                ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'}
            `}
            role="alert"
        >
            {icons[type]}
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{message}</p>
            <button
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(() => onClose(id), 300);
                }}
                className="ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                aria-label="Close"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default Toast;
