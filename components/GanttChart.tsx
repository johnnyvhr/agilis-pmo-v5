import React, { useRef, useLayoutEffect, useMemo, useState, useEffect } from 'react';

interface GanttProject {
    name: string;
    startDate: Date | string;
    endDate: Date | string;
    status?: string;
}

export type ViewMode = 'day' | 'week' | 'month' | 'quarter';

interface GanttChartProps {
    projects: GanttProject[];
    startDate: Date | string;
    endDate: Date | string;
    viewMode?: ViewMode;
}

const GanttChart: React.FC<GanttChartProps> = ({ projects, startDate, endDate, viewMode = 'month' }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [sidebarWidth] = useState<number>(300); // Fixed 300px as requested

    // Helper: Manual Date Parsing (CRITICAL)
    const parseBrDate = (dateString: Date | string) => {
        if (!dateString) return new Date();

        // Handle 'DD/MM/YYYY'
        if (typeof dateString === 'string' && dateString.includes('/')) {
            const parts = dateString.split('/');
            if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10);
                const year = parseInt(parts[2], 10);
                return new Date(year, month - 1, day);
            }
        }
        return new Date(dateString);
    };

    // Determine Chart Boundaries (Floored/Ceiled for cleaner headers)
    const { chartStart, chartEnd } = useMemo(() => {
        let start = parseBrDate(startDate);
        let end = parseBrDate(endDate);

        // Always floor start to beginning of Month for clean Top Row headers (Month/Year)
        // This ensures "December 2025" starts at the rendering edge
        start.setDate(1);
        start.setHours(0, 0, 0, 0);

        // Pad end slightly
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        end.setHours(0, 0, 0, 0);

        console.log('CALCULATED START DATE:', start);

        return { chartStart: start, chartEnd: end };
    }, [startDate, endDate]);


    // Configuration based on ViewMode
    const config = useMemo(() => {
        const ptBR = 'pt-BR';
        switch (viewMode) {
            case 'day':
                return {
                    columnWidth: 60, // 60-80px request
                    unit: 'day',
                    step: 1,
                    bottomLabel: (d: Date) => d.getDate().toString(),
                    topUnit: 'month',
                    topLabel: (d: Date) => d.toLocaleDateString(ptBR, { month: 'long', year: 'numeric' })
                };
            case 'week':
                return {
                    columnWidth: 250, // 250px request
                    unit: 'day',
                    step: 7,
                    bottomLabel: (d: Date) => `Semana ${getWeekNumber(d)}`,
                    topUnit: 'month',
                    topLabel: (d: Date) => d.toLocaleDateString(ptBR, { month: 'long', year: 'numeric' })
                };
            case 'month':
                return {
                    columnWidth: 300, // 300px request
                    unit: 'month',
                    step: 1,
                    bottomLabel: (d: Date) => d.toLocaleDateString(ptBR, { month: 'long' }),
                    topUnit: 'year',
                    topLabel: (d: Date) => d.getFullYear().toString()
                };
            case 'quarter':
                return {
                    columnWidth: 200,
                    unit: 'month',
                    step: 3,
                    bottomLabel: (d: Date) => `Q${Math.floor(d.getMonth() / 3) + 1}`,
                    topUnit: 'year',
                    topLabel: (d: Date) => d.getFullYear().toString()
                };
            default:
                return {
                    columnWidth: 300,
                    unit: 'month',
                    step: 1,
                    bottomLabel: (d: Date) => d.toLocaleDateString(ptBR, { month: 'long' }),
                    topUnit: 'year',
                    topLabel: (d: Date) => d.getFullYear().toString()
                };
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

    // Scale factor and positioning
    // We project everything to a linear pixel scale from chartStart
    const getPixelPosition = (date: Date | string) => {
        const nDate = parseBrDate(date);

        if (config.unit === 'month') {
            const monthsDiff = (nDate.getFullYear() - chartStart.getFullYear()) * 12 + (nDate.getMonth() - chartStart.getMonth());
            // Add fractional month for accuracy
            const daysInMonth = new Date(nDate.getFullYear(), nDate.getMonth() + 1, 0).getDate();
            const fraction = Math.min(1, Math.max(0, (nDate.getDate() - 1) / daysInMonth));
            return (monthsDiff + fraction) * (config.columnWidth / (config.step || 1));
        } else {
            // Days
            // Ensure we handle time zones or DST by using pure math on timestamps (dates are heavily controlled)
            const diffTime = nDate.getTime() - chartStart.getTime();
            const diffDays = diffTime / (1000 * 3600 * 24);
            const factor = viewMode === 'week' ? config.columnWidth / 7 : config.columnWidth;
            return diffDays * factor;
        }
    };

    const scrollToDate = (date: Date | string) => {
        if (scrollContainerRef.current) {
            const position = getPixelPosition(date);
            scrollContainerRef.current.scrollTo({
                left: Math.max(0, position - 100),
                behavior: 'smooth'
            });
        }
    };

    // --- Header Generation ---

    // Bottom Row Headers (The granular columns: Days, Weeks, Months, Quarters)
    const bottomHeaders = [];
    let currentHeaderDate = new Date(chartStart);

    // If Week mode, align start to Monday if needed? 
    // Usually chartStart (1st of month) might not be Monday. 
    // Visualization might look offset if we strictly step by 7 from 1st.
    // However, simplicity first: The grid follows the steps from chartStart.
    // If we want "Semana X" to align with actual weeks, the grid steps should align.
    // For now, we iterate by step.

    while (currentHeaderDate <= chartEnd) {
        bottomHeaders.push(new Date(currentHeaderDate));
        if (config.unit === 'month') {
            currentHeaderDate.setMonth(currentHeaderDate.getMonth() + config.step);
        } else {
            currentHeaderDate.setDate(currentHeaderDate.getDate() + config.step);
        }
    }

    // Top Row Headers (Grouping: Months or Years)
    const topHeaders = [];
    let currentTopDate = new Date(chartStart);

    // Iterate until end
    while (currentTopDate <= chartEnd) {
        const start = new Date(currentTopDate);
        const next = new Date(start);

        // Advance to next grouping
        if (config.topUnit === 'month') {
            next.setMonth(next.getMonth() + 1);
            next.setDate(1); // Ensure 1st
        } else { // year
            next.setFullYear(next.getFullYear() + 1);
            next.setMonth(0);
            next.setDate(1);
        }

        topHeaders.push({
            label: config.topLabel(start),
            startPos: getPixelPosition(start),
            width: getPixelPosition(next) - getPixelPosition(start)
        });

        currentTopDate = next;
    }

    // Calculate total layout width based on last bottom header
    const lastHeader = bottomHeaders[bottomHeaders.length - 1];
    const chartTotalWidth = Math.max(
        getPixelPosition(lastHeader) + config.columnWidth + 100, // ample buffer
        800 // Min width
    );


    // Brute Force Scroll (DOM Manipulation)
    useLayoutEffect(() => {
        // Attempt to find the Gantt scroll container and reset it
        // We use the Ref if available, or fallback to querySelector if for some reason Ref isn't enough (though Ref is better)
        const container = scrollContainerRef.current || document.querySelector('div[style*="overflow-x"]');

        if (container) {
            console.log('Forcing scroll to 0');
            container.scrollLeft = 0;
        }
    }, [projects]);

    return (
        <div className="w-full border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 overflow-hidden shadow-sm flex flex-col min-h-[500px]">
            <div className="flex flex-grow overflow-hidden">
                {/* Fixed 300px Sidebar */}
                <div
                    className="flex-shrink-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-20 shadow-sm overflow-hidden flex flex-col"
                    style={{ width: `${sidebarWidth}px` }}
                >
                    {/* Double Header Height to Match Chart */}
                    <div className="h-20 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Atividade / Projeto
                    </div>

                    <div className="flex-grow overflow-y-hidden relative py-2">
                        {projects.map((project, index) => (
                            <div
                                key={index}
                                className="h-10 border-b border-slate-100 dark:border-slate-700 flex items-center px-4 text-sm font-medium text-slate-700 dark:text-slate-200 truncate cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                title={`Clique para focar em: ${project.name}`}
                                onClick={() => scrollToDate(project.startDate)}
                            >
                                {project.name}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Scrollable Timeline */}
                <div
                    ref={scrollContainerRef}
                    className="flex-grow overflow-x-auto overflow-y-hidden relative bg-white dark:bg-slate-800"
                >
                    <div style={{ width: `${chartTotalWidth}px`, minWidth: '100%' }}>

                        {/* Headers Container (Height 20 = 80px or h-20 in tailwind) */}
                        <div className="h-20 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 relative">

                            {/* Top Row: Groupings */}
                            <div className="h-10 w-full relative border-b border-slate-200">
                                {topHeaders.map((header, i) => (
                                    <div
                                        key={i}
                                        className="absolute top-0 bottom-0 flex items-center pl-2 text-xs font-bold text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 truncate bg-slate-100/50 dark:bg-slate-700/30"
                                        style={{
                                            left: `${header.startPos}px`,
                                            width: `${header.width}px`
                                        }}
                                    >
                                        {header.label}
                                    </div>
                                ))}
                            </div>

                            {/* Bottom Row: Granular Units */}
                            <div className="h-10 w-full relative">
                                {bottomHeaders.map((date, i) => {
                                    const left = getPixelPosition(date);
                                    return (
                                        <div
                                            key={i}
                                            className="absolute top-0 bottom-0 flex items-center justify-center text-xs text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700 px-1 truncate"
                                            style={{
                                                left: `${left}px`,
                                                width: `${config.columnWidth}px`
                                            }}
                                        >
                                            {config.bottomLabel(date)}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Chart Area */}
                        <div className="relative py-2">
                            {/* Grid Lines (Vertical) */}
                            <div className="absolute inset-0 pointer-events-none">
                                {bottomHeaders.map((date, i) => {
                                    const left = getPixelPosition(date);
                                    return (
                                        <div
                                            key={i}
                                            className="absolute top-0 bottom-0 border-r border-slate-100 dark:border-slate-700"
                                            style={{ left: `${left}px`, width: `${config.columnWidth}px` }}
                                        />
                                    );
                                })}
                            </div>

                            {/* Bars */}
                            {projects.map((project, index) => {
                                const startPos = getPixelPosition(project.startDate);
                                const endPos = getPixelPosition(project.endDate);
                                const width = Math.max(2, endPos - startPos);
                                const barColor = project.status === 'Travado' ? 'bg-slate-700' : 'bg-blue-500';

                                return (
                                    <div key={index} className="h-10 border-b border-slate-100 dark:border-slate-700 relative w-full group">
                                        {/* Row Highlight on Hover */}
                                        <div className="absolute inset-0 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors w-full" />

                                        <div
                                            className={`absolute h-6 ${barColor} rounded-md top-2 shadow-sm cursor-pointer hover:brightness-110 transition-all z-10 flex items-center px-2`}
                                            style={{
                                                left: `${startPos}px`,
                                                width: `${width}px`
                                            }}
                                            onClick={() => scrollToDate(project.startDate)}
                                        >
                                            {/* Optional label inside bar if wide enough */}
                                            {width > 100 && (
                                                <span className="text-white text-[10px] truncate font-medium drop-shadow-md">
                                                    {project.name}
                                                </span>
                                            )}

                                            {/* Tooltip */}
                                            <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 bg-slate-800 text-white text-xs rounded py-1.5 px-3 z-30 shadow-xl w-max">
                                                <div className="font-bold mb-1">{project.name}</div>
                                                <div className="text-slate-300">
                                                    {project.startDate.toLocaleDateString('pt-BR')} - {project.endDate.toLocaleDateString('pt-BR')}
                                                </div>
                                                {project.status && (
                                                    <div className="mt-1 inline-block px-1.5 py-0.5 rounded bg-white/20 text-[10px] uppercase tracking-wide">
                                                        {project.status}
                                                    </div>
                                                )}
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
