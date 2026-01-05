import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

// @ts-ignore: Suppressing implicit any errors due to missing @types/react
class ErrorBoundary extends React.Component<Props, State> {
    public state: State;

    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        // Cast to any to bypass missing type definitions for Component properties
        const { hasError, error } = this.state;
        const { fallback, children } = this.props as any;

        if (hasError) {
            return fallback || (
                <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                    <h2 className="text-lg font-bold mb-2">Something went wrong.</h2>
                    <p className="text-sm border-b border-red-200 pb-2 mb-2">{error?.message}</p>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => (this as any).setState({ hasError: false, error: null })}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => {
                                localStorage.removeItem('vite-ui-theme');
                                window.location.reload();
                            }}
                            className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-800 transition"
                        >
                            Reset Theme & Reload
                        </button>
                    </div>
                </div>
            );
        }

        return children;
    }
}

export default ErrorBoundary;
