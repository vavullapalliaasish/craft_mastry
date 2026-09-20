import React, { useState } from 'react';

import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import {
  PALETTE,
  SPACING,
  TOUCH_TARGET,
  TYPOGRAPHY,
} from '../../theme/tokens';

import {
  AuthAdapter,
  AuthUser,
  DEV_AUTH_ENABLED,
  DEV_TEST_ACCOUNTS,
} from '../../adapters/auth';

import { AuthStackParamList } from './WelcomeLanguageScreen';

import { useLanguage } from '../../i18n/LanguageContext';

import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { Card } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { Badge } from '../../components/ui/Badge';

type Props =
  NativeStackScreenProps<
    AuthStackParamList,
    'PhoneAuth'
  > & {
    onAuthenticated?: (user: AuthUser) => void;
  };

export const PhoneAuthScreen: React.FC<Props> = ({
  navigation,
  onAuthenticated,
}) => {
  const { t } = useLanguage();

  const [phone, setPhone] =
    useState('');

  const [role, setRole] =
    useState<'ARTISAN' | 'CUSTOMER'>(
      'ARTISAN'
    );

  const [name, setName] =
    useState('');

  const [otp, setOtp] =
    useState(
      DEV_AUTH_ENABLED
        ? '123456'
        : ''
    );

  const [isVerifying, setIsVerifying] =
    useState(false);

  const [statusMessage, setStatusMessage] =
    useState('');

  const [statusError, setStatusError] =
    useState(false);

  const [devExpanded, setDevExpanded] =
    useState(false);

  const handleDevAccountSelect = (
    devPhone: string
  ) => {
    const acc =
      DEV_TEST_ACCOUNTS[devPhone];

    if (acc) {
      setPhone(devPhone);
      setRole(acc.role);
      setName(acc.name);

      setStatusMessage(
        t('devSelected', {
          name: acc.name,
          role: acc.role,
        })
      );

      setStatusError(false);
    }
  };

  const canVerify =
    phone.replace(/\D/g, '').length ===
      10 &&
    name.trim().length > 0;

  const handleVerify = async () => {
    setIsVerifying(true);

    setStatusMessage(
      t('verifying')
    );

    setStatusError(false);

    try {
      const session =
        await AuthAdapter.sendOtp(
          phone
        );

      const user =
        await AuthAdapter.verifyOtp(
          session.verificationId,
          otp,
          phone,
          name,
          role
        );

      setStatusMessage(
        t('authSuccess', {
          name: user.name,
        })
      );

      if (!user.completedOnboarding) {
        navigation.navigate(
          'Onboarding',
          {
            role:
              user.role as
                | 'ARTISAN'
                | 'CUSTOMER',

            phone: user.phone,

            name: user.name,
          }
        );
      } else {
        onAuthenticated?.(user);
      }
    } catch (err: any) {
      setStatusMessage(
        t('authError', {
          message:
            err.message ||
            String(err),
        })
      );

      setStatusError(true);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={
          styles.container
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
      >

        {/* ================================================= */}
        {/* CRAFT MASTERY LOGO */}
        {/* ================================================= */}

        <View
          style={styles.logoContainer}
        >
          <Image
            source={require('../../assets/craft_mastery_logo.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Craft Mastery Logo"
          />
        </View>

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <Card
          style={styles.headerCard}
        >
          <Badge
            label={t(
              'phoneStepBadge'
            )}
            tone="primary"
          />

          <Text
            style={[
              TYPOGRAPHY.title1,
              styles.headerTitle,
            ]}
          >
            {t('signInTitle')}
          </Text>

          <Text
            style={styles.subtitle}
          >
            {t('authSubtitle')}
          </Text>
        </Card>

        {/* ================================================= */}
        {/* ROLE SELECTION */}
        {/* ================================================= */}

        <Text
          style={[
            TYPOGRAPHY.caption,
            styles.sectionLabel,
          ]}
        >
          {t('whoAreYou')}
        </Text>

        <View
          style={styles.roleRow}
        >

          {/* ARTISAN */}

          <Card
            onPress={() =>
              setRole('ARTISAN')
            }
            accessibilityLabel="Continue as Artisan"
            accessibilityState={{
              selected:
                role === 'ARTISAN',
            }}
            style={[
              styles.roleCard,
              role === 'ARTISAN' &&
                styles.roleCardSelected,
            ]}
          >
            <Text
              style={styles.roleEmoji}
            >
              🏺
            </Text>

            <Text
              style={styles.roleTitle}
            >
              {t('roleArtisan')}
            </Text>

            <Text
              style={styles.roleDescription}
            >
              {t(
                'roleArtisanDesc'
              )}
            </Text>
          </Card>

          {/* BUYER */}

          <Card
            onPress={() =>
              setRole('CUSTOMER')
            }
            accessibilityLabel="Continue as Buyer"
            accessibilityState={{
              selected:
                role === 'CUSTOMER',
            }}
            style={[
              styles.roleCard,
              role === 'CUSTOMER' &&
                styles.roleCardSelected,
            ]}
          >
            <Text
              style={styles.roleEmoji}
            >
              🛍️
            </Text>

            <Text
              style={styles.roleTitle}
            >
              {t('roleCustomer')}
            </Text>

            <Text
              style={styles.roleDescription}
            >
              {t(
                'roleCustomerDesc'
              )}
            </Text>
          </Card>

        </View>

        {/* ================================================= */}
        {/* ACCOUNT INFORMATION */}
        {/* ================================================= */}

        <Text
          style={[
            TYPOGRAPHY.caption,
            styles.sectionLabel,
          ]}
        >
          {t('accountInfo')}
        </Text>

        <Card
          style={styles.formCard}
        >

          {/* PHONE */}

          <TextField
            label={t(
              'phoneLabel'
            )}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={10}
            placeholder={t(
              'phonePlaceholder'
            )}
            helper={t(
              'phoneHelper'
            )}
            accessibilityLabel={t(
              'phoneLabel'
            )}
          />

          {/* NAME */}

          <TextField
            label={t(
              'nameLabel'
            )}
            value={name}
            onChangeText={setName}
            placeholder={t(
              'namePlaceholder'
            )}
            style={
              styles.fieldGap
            }
            accessibilityLabel={t(
              'nameLabel'
            )}
          />

        </Card>

        {/* ================================================= */}
        {/* DEVELOPMENT TEST ACCOUNTS */}
        {/* ================================================= */}

        {DEV_AUTH_ENABLED ? (
          <View
            style={
              styles.devSection
            }
          >

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Development test accounts"
              accessibilityState={{
                expanded:
                  devExpanded,
              }}
              hitSlop={{
                top: 8,
                bottom: 8,
                left: 8,
                right: 8,
              }}
              onPress={() =>
                setDevExpanded(
                  prev => !prev
                )
              }
              style={({
                pressed,
              }) => [
                styles.devToggle,
                pressed &&
                  styles.devTogglePressed,
              ]}
            >

              <View
                style={
                  styles.devToggleText
                }
              >
                <Text
                  style={[
                    TYPOGRAPHY.caption,
                    styles.devToggleTitle,
                  ]}
                >
                  {t('devTitle')}
                </Text>

                <Text
                  style={
                    TYPOGRAPHY.footnote
                  }
                >
                  {t('devNote')}
                </Text>
              </View>

              <Text
                style={
                  styles.devChevron
                }
              >
                {devExpanded
                  ? '▲'
                  : '▼'}
              </Text>

            </Pressable>

            {devExpanded ? (
              <View
                style={
                  styles.devChips
                }
              >

                <Chip
                  label={t(
                    'devArtisanChip'
                  )}
                  selected={
                    phone ===
                    '9848012345'
                  }
                  onPress={() =>
                    handleDevAccountSelect(
                      '9848012345'
                    )
                  }
                />

                <Chip
                  label={t(
                    'devCustomerChip'
                  )}
                  selected={
                    phone ===
                    '9820044556'
                  }
                  onPress={() =>
                    handleDevAccountSelect(
                      '9820044556'
                    )
                  }
                />

              </View>
            ) : null}

          </View>
        ) : null}

        {/* ================================================= */}
        {/* BOTTOM BUTTON */}
        {/* ================================================= */}

        <View
          style={styles.footer}
        >

          {statusMessage ? (
            <Text
              style={[
                TYPOGRAPHY.footnote,
                styles.status,
                statusError
                  ? styles.statusError
                  : styles.statusOk,
              ]}
            >
              {statusMessage}
            </Text>
          ) : null}

          <Button
            title={t(
              'verifyBtn'
            )}
            onPress={
              handleVerify
            }
            loading={
              isVerifying
            }
            disabled={
              isVerifying ||
              !canVerify
            }
            accessibilityLabel={t(
              'verifyBtn'
            )}
          />

        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

/* ========================================================= */
/* STYLES */
/* ========================================================= */

const styles =
  StyleSheet.create({

    safeArea: {
      flex: 1,
      backgroundColor:
        PALETTE.background,
    },

    scroll: {
      flex: 1,
    },

    container: {
      flexGrow: 1,

      paddingHorizontal:
        SPACING.lg,

      paddingTop:
        SPACING.md,

      paddingBottom:
        SPACING.xl * 2,
    },

    /* ---------------- LOGO ---------------- */

    logoContainer: {
      width: '100%',

      alignItems:
        'center',

      justifyContent:
        'center',

      marginBottom:
        SPACING.md,

      paddingTop:
        SPACING.sm,
    },

    logo: {
      width: 150,
      height: 150,
    },

    /* ---------------- HEADER ---------------- */

    headerCard: {
      padding:
        SPACING.lg,

      alignItems:
        'center',

      backgroundColor:
        PALETTE.surface,

      borderColor:
        PALETTE.surfaceBorder,
    },

    headerTitle: {
      marginTop:
        SPACING.sm,

      marginBottom:
        SPACING.xs,

      textAlign:
        'center',
    },

    subtitle: {
      color:
        PALETTE.textMuted,

      textAlign:
        'center',

      fontSize: 14,
    },

    /* ---------------- SECTION ---------------- */

    sectionLabel: {
      marginTop:
        SPACING.xl,

      marginBottom:
        SPACING.sm,

      color:
        PALETTE.textPrimary,

      fontWeight:
        '600',
    },

    /* ---------------- ROLE CARDS ---------------- */

    roleRow: {
      flexDirection:
        'row',

      gap:
        SPACING.md,
    },

    roleCard: {
      flex: 1,

      minHeight: 120,

      padding:
        SPACING.md,

      gap:
        SPACING.xs,

      borderWidth: 1,

      borderColor:
        PALETTE.surfaceBorder,

      backgroundColor:
        PALETTE.surface,
    },

    roleCardSelected: {
      borderColor:
        PALETTE.primary,

      backgroundColor:
        PALETTE.surfaceHighlight,
    },

    roleEmoji: {
      fontSize: 26,

      marginBottom:
        SPACING.xs,
    },

    roleTitle: {
      color:
        PALETTE.textPrimary,

      fontSize: 16,

      fontWeight:
        '700',
    },

    roleDescription: {
      color:
        PALETTE.textMuted,

      fontSize: 13,

      lineHeight: 18,
    },

    /* ---------------- FORM ---------------- */

    formCard: {
      padding:
        SPACING.lg,

      backgroundColor:
        PALETTE.surface,

      borderColor:
        PALETTE.surfaceBorder,
    },

    fieldGap: {
      marginTop:
        SPACING.md,
    },

    /* ---------------- DEV ---------------- */

    devSection: {
      marginTop:
        SPACING.xl,
    },

    devToggle: {
      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      minHeight:
        TOUCH_TARGET.minHeight,
    },

    devTogglePressed: {
      opacity: 0.7,
    },

    devToggleText: {
      flex: 1,

      marginRight:
        SPACING.md,
    },

    devToggleTitle: {
      color:
        PALETTE.warning,
    },

    devChevron: {
      color:
        PALETTE.textMuted,

      fontSize: 12,
    },

    devChips: {
      flexDirection:
        'row',

      flexWrap:
        'wrap',

      gap:
        SPACING.sm,

      marginTop:
        SPACING.xs,
    },

    /* ---------------- FOOTER ---------------- */

    footer: {
      marginTop:
        SPACING.xl,

      paddingTop:
        SPACING.lg,

      borderTopWidth:
        1,

      borderTopColor:
        PALETTE.surfaceBorder,
    },

    status: {
      marginBottom:
        SPACING.sm,

      textAlign:
        'center',
    },

    statusOk: {
      color:
        PALETTE.primaryLight,
    },

    statusError: {
      color:
        PALETTE.error,
    },

  });