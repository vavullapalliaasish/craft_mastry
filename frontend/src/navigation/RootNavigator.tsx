import React, { useEffect, useState } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import { AuthStackNavigator } from './AuthStackNavigator';
import { ArtisanTabNavigator } from './ArtisanTabNavigator';
import { CustomerTabNavigator } from './CustomerTabNavigator';

import {
  AuthAdapter,
  AuthUser,
} from '../adapters/auth';

import { PALETTE } from '../theme/tokens';
import { VoiceAssistant } from '../components/VoiceAssistant';

export const RootNavigator: React.FC = () => {
  const [currentUser, setCurrentUser] =
    useState<AuthUser | null>(null);

  const [isLoading, setIsLoading] =
    useState<boolean>(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const user =
          await AuthAdapter.getCurrentUser();

        setCurrentUser(user);
      } catch (err) {
        console.warn(
          '[RootNavigator] Session check error:',
          err
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  const handleAuthenticated = (
    user: AuthUser
  ) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    try {
      await AuthAdapter.signOut();
    } catch (err) {
      console.warn(
        '[RootNavigator] Logout error:',
        err
      );
    }

    setCurrentUser(null);
  };

  const handleSwitchRole = (
    newRole: 'ARTISAN' | 'CUSTOMER'
  ) => {
    if (!currentUser) return;

    setCurrentUser({
      ...currentUser,
      role: newRole,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={PALETTE.primary}
        />
      </View>
    );
  }

  const voiceRole =
    currentUser?.role === 'ARTISAN'
      ? 'ARTISAN'
      : currentUser?.role === 'CUSTOMER'
        ? 'CUSTOMER'
        : 'GUEST';

  return (
    <View style={styles.root}>

      <NavigationContainer
        theme={{
          dark: false,

          colors: {
            primary: PALETTE.primary,
            background: PALETTE.background,
            card: PALETTE.surface,
            text: PALETTE.textPrimary,
            border: PALETTE.surfaceBorder,
            notification: PALETTE.primaryLight,
          },

          fonts: {
            regular: {
              fontFamily: 'System',
              fontWeight: '400',
            },

            medium: {
              fontFamily: 'System',
              fontWeight: '500',
            },

            bold: {
              fontFamily: 'System',
              fontWeight: '700',
            },

            heavy: {
              fontFamily: 'System',
              fontWeight: '900',
            },
          },
        }}
      >

        {!currentUser ? (

          <AuthStackNavigator
            onAuthenticated={
              handleAuthenticated
            }
            initialRouteName="WelcomeLanguage"
          />

        ) : currentUser.role === 'ARTISAN' ? (

          <ArtisanTabNavigator
            onLogout={handleLogout}
            onSwitchRole={handleSwitchRole}
          />

        ) : (

          <CustomerTabNavigator
            onLogout={handleLogout}
            onSwitchRole={handleSwitchRole}
          />

        )}

      </NavigationContainer>

      {/*
        IMPORTANT:

        VoiceAssistant is outside NavigationContainer.

        Therefore it remains available on:
        - Language selection
        - Login
        - Register
        - Onboarding
        - Artisan dashboard
        - Catalog
        - Upload
        - Messages
        - Account
        - Buyer screens
      */}

      <VoiceAssistant
        role={voiceRole}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor:
      PALETTE.background,

    alignItems: 'center',
    justifyContent: 'center',
  },
});