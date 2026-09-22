import React from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { BackHeader } from '../../components/ui/BackHeader';
import {
  PALETTE,
  RADIUS,
  SPACING,
  TYPOGRAPHY,
} from '../../theme/tokens';

interface OrdersScreenProps {
  navigation: any;
}

interface Order {
  id: string;
  productName: string;
  customerName: string;
  quantity: number;
  amount: number;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered';
  date: string;
}

const DEMO_ORDERS: Order[] = [
  {
    id: 'CM-1001',
    productName: 'Handmade Wooden Craft',
    customerName: 'Ravi Kumar',
    quantity: 2,
    amount: 1800,
    status: 'Pending',
    date: '20 Sep 2026',
  },
  {
    id: 'CM-1002',
    productName: 'Traditional Bamboo Basket',
    customerName: 'Lakshmi Devi',
    quantity: 3,
    amount: 1350,
    status: 'Confirmed',
    date: '19 Sep 2026',
  },
  {
    id: 'CM-1003',
    productName: 'Handcrafted Wall Decor',
    customerName: 'Suresh Rao',
    quantity: 1,
    amount: 950,
    status: 'Shipped',
    date: '17 Sep 2026',
  },
  {
    id: 'CM-1004',
    productName: 'Traditional Clay Pot',
    customerName: 'Anitha',
    quantity: 4,
    amount: 1200,
    status: 'Delivered',
    date: '15 Sep 2026',
  },
];

const getStatusStyle = (status: Order['status']) => {
  switch (status) {
    case 'Pending':
      return {
        backgroundColor: PALETTE.warningMuted,
        color: PALETTE.warning,
      };

    case 'Confirmed':
      return {
        backgroundColor: PALETTE.infoMuted,
        color: PALETTE.info,
      };

    case 'Shipped':
      return {
        backgroundColor: PALETTE.primaryMuted,
        color: PALETTE.primary,
      };

    case 'Delivered':
      return {
        backgroundColor: PALETTE.successMuted,
        color: PALETTE.success,
      };

    default:
      return {
        backgroundColor: PALETTE.surfaceHighlight,
        color: PALETTE.textSecondary,
      };
  }
};

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  const statusStyle = getStatusStyle(order.status);

  return (
    <View style={styles.orderCard}>
      <View style={styles.topRow}>
        <View style={styles.orderIcon}>
          <Ionicons
            name="cube-outline"
            size={22}
            color={PALETTE.primary}
          />
        </View>

        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>
            Order #{order.id}
          </Text>

          <Text
            style={styles.productName}
            numberOfLines={2}
          >
            {order.productName}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                statusStyle.backgroundColor,
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color: statusStyle.color,
              },
            ]}
          >
            {order.status}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>
            Customer
          </Text>

          <Text style={styles.detailValue}>
            {order.customerName}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>
            Quantity
          </Text>

          <Text style={styles.detailValue}>
            {order.quantity}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>
            Amount
          </Text>

          <Text style={styles.amountValue}>
            ₹{order.amount.toLocaleString('en-IN')}
          </Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.dateContainer}>
          <Ionicons
            name="calendar-outline"
            size={15}
            color={PALETTE.textMuted}
          />

          <Text style={styles.dateText}>
            {order.date}
          </Text>
        </View>
      </View>
    </View>
  );
};

export const OrdersScreen: React.FC<OrdersScreenProps> = ({
  navigation,
}) => {
  const pendingCount = DEMO_ORDERS.filter(
    (order) => order.status === 'Pending'
  ).length;

  const totalOrders = DEMO_ORDERS.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackHeader
        title="Orders"
        navigation={navigation}
      />

      <FlatList
        data={DEMO_ORDERS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OrderCard order={item} />
        )}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.headingSection}>
              <Text style={styles.eyebrow}>
                ARTISAN ORDERS
              </Text>

              <Text style={styles.heading}>
                Your Orders
              </Text>

              <Text style={styles.description}>
                View and manage orders received from
                customers.
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <View style={styles.summaryIcon}>
                  <Ionicons
                    name="receipt-outline"
                    size={20}
                    color={PALETTE.primary}
                  />
                </View>

                <Text style={styles.summaryNumber}>
                  {totalOrders}
                </Text>

                <Text style={styles.summaryLabel}>
                  Total Orders
                </Text>
              </View>

              <View style={styles.summaryCard}>
                <View style={styles.summaryIcon}>
                  <Ionicons
                    name="time-outline"
                    size={20}
                    color={PALETTE.warning}
                  />
                </View>

                <Text
                  style={[
                    styles.summaryNumber,
                    { color: PALETTE.warning },
                  ]}
                >
                  {pendingCount}
                </Text>

                <Text style={styles.summaryLabel}>
                  Pending
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>
              Recent Orders
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="receipt-outline"
                size={32}
                color={PALETTE.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>
              No orders yet
            </Text>

            <Text style={styles.emptyText}>
              Orders from customers will appear here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PALETTE.background,
  },

  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },

  headingSection: {
    marginBottom: SPACING.lg,
  },

  eyebrow: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.primary,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },

  heading: {
    ...TYPOGRAPHY.title1,
    marginBottom: SPACING.xs,
  },

  description: {
    ...TYPOGRAPHY.body,
    maxWidth: 420,
  },

  summaryRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: PALETTE.surface,
    borderWidth: 1,
    borderColor: PALETTE.surfaceBorder,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },

  summaryIcon: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: PALETTE.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },

  summaryNumber: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    color: PALETTE.primary,
  },

  summaryLabel: {
    ...TYPOGRAPHY.caption,
    marginTop: SPACING.xxs,
  },

  sectionTitle: {
    ...TYPOGRAPHY.title2,
    marginBottom: SPACING.md,
  },

  orderCard: {
    backgroundColor: PALETTE.surface,
    borderWidth: 1,
    borderColor: PALETTE.surfaceBorder,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  orderIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: PALETTE.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },

  orderInfo: {
    flex: 1,
    paddingRight: SPACING.sm,
  },

  orderId: {
    ...TYPOGRAPHY.caption,
    color: PALETTE.primary,
    fontWeight: '700',
    marginBottom: SPACING.xxs,
  },

  productName: {
    ...TYPOGRAPHY.headline,
    color: PALETTE.textPrimary,
  },

  statusBadge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },

  divider: {
    height: 1,
    backgroundColor: PALETTE.surfaceBorder,
    marginVertical: SPACING.md,
  },

  detailsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },

  detailItem: {
    flex: 1,
  },

  detailLabel: {
    ...TYPOGRAPHY.caption,
    marginBottom: SPACING.xxs,
  },

  detailValue: {
    ...TYPOGRAPHY.callout,
    color: PALETTE.textPrimary,
    fontWeight: '600',
  },

  amountValue: {
    ...TYPOGRAPHY.callout,
    color: PALETTE.primary,
    fontWeight: '800',
  },

  bottomRow: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },

  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },

  dateText: {
    ...TYPOGRAPHY.footnote,
  },

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
  },

  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: PALETTE.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },

  emptyTitle: {
    ...TYPOGRAPHY.title2,
    marginBottom: SPACING.xs,
  },

  emptyText: {
    ...TYPOGRAPHY.body,
    textAlign: 'center',
  },
});