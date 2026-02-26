import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Pressable,
    RefreshControl,
    Alert,
} from 'react-native';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { Plus, Package, Wrench, Tag, MoreVertical, Trash2, Edit3 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useColors, type ThemeColors } from '@/constants/colors';
import GlassCard from '@/components/GlassCard';
import { shopService } from '@/services/shopService';
import { StorefrontListing } from '@/types';

export default function ShopManagementScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
    const router = useRouter();
    const [items, setItems] = useState<StorefrontListing[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadItems = useCallback(async () => {
        const shopItems = await shopService.getShopItems();
        setItems(shopItems);
        setLoading(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadItems();
        }, [loadItems])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadItems();
        setRefreshing(false);
    }, [loadItems]);

    const handleDelete = useCallback((item: StorefrontListing) => {
        Alert.alert(
            'Delete Listing',
            `Are you sure you want to delete "${item.title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                        await shopService.deleteShopItem(item.id);
                        await loadItems();
                    },
                },
            ]
        );
    }, [loadItems]);

    const handleEdit = useCallback((item: StorefrontListing) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/shop/${item.id}`);
    }, [router]);

    const handleCreate = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push('/shop/create-item');
    }, [router]);

    const renderItem = useCallback(({ item }: { item: StorefrontListing }) => {
        const isService = item.listingType === 'service' || item.category === 'service';
        const isCause = item.category === 'cause';
        const TypeIcon = isService ? Wrench : Package;
        const typeColor = isCause ? colors.accent : isService ? colors.primary : colors.warning;

        return (
            <Pressable onPress={() => handleEdit(item)}>
                <GlassCard style={styles.itemCard}>
                    <Image source={{ uri: item.image }} style={styles.itemImage} />
                    <View style={styles.itemBody}>
                        <View style={styles.itemHeader}>
                            <View style={[styles.typeBadge, { backgroundColor: typeColor + '15' }]}>
                                <TypeIcon size={12} color={typeColor} />
                                <Text style={[styles.typeText, { color: typeColor }]}>
                                    {isCause ? 'Cause' : isService ? 'Service' : 'Product'}
                                </Text>
                            </View>
                            {item.price && (
                                <Text style={styles.itemPrice}>${item.price}</Text>
                            )}
                        </View>
                        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
                        <View style={styles.itemFooter}>
                            <View style={styles.tagRow}>
                                {item.tags.slice(0, 2).map(tag => (
                                    <View key={tag} style={styles.tag}>
                                        <Tag size={9} color={colors.mediumGray} />
                                        <Text style={styles.tagText}>{tag}</Text>
                                    </View>
                                ))}
                            </View>
                            <View style={styles.itemActions}>
                                <Pressable
                                    onPress={() => handleEdit(item)}
                                    hitSlop={8}
                                    style={styles.actionBtn}
                                >
                                    <Edit3 size={16} color={colors.mediumGray} />
                                </Pressable>
                                <Pressable
                                    onPress={() => handleDelete(item)}
                                    hitSlop={8}
                                    style={styles.actionBtn}
                                >
                                    <Trash2 size={16} color={colors.primary} />
                                </Pressable>
                            </View>
                        </View>

                        {item.fundingGoal && (
                            <View style={styles.fundingSection}>
                                <View style={styles.fundingBar}>
                                    <View
                                        style={[
                                            styles.fundingFill,
                                            { width: `${Math.min(((item.fundingRaised ?? 0) / item.fundingGoal) * 100, 100)}%` },
                                        ]}
                                    />
                                </View>
                                <Text style={styles.fundingText}>
                                    ${((item.fundingRaised ?? 0) / 1000).toFixed(0)}k / ${(item.fundingGoal / 1000).toFixed(0)}k raised
                                </Text>
                            </View>
                        )}
                    </View>
                </GlassCard>
            </Pressable>
        );
    }, [handleEdit, handleDelete]);

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'My Shop' }} />

            <FlatList
                data={items}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>{items.length} Listing{items.length !== 1 ? 's' : ''}</Text>
                        <Text style={styles.headerSubtitle}>Manage your products, services, and causes</Text>
                    </View>
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.empty}>
                            <Store size={40} color={colors.lightGray} />
                            <Text style={styles.emptyTitle}>No listings yet</Text>
                            <Text style={styles.emptySubtitle}>Tap the + button to add your first product or service</Text>
                        </View>
                    ) : null
                }
            />

            <Pressable
                style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.95 }] }]}
                onPress={handleCreate}
            >
                <Plus size={24} color={colors.white} strokeWidth={2.5} />
            </Pressable>
        </View>
    );
}

// Need to import Store for empty state
import { Store } from 'lucide-react-native';

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    list: {
        paddingBottom: 100,
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800' as const,
        color: colors.black,
    },
    headerSubtitle: {
        fontSize: 14,
        color: colors.mediumGray,
        marginTop: 2,
    },
    itemCard: {
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 0,
        overflow: 'hidden',
    },
    itemImage: {
        width: '100%',
        height: 130,
    },
    itemBody: {
        padding: 14,
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    typeText: {
        fontSize: 11,
        fontWeight: '600' as const,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: '700' as const,
        color: colors.accent,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '700' as const,
        color: colors.black,
        marginBottom: 3,
    },
    itemDesc: {
        fontSize: 13,
        color: colors.mediumGray,
        lineHeight: 19,
        marginBottom: 8,
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tagRow: {
        flexDirection: 'row',
        gap: 6,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: colors.extraLightGray,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
    },
    tagText: {
        fontSize: 10,
        color: colors.mediumGray,
        fontWeight: '500' as const,
    },
    itemActions: {
        flexDirection: 'row',
        gap: 10,
    },
    actionBtn: {
        padding: 4,
    },
    fundingSection: {
        marginTop: 8,
    },
    fundingBar: {
        height: 4,
        backgroundColor: colors.extraLightGray,
        borderRadius: 2,
        overflow: 'hidden',
    },
    fundingFill: {
        height: 4,
        backgroundColor: colors.accent,
        borderRadius: 2,
    },
    fundingText: {
        fontSize: 11,
        color: colors.mediumGray,
        marginTop: 3,
    },
    empty: {
        alignItems: 'center',
        paddingTop: 80,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700' as const,
        color: colors.darkGray,
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: colors.mediumGray,
        textAlign: 'center',
        marginTop: 6,
        lineHeight: 20,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
    },
});
