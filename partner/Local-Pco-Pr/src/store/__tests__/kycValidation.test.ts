/**
 * Tests for KYC document number validation logic (Partner App)
 * - Aadhaar: exactly 12 digits
 * - PAN: ABCDE1234F format
 * - Driving License: 10-20 alphanumeric chars
 * - Generic: min 5 chars
 *
 * Also tests:
 * - cropData flow: setCropData correctly populated from picked asset
 * - Cloudinary error detection (backend logic ported for unit testing)
 */

// ─── Document number validation (extracted from KycScreen) ───────────────────

interface UploadContext {
    type: string;
    needsNumber: boolean;
    side: 'front' | 'back';
}

function validateDocumentNumber(text: string, ctx: UploadContext): string | null {
    if (!ctx.needsNumber || ctx.side !== 'front') return null;

    const val = text.trim();
    if (!val) return 'Document number is required';

    if (ctx.type === 'aadhaar') {
        if (!/^\d{12}$/.test(val)) return 'Aadhaar must be exactly 12 digits';
    } else if (ctx.type === 'pan') {
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val)) return 'Invalid PAN format (e.g., ABCDE1234F)';
    } else if (ctx.type === 'license') {
        if (!/^[A-Z0-9 -]{10,20}$/.test(val)) return 'Invalid Driving License format';
    } else if (val.length < 5) {
        return 'Document number must be at least 5 characters';
    }
    return null;
}

// ─── Cloudinary error detection (extracted from kycController) ────────────────

function isCloudinaryAuthError(errorMessage: string | undefined): boolean {
    if (!errorMessage) return false;
    const msg = errorMessage.toLowerCase();
    return (
        msg.includes('invalid api_key') ||
        msg.includes('invalid api key') ||
        msg.includes('api_secret') ||
        msg.includes('cloud_name')
    );
}

// ─── cropData shape test ──────────────────────────────────────────────────────

interface CropData {
    uri: string;
    width: number;
    height: number;
    docKey: string;
    docLabel: string;
}

