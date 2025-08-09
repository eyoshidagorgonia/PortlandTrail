
'use client';

import React from 'react';

export const ThematicSeparator = () => (
    <div className="flex items-center justify-center my-2 text-border/50" aria-hidden="true">
        <div className="h-px flex-grow bg-current"></div>
        <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="mx-2 text-accent"
        >
            <path d="M12 2l2 8 8 2-8 2-2 8-2-8-8-2 8-2z" />
        </svg>
        <div className="h-px flex-grow bg-current"></div>
    </div>
);
