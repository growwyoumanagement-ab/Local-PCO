// src/screens/RegisterScreen.tsx
// Registration screen for new partners

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Platform,
    Image,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import authService from '../services/authService';
import categoryService, { ServiceCategory, Subcategory } from '../services/categoryService';

interface RegisterScreenProps {
    onRegisterSuccess: (partnerData?: any) => void;
    onNavigateToLogin: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onRegisterSuccess, onNavigateToLogin }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [nameError, setNameError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
    const [categoryError, setCategoryError] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingCategories, setIsFetchingCategories] = useState(true);
    const [error, setError] = useState('');

    // Fetch categories on component mount
    React.useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsFetchingCategories(true);
                const data = await categoryService.getCategories();
                setCategories(data);
            } catch (err: any) {
                setError('Failed to load categories. Please try again.');
            } finally {
                setIsFetchingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    // Live Validation Functions
    const validateName = (text: string) => {
        setName(text);
        if (!text.trim()) setNameError('Name is required');
        else if (text.trim().length < 3) setNameError('Name must be at least 3 characters');
        else setNameError('');
    };

    const validatePhone = (text: string) => {
        const numericValue = text.replace(/[^0-9]/g, '');
        setPhone(numericValue);
        if (!numericValue) setPhoneError('Phone number is required');
        else if (!/^[6-9]\d{9}$/.test(numericValue)) setPhoneError('Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9');
        else setPhoneError('');
    };

    const validateEmail = (text: string) => {
        setEmail(text);
        if (!text.trim()) {
            setEmailError('');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.trim())) {
            setEmailError('Please enter a valid email address');
        } else {
            setEmailError('');
        }
    };

    const validatePassword = (text: string) => {
        setPassword(text);
        if (!text) setPasswordError('Password is required');
        else if (text.length < 6) setPasswordError('Password must be at least 6 characters');
        else setPasswordError('');
    };

    const validateConfirmPassword = (text: string) => {
        setConfirmPassword(text);
        if (!text) setConfirmPasswordError('Confirm Password is required');
        else if (text !== password) setConfirmPasswordError('Passwords do not match');
        else setConfirmPasswordError('');
    };

    const handleCategorySelect = (category: ServiceCategory) => {
        setSelectedCategory(category);
        setSelectedSubcategory(''); // Reset subcategory when category changes
        setCategoryError('');
    };

    const handleSubcategorySelect = (subcategoryName: string) => {
        setSelectedSubcategory(subcategoryName);
        setCategoryError('');
    };

    const handleRegister = async () => {
        let isValid = true;

        if (!name.trim() || name.trim().length < 3) {
            setNameError('Name must be at least 3 characters');
            isValid = false;
        } else {
            setNameError('');
        }

        const numericPhone = phone.replace(/\D/g, '');
        if (!numericPhone || !/^[6-9]\d{9}$/.test(numericPhone)) {
            setPhoneError('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9');
            isValid = false;
        } else {
            setPhoneError('');
        }

        if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setEmailError('Please enter a valid email address');
            isValid = false;
        } else {
            setEmailError('');
        }

        if (!password || password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            isValid = false;
        } else {
            setPasswordError('');
        }

        if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            isValid = false;
        } else {
            setConfirmPasswordError('');
        }

        if (!selectedCategory) {
            setCategoryError('Please select a service category');
            isValid = false;
        } else {
            setCategoryError('');
        }

        if (!isValid) {
            setError('Please correct the errors before submitting');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await authService.register({
                name: name.trim(),
                phone: numericPhone,
                password,
                email: email.trim() || undefined,
                serviceCategory: selectedCategory!._id,
                serviceSubcategory: selectedSubcategory || undefined,
            });

            if (response.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Registration Successful! 🎉',
                    text2: 'Welcome to Local PCO Partner Platform.'
                });
                const partnerData = (response.data as any)?.partner || response.data;
                setTimeout(() => {
                    onRegisterSuccess(partnerData);
                }, 1000);
            } else {
                const errorMsg = response.message || 'Registration failed';
                Toast.show({
                    type: 'error',
                    text1: 'Registration Failed',
                    text2: errorMsg
                });
                setError(errorMsg);
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || 'Registration failed';
            Toast.show({
                type: 'error',
                text1: 'Registration Failed',
                text2: errorMsg
            });
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.logoContainer}>
                    <Image source={require('../../assets/logo.png')} style={styles.logoImage} />
                </View>
                <Text style={styles.title}>Join Local PCO</Text>
                <Text style={styles.subtitle}>Register as a Verified Service Partner</Text>

                <View style={styles.form}>
                    <View>
                        <TextInput
                            style={[styles.input, nameError ? styles.inputError : null]}
                            placeholder="Full Name *"
                            value={name}
                            onChangeText={validateName}
                            placeholderTextColor={COLORS.gray400}
                        />
                        {nameError ? <Text style={styles.fieldErrorText}>{nameError}</Text> : null}
                    </View>

                    <View>
                        <TextInput
                            style={[styles.input, phoneError ? styles.inputError : null]}
                            placeholder="Phone Number (10 digits) *"
                            keyboardType="phone-pad"
                            maxLength={10}
                            value={phone}
                            onChangeText={validatePhone}
                            placeholderTextColor={COLORS.gray400}
                        />
                        {phoneError ? <Text style={styles.fieldErrorText}>{phoneError}</Text> : null}
                    </View>

                    <View>
                        <TextInput
                            style={[styles.input, emailError ? styles.inputError : null]}
                            placeholder="Email (Optional)"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={validateEmail}
                            placeholderTextColor={COLORS.gray400}
                        />
                        {emailError ? <Text style={styles.fieldErrorText}>{emailError}</Text> : null}
                    </View>

                    <View>
                        <View style={[styles.passwordContainer, passwordError ? styles.inputError : null]}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Password *"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={validatePassword}
                                placeholderTextColor={COLORS.gray400}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeIcon}
                            >
                                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={24} color={COLORS.gray500} />
                            </TouchableOpacity>
                        </View>
                        {passwordError ? <Text style={styles.fieldErrorText}>{passwordError}</Text> : null}
                    </View>

                    <View>
                        <View style={[styles.passwordContainer, confirmPasswordError ? styles.inputError : null]}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Confirm Password *"
                                secureTextEntry={!showConfirmPassword}
                                value={confirmPassword}
                                onChangeText={validateConfirmPassword}
                                placeholderTextColor={COLORS.gray400}
                            />
                            <TouchableOpacity
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={styles.eyeIcon}
                            >
                                <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={24} color={COLORS.gray500} />
                            </TouchableOpacity>
                        </View>
                        {confirmPasswordError ? <Text style={styles.fieldErrorText}>{confirmPasswordError}</Text> : null}
                    </View>

                    <View>
                        <Text style={styles.categoryLabel}>Select Service Category *</Text>
                        {isFetchingCategories ? (
                            <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 16 }} />
                        ) : (
                            <View style={styles.categoryGrid}>
                                {categories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat._id}
                                        style={[
                                            styles.categoryChip,
                                            selectedCategory?._id === cat._id && styles.categoryChipSelected,
                                            categoryError && !selectedCategory ? { borderColor: COLORS.danger, borderWidth: 1 } : null
                                        ]}
                                        onPress={() => handleCategorySelect(cat)}
                                    >
                                        <Text
                                            style={[
                                                styles.categoryChipText,
                                                selectedCategory?._id === cat._id && styles.categoryChipTextSelected,
                                            ]}
                                        >
                                            {cat.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Subcategory Selection - Show only if category has subcategories */}
                    {selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.length > 0 && (
                        <View>
                            <Text style={styles.categoryLabel}>Select Subcategory *</Text>
                            <View style={styles.categoryGrid}>
                                {selectedCategory.subcategories.map((subcat, index) => (
                                    <TouchableOpacity
                                        key={subcat._id || index}
                                        style={[
                                            styles.categoryChip,
                                            selectedSubcategory === subcat.name && styles.categoryChipSelected,
                                            categoryError && !selectedSubcategory ? { borderColor: COLORS.danger, borderWidth: 1 } : null
                                        ]}
                                        onPress={() => handleSubcategorySelect(subcat.name)}
                                    >
                                        <Text
                                            style={[
                                                styles.categoryChipText,
                                                selectedSubcategory === subcat.name && styles.categoryChipTextSelected,
                                            ]}
                                        >
                                            {subcat.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}
                    
                    {categoryError ? <Text style={styles.fieldErrorText}>{categoryError}</Text> : null}

                    {error ? <Text style={styles.error}>{error}</Text> : null}

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleRegister}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <Text style={styles.buttonText}>Register</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onNavigateToLogin}>
                        <View style={styles.footerContainer}>
                            <Text style={styles.footer}>
                                Already have an account? <Text style={styles.link}>Login</Text>
                            </Text>
                            <MaterialCommunityIcons name="chevron-right" size={16} color={COLORS.primary} style={{ marginTop: 16, marginLeft: 2 }} />
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    logoImage: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: COLORS.gray900,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.gray500,
        textAlign: 'center',
        marginBottom: 32,
    },
    form: {
        gap: 16,
    },
    input: {
        backgroundColor: COLORS.gray100,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: COLORS.gray800,
    },
    inputError: {
        borderWidth: 1,
        borderColor: COLORS.danger,
        backgroundColor: '#FFF5F5',
    },
    fieldErrorText: {
        color: COLORS.danger,
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray100,
        borderRadius: 12,
        paddingRight: 16,
    },
    passwordInput: {
        flex: 1,
        padding: 16,
        fontSize: 16,
        color: COLORS.gray800,
    },
    eyeIcon: {
        padding: 4,
    },
    categoryLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.gray700,
        marginBottom: 8,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: COLORS.gray100,
        borderWidth: 1,
        borderColor: COLORS.gray200,
    },
    categoryChipSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    categoryChipText: {
        fontSize: 14,
        color: COLORS.gray700,
    },
    categoryChipTextSelected: {
        color: COLORS.white,
        fontWeight: '600',
    },
    error: {
        color: COLORS.danger,
        fontSize: 14,
        textAlign: 'center',
    },
    button: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
    footerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    footer: {
        fontSize: 14,
        color: COLORS.gray500,
        textAlign: 'center',
        marginTop: 16,
    },
    link: {
        color: COLORS.primary,
        fontWeight: '600',
    },
});

export default RegisterScreen;

