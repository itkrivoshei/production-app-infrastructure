import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MetricCard } from './MetricCard';

describe('MetricCard', () => {
  it('renders metric value', () => {
    render(<MetricCard title="Version" value="0.1.0" />);

    expect(screen.getByText('Version')).toBeInTheDocument();
    expect(screen.getByText('0.1.0')).toBeInTheDocument();
  });
});
