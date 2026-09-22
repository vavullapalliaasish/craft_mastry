import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { DashboardScreen } from '../screens/artisan/DashboardScreen';
import { CatalogScreen } from '../screens/artisan/CatalogScreen';
import { UploadScreen } from '../screens/artisan/UploadScreen';
import { MessagesScreen } from '../screens/artisan/MessagesScreen';
import { OrdersScreen } from '../screens/artisan/OrdersScreen';
import { ProfileScreen } from '../screens/artisan/ProfileScreen';
import { PALETTE, RADIUS, TOUCH_TARGET } from '../theme/tokens';
import { useLanguage } from '../i18n/LanguageContext';

export type ArtisanTabParamList = {
  Dashboard: undefined;
  Catalog: undefined;
  UploadWizard: undefined;
  Messages: undefined;
  Orders: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<ArtisanTabParamList>();

const NAV_TEXT: Record<string, Record<string, string>> = {
  en: { dashboard: 'Dashboard', catalog: 'My Products', add: 'Add Craft', messages: 'Messages', orders: 'Orders', profile: 'Profile' },
  te: { dashboard: 'డ్యాష్‌బోర్డ్', catalog: 'నా ఉత్పత్తులు', add: 'క్రాఫ్ట్ జోడించండి', messages: 'సందేశాలు', orders: 'ఆర్డర్లు', profile: 'ప్రొఫైల్' },
  hi: { dashboard: 'डैशबोर्ड', catalog: 'मेरे उत्पाद', add: 'शिल्प जोड़ें', messages: 'संदेश', orders: 'ऑर्डर', profile: 'प्रोफ़ाइल' },
  ta: { dashboard: 'டாஷ்போர்டு', catalog: 'என் பொருட்கள்', add: 'கைவினை சேர்', messages: 'செய்திகள்', orders: 'ஆர்டர்கள்', profile: 'சுயவிவரம்' },
  kn: { dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', catalog: 'ನನ್ನ ಉತ್ಪನ್ನಗಳು', add: 'ಕರಕುಶಲ ಸೇರಿಸಿ', messages: 'ಸಂದೇಶಗಳು', orders: 'ಆರ್ಡರ್‌ಗಳು', profile: 'ಪ್ರೊಫೈಲ್' },
  mr: { dashboard: 'डॅशबोर्ड', catalog: 'माझी उत्पादने', add: 'कलाकृती जोडा', messages: 'संदेश', orders: 'ऑर्डर्स', profile: 'प्रोफाइल' },
  bn: { dashboard: 'ড্যাশবোর্ড', catalog: 'আমার পণ্য', add: 'কারুশিল্প যোগ করুন', messages: 'বার্তা', orders: 'অর্ডার', profile: 'প্রোফাইল' },
  ml: { dashboard: 'ഡാഷ്ബോർഡ്', catalog: 'എന്റെ ഉൽപ്പന്നങ്ങൾ', add: 'കരകൗശലം ചേർക്കുക', messages: 'സന്ദേശങ്ങൾ', orders: 'ഓർഡറുകൾ', profile: 'പ്രൊഫൈൽ' },
  gu: { dashboard: 'ડેશબોર્ડ', catalog: 'મારા ઉત્પાદનો', add: 'હસ્તકલા ઉમેરો', messages: 'સંદેશા', orders: 'ઓર્ડર', profile: 'પ્રોફાઇલ' },
  pa: { dashboard: 'ਡੈਸ਼ਬੋਰਡ', catalog: 'ਮੇਰੇ ਉਤਪਾਦ', add: 'ਕਲਾ ਜੋੜੋ', messages: 'ਸੁਨੇਹੇ', orders: 'ਆਰਡਰ', profile: 'ਪ੍ਰੋਫ਼ਾਈਲ' },
  or: { dashboard: 'ଡ୍ୟାସବୋର୍ଡ', catalog: 'ମୋ ଉତ୍ପାଦ', add: 'କାରୁକାର୍ଯ୍ୟ ଯୋଡନ୍ତୁ', messages: 'ସନ୍ଦେଶ', orders: 'ଅର୍ଡର୍', profile: 'ପ୍ରୋଫାଇଲ୍' },
  as: { dashboard: 'ডেশ্বব’ৰ্ড', catalog: 'মোৰ সামগ্ৰী', add: 'শিল্প যোগ কৰক', messages: 'বাৰ্তা', orders: 'অৰ্ডাৰ', profile: 'প্ৰফাইল' },
  ur: { dashboard: 'ڈیش بورڈ', catalog: 'میری مصنوعات', add: 'ہنر شامل کریں', messages: 'پیغامات', orders: 'آرڈرز', profile: 'پروفائل' },
};

export const ArtisanTabNavigator: React.FC<{
  onLogout?: () => void;
  onSwitchRole?: (role: 'CUSTOMER') => void;
}> = ({ onLogout, onSwitchRole }) => {
  const { lang } = useLanguage();
  const nav = NAV_TEXT[lang] || NAV_TEXT.en;

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: PALETTE.surface,
          borderTopColor: PALETTE.surfaceBorder,
          borderTopWidth: 1,
          height: 64,
          paddingTop: 5,
          paddingBottom: 8,
          ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.25, shadowRadius: 8 },
            android: { elevation: 10 },
          }),
        },
        tabBarActiveTintColor: PALETTE.primary,
        tabBarInactiveTintColor: PALETTE.textMuted,
        tabBarLabelStyle: { fontSize: 9, fontWeight: '600', letterSpacing: 0.1 },
        tabBarItemStyle: { minHeight: TOUCH_TARGET.minHeight, paddingVertical: 0 },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
          if (route.name === 'Dashboard') iconName = focused ? 'speedometer' : 'speedometer-outline';
          if (route.name === 'Catalog') iconName = focused ? 'grid' : 'grid-outline';
          if (route.name === 'UploadWizard') iconName = focused ? 'add-circle' : 'add-circle-outline';
          if (route.name === 'Messages') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          if (route.name === 'Orders') iconName = focused ? 'receipt' : 'receipt-outline';
          if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Ionicons name={iconName} size={size} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" options={{ tabBarLabel: nav.dashboard }}>
        {(props) => <DashboardScreen {...props} onSwitchRole={onSwitchRole} />}
      </Tab.Screen>
      <Tab.Screen name="Catalog" component={CatalogScreen} options={{ tabBarLabel: nav.catalog }} />
      <Tab.Screen name="UploadWizard" component={UploadScreen} options={{ tabBarLabel: nav.add }} />
      <Tab.Screen name="Messages" component={MessagesScreen} options={{ tabBarLabel: nav.messages }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ tabBarLabel: nav.orders }} />
      <Tab.Screen name="Profile" options={{ tabBarLabel: nav.profile }}>
        {() => <ProfileScreen onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconWrap: { minWidth: 44, height: 30, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center' },
  iconWrapActive: { backgroundColor: PALETTE.primaryMuted },
});
