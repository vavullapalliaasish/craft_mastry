import React from 'react';

import {
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import { Ionicons } from '@expo/vector-icons';

import { DashboardScreen } from '../screens/artisan/DashboardScreen';
import { CatalogScreen } from '../screens/artisan/CatalogScreen';
import { UploadScreen } from '../screens/artisan/UploadScreen';
import { MessagesScreen } from '../screens/artisan/MessagesScreen';
import { ProfileScreen } from '../screens/artisan/ProfileScreen';
import { OrdersScreen } from '../screens/artisan/OrdersScreen';
import { RADIUS, TOUCH_TARGET } from '../theme/tokens';

export type ArtisanTabParamList = {
  Dashboard: undefined;
  Catalog: undefined;
  UploadWizard: undefined;
  Orders: undefined;
  Messages: undefined;
  Profile: undefined;
};

const Tab =
  createBottomTabNavigator<ArtisanTabParamList>();

interface Props {
  onLogout?: () => void;
  onSwitchRole?: (
    role: 'CUSTOMER',
  ) => void;
}

export const ArtisanTabNavigator: React.FC<Props> = ({
  onLogout,
  onSwitchRole,
}) => {
  const { width } =
    useWindowDimensions();

  const isDesktop = width >= 1000;

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarStyle: [
          styles.tabBar,

          isDesktop
            ? styles.desktopTabBar
            : null,
        ],

        tabBarActiveTintColor:
          '#75431F',

        tabBarInactiveTintColor:
          '#8A817B',

        tabBarLabelStyle:
          styles.tabLabel,

        tabBarItemStyle:
          styles.tabItem,

        tabBarIcon: ({
          color,
          size,
          focused,
        }) => {
          let iconName:
            keyof typeof Ionicons.glyphMap =
            'home-outline';

          if (
            route.name ===
            'Dashboard'
          ) {
            iconName = focused
              ? 'home'
              : 'home-outline';
          }

          if (
            route.name ===
            'Catalog'
          ) {
            iconName = focused
              ? 'grid'
              : 'grid-outline';
          }

          if (
            route.name ===
            'UploadWizard'
          ) {
            return (
              <View
                style={[
                  styles.addProductButton,
                  focused &&
                    styles.addProductButtonFocused,
                ]}
              >
                <Ionicons
                  name="add"
                  size={29}
                  color="#FFFFFF"
                />
              </View>
            );
          }
          if (route.name === 'Orders')
  iconName = focused
    ? 'receipt'
    : 'receipt-outline';

          if (
            route.name ===
            'Messages'
          ) {
            iconName = focused
              ? 'chatbubble'
              : 'chatbubble-outline';
          }

          if (
            route.name ===
            'Profile'
          ) {
            iconName = focused
              ? 'person'
              : 'person-outline';
          }

          return (
            <View
              style={[
                styles.iconWrap,
                focused &&
                  styles.iconWrapActive,
              ]}
            >
              <Ionicons
                name={iconName}
                size={size}
                color={color}
              />
            </View>
          );
        },
      })}
    >
      {/* Dashboard */}
      <Tab.Screen name="Dashboard">
        {(props) => (
          <DashboardScreen
            {...props}
            onSwitchRole={
              onSwitchRole
            }
          />
        )}
      </Tab.Screen>

      {/* Products */}
      <Tab.Screen
        name="Catalog"
        component={CatalogScreen}
        options={{
          tabBarLabel: 'My Products',
        }}
      />

      {/* Add Product */}
      <Tab.Screen
        name="UploadWizard"
        component={UploadScreen}
        options={{
          tabBarLabel: 'Add Product',
        }}
      />
      <Tab.Screen
  name="Orders"
  component={OrdersScreen}
/>

      {/* Messages */}
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarLabel: 'Messages',
        }}
      />

      {/* Profile */}
      <Tab.Screen name="Profile">
        {() => (
          <ProfileScreen
            onLogout={onLogout}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  /*
  |--------------------------------------------------------------------------
  | Bottom navigation
  |--------------------------------------------------------------------------
  */

  tabBar: {
    height: Platform.OS === 'ios' ? 78 : 70,

    backgroundColor: '#FFFFFF',

    borderTopWidth: 1,
    borderTopColor: '#E9E0D8',

    paddingTop: 7,
    paddingBottom:
      Platform.OS === 'ios'
        ? 10
        : 7,

    shadowColor: '#000000',

    shadowOffset: {
      width: 0,
      height: -3,
    },

    shadowOpacity: 0.08,
    shadowRadius: 8,

    elevation: 8,
  },

  /*
  |--------------------------------------------------------------------------
  | Desktop
  |--------------------------------------------------------------------------
  |
  | Dashboard has its own left sidebar on desktop.
  | Therefore we hide the bottom navigator there.
  |--------------------------------------------------------------------------
  */

  desktopTabBar: {
    display: 'none',
  },

  tabItem: {
    minHeight: TOUCH_TARGET.minHeight,
    flex: 1,
    minWidth: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },

  tabLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0,
    marginTop: -1,
  },

  iconWrap: {
    width: 54,
    height: 30,

    borderRadius:
      RADIUS.full,

    alignItems: 'center',
    justifyContent: 'center',
  },

  iconWrapActive: {
    backgroundColor: '#F2E6DA',
  },

  /*
  |--------------------------------------------------------------------------
  | Center Add Product
  |--------------------------------------------------------------------------
  */

  addProductButton: {
    width: 46,
    height: 46,

    borderRadius: 23,

    backgroundColor: '#75431F',

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: -13,

    borderWidth: 4,
    borderColor: '#FFFFFF',

    shadowColor: '#75431F',

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.25,
    shadowRadius: 7,

    elevation: 7,
  },

  addProductButtonFocused: {
    transform: [
      {
        scale: 1.04,
      },
    ],
  },
});