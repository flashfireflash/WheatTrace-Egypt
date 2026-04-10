import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import InteractiveMap from '../InteractiveMap';
import React from 'react';

// Mock Leaflet as it requires a real DOM which JSDOM struggles with
vi.mock('react-leaflet', () => {
  return {
    MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="map-container">{children}</div>,
    TileLayer: () => <div data-testid="tile-layer" />,
    Marker: ({ children }: { children: React.ReactNode }) => <div data-testid="marker">{children}</div>,
    Popup: ({ children }: { children: React.ReactNode }) => <div data-testid="popup">{children}</div>,
  };
});

describe('InteractiveMap Component', () => {
  it('renders the map container properly', () => {
    const { getByTestId } = render(<InteractiveMap sites={[]} />);
    
    // Test if the mocked map component renders
    expect(getByTestId('map-container')).toBeInTheDocument();
  });

  // Adding basic semantic tests
  it('includes tile layer for rendering', () => {
    const { getByTestId } = render(<InteractiveMap sites={[]} />);
    expect(getByTestId('tile-layer')).toBeInTheDocument();
  });
});
