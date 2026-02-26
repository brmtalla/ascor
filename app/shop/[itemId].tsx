import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
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
    Trash2,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useColors, type ThemeColors } from '@/constants/colors';
import { shopService } from '@/services/shopService';
import { StorefrontListing } from '@/types';

type ListingCategory = 'business' | 'service' | 'cause';

export default function EditItemScreen() {
    const colors = useColors();
    const styles = createStyles(colors);

    const CATEGORY_OPTIONS: { value: ListingCategory; label: string; icon: typeof Package; color: string }[] = [
        { value: 'business', label: 'Product', icon: Package, color: colors.warning },
        { value: 'service', label: 'Service', icon: Wrench, color: colors.primary },
        { value: 'cause', label: 'Cause', icon: Heart, color: colors.accent },
    ];
    const { itemId } = useLocalSearchParams<{ itemId: string }>();
    const router = useRouter();
    const [item, setItem] = useState<StorefrontListing | null>(null);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        const loadItem = async () => {
            const items = await shopService.getShopItems();
            const found = items.find(i => i.id === itemId);
            if (found) {
                setItem(found);
                setTitle(found.title);
                setDescription(found.description);
                setCategory(found.category);
                setPrice(found.price ? String(found.price) : '');
                setDuration(found.duration || '');
                setInventory(found.inventory ? String(found.inventory) : '');
                setDeliveryInfo(found.deliveryInfo || '');
                setFundingGoal(found.fundingGoal ? String(found.fundingGoal) : '');
                setTagsText(found.tags.join(', '));
                setImageUri(found.image);
            }
            setLoading(false);
        };
        loadItem();
    }, [itemId]);

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

    const handleSave = useCallback(async () => {
        if (!title.trim() || !description.trim()) {
            Alert.alert('Missing Fields', 'Title and description are required.');
            return;
        }
        setSubmitting(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const tags = tagsText.split(',').map(t => t.trim()).filter(Boolean);

        await shopService.updateShopItem(itemId!, {
            title: title.trim(),
            description: description.trim(),
            category,
            listingType: isService ? 'service' : 'product',
            image: imageUri,
            price: price ? parseFloat(price) : undefined,
            fundingGoal: fundingGoal ? parseFloat(fundingGoal) : undefined,
            tags,
            duration: duration || undefined,
            inventory: inventory ? parseInt(inventory) : undefined,
            deliveryInfo: deliveryInfo || undefined,
        });

        setSubmitting(false);
        Alert.alert('Updated!', 'Your listing has been updated.', [
            { text: 'OK', onPress: () => router.back() },
        ]);
    }, [itemId, title, description, category, price, duration, inventory, deliveryInfo, fundingGoal, tagsText, imageUri, isService, router]);

    const handleDelete = useCallback(() => {
        Alert.alert(
            'Delete Listing',
            `Are you sure you want to delete "${title}"? This cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                        await shopService.deleteShopItem(itemId!);
                        router.back();
                    },
                },
            ]
        );
    }, [itemId, title, router]);

    if (loading) {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ title: 'Edit Listing' }} />
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            </View>
        );
    }

    if (!item) {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ title: 'Not Found' }} />
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Listing not found</Text>
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <Stack.Screen options={{ title: 'Edit Listing' }} />
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Image */}
                <Pressable style={styles.imagePicker} onPress={handlePickImage}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Camera size={32} color={colors.mediumGray} />
                            <Text style={styles.imageText}>Change Image</Text>
                        </View>
                    )}
                </Pressable>

                {/* Category */}
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
                    value={title}
                    onChangeText={setTitle}
                    placeholderTextColor={colors.mediumGray}
                />

                {/* Description */}
                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    textAlignVertical="top"
                    placeholderTextColor={colors.mediumGray}
                />

                {/* Price / Funding */}
                {!isCause ? (
                    <>
                        <Text style={styles.label}>Price ($)</Text>
                        <View style={styles.inputRow}>
                            <DollarSign size={18} color={colors.mediumGray} />
                            <TextInput
                                style={[styles.input, styles.inputWithIcon]}
                                value={price}
                                onChangeText={setPrice}
                                keyboardType="decimal-pad"
                                placeholderTextColor={colors.mediumGray}
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
                                value={fundingGoal}
                                onChangeText={setFundingGoal}
                                keyboardType="decimal-pad"
                                placeholderTextColor={colors.mediumGray}
                            />
                        </View>
                    </>
                )}

                {isService && (
                    <>
                        <Text style={styles.label}>Duration</Text>
                        <View style={styles.inputRow}>
                            <Clock size={18} color={colors.mediumGray} />
                            <TextInput
                                style={[styles.input, styles.inputWithIcon]}
                                value={duration}
                                onChangeText={setDuration}
                                placeholderTextColor={colors.mediumGray}
                            />
                        </View>
                    </>
                )}

                {isProduct && (
                    <>
                        <Text style={styles.label}>Inventory Count</Text>
                        <View style={styles.inputRow}>
                            <Archive size={18} color={colors.mediumGray} />
                            <TextInput
                                style={[styles.input, styles.inputWithIcon]}
                                value={inventory}
                                onChangeText={setInventory}
                                keyboardType="number-pad"
                                placeholderTextColor={colors.mediumGray}
                            />
                        </View>
                        <Text style={styles.label}>Delivery Info</Text>
                        <View style={styles.inputRow}>
                            <Truck size={18} color={colors.mediumGray} />
                            <TextInput
                                style={[styles.input, styles.inputWithIcon]}
                                value={deliveryInfo}
                                onChangeText={setDeliveryInfo}
                                placeholderTextColor={colors.mediumGray}
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
                        value={tagsText}
                        onChangeText={setTagsText}
                        placeholderTextColor={colors.mediumGray}
                    />
                </View>

                {/* Actions */}
                <Pressable
                    style={({ pressed }) => [
                        styles.saveBtn,
                        pressed && { opacity: 0.9 },
                        submitting && { opacity: 0.6 },
                    ]}
                    onPress={handleSave}
                    disabled={submitting}
                >
                    <Check size={18} color={colors.white} />
                    <Text style={styles.saveBtnText}>
                        {submitting ? 'Saving...' : 'Save Changes'}
                    </Text>
                </Pressable>

                <Pressable
                    style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.9 }]}
                    onPress={handleDelete}
                >
                    <Trash2 size={18} color={colors.primary} />
                    <Text style={styles.deleteBtnText}>Delete Listing</Text>
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
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: colors.mediumGray,
    },
    imagePicker: {
        marginBottom: 20,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: colors.lightGray,
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
    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: colors.accent,
        paddingVertical: 16,
        borderRadius: 14,
        marginTop: 28,
    },
    saveBtnText: {
        fontSize: 16,
        fontWeight: '700' as const,
        color: colors.white,
    },
    deleteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: colors.primary,
        marginTop: 12,
    },
    deleteBtnText: {
        fontSize: 15,
        fontWeight: '600' as const,
        color: colors.primary,
    },
});
