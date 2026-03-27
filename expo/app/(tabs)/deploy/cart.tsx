import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ChevronRight,
  Truck,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useColors, type ThemeColors } from '@/constants/colors';
import { useCart } from '@/contexts/CartContext';
import { CartStore, CartItem } from '@/types';

export default function CartScreen() {
  const colors = useColors();
  const styles = createStyles(colors);
  const router = useRouter();
  const { stores, totalItems, totalPrice, updateQuantity, removeFromCart, clearStore, clearCart } = useCart();

  const handleCheckoutStore = useCallback((store: CartStore) => {
    const storeTotal = store.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Checkout',
      `Place order with ${store.sellerUsername}?\n\n${store.items.length} item${store.items.length !== 1 ? 's' : ''} · $${storeTotal.toFixed(2)}\n\nCharged to your Ascor wallet.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Place Order',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            clearStore(store.sellerId);
            Alert.alert('Order Placed!', `Your order with ${store.sellerUsername} has been confirmed.`);
          },
        },
      ]
    );
  }, [clearStore]);

  const handleCheckoutAll = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Checkout All',
      `Place orders with ${stores.length} seller${stores.length !== 1 ? 's' : ''}?\n\n${totalItems} item${totalItems !== 1 ? 's' : ''} · $${totalPrice.toFixed(2)}\n\nCharged to your Ascor wallet.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Place All Orders',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            clearCart();
            Alert.alert('All Orders Placed!', 'Your orders have been confirmed with all sellers.');
          },
        },
      ]
    );
  }, [stores.length, totalItems, totalPrice, clearCart]);

  const renderCartItem = useCallback((item: CartItem) => {
    const itemTotal = item.price * item.quantity;
    const variantText = Object.entries(item.selectedVariants)
      .map(([k, v]) => `${k}: ${v}`)
      .join(' · ');

    return (
      <View key={`${item.opportunityId}-${JSON.stringify(item.selectedVariants)}`} style={styles.cartItem}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
        <View style={styles.itemContent}>
          <Text style={styles.itemName} numberOfLines={2}>{item.title}</Text>
          {variantText ? <Text style={styles.itemVariants}>{variantText}</Text> : null}
          <Text style={styles.itemPrice}>${itemTotal.toFixed(2)}</Text>
          <View style={styles.itemQuantityRow}>
            <View style={styles.quantityStepper}>
              <Pressable
                style={styles.stepperBtn}
                onPress={() => {
                  Haptics.selectionAsync();
                  updateQuantity(item.opportunityId, item.selectedVariants, item.quantity - 1);
                }}
              >
                <Minus size={14} color={item.quantity <= 1 ? colors.lightGray : colors.darkGray} />
              </Pressable>
              <Text style={styles.quantityValue}>{item.quantity}</Text>
              <Pressable
                style={styles.stepperBtn}
                onPress={() => {
                  Haptics.selectionAsync();
                  updateQuantity(item.opportunityId, item.selectedVariants, item.quantity + 1);
                }}
              >
                <Plus size={14} color={colors.darkGray} />
              </Pressable>
            </View>
            <Pressable
              style={styles.removeBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                removeFromCart(item.opportunityId, item.selectedVariants);
              }}
              hitSlop={8}
            >
              <Trash2 size={16} color={colors.primary} />
            </Pressable>
          </View>
        </View>
      </View>
    );
  }, [updateQuantity, removeFromCart]);

  const renderStore = useCallback((store: CartStore) => {
    const storeTotal = store.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const storeItemCount = store.items.reduce((sum, i) => sum + i.quantity, 0);

    return (
      <View key={store.sellerId} style={styles.storeSection}>
        <View style={styles.storeHeader}>
          <Pressable
            style={styles.storeHeaderLeft}
            onPress={() => {
              router.push(`/user/${store.sellerId}`);
            }}
          >
            <Image source={{ uri: store.sellerAvatar }} style={styles.storeAvatar} />
            <View>
              <Text style={styles.storeName}>{store.sellerUsername}</Text>
              <Text style={styles.storeItemCount}>{storeItemCount} item{storeItemCount !== 1 ? 's' : ''}</Text>
            </View>
            <ChevronRight size={16} color={colors.mediumGray} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.storeCheckoutBtn, pressed && { opacity: 0.85 }]}
            onPress={() => handleCheckoutStore(store)}
          >
            <Text style={styles.storeCheckoutText}>${storeTotal.toFixed(2)}</Text>
            <ChevronRight size={14} color={colors.white} />
          </Pressable>
        </View>

        {store.items.map(renderCartItem)}

        {store.items[0]?.deliveryInfo && (
          <View style={styles.deliveryInfo}>
            <Truck size={13} color={colors.accent} />
            <Text style={styles.deliveryInfoText}>{store.items[0].deliveryInfo}</Text>
          </View>
        )}
      </View>
    );
  }, [handleCheckoutStore, renderCartItem, router]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Cart' }} />

      {stores.length === 0 ? (
        <View style={styles.emptyState}>
          <ShoppingBag size={48} color={colors.lightGray} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtext}>Browse products in Deploy and add items to your cart.</Text>
          <Pressable
            style={({ pressed }) => [styles.browseBtn, pressed && { opacity: 0.85 }]}
            onPress={() => router.back()}
          >
            <Text style={styles.browseBtnText}>Browse Products</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.cartHeader}>
              <Text style={styles.cartTitle}>{totalItems} item{totalItems !== 1 ? 's' : ''} from {stores.length} store{stores.length !== 1 ? 's' : ''}</Text>
            </View>

            {stores.map(renderStore)}

            <View style={{ height: 120 }} />
          </ScrollView>

          <View style={styles.checkoutBar}>
            <View style={styles.checkoutInfo}>
              <Text style={styles.checkoutLabel}>Total</Text>
              <Text style={styles.checkoutTotal}>${totalPrice.toFixed(2)}</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.checkoutAllBtn, pressed && { opacity: 0.85 }]}
              onPress={handleCheckoutAll}
            >
              <ShoppingBag size={18} color={colors.white} />
              <Text style={styles.checkoutAllText}>Checkout All</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  cartHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  cartTitle: {
    fontSize: 14,
    color: colors.mediumGray,
    fontWeight: '500' as const,
  },
  storeSection: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lightGray,
    backgroundColor: colors.extraLightGray,
  },
  storeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  storeAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  storeName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.black,
  },
  storeItemCount: {
    fontSize: 11,
    color: colors.mediumGray,
    marginTop: 1,
  },
  storeCheckoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  storeCheckoutText: {
    fontSize: 14,
    fontWeight: '800' as const,
    color: colors.white,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lightGray,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  itemContent: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.black,
  },
  itemVariants: {
    fontSize: 11,
    color: colors.mediumGray,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: colors.primary,
    marginTop: 4,
  },
  itemQuantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  quantityStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.extraLightGray,
    borderRadius: 10,
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.black,
    minWidth: 24,
    textAlign: 'center',
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.accent + '06',
  },
  deliveryInfoText: {
    flex: 1,
    fontSize: 12,
    color: colors.darkGray,
    lineHeight: 17,
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  checkoutInfo: {},
  checkoutLabel: {
    fontSize: 12,
    color: colors.mediumGray,
  },
  checkoutTotal: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: colors.black,
  },
  checkoutAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  checkoutAllText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.white,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.darkGray,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.mediumGray,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  browseBtn: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  browseBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.white,
  },
});
