// Utility functions for property panel
import type { PropertyConfig } from '../fields/types';

// Group properties by group name
export const groupProperties = (properties: PropertyConfig[]): Record<string, PropertyConfig[]> => {
    return properties.reduce((groups, prop) => {
        const group = prop.group || 'General';
        if (!groups[group]) groups[group] = [];
        groups[group].push(prop);
        return groups;
    }, {} as Record<string, PropertyConfig[]>);
};

// Order of groups (customize as needed)
export const GROUP_ORDER = ['Basic', 'Validation', 'Advanced', 'Appearance', 'General'];

// Sort groups by predefined order
export const sortGroups = (groups: string[]): string[] => {
    return groups.sort((a, b) => {
        const indexA = GROUP_ORDER.indexOf(a);
        const indexB = GROUP_ORDER.indexOf(b);
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });
};
