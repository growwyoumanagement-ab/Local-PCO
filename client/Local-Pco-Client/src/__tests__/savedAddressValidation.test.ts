/**
 * Tests for SavedAddressScreen form validation logic
 * - Label required
 * - Full address required + min 5 chars
 * - City required
 * - Pincode required + exactly 6 numeric digits
 */

// ─── Validation logic extracted from SavedAddressScreen ──────────────────────

interface AddressFormErrors {
    label?: string;
    full?: string;
    city?: string;
    pincode?: string;
}

interface AddressFormData {
    label: string;
    full: string;
    city: string;
    pincode: string;
}

function validateAddressForm(formData: AddressFormData): AddressFormErrors {
    const errors: AddressFormErrors = {};

    if (!formData.label.trim()) {
        errors.label = 'Label is required (e.g., Home, Office)';
    }
    if (!formData.full.trim()) {
        errors.full = 'Full address is required';
    } else if (formData.full.trim().length < 5) {
        errors.full = 'Address is too short, please be more specific';
    }
    if (!formData.city.trim()) {
        errors.city = 'City is required';
    }
    if (!formData.pincode.trim()) {
        errors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
        errors.pincode = 'Pincode must be exactly 6 digits';
    }

    return errors;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('SavedAddressScreen — Form Validation', () => {

    const validForm: AddressFormData = {
        label: 'Home',
        full: '42 MG Road, Indiranagar',
        city: 'Bangalore',
        pincode: '560038',
    };

    it('passes when all fields are valid', () => {
        const errors = validateAddressForm(validForm);
        expect(Object.keys(errors)).toHaveLength(0);
    });

    // ── Label ─────────────────────────────────────────────────────────────────

    describe('label field', () => {
        it('errors when label is empty', () => {
            const errors = validateAddressForm({ ...validForm, label: '' });
            expect(errors.label).toBeDefined();
            expect(errors.label).toContain('required');
        });

        it('errors when label is only whitespace', () => {
            const errors = validateAddressForm({ ...validForm, label: '   ' });
            expect(errors.label).toBeDefined();
        });

        it('passes when label has valid text', () => {
            const errors = validateAddressForm({ ...validForm, label: 'Office' });
            expect(errors.label).toBeUndefined();
        });
    });

    // ── Full Address ──────────────────────────────────────────────────────────

    describe('full address field', () => {
        it('errors when full address is empty', () => {
            const errors = validateAddressForm({ ...validForm, full: '' });
            expect(errors.full).toBeDefined();
            expect(errors.full).toContain('required');
        });

        it('errors when full address is 4 chars (boundary)', () => {
            const errors = validateAddressForm({ ...validForm, full: 'A101' });
            expect(errors.full).toBeDefined();
            expect(errors.full).toContain('too short');
        });

        it('passes when full address is exactly 5 chars (boundary)', () => {
            const errors = validateAddressForm({ ...validForm, full: 'AB123' });
            expect(errors.full).toBeUndefined();
        });

        it('passes when full address is long', () => {
            const errors = validateAddressForm({ ...validForm, full: 'Flat 4B, Sunrise Apartments, JP Nagar' });
            expect(errors.full).toBeUndefined();
        });
    });

    // ── City ──────────────────────────────────────────────────────────────────

    describe('city field', () => {
        it('errors when city is empty', () => {
            const errors = validateAddressForm({ ...validForm, city: '' });
            expect(errors.city).toBeDefined();
            expect(errors.city).toContain('required');
        });

        it('errors when city is only whitespace', () => {
            const errors = validateAddressForm({ ...validForm, city: '   ' });
            expect(errors.city).toBeDefined();
        });

        it('passes when city has valid text', () => {
            const errors = validateAddressForm({ ...validForm, city: 'Mumbai' });
            expect(errors.city).toBeUndefined();
        });
    });

    // ── Pincode ───────────────────────────────────────────────────────────────

    describe('pincode field', () => {
        it('errors when pincode is empty', () => {
            const errors = validateAddressForm({ ...validForm, pincode: '' });
            expect(errors.pincode).toBeDefined();
            expect(errors.pincode).toContain('required');
        });

        it('errors when pincode has 5 digits (too short)', () => {
            const errors = validateAddressForm({ ...validForm, pincode: '56003' });
            expect(errors.pincode).toBeDefined();
            expect(errors.pincode).toContain('6 digits');
        });

        it('errors when pincode has 7 digits (too long)', () => {
            const errors = validateAddressForm({ ...validForm, pincode: '5600380' });
            expect(errors.pincode).toBeDefined();
            expect(errors.pincode).toContain('6 digits');
        });

        it('errors when pincode contains letters', () => {
            const errors = validateAddressForm({ ...validForm, pincode: '56003A' });
            expect(errors.pincode).toBeDefined();
            expect(errors.pincode).toContain('6 digits');
        });

        it('errors when pincode contains spaces', () => {
            const errors = validateAddressForm({ ...validForm, pincode: '560 38' });
            expect(errors.pincode).toBeDefined();
        });

        it('passes when pincode is exactly 6 digits (boundary)', () => {
            const errors = validateAddressForm({ ...validForm, pincode: '560038' });
            expect(errors.pincode).toBeUndefined();
        });

        it('passes for various valid 6-digit pincodes', () => {
            for (const code of ['110001', '400001', '600001', '700001', '500001']) {
                const errors = validateAddressForm({ ...validForm, pincode: code });
                expect(errors.pincode).toBeUndefined();
            }
        });
    });

    // ── Multiple Fields ───────────────────────────────────────────────────────

    describe('multiple invalid fields', () => {
        it('returns errors for all invalid fields simultaneously', () => {
            const errors = validateAddressForm({ label: '', full: '', city: '', pincode: '' });
            expect(errors.label).toBeDefined();
            expect(errors.full).toBeDefined();
            expect(errors.city).toBeDefined();
            expect(errors.pincode).toBeDefined();
        });

        it('returns only pincode error when only pincode is invalid', () => {
            const errors = validateAddressForm({ ...validForm, pincode: 'abc' });
            expect(errors.label).toBeUndefined();
            expect(errors.full).toBeUndefined();
            expect(errors.city).toBeUndefined();
            expect(errors.pincode).toBeDefined();
        });
    });
});
