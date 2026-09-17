import React, { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { PALETTE, RADIUS, SPACING, TYPOGRAPHY, ELEVATION } from '../../theme/tokens';
import { ApiAdapter } from '../../adapters/api';
import { AuthAdapter } from '../../adapters/auth';
import { useLanguage } from '../../i18n/LanguageContext';
import { DEMO_MODE, isDemoInquiry, isDemoProduct, productBelongsToUser, inquiryBelongsToUser } from '../../config/demo';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Avatar } from '../../components/ui/Avatar';

interface Props {
  navigation: any;
  onLogout?: () => void;
  onSwitchRole?: (role: 'CUSTOMER') => void;
}

export const DashboardScreen: React.FC<Props> = ({
  navigation,
  onLogout,
  onSwitchRole,
}) => {
  const { t } = useLanguage();
  const [userName, setUserName] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [inquiriesCount, setInquiriesCount] = useState(0);
  const [geminiActive, setGeminiActive] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async (refresh = false) => {
    setLoading(true);

    const [userRes, healthRes, productsRes, inquiriesRes] = await Promise.allSettled([
      AuthAdapter.getCurrentUser(),
      ApiAdapter.checkHealth(),
      ApiAdapter.getProducts(refresh),
      ApiAdapter.getInquiries(refresh),
    ]);

    const user = userRes.status === 'fulfilled' ? userRes.value : null;

    if (user) setUserName(user.name || '');

    if (healthRes.status === 'fulfilled') {
      setGeminiActive(Boolean(healthRes.value.hasGeminiKey));
    }

    const allProducts = productsRes.status === 'fulfilled' ? productsRes.value : [];
    const mine = allProducts.filter(
      (p: any) => (DEMO_MODE || !isDemoProduct(p)) && productBelongsToUser(p, user),
    );
    setProducts(mine);

    const ownedIds = new Set(mine.map((p: any) => p.id));
    const allInquiries = inquiriesRes.status === 'fulfilled' ? inquiriesRes.value : [];
    const mineInquiries = allInquiries.filter(
      (i: any) =>
        (DEMO_MODE || !isDemoInquiry(i)) &&
        inquiryBelongsToUser(i, user, ownedIds),
    );
    setInquiriesCount(mineInquiries.length);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const latestProducts = products.slice(0, 3);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => loadDashboard(true)}
            tintColor={PALETTE.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Professional header */}
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Badge label={t('workshopBadge')} tone="primary" />
            <Text style={styles.eyebrow}>YOUR WORKSHOP</Text>
            <Text style={TYPOGRAPHY.title1}>
              {t('greeting', { name: userName || t('roleArtisan') })}
            </Text>
            <Text style={[TYPOGRAPHY.body, styles.headerSub]}>
              {t('workshopSubtitle')}
            </Text>
          </View>
          <Avatar name={userName} size={54} />
        </View>

        {/* Main workspace CTA */}
        <Card elevated style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="sparkles" size={22} color={PALETTE.textInverse} />
          </View>
          <Text style={styles.heroTitle}>Create your next listing</Text>
          <Text style={styles.heroText}>
            Add one photo and speak naturally. AI will enhance the photo, understand
            your craft and help prepare the listing.
          </Text>
          <Button
            title={t('addCraftBtn')}
            onPress={() => navigation.navigate('UploadWizard')}
            style={styles.heroButton}
            accessibilityLabel={t('addCraftBtn')}
          />
          <View style={styles.aiStatus}>
            <View style={[styles.statusDot, geminiActive && styles.statusDotActive]} />
            <Text style={styles.aiStatusText}>
              {geminiActive ? 'AI services ready' : 'AI services need configuration'}
            </Text>
          </View>
        </Card>

        {/* Business snapshot */}
        <SectionHeader title={t('snapshotTitle')} />
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Ionicons name="albums-outline" size={20} color={PALETTE.primary} />
            <Text style={styles.statNumber}>{products.length}</Text>
            <Text style={styles.statLabel}>{t('statListings')}</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="chatbubbles-outline" size={20} color={PALETTE.primary} />
            <Text style={styles.statNumber}>{inquiriesCount}</Text>
            <Text style={styles.statLabel}>{t('statInquiries')}</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="sparkles-outline" size={20} color={PALETTE.primary} />
            <Text style={styles.statNumber}>AI</Text>
            <Text style={styles.statLabel}>ASSISTED</Text>
          </View>
        </View>

        {/* Quick actions */}
        <SectionHeader title="Quick actions" />
        <View style={styles.actionGrid}>
          <Card onPress={() => navigation.navigate('UploadWizard')} style={styles.actionCard}>
            <View style={styles.actionIcon}>
              <Ionicons name="camera-outline" size={22} color={PALETTE.primary} />
            </View>
            <Text style={styles.actionTitle}>Add craft</Text>
            <Text style={styles.actionText}>Photo + voice</Text>
          </Card>

          <Card onPress={() => navigation.navigate('Catalog')} style={styles.actionCard}>
            <View style={styles.actionIcon}>
              <Ionicons name="grid-outline" size={22} color={PALETTE.primary} />
            </View>
            <Text style={styles.actionTitle}>My catalog</Text>
            <Text style={styles.actionText}>View your listings</Text>
          </Card>

          <Card onPress={() => navigation.navigate('Messages')} style={styles.actionCard}>
            <View style={styles.actionIcon}>
              <Ionicons name="chatbubble-ellipses-outline" size={22} color={PALETTE.primary} />
            </View>
            <Text style={styles.actionTitle}>Buyer messages</Text>
            <Text style={styles.actionText}>Reply in your language</Text>
          </Card>
        </View>

        {/* Recent work */}
        <SectionHeader
          title="Recent crafts"
          subtitle={`${products.length} published listing${products.length === 1 ? '' : 's'}`}
        />

        {latestProducts.length > 0 ? (
          <View style={styles.recentList}>
            {latestProducts.map((product) => {
              const imageUri = product.enhancedImageUrl || product.originalImageUrl;
              return (
                <Card key={product.id} style={styles.recentCard}>
                  {imageUri ? (
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.recentImage}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                    />
                  ) : (
                    <View style={styles.recentImagePlaceholder}>
                      <Ionicons name="image-outline" size={22} color={PALETTE.textMuted} />
                    </View>
                  )}
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentTitle} numberOfLines={2}>
                      {product.title || t('untitledCraft')}
                    </Text>
                    <Text style={styles.recentPrice}>
                      ₹{product.finalPrice || product.recommendedPrice || '—'}
                    </Text>
                    <Text style={styles.recentMeta} numberOfLines={1}>
                      {product.category || t('handicrafts')}
                    </Text>
                  </View>
                </Card>
              );
            })}
          </View>
        ) : (
          <Card style={styles.emptyCard}>
            <Ionicons name="sparkles-outline" size={30} color={PALETTE.primary} />
            <Text style={styles.emptyTitle}>Your first craft starts here</Text>
            <Text style={styles.emptyText}>
              Add a photo and use your voice. We will guide you through the rest.
            </Text>
            <Button
              title="Create first listing"
              onPress={() => navigation.navigate('UploadWizard')}
              style={styles.emptyButton}
            />
          </Card>
        )}

        {/* Inbox shortcut */}
        <Card
          onPress={() => navigation.navigate('Messages')}
          style={styles.inboxCard}
          accessibilityLabel="Open buyer messages"
        >
          <View style={styles.inboxIcon}>
            <Ionicons name="mail-open-outline" size={22} color={PALETTE.primary} />
          </View>
          <View style={styles.inboxCopy}>
            <Text style={styles.inboxTitle}>Buyer inquiries</Text>
            <Text style={styles.inboxText}>
              {inquiriesCount
                ? `${inquiriesCount} conversation${inquiriesCount === 1 ? '' : 's'} waiting in your inbox.`
                : 'New buyer questions will appear here.'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={PALETTE.textMuted} />
        </Card>

        <View style={styles.footer}>
          {onSwitchRole ? (
            <Button
              variant="secondary"
              title={t('switchBuyer')}
              onPress={() => onSwitchRole('CUSTOMER')}
              accessibilityLabel={t('switchBuyer')}
            />
          ) : null}
          {onLogout ? (
            <Button
              variant="destructive"
              title={t('signOut')}
              onPress={onLogout}
              accessibilityLabel={t('signOut')}
            />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PALETTE.background,
  },
  scroll: {
    flex: 1,
  },
  container: {
    padding: SPACING.lg,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  headerCopy: {
    flex: 1,
    marginRight: SPACING.md,
  },
  eyebrow: {
    color: PALETTE.primaryLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  headerSub: {
    marginTop: SPACING.xs,
  },
  hero: {
    padding: SPACING.xl,
    borderColor: PALETTE.primary + '35',
    backgroundColor: PALETTE.surfaceElevated,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: PALETTE.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  heroTitle: {
    color: PALETTE.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  heroText: {
    color: PALETTE.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: SPACING.sm,
  },
  heroButton: {
    marginTop: SPACING.lg,
  },
  aiStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PALETTE.warning,
    marginRight: SPACING.xs,
  },
  statusDotActive: {
    backgroundColor: PALETTE.success,
  },
  aiStatusText: {
    color: PALETTE.textMuted,
    fontSize: 11,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statBox: {
    flex: 1,
    minHeight: 112,
    padding: SPACING.md,
    backgroundColor: PALETTE.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: PALETTE.surfaceBorder,
    ...ELEVATION.card,
  },
  statNumber: {
    color: PALETTE.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    marginTop: SPACING.sm,
  },
  statLabel: {
    color: PALETTE.textMuted,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  actionCard: {
    flex: 1,
    minHeight: 132,
    padding: SPACING.md,
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: PALETTE.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  actionTitle: {
    color: PALETTE.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  actionText: {
    color: PALETTE.textMuted,
    fontSize: 11,
    marginTop: 3,
  },
  recentList: {
    gap: SPACING.sm,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
  },
  recentImage: {
    width: 76,
    height: 76,
    borderRadius: RADIUS.md,
    backgroundColor: PALETTE.surfaceElevated,
  },
  recentImagePlaceholder: {
    width: 76,
    height: 76,
    borderRadius: RADIUS.md,
    backgroundColor: PALETTE.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  recentTitle: {
    color: PALETTE.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  recentPrice: {
    color: PALETTE.primary,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  recentMeta: {
    color: PALETTE.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  emptyCard: {
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    color: PALETTE.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    marginTop: SPACING.sm,
  },
  emptyText: {
    color: PALETTE.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  emptyButton: {
    alignSelf: 'stretch',
    marginTop: SPACING.md,
  },
  inboxCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  inboxIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: PALETTE.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inboxCopy: {
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  inboxTitle: {
    color: PALETTE.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  inboxText: {
    color: PALETTE.textMuted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  footer: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: PALETTE.surfaceBorder,
    gap: SPACING.sm,
  },
});
