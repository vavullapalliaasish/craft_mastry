import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PALETTE, RADIUS, SPACING, TYPOGRAPHY, ELEVATION } from '../../theme/tokens';
import { AuthAdapter, AuthUser } from '../../adapters/auth';
import { useLanguage } from '../../i18n/LanguageContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Skeleton } from '../../components/ui/Skeleton';
import { Avatar } from '../../components/ui/Avatar';

interface Props {
  onLogout?: () => void;
  onSwitchRole?: (role: 'ARTISAN') => void;
}

const languageNames: Record<string, string> = {
  en: 'English',
  te: 'తెలుగు',
  hi: 'हिन्दी',
  ta: 'தமிழ்',
  kn: 'ಕನ್ನಡ',
  mr: 'मराठी',
  bn: 'বাংলা',
  ml: 'മലയാളം',
  gu: 'ગુજરાતી',
  pa: 'ਪੰਜਾਬੀ',
  or: 'ଓଡ଼ିଆ',
  as: 'অসমীয়া',
  ur: 'اردو',
};

export const ProfileScreen: React.FC<Props> = ({ onLogout, onSwitchRole }) => {
  const { t, lang } = useLanguage();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const current = await AuthAdapter.getCurrentUser();
        if (active) setUser(current);
      } catch (err) {
        console.warn('Profile session load error:', err);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Badge label={t('profileBadge')} tone="primary" />
            <Text style={styles.eyebrow}>ACCOUNT</Text>
            <Text style={TYPOGRAPHY.title1}>{t('profileTitle')}</Text>
            <Text style={[TYPOGRAPHY.body, styles.headerSub]}>{t('profileSub')}</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="person-outline" size={24} color={PALETTE.primary} />
          </View>
        </View>

        {loading ? (
          <Card elevated style={styles.identityCard}>
            <View style={styles.identityRow}>
              <Skeleton width={68} height={68} radius={RADIUS.full} />
              <View style={styles.identityText}>
                <Skeleton width="70%" height={18} />
                <Skeleton width="45%" height={13} style={styles.skeletonGap} />
              </View>
            </View>
          </Card>
        ) : user ? (
          <Card elevated style={styles.identityCard}>
            <View style={styles.identityRow}>
              <Avatar name={user.name} size={68} />
              <View style={styles.identityText}>
                <Text style={styles.userName} numberOfLines={2}>
                  {user.name}
                </Text>
                <Text style={styles.phone}>{formatPhone(user.phone)}</Text>
                <View style={styles.roleBadge}>
                  <Ionicons name="checkmark-circle" size={13} color={PALETTE.success} />
                  <Text style={styles.roleText}>
                    {user.role === 'CUSTOMER' ? 'Buyer account' : 'Artisan account'}
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        ) : (
          <Card elevated style={styles.identityCard}>
            <Text style={TYPOGRAPHY.body}>{t('profileUnavailable')}</Text>
          </Card>
        )}

        <SectionHeader title="Your details" />
        <Card style={styles.detailsCard}>
          <InfoRow
            icon="person-outline"
            label="Name"
            value={user?.name || '—'}
          />
          <InfoRow
            icon="call-outline"
            label="Mobile number"
            value={user ? formatPhone(user.phone) : '—'}
          />
          <InfoRow
            icon="language-outline"
            label="Language"
            value={languageNames[lang] || 'English'}
          />
          <InfoRow
            icon="location-outline"
            label="Location"
            value="India"
            last
          />
        </Card>

        <SectionHeader title={t('accountSection')} />
        <Card style={styles.accountCard}>
          <View style={styles.accountIcon}>
            <Ionicons name="swap-horizontal-outline" size={22} color={PALETTE.primary} />
          </View>
          <View style={styles.accountCopy}>
            <Text style={styles.accountTitle}>
              {user?.role === 'CUSTOMER' ? 'Sell your own crafts' : 'Explore as a buyer'}
            </Text>
            <Text style={styles.accountText}>
              {user?.role === 'CUSTOMER'
                ? 'Switch to the artisan workspace when you want to create and sell a craft listing.'
                : 'Switch to the buyer marketplace to discover and inquire about crafts.'}
            </Text>
          </View>
        </Card>

        {onSwitchRole ? (
          <Button
            variant="secondary"
            title={user?.role === 'CUSTOMER' ? t('switchArtisan') : t('switchBuyer')}
            onPress={() => onSwitchRole('ARTISAN')}
            style={styles.switchButton}
          />
        ) : null}

        <View style={styles.sessionSection}>
          <Text style={styles.sessionLabel}>SESSION</Text>
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

const InfoRow: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  last?: boolean;
}> = ({ icon, label, value, last }) => (
  <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
    <View style={styles.infoIcon}>
      <Ionicons name={icon} size={18} color={PALETTE.primary} />
    </View>
    <View style={styles.infoCopy}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

function formatPhone(phone: string): string {
  const digits = String(phone || '').replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) return phone || '—';
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    letterSpacing: 1.2,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  headerSub: {
    marginTop: SPACING.xs,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: PALETTE.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityCard: {
    padding: SPACING.lg,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  identityText: {
    flex: 1,
    marginLeft: SPACING.lg,
  },
  userName: {
    color: PALETTE.textPrimary,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '800',
  },
  phone: {
    color: PALETTE.textSecondary,
    fontSize: 13,
    marginTop: 3,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.sm,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    backgroundColor: PALETTE.successMuted,
  },
  roleText: {
    color: PALETTE.success,
    fontSize: 10,
    fontWeight: '800',
  },
  skeletonGap: {
    marginTop: SPACING.sm,
  },
  detailsCard: {
    paddingVertical: 4,
  },
  infoRow: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.surfaceBorder,
  },
  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: PALETTE.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCopy: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  infoLabel: {
    color: PALETTE.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  infoValue: {
    color: PALETTE.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 3,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  accountIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: PALETTE.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountCopy: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  accountTitle: {
    color: PALETTE.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  accountText: {
    color: PALETTE.textMuted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  switchButton: {
    marginTop: SPACING.sm,
  },
  sessionSection: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: PALETTE.surfaceBorder,
    gap: SPACING.sm,
  },
  sessionLabel: {
    color: PALETTE.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
});
