import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusCard } from './StatusCard';

describe('StatusCard', () => {
  it('renders title and value', () => {
    render(<StatusCard title="API Health" value="ok" status="ok" />);

    expect(screen.getByText('API Health')).toBeInTheDocument();
    expect(screen.getByText('ok')).toBeInTheDocument();
  });
});
