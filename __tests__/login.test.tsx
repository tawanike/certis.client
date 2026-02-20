import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoginPage from "@/app/auth/login/page";

// Mock the next/navigation useRouter
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
    }),
}));

describe('Login Page', () => {
    it('renders login form', () => {
        render(<LoginPage />);

        // "Sign In" appears in the title and the button
        expect(screen.getAllByText(/sign in/i)[0]).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
});
