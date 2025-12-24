
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Project } from '../types';
import { ChevronDownIcon, ChevronUpIcon } from './icons';

interface ProjectComboboxProps {
    projects: Project[];
    selectedProject: Project | null;
    onSelect: (project: Project) => void;
}

const ProjectCombobox: React.FC<ProjectComboboxProps> = ({ projects, selectedProject, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize search term when selected project changes externally
    useEffect(() => {
        if (selectedProject) {
            setSearchTerm(selectedProject.name);
        } else {
            setSearchTerm('');
        }
    }, [selectedProject]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                // Revert search term to selected project if closed without selection
                if (selectedProject) {
                    setSearchTerm(selectedProject.name);
                } else {
                    setSearchTerm('');
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [selectedProject]);

    const filteredProjects = useMemo(() => {
        if (!searchTerm) return projects;
        return projects.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [projects, searchTerm]);

    const handleSelect = (project: Project) => {
        onSelect(project);
        setSearchTerm(project.name);
        setIsOpen(false);
    };

    const handleInputClick = () => {
        setIsOpen(true);
        // Optional: clear search on click to show all? Or keep current?
        // Usually keeping current is better, but selecting text allows easy overwrite.
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setIsOpen(true);
    };

    return (
        <div className="relative mt-1" ref={containerRef}>
            <div className="relative">
                <input
                    type="text"
                    className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 pr-8 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Buscar projeto..."
                    value={searchTerm}
                    onClick={handleInputClick}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    {isOpen ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                </div>
            </div>

            {isOpen && (
                <div className="absolute left-0 top-full mt-1 bg-slate-700 border border-slate-600 rounded-md shadow-xl z-50 max-h-60 overflow-y-auto min-w-full w-max">
                    {filteredProjects.length > 0 ? (
                        <ul className="py-1">
                            {filteredProjects.map(project => (
                                <li
                                    key={project.id}
                                    onClick={() => handleSelect(project)}
                                    className={`px-4 py-2 cursor-pointer hover:bg-slate-600 text-sm whitespace-nowrap ${selectedProject?.id === project.id ? 'bg-blue-600 text-white' : 'text-slate-200'}`}
                                >
                                    {project.code && <span className="font-mono text-xs opacity-70 mr-2">[{project.code}]</span>}
                                    {project.name}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-3 text-slate-400 text-sm text-center">
                            Nenhum projeto encontrado.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProjectCombobox;
