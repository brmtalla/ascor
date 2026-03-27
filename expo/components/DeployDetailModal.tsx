import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
  Alert,
  Linking,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Image } from 'expo-image';
import {
  X,
  ArrowUpRight,
  DollarSign,
  Heart,
  User,
  Users,
  MessageCircle,
  ChevronRight,
  ChevronLeft,
  ShoppingCart,
  Send,
  Calendar,
  Shield,
  Clock,
  Package,
  Truck,
  Check,
  Minus,
  Plus,
  CalendarDays,
  Store,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useColors, type ThemeColors } from '@/constants/colors';
import { OpportunityCard, TimeSlot } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { listingsService } from '@/services/listingsService';

interface DeployDetailModalProps {
  opportunity: OpportunityCard | null;
  visible: boolean;
  onClose: () => void;
  onNavigateToUser?: (userId: string) => void;
}

type ModalView = 'detail' | 'booking' | 'storefront' | 'product_detail';

export default function DeployDetailModal({
  opportunity,
  visible,
  onClose,
  onNavigateToUser,
}: DeployDetailModalProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const [contributionAmount, setContributionAmount] = useState<string>('');
  const [showContributeInput, setShowContributeInput] = useState<boolean>(false);
  const [modalView, setModalView] = useState<ModalView>('detail');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState<number>(1);
  const [activeProduct, setActiveProduct] = useState<OpportunityCard | null>(null);
  const { addToCart, totalItems, totalPrice } = useCart();

  const handleClose = useCallback(() => {
    setShowContributeInput(false);
    setContributionAmount('');
    setModalView('detail');
    setSelectedSlot(null);
    setSelectedDate('');
    setSelectedVariants({});
    setQuantity(1);
    setActiveProduct(null);
    onClose();
  }, [onClose]);

  const availableDates = useMemo(() => {
    if (!opportunity?.availableSlots) return [];
    const dates = [...new Set(opportunity.availableSlots.map(s => s.date))];
    return dates;
  }, [opportunity?.availableSlots]);

  const slotsForDate = useMemo(() => {
    if (!opportunity?.availableSlots || !selectedDate) return [];
    return opportunity.availableSlots.filter(s => s.date === selectedDate);
  }, [opportunity?.availableSlots, selectedDate]);

  const sellerProducts = useMemo(() => {
    if (!opportunity?.ownerId) return [];
    return listingsService.getByOwner(opportunity.ownerId).filter(p => p.listingType === 'product');
  }, [opportunity?.ownerId]);

  if (!opportunity) return null;

  const isCause = opportunity.category === 'cause';
  const isBusiness = opportunity.category === 'business';
  const isExternal = opportunity.category === 'external';
  const isService = isBusiness && opportunity.listingType === 'service';
  const isProduct = isBusiness && opportunity.listingType === 'product';

  const progress = opportunity.fundingGoal
    ? Math.min((opportunity.fundingRaised ?? 0) / opportunity.fundingGoal, 1)
    : 0;

  const handleExternalLink = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (opportunity.externalUrl) {
      if (Platform.OS === 'web') {
        window.open(opportunity.externalUrl, '_blank');
      } else {
        Linking.openURL(opportunity.externalUrl);
      }
    }
  };

  const handleBookService = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0]);
    }
    setModalView('booking');
  };

  const handleConfirmBooking = () => {
    if (!selectedSlot) {
      Alert.alert('Select a Time', 'Please pick an available time slot.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Confirm Booking',
      `Book "${opportunity.title}" with ${opportunity.ownerUsername}?\n\n${selectedSlot.date} at ${selectedSlot.time}\nDuration: ${opportunity.duration ?? 'TBD'}\nTotal: $${opportunity.price}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Book & Pay',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert(
              'Booking Confirmed!',
              `You're booked with ${opportunity.ownerUsername} on ${selectedSlot.date} at ${selectedSlot.time}. $${opportunity.price} has been charged to your Ascor wallet.`
            );
            handleClose();
          },
        },
      ]
    );
  };

  const handleBrowseStorefront = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalView('storefront');
  };

  const handleOpenProduct = (product: OpportunityCard) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveProduct(product);
    setSelectedVariants({});
    setQuantity(1);
    setModalView('product_detail');
  };

  const handleAddProductToCart = (product: OpportunityCard, variants: Record<string, string>, qty: number) => {
    const hasVariants = product.variants && product.variants.length > 0;
    if (hasVariants) {
      const allSelected = product.variants!.every(v => variants[v.name]);
      if (!allSelected) {
        Alert.alert('Select Options', 'Please select all product options first.');
        return;
      }
    }
    addToCart({
      opportunityId: product.id,
      title: product.title,
      image: product.image,
      price: product.price ?? 0,
      quantity: qty,
      selectedVariants: { ...variants },
      sellerId: product.ownerId ?? '',
      sellerUsername: product.ownerUsername ?? '',
      sellerAvatar: product.ownerAvatar ?? '',
      deliveryInfo: product.deliveryInfo,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Added to Cart', `${qty}x "${product.title}" added to your cart.`);
  };

  const handleContact = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Message Sent',
      `Your inquiry about "${opportunity.title}" has been sent to ${opportunity.ownerUsername}. They'll reply in your messages.`
    );
  };

  const handleContribute = () => {
    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid contribution amount.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Confirm Contribution',
      `Contribute $${amount.toFixed(2)} to "${opportunity.title}"?\n\nFunds go directly to ${opportunity.ownerUsername}, who has full agency over distribution.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Contribute',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Contributed!', `$${amount.toFixed(2)} sent to "${opportunity.title}". Thank you for your support!`);
            setShowContributeInput(false);
            setContributionAmount('');
          },
        },
      ]
    );
  };

  const handleVisitProfile = () => {
    if (opportunity.ownerId && onNavigateToUser) {
      handleClose();
      setTimeout(() => {
        onNavigateToUser(opportunity.ownerId!);
      }, 300);
    }
  };

  const categoryColor = isCause ? colors.accent : isBusiness ? colors.primary : colors.darkGray;

  // ── BOOKING VIEW ──
  if (modalView === 'booking') {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.headerPill} />
            <Pressable
              style={styles.backBtn}
              onPress={() => { setModalView('detail'); setSelectedSlot(null); }}
              hitSlop={12}
            >
              <ChevronLeft size={20} color={colors.darkGray} />
            </Pressable>
            <Text style={styles.headerTitle}>Book Appointment</Text>
            <Pressable style={styles.closeBtn} onPress={handleClose} hitSlop={12}>
              <X size={20} color={colors.darkGray} />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.bookingHeader}>
              <View style={styles.bookingServiceRow}>
                {opportunity.ownerAvatar && (
                  <Image source={{ uri: opportunity.ownerAvatar }} style={styles.bookingAvatar} />
                )}
                <View style={styles.bookingServiceInfo}>
                  <Text style={styles.bookingServiceName}>{opportunity.title}</Text>
                  <Text style={styles.bookingServiceMeta}>
                    {opportunity.ownerUsername} · {opportunity.duration}
                  </Text>
                </View>
                <View style={styles.bookingPriceBadge}>
                  <Text style={styles.bookingPriceText}>${opportunity.price}</Text>
                </View>
              </View>
            </View>

            <View style={styles.bookingSection}>
              <View style={styles.sectionHeaderRow}>
                <CalendarDays size={16} color={colors.primary} />
                <Text style={styles.bookingSectionTitle}>Select Date</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
                {availableDates.map(date => {
                  const isActive = selectedDate === date;
                  const parts = date.split(', ');
                  const dayMonth = parts[0] ?? date;
                  return (
                    <Pressable
                      key={date}
                      style={[styles.dateChip, isActive && styles.dateChipActive]}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setSelectedDate(date);
                        setSelectedSlot(null);
                      }}
                    >
                      <Text style={[styles.dateChipText, isActive && styles.dateChipTextActive]}>{dayMonth}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {selectedDate && (
              <View style={styles.bookingSection}>
                <View style={styles.sectionHeaderRow}>
                  <Clock size={16} color={colors.primary} />
                  <Text style={styles.bookingSectionTitle}>Available Times</Text>
                </View>
                <View style={styles.slotsGrid}>
                  {slotsForDate.map(slot => {
                    const isSelected = selectedSlot?.id === slot.id;
                    return (
                      <Pressable
                        key={slot.id}
                        style={[
                          styles.slotChip,
                          !slot.available && styles.slotChipDisabled,
                          isSelected && styles.slotChipSelected,
                        ]}
                        onPress={() => {
                          if (!slot.available) return;
                          Haptics.selectionAsync();
                          setSelectedSlot(slot);
                        }}
                        disabled={!slot.available}
                      >
                        <Text style={[
                          styles.slotChipText,
                          !slot.available && styles.slotChipTextDisabled,
                          isSelected && styles.slotChipTextSelected,
                        ]}>
                          {slot.time}
                        </Text>
                        {!slot.available && <Text style={styles.slotTakenText}>Taken</Text>}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {selectedSlot && (
              <View style={styles.bookingSummary}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Service</Text>
                  <Text style={styles.summaryValue}>{opportunity.title}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Date</Text>
                  <Text style={styles.summaryValue}>{selectedSlot.date}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Time</Text>
                  <Text style={styles.summaryValue}>{selectedSlot.time}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Duration</Text>
                  <Text style={styles.summaryValue}>{opportunity.duration}</Text>
                </View>
                <View style={[styles.summaryRow, styles.summaryRowTotal]}>
                  <Text style={styles.summaryTotalLabel}>Total</Text>
                  <Text style={styles.summaryTotalValue}>${opportunity.price}</Text>
                </View>
              </View>
            )}

            <View style={{ height: 120 }} />
          </ScrollView>

          <View style={styles.actionBar}>
            <Pressable
              style={({ pressed }) => [
                styles.actionBtnPrimary,
                !selectedSlot && styles.actionBtnDisabled,
                pressed && { opacity: 0.85 },
              ]}
              onPress={handleConfirmBooking}
              disabled={!selectedSlot}
            >
              <Calendar size={18} color={colors.white} />
              <Text style={styles.actionBtnPrimaryText}>
                {selectedSlot ? `Book for $${opportunity.price}` : 'Select a time slot'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  }

  // ── PRODUCT DETAIL VIEW (individual item from storefront) ──
  if (modalView === 'product_detail' && activeProduct) {
    const p = activeProduct;
    const pTotal = (p.price ?? 0) * quantity;
    const hasVariants = p.variants && p.variants.length > 0;
    const allVariantsSelected = hasVariants
      ? p.variants!.every(v => selectedVariants[v.name])
      : true;

    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.header}>
            <View style={styles.headerPill} />
            <Pressable
              style={styles.backBtn}
              onPress={() => {
                setModalView('storefront');
                setSelectedVariants({});
                setQuantity(1);
                setActiveProduct(null);
              }}
              hitSlop={12}
            >
              <ChevronLeft size={20} color={colors.darkGray} />
            </Pressable>
            <Text style={styles.headerTitle} numberOfLines={1}>Product Details</Text>
            <Pressable style={styles.closeBtn} onPress={handleClose} hitSlop={12}>
              <X size={20} color={colors.darkGray} />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Image source={{ uri: p.image }} style={styles.productHeroImage} />

            <View style={styles.productDetailBody}>
              <Text style={styles.productDetailTitle}>{p.title}</Text>
              <View style={styles.productDetailMeta}>
                {p.ownerAvatar && (
                  <Image source={{ uri: p.ownerAvatar }} style={styles.productDetailSellerAvatar} />
                )}
                <Text style={styles.productDetailSeller}>{p.ownerUsername}</Text>
              </View>

              <View style={styles.productDetailPriceRow}>
                <Text style={styles.productDetailPrice}>${p.price}</Text>
                {p.inventory != null && (
                  <View style={styles.productDetailStock}>
                    <Package size={12} color={colors.mediumGray} />
                    <Text style={styles.productDetailStockText}>{p.inventory} in stock</Text>
                  </View>
                )}
              </View>

              <Text style={styles.productDetailDesc}>{p.description}</Text>

              {hasVariants && p.variants!.map(variant => (
                <View key={variant.id} style={styles.variantSection}>
                  <Text style={styles.variantLabel}>{variant.name}</Text>
                  <View style={styles.variantOptionsRow}>
                    {variant.options.map(option => {
                      const isSelected = selectedVariants[variant.name] === option;
                      return (
                        <Pressable
                          key={option}
                          style={[styles.variantOption, isSelected && styles.variantOptionSelected]}
                          onPress={() => {
                            Haptics.selectionAsync();
                            setSelectedVariants(prev => ({ ...prev, [variant.name]: option }));
                          }}
                        >
                          {isSelected && <Check size={13} color={colors.white} />}
                          <Text style={[styles.variantOptionText, isSelected && styles.variantOptionTextSelected]}>
                            {option}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}

              <View style={styles.quantitySection}>
                <Text style={styles.quantityLabel}>Quantity</Text>
                <View style={styles.quantityStepper}>
                  <Pressable
                    style={[styles.stepperBtn, quantity <= 1 && styles.stepperBtnDisabled]}
                    onPress={() => {
                      if (quantity > 1) {
                        Haptics.selectionAsync();
                        setQuantity(q => q - 1);
                      }
                    }}
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} color={quantity <= 1 ? colors.lightGray : colors.darkGray} />
                  </Pressable>
                  <Text style={styles.quantityValue}>{quantity}</Text>
                  <Pressable
                    style={[styles.stepperBtn, quantity >= (p.inventory ?? 99) && styles.stepperBtnDisabled]}
                    onPress={() => {
                      if (quantity < (p.inventory ?? 99)) {
                        Haptics.selectionAsync();
                        setQuantity(q => q + 1);
                      }
                    }}
                    disabled={quantity >= (p.inventory ?? 99)}
                  >
                    <Plus size={16} color={quantity >= (p.inventory ?? 99) ? colors.lightGray : colors.darkGray} />
                  </Pressable>
                </View>
              </View>

              {p.deliveryInfo && (
                <View style={styles.deliveryCard}>
                  <View style={styles.deliveryHeader}>
                    <Truck size={16} color={colors.accent} />
                    <Text style={styles.deliveryTitle}>Delivery Info</Text>
                  </View>
                  <Text style={styles.deliveryText}>{p.deliveryInfo}</Text>
                </View>
              )}

              {p.organizerNote && (
                <View style={styles.noteCard}>
                  <View style={styles.noteHeader}>
                    <Shield size={14} color={colors.primary} />
                    <Text style={[styles.noteLabel, { color: colors.primary }]}>From the Owner</Text>
                  </View>
                  <Text style={styles.noteText}>{p.organizerNote}</Text>
                </View>
              )}

              <View style={styles.productDetailSummary}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Item Price</Text>
                  <Text style={styles.summaryValue}>${p.price}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Quantity</Text>
                  <Text style={styles.summaryValue}>×{quantity}</Text>
                </View>
                {Object.entries(selectedVariants).map(([key, val]) => (
                  <View key={key} style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>{key}</Text>
                    <Text style={styles.summaryValue}>{val}</Text>
                  </View>
                ))}
                <View style={[styles.summaryRow, styles.summaryRowTotal]}>
                  <Text style={styles.summaryTotalLabel}>Total</Text>
                  <Text style={styles.summaryTotalValue}>${pTotal}</Text>
                </View>
              </View>
            </View>

            <View style={{ height: 120 }} />
          </ScrollView>

          <View style={styles.actionBar}>
            <View style={styles.actionButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.addToCartBtn,
                  !allVariantsSelected && styles.addToCartBtnDisabled,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={() => handleAddProductToCart(p, selectedVariants, quantity)}
                disabled={!allVariantsSelected}
              >
                <ShoppingCart size={18} color={allVariantsSelected ? colors.accent : colors.lightGray} />
                <Text style={[
                  styles.addToCartBtnText,
                  !allVariantsSelected && { color: colors.lightGray },
                ]}>
                  Add to Cart
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }

  // ── STOREFRONT VIEW (list of all seller's products) ──
  if (modalView === 'storefront') {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.headerPill} />
            <Pressable
              style={styles.backBtn}
              onPress={() => setModalView('detail')}
              hitSlop={12}
            >
              <ChevronLeft size={20} color={colors.darkGray} />
            </Pressable>
            <Text style={styles.headerTitle}>{opportunity.ownerUsername}'s Store</Text>
            <Pressable style={styles.closeBtn} onPress={handleClose} hitSlop={12}>
              <X size={20} color={colors.darkGray} />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.storefrontOwnerCard}>
              {opportunity.ownerAvatar && (
                <Image source={{ uri: opportunity.ownerAvatar }} style={styles.storefrontOwnerAvatar} />
              )}
              <View style={styles.storefrontOwnerInfo}>
                <Text style={styles.storefrontOwnerName}>{opportunity.ownerUsername}</Text>
                <Text style={styles.storefrontOwnerMeta}>{sellerProducts.length} product{sellerProducts.length !== 1 ? 's' : ''} available</Text>
              </View>
            </View>

            {sellerProducts.map(product => {
              const pPrice = product.price ?? 0;
              const hasOpts = product.variants && product.variants.length > 0;
              return (
                <Pressable
                  key={product.id}
                  style={({ pressed }) => [styles.storefrontItem, pressed && { backgroundColor: colors.extraLightGray }]}
                  onPress={() => handleOpenProduct(product)}
                >
                  <Image source={{ uri: product.image }} style={styles.storefrontItemImage} />
                  <View style={styles.storefrontItemInfo}>
                    <Text style={styles.storefrontItemName} numberOfLines={2}>{product.title}</Text>
                    <Text style={styles.storefrontItemPrice}>${pPrice}</Text>
                    {hasOpts && (
                      <Text style={styles.storefrontItemVariants}>
                        {product.variants!.map(v => v.name).join(' · ')}
                      </Text>
                    )}
                    {product.inventory != null && (
                      <Text style={styles.storefrontItemStock}>{product.inventory} in stock</Text>
                    )}
                  </View>
                  <View style={styles.storefrontItemChevron}>
                    <ChevronRight size={18} color={colors.mediumGray} />
                  </View>
                </Pressable>
              );
            })}

            {sellerProducts.length === 0 && (
              <View style={styles.emptyStorefront}>
                <Package size={32} color={colors.lightGray} />
                <Text style={styles.emptyStorefrontText}>No products available</Text>
              </View>
            )}

            <View style={{ height: 120 }} />
          </ScrollView>

          {totalItems > 0 && (
            <View style={styles.actionBar}>
              <Pressable
                style={({ pressed }) => [styles.cartSummaryBar, pressed && { opacity: 0.9 }]}
                onPress={() => {
                  handleClose();
                }}
              >
                <View style={styles.cartSummaryLeft}>
                  <ShoppingCart size={18} color={colors.white} />
                  <Text style={styles.cartSummaryCount}>{totalItems} item{totalItems !== 1 ? 's' : ''}</Text>
                </View>
                <Text style={styles.cartSummaryTotal}>${totalPrice.toFixed(2)}</Text>
              </Pressable>
            </View>
          )}
        </View>
      </Modal>
    );
  }

  // ── MAIN DETAIL VIEW ──
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <View style={styles.headerPill} />
          <Pressable style={styles.closeBtn} onPress={handleClose} hitSlop={12}>
            <X size={20} color={colors.darkGray} />
          </Pressable>
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Image source={{ uri: opportunity.image }} style={styles.heroImage} />

          <View style={styles.body}>
            <View style={styles.badgeRow}>
              <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '12' }]}>
                <Text style={[styles.categoryText, { color: categoryColor }]}>
                  {isCause ? 'Cause' : isBusiness ? 'Business' : 'External'}
                </Text>
              </View>
              {isService && (
                <View style={[styles.typeBadge, { backgroundColor: '#6366F1' + '15' }]}>
                  <Calendar size={10} color="#6366F1" />
                  <Text style={[styles.typeBadgeText, { color: '#6366F1' }]}>Bookable Service</Text>
                </View>
              )}
              {isProduct && (
                <View style={[styles.typeBadge, { backgroundColor: colors.warning + '15' }]}>
                  <Package size={10} color={colors.warning} />
                  <Text style={[styles.typeBadgeText, { color: colors.warning }]}>Product</Text>
                </View>
              )}
            </View>

            <Text style={styles.title}>{opportunity.title}</Text>

            {opportunity.ownerUsername && (
              <Pressable style={styles.ownerCard} onPress={handleVisitProfile}>
                {opportunity.ownerAvatar ? (
                  <Image source={{ uri: opportunity.ownerAvatar }} style={styles.ownerAvatar} />
                ) : (
                  <View style={styles.ownerAvatarFallback}><User size={16} color={colors.mediumGray} /></View>
                )}
                <View style={styles.ownerInfo}>
                  <Text style={styles.ownerName}>{opportunity.ownerUsername}</Text>
                  <Text style={styles.ownerLabel}>
                    {isCause ? 'Organizer' : 'Business Owner'}
                  </Text>
                </View>
                <ChevronRight size={16} color={colors.mediumGray} />
              </Pressable>
            )}

            {isCause && opportunity.fundingGoal != null && (
              <View style={styles.causeProgressCard}>
                <View style={styles.causeAmounts}>
                  <View>
                    <Text style={styles.causeRaisedAmount}>
                      ${(opportunity.fundingRaised ?? 0).toLocaleString()}
                    </Text>
                    <Text style={styles.causeLabel}>raised</Text>
                  </View>
                  <View style={styles.causeGoalWrap}>
                    <Text style={styles.causeGoalAmount}>
                      ${opportunity.fundingGoal.toLocaleString()}
                    </Text>
                    <Text style={styles.causeLabel}>goal</Text>
                  </View>
                </View>
                <View style={styles.causeProgressBg}>
                  <View style={[styles.causeProgressFill, { width: `${progress * 100}%` }]} />
                </View>
                <Text style={styles.causeProgressPercent}>
                  {Math.round(progress * 100)}% funded
                </Text>

                {opportunity.fundingContributors && opportunity.fundingContributors.length > 0 && (
                  <View style={styles.contributorsSection}>
                    <View style={styles.contributorsHeader}>
                      <Users size={14} color={colors.mediumGray} />
                      <Text style={styles.contributorsTitle}>
                        {opportunity.fundingContributors.length} Contributors
                      </Text>
                    </View>
                    {opportunity.fundingContributors.map((c) => (
                      <View key={c.id} style={styles.contributorRow}>
                        <Image source={{ uri: c.avatar }} style={styles.contributorAvatar} />
                        <Text style={styles.contributorName}>{c.username}</Text>
                        <Text style={styles.contributorAmount}>${c.amount.toLocaleString()}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {isBusiness && opportunity.price != null && (
              <View style={styles.priceCard}>
                <View style={styles.priceCardLeft}>
                  <Text style={styles.priceCardLabel}>
                    {isService ? 'Per Session' : isProduct ? 'Starting at' : 'Price'}
                  </Text>
                  <Text style={styles.priceCardAmount}>${opportunity.price.toLocaleString()}</Text>
                  {isService && opportunity.duration && (
                    <View style={styles.durationRow}>
                      <Clock size={12} color={colors.mediumGray} />
                      <Text style={styles.durationText}>{opportunity.duration}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.priceCardRight}>
                  {opportunity.supportCount != null && (
                    <View style={styles.supportBadge}>
                      <Heart size={14} color={colors.primary} />
                      <Text style={styles.priceCardSupport}>{opportunity.supportCount}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {isExternal && opportunity.price != null && (
              <View style={styles.priceCard}>
                <View style={styles.priceCardLeft}>
                  <Text style={styles.priceCardLabel}>Listed Price</Text>
                  <Text style={styles.priceCardAmount}>${opportunity.price.toLocaleString()}</Text>
                </View>
              </View>
            )}

            {isExternal && opportunity.fundingGoal != null && (
              <View style={styles.externalFundingCard}>
                <View style={styles.causeAmounts}>
                  <View>
                    <Text style={[styles.causeRaisedAmount, { color: colors.darkGray }]}>
                      ${((opportunity.fundingRaised ?? 0) / 1000).toFixed(0)}k
                    </Text>
                    <Text style={styles.causeLabel}>raised</Text>
                  </View>
                  <View style={styles.causeGoalWrap}>
                    <Text style={styles.causeGoalAmount}>
                      ${(opportunity.fundingGoal / 1000).toFixed(0)}k goal
                    </Text>
                  </View>
                </View>
                <View style={[styles.causeProgressBg, { marginTop: 8 }]}>
                  <View style={[styles.causeProgressFill, { width: `${progress * 100}%`, backgroundColor: colors.darkGray }]} />
                </View>
              </View>
            )}

            {isService && opportunity.availableSlots && opportunity.availableSlots.length > 0 && (
              <View style={styles.availabilityPreview}>
                <View style={styles.availabilityHeader}>
                  <Calendar size={15} color="#6366F1" />
                  <Text style={styles.availabilityTitle}>Availability</Text>
                </View>
                <View style={styles.availabilitySlotPreview}>
                  {opportunity.availableSlots.filter(s => s.available).slice(0, 3).map(slot => (
                    <View key={slot.id} style={styles.previewSlot}>
                      <Text style={styles.previewSlotDate}>{slot.date}</Text>
                      <Text style={styles.previewSlotTime}>{slot.time}</Text>
                    </View>
                  ))}
                  {opportunity.availableSlots.filter(s => s.available).length > 3 && (
                    <View style={styles.previewSlotMore}>
                      <Text style={styles.previewSlotMoreText}>
                        +{opportunity.availableSlots.filter(s => s.available).length - 3} more
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {isProduct && sellerProducts.length > 0 && (
              <Pressable
                style={({ pressed }) => [styles.browseStoreCard, pressed && { opacity: 0.85 }]}
                onPress={handleBrowseStorefront}
              >
                <View style={styles.browseStoreIcon}>
                  <Store size={20} color={colors.accent} />
                </View>
                <View style={styles.browseStoreInfo}>
                  <Text style={styles.browseStoreTitle}>Browse Store</Text>
                  <Text style={styles.browseStoreSub}>
                    {sellerProducts.length} product{sellerProducts.length !== 1 ? 's' : ''} from {opportunity.ownerUsername}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.mediumGray} />
              </Pressable>
            )}

            {isProduct && opportunity.deliveryInfo && (
              <View style={styles.deliveryPreview}>
                <Truck size={14} color={colors.accent} />
                <Text style={styles.deliveryPreviewText}>{opportunity.deliveryInfo}</Text>
              </View>
            )}

            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.descriptionText}>{opportunity.description}</Text>
            </View>

            {opportunity.organizerNote && (
              <View style={styles.noteCard}>
                <View style={styles.noteHeader}>
                  <Shield size={14} color={categoryColor} />
                  <Text style={[styles.noteLabel, { color: categoryColor }]}>
                    {isCause ? 'Organizer Note' : 'From the Owner'}
                  </Text>
                </View>
                <Text style={styles.noteText}>{opportunity.organizerNote}</Text>
              </View>
            )}

            {isCause && (
              <View style={styles.causeDisclaimer}>
                <Text style={styles.disclaimerText}>
                  All contributions go directly to the organizer, who has full agency over how funds are used.
                </Text>
              </View>
            )}

            <View style={styles.tagsSection}>
              {opportunity.tags.map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        <View style={styles.actionBar}>
          {isService && opportunity.ownerId && (
            <View style={styles.actionButtons}>
              <Pressable
                style={({ pressed }) => [styles.actionBtnSecondary, pressed && { opacity: 0.85 }]}
                onPress={handleContact}
              >
                <MessageCircle size={18} color={colors.primary} />
                <Text style={styles.actionBtnSecondaryText}>Message</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.actionBtnPrimary, { flex: 1 }, pressed && { opacity: 0.85 }]}
                onPress={handleBookService}
              >
                <Calendar size={18} color={colors.white} />
                <Text style={styles.actionBtnPrimaryText}>Book Appointment</Text>
              </Pressable>
            </View>
          )}

          {isProduct && opportunity.ownerId && (
            <View style={styles.actionButtons}>
              {totalItems > 0 && (
                <View style={styles.cartPreviewPill}>
                  <ShoppingCart size={14} color={colors.accent} />
                  <Text style={styles.cartPreviewText}>{totalItems}</Text>
                </View>
              )}
              <Pressable
                style={({ pressed }) => [styles.actionBtnPrimary, { flex: 1 }, pressed && { opacity: 0.85 }]}
                onPress={handleBrowseStorefront}
              >
                <Store size={18} color={colors.white} />
                <Text style={styles.actionBtnPrimaryText}>Browse Products</Text>
              </Pressable>
            </View>
          )}

          {isBusiness && !isService && !isProduct && opportunity.ownerId && (
            <View style={styles.actionButtons}>
              <Pressable
                style={({ pressed }) => [styles.actionBtnSecondary, pressed && { opacity: 0.85 }]}
                onPress={handleContact}
              >
                <MessageCircle size={18} color={colors.primary} />
                <Text style={styles.actionBtnSecondaryText}>Message</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.actionBtnPrimary, { flex: 1 }, pressed && { opacity: 0.85 }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  Alert.alert(
                    'Confirm Purchase',
                    `Pay $${opportunity.price} for "${opportunity.title}"?\nCharged to your Ascor wallet.`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Pay Now', onPress: () => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        Alert.alert('Payment Sent!', `$${opportunity.price} sent to ${opportunity.ownerUsername}.`);
                        handleClose();
                      }},
                    ]
                  );
                }}
              >
                <ShoppingCart size={18} color={colors.white} />
                <Text style={styles.actionBtnPrimaryText}>
                  Pay ${opportunity.price?.toLocaleString()}
                </Text>
              </Pressable>
            </View>
          )}

          {isCause && (
            <View style={styles.actionButtons}>
              {!showContributeInput ? (
                <Pressable
                  style={({ pressed }) => [styles.actionBtnCause, pressed && { opacity: 0.85 }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowContributeInput(true);
                  }}
                >
                  <DollarSign size={18} color={colors.white} />
                  <Text style={styles.actionBtnPrimaryText}>Contribute to Cause</Text>
                </Pressable>
              ) : (
                <View style={styles.contributeInputRow}>
                  <View style={styles.contributeInputWrap}>
                    <Text style={styles.currencyPrefix}>$</Text>
                    <TextInput
                      style={styles.contributeInput}
                      value={contributionAmount}
                      onChangeText={setContributionAmount}
                      keyboardType="numeric"
                      placeholder="0.00"
                      placeholderTextColor={colors.mediumGray}
                      autoFocus
                    />
                  </View>
                  <Pressable
                    style={({ pressed }) => [styles.sendBtn, pressed && { opacity: 0.85 }]}
                    onPress={handleContribute}
                  >
                    <Send size={18} color={colors.white} />
                  </Pressable>
                  <Pressable
                    style={styles.cancelContribute}
                    onPress={() => {
                      setShowContributeInput(false);
                      setContributionAmount('');
                    }}
                  >
                    <X size={18} color={colors.mediumGray} />
                  </Pressable>
                </View>
              )}
            </View>
          )}

          {isExternal && (
            <View style={styles.actionButtons}>
              <Pressable
                style={({ pressed }) => [styles.actionBtnExternal, pressed && { opacity: 0.85 }]}
                onPress={handleExternalLink}
              >
                <ArrowUpRight size={18} color={colors.white} />
                <Text style={styles.actionBtnPrimaryText}>
                  View on {opportunity.externalUrl?.replace('https://', '').replace('www.', '') ?? 'External Site'}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
  },
  headerPill: {
    position: 'absolute' as const,
    top: 10,
    left: '50%',
    marginLeft: -18,
    width: 36,
    height: 4,
    backgroundColor: colors.lightGray,
    borderRadius: 2,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center' as const,
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.black,
  },
  closeBtn: {
    position: 'absolute' as const,
    right: 16,
    top: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.extraLightGray,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.extraLightGray,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    zIndex: 10,
  },
  scrollContent: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: 220,
  },
  body: {
    padding: 20,
  },
  badgeRow: {
    flexDirection: 'row' as const,
    gap: 8,
    marginBottom: 10,
  },
  categoryBadge: {
    alignSelf: 'flex-start' as const,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  typeBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  title: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: colors.black,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  ownerCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  ownerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  ownerAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.extraLightGray,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  ownerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  ownerName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.black,
  },
  ownerLabel: {
    fontSize: 12,
    color: colors.mediumGray,
    marginTop: 1,
  },
  causeProgressCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.accent + '20',
  },
  causeAmounts: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-end' as const,
    marginBottom: 10,
  },
  causeRaisedAmount: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: colors.accent,
  },
  causeLabel: {
    fontSize: 12,
    color: colors.mediumGray,
    marginTop: 1,
  },
  causeGoalWrap: {
    alignItems: 'flex-end' as const,
  },
  causeGoalAmount: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.black,
  },
  causeProgressBg: {
    height: 10,
    backgroundColor: colors.extraLightGray,
    borderRadius: 5,
    overflow: 'hidden' as const,
  },
  causeProgressFill: {
    height: 10,
    backgroundColor: colors.accent,
    borderRadius: 5,
  },
  causeProgressPercent: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.accent,
    marginTop: 6,
  },
  contributorsSection: {
    marginTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.lightGray,
    paddingTop: 12,
  },
  contributorsHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    marginBottom: 10,
  },
  contributorsTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.darkGray,
  },
  contributorRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 6,
  },
  contributorAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  contributorName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.darkGray,
    marginLeft: 10,
  },
  contributorAmount: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.accent,
  },
  priceCard: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  priceCardLeft: {},
  priceCardLabel: {
    fontSize: 12,
    color: colors.mediumGray,
    marginBottom: 2,
  },
  priceCardAmount: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: colors.black,
  },
  durationRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    marginTop: 4,
  },
  durationText: {
    fontSize: 13,
    color: colors.mediumGray,
    fontWeight: '500' as const,
  },
  priceCardRight: {
    alignItems: 'flex-end' as const,
  },
  supportBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 5,
  },
  priceCardSupport: {
    fontSize: 13,
    color: colors.mediumGray,
    fontWeight: '500' as const,
  },
  externalFundingCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  availabilityPreview: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#6366F1' + '20',
  },
  availabilityHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    marginBottom: 10,
  },
  availabilityTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.black,
  },
  availabilitySlotPreview: {
    flexDirection: 'row' as const,
    gap: 8,
    flexWrap: 'wrap' as const,
  },
  previewSlot: {
    backgroundColor: '#6366F1' + '08',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#6366F1' + '15',
  },
  previewSlotDate: {
    fontSize: 11,
    color: colors.mediumGray,
    fontWeight: '500' as const,
  },
  previewSlotTime: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#6366F1',
    marginTop: 2,
  },
  previewSlotMore: {
    backgroundColor: colors.extraLightGray,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center' as const,
  },
  previewSlotMoreText: {
    fontSize: 12,
    color: colors.mediumGray,
    fontWeight: '600' as const,
  },
  browseStoreCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.accent + '25',
  },
  browseStoreIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.accent + '12',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  browseStoreInfo: {
    flex: 1,
    marginLeft: 12,
  },
  browseStoreTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.black,
  },
  browseStoreSub: {
    fontSize: 12,
    color: colors.mediumGray,
    marginTop: 2,
  },
  deliveryPreview: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    backgroundColor: colors.accent + '08',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  deliveryPreviewText: {
    flex: 1,
    fontSize: 13,
    color: colors.darkGray,
    lineHeight: 19,
  },
  descriptionSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.black,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 15,
    color: colors.darkGray,
    lineHeight: 23,
  },
  noteCard: {
    backgroundColor: colors.extraLightGray,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  noteHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    marginBottom: 6,
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  noteText: {
    fontSize: 14,
    color: colors.darkGray,
    lineHeight: 21,
  },
  causeDisclaimer: {
    backgroundColor: colors.accent + '08',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.accent + '15',
  },
  disclaimerText: {
    fontSize: 12,
    color: colors.mediumGray,
    lineHeight: 18,
    textAlign: 'center' as const,
  },
  tagsSection: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  tag: {
    backgroundColor: colors.extraLightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 12,
    color: colors.mediumGray,
    fontWeight: '500' as const,
  },
  actionBar: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  actionButtons: {
    flexDirection: 'row' as const,
    gap: 10,
    alignItems: 'center' as const,
  },
  actionBtnPrimary: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
  },
  actionBtnDisabled: {
    backgroundColor: colors.lightGray,
  },
  actionBtnPrimaryText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.white,
  },
  actionBtnSecondary: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 6,
    backgroundColor: colors.primary + '10',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  actionBtnSecondaryText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.primary,
  },
  actionBtnCause: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 14,
  },
  actionBtnExternal: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    backgroundColor: colors.darkGray,
    paddingVertical: 16,
    borderRadius: 14,
  },
  contributeInputRow: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  contributeInputWrap: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.extraLightGray,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1,
    borderColor: colors.accent + '40',
  },
  currencyPrefix: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.accent,
    marginRight: 4,
  },
  contributeInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.black,
    height: 52,
  },
  sendBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  cancelContribute: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.extraLightGray,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  bookingHeader: {
    backgroundColor: colors.white,
    padding: 16,
    marginBottom: 8,
  },
  bookingServiceRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  bookingAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  bookingServiceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  bookingServiceName: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: colors.black,
  },
  bookingServiceMeta: {
    fontSize: 13,
    color: colors.mediumGray,
    marginTop: 2,
  },
  bookingPriceBadge: {
    backgroundColor: colors.primary + '10',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  bookingPriceText: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: colors.primary,
  },
  bookingSection: {
    padding: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    marginBottom: 12,
  },
  bookingSectionTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.black,
  },
  dateScroll: {
    marginHorizontal: -4,
  },
  dateChip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    marginHorizontal: 4,
  },
  dateChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dateChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.darkGray,
  },
  dateChipTextActive: {
    color: colors.white,
  },
  slotsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 10,
  },
  slotChip: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
    minWidth: 100,
    alignItems: 'center' as const,
  },
  slotChipDisabled: {
    backgroundColor: colors.extraLightGray,
    borderColor: colors.extraLightGray,
  },
  slotChipSelected: {
    backgroundColor: colors.primary + '08',
    borderColor: colors.primary,
  },
  slotChipText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.darkGray,
  },
  slotChipTextDisabled: {
    color: colors.lightGray,
  },
  slotChipTextSelected: {
    color: colors.primary,
  },
  slotTakenText: {
    fontSize: 10,
    color: colors.mediumGray,
    marginTop: 2,
  },
  bookingSummary: {
    marginHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  summaryRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.mediumGray,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.darkGray,
  },
  summaryRowTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    marginTop: 4,
    paddingTop: 12,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.black,
  },
  summaryTotalValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: colors.primary,
  },
  // Product detail view styles
  productHeroImage: {
    width: '100%',
    height: 260,
  },
  productDetailBody: {
    padding: 20,
  },
  productDetailTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: colors.black,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  productDetailMeta: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 14,
  },
  productDetailSellerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  productDetailSeller: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.mediumGray,
  },
  productDetailPriceRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 16,
  },
  productDetailPrice: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: colors.primary,
  },
  productDetailStock: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    backgroundColor: colors.extraLightGray,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  productDetailStockText: {
    fontSize: 12,
    color: colors.mediumGray,
    fontWeight: '500' as const,
  },
  productDetailDesc: {
    fontSize: 15,
    color: colors.darkGray,
    lineHeight: 23,
    marginBottom: 20,
  },
  productDetailSummary: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.lightGray,
    marginTop: 8,
  },
  variantSection: {
    marginBottom: 16,
  },
  variantLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.black,
    marginBottom: 10,
  },
  variantOptionsRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  variantOption: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.lightGray,
  },
  variantOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  variantOptionText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.darkGray,
  },
  variantOptionTextSelected: {
    color: colors.white,
  },
  quantitySection: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.black,
  },
  quantityStepper: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 2,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.lightGray,
    overflow: 'hidden' as const,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  stepperBtnDisabled: {
    opacity: 0.4,
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: colors.black,
    minWidth: 36,
    textAlign: 'center' as const,
  },
  deliveryCard: {
    backgroundColor: colors.accent + '08',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  deliveryHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    marginBottom: 6,
  },
  deliveryTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: colors.accent,
  },
  deliveryText: {
    fontSize: 13,
    color: colors.darkGray,
    lineHeight: 19,
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    backgroundColor: colors.accent + '12',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.accent + '30',
  },
  addToCartBtnDisabled: {
    backgroundColor: colors.extraLightGray,
    borderColor: colors.lightGray,
  },
  addToCartBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.accent,
  },
  cartPreviewPill: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 5,
    backgroundColor: colors.accent + '12',
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderRadius: 14,
  },
  cartPreviewText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: colors.accent,
  },
  storefrontOwnerCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lightGray,
  },
  storefrontOwnerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  storefrontOwnerInfo: {
    marginLeft: 12,
  },
  storefrontOwnerName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.black,
  },
  storefrontOwnerMeta: {
    fontSize: 13,
    color: colors.mediumGray,
    marginTop: 2,
  },
  storefrontItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lightGray,
    backgroundColor: colors.white,
  },
  storefrontItemImage: {
    width: 72,
    height: 72,
    borderRadius: 14,
  },
  storefrontItemInfo: {
    flex: 1,
    marginLeft: 14,
  },
  storefrontItemName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.black,
  },
  storefrontItemPrice: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: colors.primary,
    marginTop: 4,
  },
  storefrontItemVariants: {
    fontSize: 12,
    color: colors.mediumGray,
    marginTop: 3,
  },
  storefrontItemStock: {
    fontSize: 11,
    color: colors.accent,
    marginTop: 2,
  },
  storefrontItemChevron: {
    marginLeft: 8,
  },
  emptyStorefront: {
    alignItems: 'center' as const,
    paddingVertical: 60,
  },
  emptyStorefrontText: {
    fontSize: 15,
    color: colors.mediumGray,
    marginTop: 12,
  },
  cartSummaryBar: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  cartSummaryLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  cartSummaryCount: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.white,
  },
  cartSummaryTotal: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: colors.white,
  },
});