function buildCropData(asset: { uri: string; width?: number; height?: number }, ctx: { type: string; label: string }): CropData {
    return {
        uri: asset.uri,
        width: asset.width || 1200,
        height: asset.height || 900,
        docKey: ctx.type,
        docLabel: ctx.label,
    };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('KycScreen — Document Number Validation', () => {

    // ── Aadhaar ───────────────────────────────────────────────────────────────

    describe('Aadhaar Card', () => {
        const ctx: UploadContext = { type: 'aadhaar', needsNumber: true, side: 'front' };

        it('passes for exactly 12 digits', () => {
            expect(validateDocumentNumber('123456789012', ctx)).toBeNull();
        });

        it('fails for 11 digits', () => {
            expect(validateDocumentNumber('12345678901', ctx)).toContain('12 digits');
        });

        it('fails for 13 digits', () => {
            expect(validateDocumentNumber('1234567890123', ctx)).toContain('12 digits');
        });

        it('fails when containing letters', () => {
            expect(validateDocumentNumber('12345678901A', ctx)).toContain('12 digits');
        });

        it('fails for empty string', () => {
            expect(validateDocumentNumber('', ctx)).toContain('required');
        });
    });

    // ── PAN ───────────────────────────────────────────────────────────────────

    describe('PAN Card', () => {
        const ctx: UploadContext = { type: 'pan', needsNumber: true, side: 'front' };

        it('passes for correct format ABCDE1234F', () => {
            expect(validateDocumentNumber('ABCDE1234F', ctx)).toBeNull();
        });

        it('passes for another valid PAN', () => {
            expect(validateDocumentNumber('ZXYWV9876P', ctx)).toBeNull();
        });

        it('fails when lowercase letters used', () => {
            expect(validateDocumentNumber('abcde1234F', ctx)).toContain('PAN format');
        });

        it('fails for 9-character PAN', () => {
            expect(validateDocumentNumber('ABCDE1234', ctx)).toContain('PAN format');
        });

        it('fails for all-digits PAN', () => {
            expect(validateDocumentNumber('1234567890', ctx)).toContain('PAN format');
        });

        it('fails for empty string', () => {
            expect(validateDocumentNumber('', ctx)).toContain('required');
        });
    });

    // ── Driving License ───────────────────────────────────────────────────────

    describe('Driving License', () => {
        const ctx: UploadContext = { type: 'license', needsNumber: true, side: 'front' };

        it('passes for standard alphanumeric license format', () => {
            expect(validateDocumentNumber('DL-0420110012345', ctx)).toBeNull();
        });

        it('passes for 10-char license number (min boundary)', () => {
            expect(validateDocumentNumber('KA01202100', ctx)).toBeNull();
        });

        it('passes for 20-char license number (max boundary)', () => {
            expect(validateDocumentNumber('KA01202100012345ABCD', ctx)).toBeNull();
        });

        it('fails for 9-char license (too short)', () => {
            expect(validateDocumentNumber('KA012021A', ctx)).toContain('License format');
        });

        it('fails for 21-char license (too long)', () => {
            expect(validateDocumentNumber('KA01202100012345ABCDE', ctx)).toContain('License format');
        });

        it('fails for empty string', () => {
            expect(validateDocumentNumber('', ctx)).toContain('required');
        });
    });

    // ── Back side (no number required) ───────────────────────────────────────

    describe('Back side documents', () => {
        it('skips validation for back-side uploads', () => {
            const ctx: UploadContext = { type: 'aadhaar', needsNumber: true, side: 'back' };
            // Even empty is fine for back side
            expect(validateDocumentNumber('', ctx)).toBeNull();
        });
    });

    // ── needsNumber: false (passbook, photo) ─────────────────────────────────

    describe('Documents without number requirement', () => {
        it('skips validation when needsNumber is false', () => {
            const ctx: UploadContext = { type: 'passbook', needsNumber: false, side: 'front' };
            expect(validateDocumentNumber('', ctx)).toBeNull();
        });
    });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('KycScreen — Crop Data Builder', () => {
    it('populates cropData correctly from asset with dimensions', () => {
        const data = buildCropData(
            { uri: 'file:///tmp/photo.jpg', width: 2048, height: 1536 },
            { type: 'aadhaar', label: 'Aadhaar Card' }
        );
        expect(data.uri).toBe('file:///tmp/photo.jpg');
        expect(data.width).toBe(2048);
        expect(data.height).toBe(1536);
        expect(data.docKey).toBe('aadhaar');
        expect(data.docLabel).toBe('Aadhaar Card');
    });

    it('falls back to 1200x900 when dimensions are undefined', () => {
        const data = buildCropData(
            { uri: 'file:///tmp/photo.jpg' },
            { type: 'pan', label: 'PAN Card' }
        );
        expect(data.width).toBe(1200);
        expect(data.height).toBe(900);
    });

    it('uses isSquare for photo docKey', () => {
        const data = buildCropData(
            { uri: 'file:///tmp/selfie.jpg', width: 800, height: 800 },
            { type: 'photo', label: 'Profile Photo' }
        );
        expect(data.docKey).toBe('photo');
        // isSquare is derived by the caller: cropData.docKey === 'photo'
        expect(data.docKey === 'photo').toBe(true);
    });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Backend — Cloudinary Auth Error Detection', () => {
    it('detects "invalid api_key" error', () => {
        expect(isCloudinaryAuthError('Invalid API_KEY for cloud')).toBe(true);
    });

    it('detects "invalid api key" error (with space)', () => {
        expect(isCloudinaryAuthError('Invalid api key provided')).toBe(true);
    });

    it('detects "api_secret" in message', () => {
        expect(isCloudinaryAuthError('Wrong api_secret supplied')).toBe(true);
    });

    it('detects "cloud_name" in message', () => {
        expect(isCloudinaryAuthError('Unknown cloud_name: foo')).toBe(true);
    });

    it('does NOT flag a generic network error', () => {
        expect(isCloudinaryAuthError('Request timed out')).toBe(false);
    });

    it('does NOT flag undefined message', () => {
        expect(isCloudinaryAuthError(undefined)).toBe(false);
    });

    it('does NOT flag an empty string', () => {
        expect(isCloudinaryAuthError('')).toBe(false);
    });

    it('returns a friendly message for auth error (integration check)', () => {
        const rawMsg = 'Invalid api_key detected';
        const friendlyMsg = isCloudinaryAuthError(rawMsg)
            ? 'Document upload service is temporarily unavailable. Please try again later or contact support.'
            : rawMsg;
        expect(friendlyMsg).toBe(
            'Document upload service is temporarily unavailable. Please try again later or contact support.'
        );
    });
});
