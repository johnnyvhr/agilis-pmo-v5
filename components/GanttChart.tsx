
import React, { useRef, useLayoutEffect, useMemo, useState, useEffect } from 'react';

interface GanttProject {
    name: string;
    startDate: Date;
    endDate: Date;
    status?: string;
}

export type ViewMode = 'day' | 'week' | 'month' | 'quarter';

interface GanttChartProps {
    projects: GanttProject[];
    startDate: Date;
    endDate: Date;
    viewMode?: ViewMode;
}

const GanttChart: React.FC<GanttChartProps> = ({ projects, startDate, endDate, viewMode = 'month' }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    
    // --- Resizable Sidebar Logic ---
    const [sidebarWidth, setSidebarWidth] = useState<number>(256); // Default 256px (w-64)

    useEffect(() => {
        const savedWidth = localStorage.getItem('gantt_sidebar_width');
        if (savedWidth) {
            setSidebarWidth(parseInt(savedWidth, 10));
        }
    }, []);

    const startResizing = (mouseDownEvent: React.MouseEvent) => {
        mouseDownEvent.preventDefault();
        const startX = mouseDownEvent.clientX;
        const startWidth = sidebarWidth;

        const onMouseMove = (mouseMoveEvent: MouseEvent) => {
            const newWidth = startWidth + (mouseMoveEvent.clientX - startX);
            // Limits: Min 150px, Max 600px
            if (newWidth >= 150 && newWidth <= 600) {
                setSidebarWidth(newWidth);
            }
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.body.style.cursor = 'default';
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.body.style.cursor = 'col-resize';
    };

    useEffect(() => {
        localStorage.setItem('gantt_sidebar_width', sidebarWidth.toString());
    }, [sidebarWidth]);
    // -------------------------------

    // Helper: Normalize dates to start of day
    const normalizeDate = (date: Date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    };

    const chartStart = normalizeDate(startDate);
    const chartEnd = normalizeDate(endDate);

    // Configuration based on ViewMode
    const config = useMemo(() => {
        switch (viewMode) {
            case 'day':
                return { columnWidth: 40, unit: 'day', step: 1, labelFormat: (d: Date) => d.getDate().toString() };
            case 'week':
                return { columnWidth: 30, unit: 'day', step: 7, labelFormat: (d: Date) => `S${getWeekNumber(d)}` };
            case 'month':
                return { columnWidth: 60, unit: 'month', step: 1, labelFormat: (d: Date) => d.toLocaleDateString('pt-BR', { month: 'short' }) };
            case 'quarter':
                return { columnWidth: 80, unit: 'month', step: 3, labelFormat: (d: Date) => `Q${Math.floor(d.getMonth() / 3) + 1}` };
            default:
                return { columnWidth: 60, unit: 'month', step: 1, labelFormat: (d: Date) => d.toLocaleDateString('pt-BR', { month: 'short' }) };
        }
    }, [viewMode]);

    // Helper: Get Week Number
    function getWeekNumber(d: Date) {
        const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        const dayNum = date.getUTCDay() || 7;
        date.setUTCDate(date.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
        return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    }

    // Helper: Calculate difference in appropriate units
    const getDiff = (start: Date, end: Date, unit: string) => {
        if (unit === 'month') {
            return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        }
        // days
        return (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
    };

    // Calculate chart dimensions
    const totalUnits = Math.max(1, getDiff(chartStart, chartEnd, config.unit));
    // We add a buffer to the width to ensure the last label/bar isn't cut off
    const chartWidth = (totalUnits / (config.unit === 'day' && viewMode === 'week' ? 1 : 1)) * config.columnWidth + 200; 
    
    // Scale factor (pixels per millisecond or pixels per month index)
    // To simplify: we will project everything to a linear pixel scale
    const getPixelPosition = (date: Date) => {
        const nDate = normalizeDate(date);
        if (config.unit === 'month') {
            const monthsDiff = (nDate.getFullYear() - chartStart.getFullYear()) * 12 + (nDate.getMonth() - chartStart.getMonth());
            // Add fractional month for accuracy
            const daysInMonth = new Date(nDate.getFullYear(), nDate.getMonth() + 1, 0).getDate();
            const fraction = (nDate.getDate() - 1) / daysInMonth;
            return (monthsDiff + fraction) * (config.columnWidth / config.step);
        } else {
            // Days
            const daysDiff = (nDate.getTime() - chartStart.getTime()) / (1000 * 3600 * 24);
            const factor = viewMode === 'week' ? config.columnWidth / 7 : config.columnWidth;
            return daysDiff * factor;
        }
    };

    // Scroll to Specific Date Logic
    const scrollToDate = (date: Date) => {
        if (scrollContainerRef.current) {
            const position = getPixelPosition(date);
            // Scroll to the position minus a padding (e.g. 100px) so the bar starts a bit into the view
            scrollContainerRef.current.scrollTo({
                left: Math.max(0, position - 100),
                behavior: 'smooth'
            });
        }
    };

    // Generate Headers
    const headers = [];
    let currentHeaderDate = new Date(chartStart);
    
    // Align start date for loop based on view mode
    if (viewMode === 'month' || viewMode === 'quarter') {
        currentHeaderDate.setDate(1);
    }

    while (currentHeaderDate <= chartEnd) {
        headers.push(new Date(currentHeaderDate));
        if (config.unit === 'month') {
            currentHeaderDate.setMonth(currentHeaderDate.getMonth() + config.step);
        } else {
            currentHeaderDate.setDate(currentHeaderDate.getDate() + config.step);
        }
    }

    // Auto-scroll to earliest project on mount or update
    useLayoutEffect(() => {
        if (scrollContainerRef.current && projects.length > 0) {
            // Find earliest start date
            const earliest = projects.reduce((min, p) => p.startDate < min ? p.startDate : min, projects[0].startDate);
            const pixelPos = getPixelPosition(earliest);
            
            // Scroll to position minus some padding (e.g. 100px)
            scrollContainerRef.current.scrollLeft = Math.max(0, pixelPos - 100);
        }
    }, [projects, viewMode, chartStart]);

    return (
        <div className="w-full border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm flex flex-col">
            {/* Main Container */}
            <div className="flex flex-grow overflow-hidden">
                {/* Fixed Sidebar (Task Names) - Resizable */}
                <div 
                    className="flex-shrink-0 bg-white border-r border-slate-200 z-20 shadow-sm overflow-hidden flex flex-col relative group"
                    style={{ width: `${sidebarWidth}px` }}
                >
                    <div className="h-10 bg-slate-50 border-b border-slate-200 flex items-center px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
                        Atividade / Projeto
                    </div>
                    <div className="flex-grow overflow-y-hidden relative">
                         {/* We mirror the height of the chart rows here */}
                         <div style={{ marginTop: '0px' }}> {/* Placeholder for scroll sync if needed later */}
                            {projects.map((project, index) => (
                                <div 
                                    key={index} 
                                    className="h-10 border-b border-slate-100 flex items-center px-3 text-sm font-medium text-slate-700 truncate cursor-pointer hover:bg-slate-50 hover:text-blue-600 transition-colors" 
                                    title={`Clique para focar em: ${project.name}`}
                                    onClick={() => scrollToDate(project.startDate)}
                                >
                                    {project.name}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Resizer Handle */}
                    <div 
                        className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-blue-400 opacity-0 hover:opacity-100 transition-opacity z-50"
                        onMouseDown={startResizing}
                    />
                </div>

                {/* Scrollable Timeline Area */}
                <div 
                    ref={scrollContainerRef}
                    className="flex-grow overflow-x-auto overflow-y-hidden relative bg-white"
                >
                    <div style={{ width: `${Math.max(chartWidth, 800)}px`, minWidth: '100%' }}>
                        {/* Timeline Header */}
                        <div className="h-10 bg-slate-50 border-b border-slate-200 flex relative">
                            {headers.map((date, i) => {
                                const left = getPixelPosition(date);
                                return (
                                    <div 
                                        key={i} 
                                        className="absolute top-0 bottom-0 flex items-center justify-center text-xs text-slate-500 border-r border-slate-200 px-1 truncate"
                                        style={{ 
                                            left: `${left}px`, 
                                            width: `${config.columnWidth}px` 
                                        }}
                                    >
                                        {config.labelFormat(date)}
                                        {viewMode === 'month' && <span className='text-[10px] ml-1 text-slate-400'>{date.getFullYear()}</span>}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Timeline Grid & Bars */}
                        <div className="relative">
                            {/* Grid Lines */}
                            <div className="absolute inset-0 pointer-events-none">
                                {headers.map((date, i) => {
                                    const left = getPixelPosition(date);
                                    return (
                                        <div 
                                            key={i} 
                                            className="absolute top-0 bottom-0 border-r border-slate-100"
                                            style={{ left: `${left}px`, width: `${config.columnWidth}px` }}
                                        />
                                    );
                                })}
                            </div>

                            {/* Project Rows & Bars */}
                            {projects.map((project, index) => {
                                const startPos = getPixelPosition(project.startDate);
                                const endPos = getPixelPosition(project.endDate);
                                const width = Math.max(2, endPos - startPos);

                                const barColor = project.status === 'Travado' ? 'bg-slate-700' : 'bg-blue-500';

                                return (
                                    <div key={index} className="h-10 border-b border-slate-100 relative w-full">
                                        <div 
                                            className={`absolute h-5 ${barColor} rounded-full top-2.5 shadow-sm cursor-pointer hover:opacity-80 transition-opacity group z-10`}
                                            style={{
                                                left: `${startPos}px`,
                                                width: `${width}px`
                                            }}
                                            onClick={() => scrollToDate(project.startDate)}
                                        >
                                            {/* Tooltip */}
                                            <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs rounded py-1 px-2 mb-1 z-30 whitespace-nowrap shadow-lg">
                                                <div className="font-bold mb-0.5">{project.name}</div>
                                                <div>
                                                    {project.startDate.toLocaleDateString('pt-BR')} - {project.endDate.toLocaleDateString('pt-BR')}
                                                </div>
                                                {project.status && <div className="text-[10px] uppercase opacity-75 mt-0.5">{project.status}</div>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GanttChart;
