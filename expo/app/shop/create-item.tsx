import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Pressable,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import {
    Camera,
    Package,
    Wrench,
    Heart,
    DollarSign,
    Clock,
    Archive,
    Truck,
    Tag,
    Check,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useColors, type ThemeColors } from '@/constants/colors';
import { shopService } from '@/services/shopService';
import { StorefrontListing } from '@/types';

type ListingCategory = 'business' | 'service' | 'cause';
type ListingType = 'product' | 'service';

export default function CreateItemScreen() {
    const colors = useColors();
    const styles = createStyles(colors);

    const CATEGORY_OPTIONS: { value: ListingCategory; label: string; icon: typeof Package; color: string }[] = [
        { value: 'business', label: 'Product', icon: Package, color: colors.warning },
        { value: 'service', label: 'Service', icon: Wrench, color: colors.primary },
        { value: 'cause', label: 'Cause', icon: Heart, color: colors.accent },
    ];
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<ListingCategory>('business');
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('');
    const [inventory, setInventory] = useState('');
    const [deliveryInfo, setDeliveryInfo] = useState('');
    const [fundingGoal, setFundingGoal] = useState('');
    const [tagsText, setTagsText] = useState('');
    const [imageUri, setImageUri] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const isService = category === 'service';
    const isCause = category === 'cause';
    const isProduct = category === 'business';

    const handlePickImage = useCallback(async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });
        if (!result.canceled && result.assets[0]) {
            setImageUri(result.assets[0].uri);
        }
    }, []);

    const validate = (): boolean => {
        if (!title.trim()) {
            Alert.alert('Missing Title', 'Please enter a title for your listing.');
            return false;
        }
        if (!description.trim()) {
            Alert.alert('Missing Description', 'Please enter a description.');
            return false;
        }
        if ((isProduct || isService) && !price.trim()) {
            Alert.alert('Missing Price', 'Please enter a price.');
            return false;
        }
        if (isCause && !fundingGoal.trim()) {
            Alert.alert('Missing Goal', 'Please enter a funding goal.');
            return false;
        }
        return true;
    };

    const handleSubmit = useCallback(async () => {
        if (!validate()) return;
        setSubmitting(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const tags = tagsText.split(',').map(t => t.trim()).filter(Boolean);

        const newItem: StorefrontListing = {
            id: shopService.generateId(),
            title: title.trim(),
            description: description.trim(),
            category: category,
            listingType: isService ? 'service' : 'product',
            image: imageUri || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
            price: price ? parseFloat(price) : undefined,
            fundingGoal: fundingGoal ? parseFloat(fundingGoal) : undefined,
            fundingRaised: 0,
            supportCount: 0,
            tags,
            duration: duration || undefined,
            inventory: inventory ? parseInt(inventory) : undefined,
            deliveryInfo: deliveryInfo || undefined,
        };

        await shopService.addShopItem(newItem);
        setSubmitting(false);
        Alert.alert('Listing Created!', `"${title}" has been added to your shop.`, [
            { text: 'OK', onPress: () => router.back() },
        ]);
    }, [title, description, category, price, duration, inventory, deliveryInfo, fundingGoal, tagsText, imageUri, isService, router]);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <Stack.Screen options={{ title: 'New Listing' }} />
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Image Picker */}
                <Pressable style={styles.imagePicker} onPress={handlePickImage}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Camera size={32} color={colors.mediumGray} />
                            <Text style={styles.imageText}>Add Cover Image</Text>
                        </View>
                    )}
                </Pressable>

                {/* Category Selector */}
                <Text style={styles.label}>Category</Text>
                <View style={styles.categoryRow}>
                    {CATEGORY_OPTIONS.map(opt => {
                        const IconComp = opt.icon;
                        const selected = category === opt.value;
                        return (
                            <Pressable
                                key={opt.value}
                                style={[
                                    styles.categoryOption,
                                    selected && { borderColor: opt.color, backgroundColor: opt.color + '10' },
                                ]}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setCategory(opt.value);
                                }}
                            >
                                <IconComp size={18} color={selected ? opt.color : colors.mediumGray} />
                                <Text style={[styles.categoryLabel, selected && { color: opt.color, fontWeight: '600' }]}>
                                    {opt.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>

                {/* Title */}
                <Text style={styles.label}>Title</Text>
                <TextInput
                    style={styles.input}
                    placeholder={isService ? 'e.g., Web Design Services' : isCause ? 'e.g., Community Garden Fund' : 'e.g., Handmade Candles'}
                    placeholderTextColor={colors.mediumGray}
                    value={title}
                    onChangeText={setTitle}
                />

                {/* Description */}
                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe your listing in detail..."
                    placeholderTextColor={colors.mediumGray}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    textAlignVertical="top"
                />

                {/* Price / Funding Goal */}
                {!isCause ? (
                    <>
                        <Text style={styles.label}>Price ($)</Text>
                        <View style={styles.inputRow}>
                            <DollarSign size={18} color={colors.mediumGray} />
                            <TextInput
                                style={[styles.input, styles.inputWithIcon]}
                                placeholder="0.00"
                                placeholderTextColor={colors.mediumGray}
                                value={price}
                                onChangeText={setPrice}
                                keyboardType="decimal-pad"
                            />
                        </View>
                    </>
                ) : (
                    <>
                        <Text style={styles.label}>Funding Goal ($)</Text>
                        <View style={styles.inputRow}>
                            <DollarSign size={18} color={colors.mediumGray} />
                            <TextInput
                                style={[styles.input, styles.inputWithIcon]}
                                placeholder="5000"
                                placeholderTextColor={colors.mediumGray}
                                value={fundingGoal}
                                onChangeText={setFundingGoal}
                                keyboardType="decimal-pad"
                            />
                        </View>
                    </>
                )}

                {/* Service-specific fields */}
                {isService && (
                    <>
                        <Text style={styles.label}>Duration</Text>
                        <View style={styles.inputRow}>
                            <Clock size={18} color={colors.mediumGray} />
                            <TextInput
                                style={[styles.input, styles.inputWithIcon]}
                                placeholder="e.g., 1 hour, 30 min"
                                placeholderTextColor={colors.mediumGray}
                                value={duration}
                                onChangeText={setDuration}
                            />
                        </View>
                    </>
                )}

                {/* Product-specific fields */}
                {isProduct && (
                    <>
                        <Text style={styles.label}>Inventory Count</Text>
                        <View style={styles.inputRow}>
                            <Archive size={18} color={colors.mediumGray} />
                            <TextInput
                                style={[styles.input, styles.inputWithIcon]}
                                placeholder="e.g., 50"
                                placeholderTextColor={colors.mediumGray}
                                value={inventory}
                                onChangeText={setInventory}
                                keyboardType="number-pad"
                            />
                        </View>

                        <Text style={styles.label}>Delivery Info</Text>
                        <View style={styles.inputRow}>
                            <Truck size={18} color={colors.mediumGray} />
                            <TextInput
                                style={[styles.input, styles.inputWithIcon]}
                                placeholder="e.g., Ships in 3-5 business days"
                                placeholderTextColor={colors.mediumGray}
                                value={deliveryInfo}
                                onChangeText={setDeliveryInfo}
                            />
                        </View>
                    </>
                )}

                {/* Tags */}
                <Text style={styles.label}>Tags (comma separated)</Text>
                <View style={styles.inputRow}>
                    <Tag size={18} color={colors.mediumGray} />
                    <TextInput
                        style={[styles.input, styles.inputWithIcon]}
                        placeholder="e.g., organic, handmade, local"
                        placeholderTextColor={colors.mediumGray}
                        value={tagsText}
                        onChangeText={setTagsText}
                    />
                </View>

                {/* Submit */}
                <Pressable
                    style={({ pressed }) => [
                        styles.submitBtn,
                        pressed && { opacity: 0.9 },
                        submitting && { opacity: 0.6 },
                    ]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    <Check size={18} color={colors.white} />
                    <Text style={styles.submitBtnText}>
                        {submitting ? 'Creating...' : 'Create Listing'}
                    </Text>
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    imagePicker: {
        marginBottom: 20,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: colors.lightGray,
        borderStyle: 'dashed',
    },
    imagePreview: {
        width: '100%',
        height: 180,
    },
    imagePlaceholder: {
        height: 180,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.extraLightGray,
        gap: 8,
    },
    imageText: {
        fontSize: 14,
        color: colors.mediumGray,
        fontWeight: '500' as const,
    },
    label: {
        fontSize: 13,
        fontWeight: '600' as const,
        color: colors.darkGray,
        marginBottom: 6,
        marginTop: 16,
    },
    categoryRow: {
        flexDirection: 'row',
        gap: 10,
    },
    categoryOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: colors.lightGray,
        backgroundColor: colors.white,
    },
    categoryLabel: {
        fontSize: 13,
        color: colors.mediumGray,
        fontWeight: '500' as const,
    },
    input: {
        backgroundColor: colors.white,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: colors.black,
        borderWidth: 1,
        borderColor: colors.lightGray,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: colors.white,
        borderRadius: 12,
        paddingLeft: 14,
        borderWidth: 1,
        borderColor: colors.lightGray,
    },
    inputWithIcon: {
        flex: 1,
        borderWidth: 0,
        paddingLeft: 0,
    },
    submitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 14,
        marginTop: 28,
    },
    submitBtnText: {
        fontSize: 16,
        fontWeight: '700' as const,
        color: colors.white,
    },
});
