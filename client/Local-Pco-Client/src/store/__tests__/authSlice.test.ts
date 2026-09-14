import authReducer, { loginClient } from '../authSlice';

describe('authSlice Reducer and Thunk Lifecycle Tests', () => {
    const initialState = {
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
        refreshToken: null,
        error: null,
    };

    it('should return the initial state', () => {
        expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle loginClient.pending lifecycle state transition', () => {
        const nextState = authReducer(initialState, loginClient.pending('', { phone: '9876543210', password: 'password123' }));
        expect(nextState.isLoading).toBe(true);
        expect(nextState.error).toBeNull();
    });

    it('should handle loginClient.fulfilled lifecycle state transition', () => {
        const mockUser = {
            id: '1',
            name: 'Client User',
            phone: '9876543210',
            token: 'mock-token-123'
        };
        const nextState = authReducer(
            { ...initialState, isLoading: true },
            loginClient.fulfilled(mockUser, '', { phone: '9876543210', password: 'password123' })
        );
        expect(nextState.isLoading).toBe(false);
        expect(nextState.isAuthenticated).toBe(true);
        expect(nextState.user).toEqual(mockUser);
    });

    it('should handle loginClient.rejected lifecycle state transition', () => {
        const nextState = authReducer(
            { ...initialState, isLoading: true },
            loginClient.rejected(new Error('Login failed'), '', { phone: '9876543210', password: 'password123' }, 'Login failed')
        );
        expect(nextState.isLoading).toBe(false);
        expect(nextState.error).toBe('Login failed');
    });
});
