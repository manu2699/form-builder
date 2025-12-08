// Button Field - Runtime (Live Form)
import React from 'react';
import type { RuntimeProps } from '../types';

export const ButtonRuntime = ({ label = 'Submit' }: RuntimeProps) => (
    <button
        type="submit"
        className="px-6 py-2 bg-black text-white hover:bg-gray-800 transition-colors"
    >
        {label}
    </button>
);
