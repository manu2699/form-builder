// User Identity - Random names and colors for collaboration
const NAMES = [
    'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry',
    'Ivy', 'Jack', 'Kate', 'Leo', 'Maya', 'Noah', 'Olivia', 'Peter',
    'Quinn', 'Ruby', 'Sam', 'Tara', 'Uma', 'Victor', 'Wendy', 'Xavier'
];

const COLORS = [
    '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#22C55E', '#14B8A6',
    '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7',
    '#D946EF', '#EC4899', '#F43F5E'
];

const STORAGE_KEY = 'form-builder-user';

export interface User {
    id: string;
    name: string;
    color: string;
}

function generateId(): string {
    return Math.random().toString(36).substring(2, 15);
}

function getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)] as T;
}

export function getUser(): User {
    // Check localStorage first
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            // Invalid stored data, create new
        }
    }

    // Create new user
    const user: User = {
        id: generateId(),
        name: getRandomItem(NAMES),
        color: getRandomItem(COLORS),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
}

export function getUserInitials(name: string): string {
    return name.charAt(0).toUpperCase();
}
