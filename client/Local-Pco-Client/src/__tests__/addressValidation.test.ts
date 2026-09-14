/**
 * Tests for AddressScreen validation logic
 * - Location Required: no option selected → correct toast type
 * - Address Too Short: manual input < 8 chars
 * - canContinue logic: GPS, saved address, manual input
 */

// ─── Helpers extracted from AddressScreen logic ──────────────────────────────

type LocationState = {
    useCurrentLocation: boolean;
    selectedAddress: { id: string } | null;
    showManualInput: boolean;
    manualAddress: string;
};

function getValidationError(state: LocationState): string | null {
    const { useCurrentLocation, selectedAddress, showManualInput, manualAddress } = state;

    if (!useCurrentLocation && !selectedAddress && !(showManualInput && manualAddress.trim().length >= 8)) {
        if (!showManualInput) return 'Location Required';
        if (manualAddress.trim().length < 8) return 'Address Too Short';
        return 'No Location Selected';
    }
    return null;
}

function canContinue(state: LocationState): boolean {
    const { useCurrentLocation, selectedAddress, showManualInput, manualAddress } = state;
    return !!(useCurrentLocation || selectedAddress || (showManualInput && manualAddress.trim().length >= 8));
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AddressScreen — Location Validation', () => {
    describe('getValidationError()', () => {
        it('returns "Location Required" when nothing is selected and manual input is hidden', () => {
            expect(getValidationError({
                useCurrentLocation: false,
                selectedAddress: null,
                showManualInput: false,
                manualAddress: '',
            })).toBe('Location Required');
        });

        it('returns "Address Too Short" when manual input is open but address < 8 chars', () => {
            expect(getValidationError({
                useCurrentLocation: false,
                selectedAddress: null,
                showManualInput: true,
                manualAddress: 'abc',
            })).toBe('Address Too Short');
        });

        it('returns "Address Too Short" when manual address is exactly 7 chars (boundary)', () => {
            expect(getValidationError({
                useCurrentLocation: false,
                selectedAddress: null,
                showManualInput: true,
                manualAddress: '1234567',
            })).toBe('Address Too Short');
        });

        it('returns null when GPS location is selected', () => {
            expect(getValidationError({
                useCurrentLocation: true,
                selectedAddress: null,
                showManualInput: false,
                manualAddress: '',
            })).toBeNull();
        });

        it('returns null when a saved address is selected', () => {
            expect(getValidationError({
                useCurrentLocation: false,
                selectedAddress: { id: 'addr-1' },
                showManualInput: false,
                manualAddress: '',
            })).toBeNull();
        });

        it('returns null when manual address has exactly 8 chars (boundary)', () => {
            expect(getValidationError({
                useCurrentLocation: false,
                selectedAddress: null,
                showManualInput: true,
                manualAddress: '12345678',
            })).toBeNull();
        });

        it('returns null when manual address has > 8 chars', () => {
            expect(getValidationError({
                useCurrentLocation: false,
                selectedAddress: null,
                showManualInput: true,
                manualAddress: '123 MG Road, Bangalore',
            })).toBeNull();
        });

        it('trims whitespace before length check', () => {
            // "   abc   " — trimmed = "abc" (3 chars) → too short
            expect(getValidationError({
                useCurrentLocation: false,
                selectedAddress: null,
                showManualInput: true,
                manualAddress: '   abc   ',
            })).toBe('Address Too Short');
        });
    });

    describe('canContinue()', () => {
        it('is false when nothing is selected', () => {
            expect(canContinue({
                useCurrentLocation: false,
                selectedAddress: null,
                showManualInput: false,
                manualAddress: '',
            })).toBe(false);
        });

        it('is true when GPS location is used', () => {
            expect(canContinue({
                useCurrentLocation: true,
                selectedAddress: null,
                showManualInput: false,
                manualAddress: '',
            })).toBe(true);
        });

        it('is true when saved address is selected', () => {
            expect(canContinue({
                useCurrentLocation: false,
                selectedAddress: { id: 'saved-123' },
                showManualInput: false,
                manualAddress: '',
            })).toBe(true);
        });

        it('is false when manual input has 7 chars', () => {
            expect(canContinue({
                useCurrentLocation: false,
                selectedAddress: null,
                showManualInput: true,
                manualAddress: '1234567',
            })).toBe(false);
        });

        it('is true when manual input has 8 chars', () => {
            expect(canContinue({
                useCurrentLocation: false,
                selectedAddress: null,
                showManualInput: true,
                manualAddress: '12345678',
            })).toBe(true);
        });
    });
});
