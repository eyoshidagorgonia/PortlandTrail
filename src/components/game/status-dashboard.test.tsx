import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatusDashboard from './status-dashboard';
import { INITIAL_PLAYER_STATE } from '@/lib/constants';
import type { PlayerState } from '@/lib/types';

describe('StatusDashboard', () => {
  it('renders the player name and job', () => {
    const testPlayerState: PlayerState = {
      ...INITIAL_PLAYER_STATE,
      name: 'Test Player',
      job: 'Test Job',
      avatar: 'https://placehold.co/64x64.png',
      bio: 'A test bio.',
    };

    render(<StatusDashboard playerState={testPlayerState} />);

    // Check if player name is rendered
    expect(screen.getByText('Test Player')).toBeInTheDocument();
    
    // Check if player job is rendered
    expect(screen.getByText('Test Job')).toBeInTheDocument();
    
    // Check if bio is rendered
    expect(screen.getByText('A test bio.')).toBeInTheDocument();
  });

  it('displays all stat items', () => {
    render(<StatusDashboard playerState={INITIAL_PLAYER_STATE} />);

    expect(screen.getByText('Hunger')).toBeInTheDocument();
    expect(screen.getByText('Bike Health')).toBeInTheDocument();
    expect(screen.getByText('Style')).toBeInTheDocument();
    expect(screen.getByText('Irony')).toBeInTheDocument();
    expect(screen.getByText('Authenticity')).toBeInTheDocument();
  });

  it('displays all resource items', () => {
    render(<StatusDashboard playerState={INITIAL_PLAYER_STATE} />);
    
    expect(screen.getByText('Vinyls')).toBeInTheDocument();
    expect(screen.getByText('Coffee Beans')).toBeInTheDocument();
  });

  it('renders badges when the player has them', () => {
    const stateWithBadge: PlayerState = {
        ...INITIAL_PLAYER_STATE,
        resources: {
            ...INITIAL_PLAYER_STATE.resources,
            badges: [{
                description: 'Test Badge',
                imageDataUri: 'https://placehold.co/48x48.png'
            }]
        }
    };

    render(<StatusDashboard playerState={stateWithBadge} />);

    const badgeImage = screen.getByAltText('Test Badge');
    expect(badgeImage).toBeInTheDocument();
    expect(badgeImage).toHaveAttribute('src', 'https://placehold.co/48x48.png');
  });
});
