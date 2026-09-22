import React, {
  useEffect,
  useState,
} from 'react';

import { useNavigation } from '@react-navigation/native';

import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  AuthAdapter,
  AuthUser,
} from '../../adapters/auth';

import {
  StorageAdapter,
} from '../../adapters/storage';

import {
  ApiAdapter,
} from '../../adapters/api';

import {
  useLanguage,
} from '../../i18n/LanguageContext';

import {
  BackHeader,
} from '../../components/ui/BackHeader';

/* =====================================================
   PROPS
===================================================== */

interface Props {
  onLogout?: () => void;
}

/* =====================================================
   LANGUAGE NAMES
===================================================== */

const languageNames: Record<
  string,
  string
> = {
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

/* =====================================================
   LANGUAGE OPTIONS
===================================================== */

const languageOptions = [
  {
    code: 'en',
    name: 'English',
  },
  {
    code: 'te',
    name: 'తెలుగు',
  },
  {
    code: 'hi',
    name: 'हिन्दी',
  },
  {
    code: 'ta',
    name: 'தமிழ்',
  },
  {
    code: 'kn',
    name: 'ಕನ್ನಡ',
  },
  {
    code: 'mr',
    name: 'मराठी',
  },
  {
    code: 'bn',
    name: 'বাংলা',
  },
  {
    code: 'ml',
    name: 'മലയാളം',
  },
  {
    code: 'gu',
    name: 'ગુજરાતી',
  },
  {
    code: 'pa',
    name: 'ਪੰਜਾਬੀ',
  },
  {
    code: 'or',
    name: 'ଓଡ଼ିଆ',
  },
  {
    code: 'as',
    name: 'অসমীয়া',
  },
  {
    code: 'ur',
    name: 'اردو',
  },
];


const PROFILE_TEXT: Record<string, Record<string, string>> = {
  en: {
    profile:'Profile', myProfile:'My Profile', manage:'Manage your information and preferences', artisan:'Artisan', customer:'Customer', loading:'Loading...', bio:'Creating handmade crafts with love 🌿', proud:'Proud to be', creator:'a Creator ♥', personal:'Personal Information', edit:'Edit', name:'Name', mobile:'Mobile Number', email:'Email', notAdded:'Not added', add:'Add', location:'Location', update:'Update', language:'Language', change:'Change', account:'Account Actions', changePin:'Change PIN', updatePin:'Update your 4-digit PIN', signOut:'Sign Out', logoutDesc:'Log out from your account', journey:'Craft Journey', productsListed:'Products Listed', ordersReceived:'Orders Received', shopRating:'Shop Rating', quote:'“Every craft tells a story,\nand you are the storyteller.”', settings:'Quick Settings', notifications:'Notifications', notificationsDesc:'Receive updates about orders and messages', audio:'Audio Assistance', audioDesc:'Hear descriptions in your selected language', keep:'Keep Creating', keepDesc:'Your crafts make the world more beautiful!', editProfile:'Edit Profile', enterName:'Enter your name', enterEmail:'Enter your email', enterLocation:'Enter your location', cancel:'Cancel', save:'Save', saving:'Saving...', changeLanguage:'Change Language', currentPin:'Current PIN', newPin:'New PIN', confirmPin:'Confirm New PIN', pinPlaceholder:'4-digit PIN', savePin:'Save PIN', invalidName:'Invalid name', nameRequired:'Please enter your name.', invalidEmail:'Invalid email', validEmail:'Please enter a valid email.', sessionError:'Session Error', sessionMissing:'Authentication session not found. Please log in again.', profileUpdated:'Profile Updated', profileSaved:'Your profile information was saved successfully.', error:'Error', saveProfileError:'Unable to save profile.', invalidPin:'Invalid PIN', currentPinDigits:'Current PIN must contain exactly 4 digits.', newPinDigits:'New PIN must contain exactly 4 digits.', pinMismatch:'PIN mismatch', pinNotMatch:'New PIN and confirmation PIN do not match.', incorrectPin:'Incorrect PIN', incorrectPinText:'The current PIN is incorrect.', pinUpdated:'PIN Updated', pinUpdatedText:'Your 4-digit PIN was changed successfully.', changeLanguageError:'Unable to change language.', confirmSignOut:'Are you sure you want to sign out?', signOutFailed:'Sign Out Failed', signOutFailedText:'Unable to sign out. Please try again.'
  },
  te: {
    profile:'ప్రొఫైల్', myProfile:'నా ప్రొఫైల్', manage:'మీ సమాచారం మరియు ప్రాధాన్యతలను నిర్వహించండి', artisan:'కళాకారుడు', customer:'కస్టమర్', loading:'లోడ్ అవుతోంది...', bio:'ప్రేమతో చేతితో తయారు చేసిన కళాకృతులను సృష్టిస్తున్నాను 🌿', proud:'గర్వంగా', creator:'ఒక సృష్టికర్త ♥', personal:'వ్యక్తిగత సమాచారం', edit:'మార్చు', name:'పేరు', mobile:'మొబైల్ నంబర్', email:'ఈమెయిల్', notAdded:'జోడించలేదు', add:'జోడించు', location:'స్థానం', update:'అప్‌డేట్', language:'భాష', change:'మార్చు', account:'ఖాతా చర్యలు', changePin:'PIN మార్చండి', updatePin:'మీ 4 అంకెల PINని అప్‌డేట్ చేయండి', signOut:'సైన్ అవుట్', logoutDesc:'మీ ఖాతా నుండి బయటకు వెళ్లండి', journey:'కళా ప్రయాణం', productsListed:'జాబితా చేసిన ఉత్పత్తులు', ordersReceived:'అందుకున్న ఆర్డర్లు', shopRating:'షాప్ రేటింగ్', quote:'“ప్రతి కళ ఒక కథ చెబుతుంది,\nమీరు ఆ కథ చెప్పే సృష్టికర్త.”', settings:'త్వరిత సెట్టింగ్స్', notifications:'నోటిఫికేషన్లు', notificationsDesc:'ఆర్డర్లు మరియు సందేశాల అప్‌డేట్లు పొందండి', audio:'ఆడియో సహాయం', audioDesc:'మీ ఎంపిక చేసిన భాషలో వివరాలు వినండి', keep:'సృష్టిస్తూ ఉండండి', keepDesc:'మీ కళాకృతులు ప్రపంచాన్ని మరింత అందంగా చేస్తాయి!', editProfile:'ప్రొఫైల్ మార్చండి', enterName:'మీ పేరు నమోదు చేయండి', enterEmail:'మీ ఈమెయిల్ నమోదు చేయండి', enterLocation:'మీ స్థానం నమోదు చేయండి', cancel:'రద్దు', save:'సేవ్', saving:'సేవ్ అవుతోంది...', changeLanguage:'భాష మార్చండి', currentPin:'ప్రస్తుత PIN', newPin:'కొత్త PIN', confirmPin:'కొత్త PIN నిర్ధారించండి', pinPlaceholder:'4 అంకెల PIN', savePin:'PIN సేవ్ చేయండి', invalidName:'చెల్లని పేరు', nameRequired:'దయచేసి మీ పేరు నమోదు చేయండి.', invalidEmail:'చెల్లని ఈమెయిల్', validEmail:'దయచేసి సరైన ఈమెయిల్ నమోదు చేయండి.', sessionError:'సెషన్ లోపం', sessionMissing:'లాగిన్ సెషన్ కనబడలేదు. దయచేసి మళ్లీ లాగిన్ చేయండి.', profileUpdated:'ప్రొఫైల్ అప్‌డేట్ అయింది', profileSaved:'మీ ప్రొఫైల్ సమాచారం విజయవంతంగా సేవ్ అయింది.', error:'లోపం', saveProfileError:'ప్రొఫైల్ సేవ్ చేయలేకపోయాము.', invalidPin:'చెల్లని PIN', currentPinDigits:'ప్రస్తుత PINలో ఖచ్చితంగా 4 అంకెలు ఉండాలి.', newPinDigits:'కొత్త PINలో ఖచ్చితంగా 4 అంకెలు ఉండాలి.', pinMismatch:'PIN సరిపోలలేదు', pinNotMatch:'కొత్త PIN మరియు నిర్ధారణ PIN సరిపోలలేదు.', incorrectPin:'తప్పు PIN', incorrectPinText:'ప్రస్తుత PIN తప్పుగా ఉంది.', pinUpdated:'PIN అప్‌డేట్ అయింది', pinUpdatedText:'మీ 4 అంకెల PIN విజయవంతంగా మార్చబడింది.', changeLanguageError:'భాష మార్చలేకపోయాము.', confirmSignOut:'మీరు నిజంగా సైన్ అవుట్ చేయాలనుకుంటున్నారా?', signOutFailed:'సైన్ అవుట్ విఫలమైంది', signOutFailedText:'సైన్ అవుట్ చేయలేకపోయాము. మళ్లీ ప్రయత్నించండి.'
  },
  hi: { profile:'प्रोफ़ाइल',myProfile:'मेरी प्रोफ़ाइल',manage:'अपनी जानकारी और प्राथमिकताएँ प्रबंधित करें',artisan:'कारीगर',customer:'ग्राहक',loading:'लोड हो रहा है...',bio:'प्यार से हस्तनिर्मित शिल्प बनाना 🌿',proud:'गर्व से',creator:'एक निर्माता ♥',personal:'व्यक्तिगत जानकारी',edit:'संपादित करें',name:'नाम',mobile:'मोबाइल नंबर',email:'ईमेल',notAdded:'जोड़ा नहीं गया',add:'जोड़ें',location:'स्थान',update:'अपडेट',language:'भाषा',change:'बदलें',account:'खाता क्रियाएँ',changePin:'PIN बदलें',updatePin:'अपना 4 अंकों का PIN अपडेट करें',signOut:'साइन आउट',logoutDesc:'अपने खाते से बाहर निकलें',journey:'शिल्प यात्रा',productsListed:'सूचीबद्ध उत्पाद',ordersReceived:'प्राप्त ऑर्डर',shopRating:'दुकान रेटिंग',quote:'“हर शिल्प एक कहानी कहता है,\nऔर आप उस कहानी के रचनाकार हैं।”',settings:'त्वरित सेटिंग्स',notifications:'सूचनाएँ',notificationsDesc:'ऑर्डर और संदेशों के अपडेट पाएँ',audio:'ऑडियो सहायता',audioDesc:'अपनी चुनी भाषा में विवरण सुनें',keep:'बनाते रहें',keepDesc:'आपके शिल्प दुनिया को और सुंदर बनाते हैं!',editProfile:'प्रोफ़ाइल संपादित करें',enterName:'अपना नाम दर्ज करें',enterEmail:'अपना ईमेल दर्ज करें',enterLocation:'अपना स्थान दर्ज करें',cancel:'रद्द करें',save:'सहेजें',saving:'सहेजा जा रहा है...',changeLanguage:'भाषा बदलें',currentPin:'वर्तमान PIN',newPin:'नया PIN',confirmPin:'नया PIN पुष्टि करें',pinPlaceholder:'4 अंकों का PIN',savePin:'PIN सहेजें',invalidName:'अमान्य नाम',nameRequired:'कृपया अपना नाम दर्ज करें।',invalidEmail:'अमान्य ईमेल',validEmail:'कृपया सही ईमेल दर्ज करें।',sessionError:'सत्र त्रुटि',sessionMissing:'प्रमाणीकरण सत्र नहीं मिला। कृपया फिर लॉगिन करें।',profileUpdated:'प्रोफ़ाइल अपडेट',profileSaved:'आपकी प्रोफ़ाइल जानकारी सफलतापूर्वक सहेजी गई।',error:'त्रुटि',saveProfileError:'प्रोफ़ाइल सहेजी नहीं जा सकी।',invalidPin:'अमान्य PIN',currentPinDigits:'वर्तमान PIN में ठीक 4 अंक होने चाहिए।',newPinDigits:'नए PIN में ठीक 4 अंक होने चाहिए।',pinMismatch:'PIN मेल नहीं खाता',pinNotMatch:'नया PIN और पुष्टि PIN मेल नहीं खाते।',incorrectPin:'गलत PIN',incorrectPinText:'वर्तमान PIN गलत है।',pinUpdated:'PIN अपडेट',pinUpdatedText:'आपका 4 अंकों का PIN सफलतापूर्वक बदल दिया गया।',changeLanguageError:'भाषा बदली नहीं जा सकी।',confirmSignOut:'क्या आप साइन आउट करना चाहते हैं?',signOutFailed:'साइन आउट विफल',signOutFailedText:'साइन आउट नहीं हो सका। फिर प्रयास करें।'},
  ta: { profile:'சுயவிவரம்',myProfile:'என் சுயவிவரம்',manage:'உங்கள் தகவல் மற்றும் விருப்பங்களை நிர்வகிக்கவும்',artisan:'கைவினைஞர்',customer:'வாடிக்கையாளர்',loading:'ஏற்றுகிறது...',bio:'அன்புடன் கைவினைப் பொருட்களை உருவாக்குகிறேன் 🌿',proud:'பெருமையுடன்',creator:'ஒரு படைப்பாளர் ♥',personal:'தனிப்பட்ட தகவல்',edit:'திருத்து',name:'பெயர்',mobile:'மொபைல் எண்',email:'மின்னஞ்சல்',notAdded:'சேர்க்கப்படவில்லை',add:'சேர்',location:'இடம்',update:'புதுப்பி',language:'மொழி',change:'மாற்று',account:'கணக்கு செயல்கள்',changePin:'PIN மாற்று',updatePin:'4 இலக்க PIN ஐ புதுப்பிக்கவும்',signOut:'வெளியேறு',logoutDesc:'உங்கள் கணக்கிலிருந்து வெளியேறவும்',journey:'கைவினைப் பயணம்',productsListed:'பட்டியலிட்ட பொருட்கள்',ordersReceived:'பெற்ற ஆர்டர்கள்',shopRating:'கடை மதிப்பீடு',quote:'“ஒவ்வொரு கைவினையும் ஒரு கதையைச் சொல்கிறது,\nநீங்கள் அந்தக் கதையின் படைப்பாளர்.”',settings:'விரைவு அமைப்புகள்',notifications:'அறிவிப்புகள்',notificationsDesc:'ஆர்டர்கள் மற்றும் செய்தி புதுப்பிப்புகளைப் பெறுங்கள்',audio:'ஆடியோ உதவி',audioDesc:'தேர்ந்தெடுத்த மொழியில் விளக்கங்களைக் கேளுங்கள்',keep:'தொடர்ந்து உருவாக்குங்கள்',keepDesc:'உங்கள் கைவினைகள் உலகை அழகாக்குகின்றன!',editProfile:'சுயவிவரத்தைத் திருத்து',enterName:'உங்கள் பெயரை உள்ளிடவும்',enterEmail:'உங்கள் மின்னஞ்சலை உள்ளிடவும்',enterLocation:'உங்கள் இருப்பிடத்தை உள்ளிடவும்',cancel:'ரத்து',save:'சேமி',saving:'சேமிக்கிறது...',changeLanguage:'மொழியை மாற்று',currentPin:'தற்போதைய PIN',newPin:'புதிய PIN',confirmPin:'புதிய PIN உறுதிப்படுத்து',pinPlaceholder:'4 இலக்க PIN',savePin:'PIN சேமி',invalidName:'தவறான பெயர்',nameRequired:'உங்கள் பெயரை உள்ளிடவும்.',invalidEmail:'தவறான மின்னஞ்சல்',validEmail:'சரியான மின்னஞ்சலை உள்ளிடவும்.',sessionError:'அமர்வு பிழை',sessionMissing:'அங்கீகார அமர்வு இல்லை. மீண்டும் உள்நுழையவும்.',profileUpdated:'சுயவிவரம் புதுப்பிக்கப்பட்டது',profileSaved:'உங்கள் சுயவிவரம் வெற்றிகரமாக சேமிக்கப்பட்டது.',error:'பிழை',saveProfileError:'சுயவிவரத்தைச் சேமிக்க முடியவில்லை.',invalidPin:'தவறான PIN',currentPinDigits:'தற்போதைய PIN இல் 4 இலக்கங்கள் இருக்க வேண்டும்.',newPinDigits:'புதிய PIN இல் 4 இலக்கங்கள் இருக்க வேண்டும்.',pinMismatch:'PIN பொருந்தவில்லை',pinNotMatch:'புதிய PIN மற்றும் உறுதிப்படுத்தல் PIN பொருந்தவில்லை.',incorrectPin:'தவறான PIN',incorrectPinText:'தற்போதைய PIN தவறாக உள்ளது.',pinUpdated:'PIN புதுப்பிக்கப்பட்டது',pinUpdatedText:'உங்கள் 4 இலக்க PIN வெற்றிகரமாக மாற்றப்பட்டது.',changeLanguageError:'மொழியை மாற்ற முடியவில்லை.',confirmSignOut:'வெளியேற விரும்புகிறீர்களா?',signOutFailed:'வெளியேற முடியவில்லை',signOutFailedText:'மீண்டும் முயற்சிக்கவும்.'},
  kn: { profile:'ಪ್ರೊಫೈಲ್',myProfile:'ನನ್ನ ಪ್ರೊಫೈಲ್',manage:'ನಿಮ್ಮ ಮಾಹಿತಿ ಮತ್ತು ಆದ್ಯತೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ',artisan:'ಕುಶಲಕರ್ಮಿ',customer:'ಗ್ರಾಹಕ',loading:'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',bio:'ಪ್ರೀತಿಯಿಂದ ಕೈಯಿಂದ ತಯಾರಿಸಿದ ಕರಕುಶಲಗಳನ್ನು ಸೃಷ್ಟಿಸುತ್ತೇನೆ 🌿',proud:'ಹೆಮ್ಮೆಯಿಂದ',creator:'ಒಬ್ಬ ಸೃಷ್ಟಿಕರ್ತ ♥',personal:'ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ',edit:'ತಿದ್ದು',name:'ಹೆಸರು',mobile:'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',email:'ಇಮೇಲ್',notAdded:'ಸೇರಿಸಲಾಗಿಲ್ಲ',add:'ಸೇರಿಸಿ',location:'ಸ್ಥಳ',update:'ನವೀಕರಿಸಿ',language:'ಭಾಷೆ',change:'ಬದಲಾಯಿಸಿ',account:'ಖಾತೆ ಕ್ರಮಗಳು',changePin:'PIN ಬದಲಾಯಿಸಿ',updatePin:'4 ಅಂಕಿಯ PIN ನವೀಕರಿಸಿ',signOut:'ಸೈನ್ ಔಟ್',logoutDesc:'ಖಾತೆಯಿಂದ ಹೊರಬನ್ನಿ',journey:'ಕರಕುಶಲ ಪ್ರಯಾಣ',productsListed:'ಪಟ್ಟಿಯಲ್ಲಿರುವ ಉತ್ಪನ್ನಗಳು',ordersReceived:'ಸ್ವೀಕರಿಸಿದ ಆರ್ಡರ್‌ಗಳು',shopRating:'ಅಂಗಡಿ ರೇಟಿಂಗ್',quote:'“ಪ್ರತಿ ಕರಕುಶಲವೂ ಒಂದು ಕಥೆ ಹೇಳುತ್ತದೆ,\nನೀವು ಆ ಕಥೆಯ ಸೃಷ್ಟಿಕರ್ತ.”',settings:'ತ್ವರಿತ ಸೆಟ್ಟಿಂಗ್‌ಗಳು',notifications:'ಅಧಿಸೂಚನೆಗಳು',notificationsDesc:'ಆರ್ಡರ್ ಮತ್ತು ಸಂದೇಶಗಳ ನವೀಕರಣ ಪಡೆಯಿರಿ',audio:'ಆಡಿಯೋ ಸಹಾಯ',audioDesc:'ಆಯ್ಕೆ ಮಾಡಿದ ಭಾಷೆಯಲ್ಲಿ ವಿವರಣೆ ಕೇಳಿ',keep:'ಸೃಷ್ಟಿಸುತ್ತಿರಿ',keepDesc:'ನಿಮ್ಮ ಕರಕುಶಲಗಳು ಜಗತ್ತನ್ನು ಸುಂದರಗೊಳಿಸುತ್ತವೆ!',editProfile:'ಪ್ರೊಫೈಲ್ ತಿದ್ದು',enterName:'ನಿಮ್ಮ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',enterEmail:'ನಿಮ್ಮ ಇಮೇಲ್ ನಮೂದಿಸಿ',enterLocation:'ನಿಮ್ಮ ಸ್ಥಳ ನಮೂದಿಸಿ',cancel:'ರದ್ದು',save:'ಉಳಿಸಿ',saving:'ಉಳಿಸಲಾಗುತ್ತಿದೆ...',changeLanguage:'ಭಾಷೆ ಬದಲಾಯಿಸಿ',currentPin:'ಪ್ರಸ್ತುತ PIN',newPin:'ಹೊಸ PIN',confirmPin:'ಹೊಸ PIN ದೃಢೀಕರಿಸಿ',pinPlaceholder:'4 ಅಂಕಿಯ PIN',savePin:'PIN ಉಳಿಸಿ',invalidName:'ಅಮಾನ್ಯ ಹೆಸರು',nameRequired:'ನಿಮ್ಮ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.',invalidEmail:'ಅಮಾನ್ಯ ಇಮೇಲ್',validEmail:'ಸರಿಯಾದ ಇಮೇಲ್ ನಮೂದಿಸಿ.',sessionError:'ಸೆಷನ್ ದೋಷ',sessionMissing:'ದೃಢೀಕರಣ ಸೆಷನ್ ಸಿಗಲಿಲ್ಲ. ಮತ್ತೆ ಲಾಗಿನ್ ಮಾಡಿ.',profileUpdated:'ಪ್ರೊಫೈಲ್ ನವೀಕರಿಸಲಾಗಿದೆ',profileSaved:'ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ.',error:'ದೋಷ',saveProfileError:'ಪ್ರೊಫೈಲ್ ಉಳಿಸಲಾಗಲಿಲ್ಲ.',invalidPin:'ಅಮಾನ್ಯ PIN',currentPinDigits:'ಪ್ರಸ್ತುತ PIN 4 ಅಂಕಿಗಳನ್ನು ಹೊಂದಿರಬೇಕು.',newPinDigits:'ಹೊಸ PIN 4 ಅಂಕಿಗಳನ್ನು ಹೊಂದಿರಬೇಕು.',pinMismatch:'PIN ಹೊಂದಿಕೆಯಾಗಿಲ್ಲ',pinNotMatch:'ಹೊಸ PIN ಮತ್ತು ದೃಢೀಕರಣ PIN ಹೊಂದಿಕೆಯಾಗಿಲ್ಲ.',incorrectPin:'ತಪ್ಪು PIN',incorrectPinText:'ಪ್ರಸ್ತುತ PIN ತಪ್ಪಾಗಿದೆ.',pinUpdated:'PIN ನವೀಕರಿಸಲಾಗಿದೆ',pinUpdatedText:'ನಿಮ್ಮ 4 ಅಂಕಿಯ PIN ಯಶಸ್ವಿಯಾಗಿ ಬದಲಾಗಿದೆ.',changeLanguageError:'ಭಾಷೆ ಬದಲಾಯಿಸಲಾಗಲಿಲ್ಲ.',confirmSignOut:'ಸೈನ್ ಔಟ್ ಮಾಡಲು ಖಚಿತವೇ?',signOutFailed:'ಸೈನ್ ಔಟ್ ವಿಫಲ',signOutFailedText:'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.'},
  mr: { profile:'प्रोफाइल',myProfile:'माझे प्रोफाइल',manage:'तुमची माहिती आणि प्राधान्ये व्यवस्थापित करा',artisan:'कारागीर',customer:'ग्राहक',loading:'लोड होत आहे...',bio:'प्रेमाने हस्तनिर्मित वस्तू तयार करतो 🌿',proud:'अभिमानाने',creator:'एक निर्माता ♥',personal:'वैयक्तिक माहिती',edit:'संपादित करा',name:'नाव',mobile:'मोबाइल नंबर',email:'ईमेल',notAdded:'जोडलेले नाही',add:'जोडा',location:'स्थान',update:'अपडेट',language:'भाषा',change:'बदला',account:'खाते क्रिया',changePin:'PIN बदला',updatePin:'4 अंकी PIN अपडेट करा',signOut:'साइन आउट',logoutDesc:'खात्यातून बाहेर पडा',journey:'कला प्रवास',productsListed:'यादीतील उत्पादने',ordersReceived:'मिळालेले ऑर्डर',shopRating:'दुकान रेटिंग',quote:'“प्रत्येक कलाकृती एक कथा सांगते,\nआणि तुम्ही त्या कथेचे निर्माते आहात.”',settings:'त्वरित सेटिंग्ज',notifications:'सूचना',notificationsDesc:'ऑर्डर आणि संदेशांचे अपडेट मिळवा',audio:'ऑडिओ सहाय्य',audioDesc:'निवडलेल्या भाषेत माहिती ऐका',keep:'निर्मिती सुरू ठेवा',keepDesc:'तुमच्या कलाकृती जग अधिक सुंदर करतात!',editProfile:'प्रोफाइल संपादित करा',enterName:'तुमचे नाव भरा',enterEmail:'तुमचा ईमेल भरा',enterLocation:'तुमचे स्थान भरा',cancel:'रद्द करा',save:'जतन करा',saving:'जतन करत आहे...',changeLanguage:'भाषा बदला',currentPin:'सध्याचा PIN',newPin:'नवीन PIN',confirmPin:'नवीन PIN पुष्टी करा',pinPlaceholder:'4 अंकी PIN',savePin:'PIN जतन करा',invalidName:'अवैध नाव',nameRequired:'कृपया नाव भरा.',invalidEmail:'अवैध ईमेल',validEmail:'कृपया योग्य ईमेल भरा.',sessionError:'सत्र त्रुटी',sessionMissing:'प्रमाणीकरण सत्र सापडले नाही. पुन्हा लॉगिन करा.',profileUpdated:'प्रोफाइल अपडेट झाले',profileSaved:'प्रोफाइल माहिती यशस्वीरित्या जतन झाली.',error:'त्रुटी',saveProfileError:'प्रोफाइल जतन करता आले नाही.',invalidPin:'अवैध PIN',currentPinDigits:'सध्याच्या PIN मध्ये 4 अंक असणे आवश्यक आहे.',newPinDigits:'नवीन PIN मध्ये 4 अंक असणे आवश्यक आहे.',pinMismatch:'PIN जुळत नाही',pinNotMatch:'नवीन PIN आणि पुष्टी PIN जुळत नाहीत.',incorrectPin:'चुकीचा PIN',incorrectPinText:'सध्याचा PIN चुकीचा आहे.',pinUpdated:'PIN अपडेट',pinUpdatedText:'तुमचा 4 अंकी PIN यशस्वीरित्या बदलला.',changeLanguageError:'भाषा बदलता आली नाही.',confirmSignOut:'साइन आउट करायचे आहे का?',signOutFailed:'साइन आउट अयशस्वी',signOutFailedText:'पुन्हा प्रयत्न करा.'},
  bn: { profile:'প্রোফাইল',myProfile:'আমার প্রোফাইল',manage:'আপনার তথ্য ও পছন্দ পরিচালনা করুন',artisan:'কারিগর',customer:'ক্রেতা',loading:'লোড হচ্ছে...',bio:'ভালোবাসা দিয়ে হাতে তৈরি কারুশিল্প তৈরি করছি 🌿',proud:'গর্বিতভাবে',creator:'একজন স্রষ্টা ♥',personal:'ব্যক্তিগত তথ্য',edit:'সম্পাদনা',name:'নাম',mobile:'মোবাইল নম্বর',email:'ইমেল',notAdded:'যোগ করা হয়নি',add:'যোগ করুন',location:'অবস্থান',update:'আপডেট',language:'ভাষা',change:'পরিবর্তন',account:'অ্যাকাউন্ট কার্যক্রম',changePin:'PIN পরিবর্তন করুন',updatePin:'৪ সংখ্যার PIN আপডেট করুন',signOut:'সাইন আউট',logoutDesc:'অ্যাকাউন্ট থেকে বের হন',journey:'কারুশিল্পের যাত্রা',productsListed:'তালিকাভুক্ত পণ্য',ordersReceived:'প্রাপ্ত অর্ডার',shopRating:'দোকানের রেটিং',quote:'“প্রতিটি কারুশিল্প একটি গল্প বলে,\nআর আপনি সেই গল্পের স্রষ্টা।”',settings:'দ্রুত সেটিংস',notifications:'বিজ্ঞপ্তি',notificationsDesc:'অর্ডার ও বার্তার আপডেট পান',audio:'অডিও সহায়তা',audioDesc:'নির্বাচিত ভাষায় বিবরণ শুনুন',keep:'সৃষ্টি চালিয়ে যান',keepDesc:'আপনার কারুশিল্প পৃথিবীকে আরও সুন্দর করে!',editProfile:'প্রোফাইল সম্পাদনা',enterName:'আপনার নাম লিখুন',enterEmail:'আপনার ইমেল লিখুন',enterLocation:'আপনার অবস্থান লিখুন',cancel:'বাতিল',save:'সংরক্ষণ',saving:'সংরক্ষণ হচ্ছে...',changeLanguage:'ভাষা পরিবর্তন করুন',currentPin:'বর্তমান PIN',newPin:'নতুন PIN',confirmPin:'নতুন PIN নিশ্চিত করুন',pinPlaceholder:'৪ সংখ্যার PIN',savePin:'PIN সংরক্ষণ',invalidName:'অবৈধ নাম',nameRequired:'আপনার নাম লিখুন।',invalidEmail:'অবৈধ ইমেল',validEmail:'সঠিক ইমেল লিখুন।',sessionError:'সেশন ত্রুটি',sessionMissing:'প্রমাণীকরণ সেশন পাওয়া যায়নি। আবার লগইন করুন।',profileUpdated:'প্রোফাইল আপডেট',profileSaved:'আপনার প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে।',error:'ত্রুটি',saveProfileError:'প্রোফাইল সংরক্ষণ করা যায়নি।',invalidPin:'অবৈধ PIN',currentPinDigits:'বর্তমান PIN-এ ঠিক ৪টি সংখ্যা থাকতে হবে।',newPinDigits:'নতুন PIN-এ ঠিক ৪টি সংখ্যা থাকতে হবে।',pinMismatch:'PIN মেলেনি',pinNotMatch:'নতুন PIN ও নিশ্চিতকরণ PIN মেলেনি।',incorrectPin:'ভুল PIN',incorrectPinText:'বর্তমান PIN ভুল।',pinUpdated:'PIN আপডেট',pinUpdatedText:'আপনার ৪ সংখ্যার PIN সফলভাবে পরিবর্তন হয়েছে।',changeLanguageError:'ভাষা পরিবর্তন করা যায়নি।',confirmSignOut:'আপনি কি সাইন আউট করতে চান?',signOutFailed:'সাইন আউট ব্যর্থ',signOutFailedText:'আবার চেষ্টা করুন.'},
  ml: { profile:'പ്രൊഫൈൽ',myProfile:'എന്റെ പ്രൊഫൈൽ',manage:'നിങ്ങളുടെ വിവരങ്ങളും മുൻഗണനകളും നിയന്ത്രിക്കുക',artisan:'കരകൗശലക്കാരൻ',customer:'ഉപഭോക്താവ്',loading:'ലോഡ് ചെയ്യുന്നു...',bio:'സ്നേഹത്തോടെ കൈത്തറി ഉൽപ്പന്നങ്ങൾ സൃഷ്ടിക്കുന്നു 🌿',proud:'അഭിമാനത്തോടെ',creator:'ഒരു സ്രഷ്ടാവ് ♥',personal:'വ്യക്തിഗത വിവരങ്ങൾ',edit:'തിരുത്തുക',name:'പേര്',mobile:'മൊബൈൽ നമ്പർ',email:'ഇമെയിൽ',notAdded:'ചേർത്തിട്ടില്ല',add:'ചേർക്കുക',location:'സ്ഥലം',update:'അപ്‌ഡേറ്റ്',language:'ഭാഷ',change:'മാറ്റുക',account:'അക്കൗണ്ട് പ്രവർത്തനങ്ങൾ',changePin:'PIN മാറ്റുക',updatePin:'4 അക്ക PIN അപ്‌ഡേറ്റ് ചെയ്യുക',signOut:'സൈൻ ഔട്ട്',logoutDesc:'അക്കൗണ്ടിൽ നിന്ന് പുറത്തുകടക്കുക',journey:'കരകൗശല യാത്ര',productsListed:'ലിസ്റ്റ് ചെയ്ത ഉൽപ്പന്നങ്ങൾ',ordersReceived:'ലഭിച്ച ഓർഡറുകൾ',shopRating:'ഷോപ്പ് റേറ്റിംഗ്',quote:'“ഓരോ കരകൗശലവും ഒരു കഥ പറയുന്നു,\nനിങ്ങളാണ് ആ കഥയുടെ സ്രഷ്ടാവ്.”',settings:'ദ്രുത ക്രമീകരണങ്ങൾ',notifications:'അറിയിപ്പുകൾ',notificationsDesc:'ഓർഡറുകളും സന്ദേശങ്ങളും സംബന്ധിച്ച അപ്‌ഡേറ്റുകൾ നേടുക',audio:'ഓഡിയോ സഹായം',audioDesc:'തിരഞ്ഞെടുത്ത ഭാഷയിൽ വിവരണങ്ങൾ കേൾക്കുക',keep:'സൃഷ്ടിച്ചുകൊണ്ടിരിക്കുക',keepDesc:'നിങ്ങളുടെ കരകൗശലങ്ങൾ ലോകത്തെ കൂടുതൽ മനോഹരമാക്കുന്നു!',editProfile:'പ്രൊഫൈൽ തിരുത്തുക',enterName:'നിങ്ങളുടെ പേര് നൽകുക',enterEmail:'നിങ്ങളുടെ ഇമെയിൽ നൽകുക',enterLocation:'നിങ്ങളുടെ സ്ഥലം നൽകുക',cancel:'റദ്ദാക്കുക',save:'സേവ്',saving:'സേവ് ചെയ്യുന്നു...',changeLanguage:'ഭാഷ മാറ്റുക',currentPin:'നിലവിലെ PIN',newPin:'പുതിയ PIN',confirmPin:'പുതിയ PIN സ്ഥിരീകരിക്കുക',pinPlaceholder:'4 അക്ക PIN',savePin:'PIN സേവ് ചെയ്യുക',invalidName:'അസാധുവായ പേര്',nameRequired:'നിങ്ങളുടെ പേര് നൽകുക.',invalidEmail:'അസാധുവായ ഇമെയിൽ',validEmail:'ശരിയായ ഇമെയിൽ നൽകുക.',sessionError:'സെഷൻ പിശക്',sessionMissing:'അംഗീകൃത സെഷൻ കണ്ടെത്തിയില്ല. വീണ്ടും ലോഗിൻ ചെയ്യുക.',profileUpdated:'പ്രൊഫൈൽ അപ്‌ഡേറ്റ് ചെയ്തു',profileSaved:'നിങ്ങളുടെ പ്രൊഫൈൽ വിജയകരമായി സേവ് ചെയ്തു.',error:'പിശക്',saveProfileError:'പ്രൊഫൈൽ സേവ് ചെയ്യാനായില്ല.',invalidPin:'അസാധുവായ PIN',currentPinDigits:'നിലവിലെ PIN-ൽ കൃത്യമായി 4 അക്കങ്ങൾ വേണം.',newPinDigits:'പുതിയ PIN-ൽ കൃത്യമായി 4 അക്കങ്ങൾ വേണം.',pinMismatch:'PIN പൊരുത്തപ്പെടുന്നില്ല',pinNotMatch:'പുതിയ PINയും സ്ഥിരീകരണ PINയും പൊരുത്തപ്പെടുന്നില്ല.',incorrectPin:'തെറ്റായ PIN',incorrectPinText:'നിലവിലെ PIN തെറ്റാണ്.',pinUpdated:'PIN അപ്‌ഡേറ്റ് ചെയ്തു',pinUpdatedText:'നിങ്ങളുടെ 4 അക്ക PIN വിജയകരമായി മാറ്റി.',changeLanguageError:'ഭാഷ മാറ്റാനായില്ല.',confirmSignOut:'സൈൻ ഔട്ട് ചെയ്യണോ?',signOutFailed:'സൈൻ ഔട്ട് പരാജയപ്പെട്ടു',signOutFailedText:'വീണ്ടും ശ്രമിക്കുക.'},
  gu: { profile:'પ્રોફાઇલ',myProfile:'મારી પ્રોફાઇલ',manage:'તમારી માહિતી અને પસંદગીઓ મેનેજ કરો',artisan:'કારીગર',customer:'ગ્રાહક',loading:'લોડ થઈ રહ્યું છે...',bio:'પ્રેમથી હસ્તકલા બનાવું છું 🌿',proud:'ગર્વથી',creator:'એક સર્જક ♥',personal:'વ્યક્તિગત માહિતી',edit:'ફેરફાર',name:'નામ',mobile:'મોબાઇલ નંબર',email:'ઇમેઇલ',notAdded:'ઉમેર્યું નથી',add:'ઉમેરો',location:'સ્થાન',update:'અપડેટ',language:'ભાષા',change:'બદલો',account:'એકાઉન્ટ ક્રિયાઓ',changePin:'PIN બદલો',updatePin:'4 અંકનો PIN અપડેટ કરો',signOut:'સાઇન આઉટ',logoutDesc:'એકાઉન્ટમાંથી બહાર નીકળો',journey:'કલા સફર',productsListed:'યાદીમાં ઉત્પાદનો',ordersReceived:'મળેલા ઓર્ડર',shopRating:'દુકાન રેટિંગ',quote:'“દરેક કલા એક વાર્તા કહે છે,\nઅને તમે તેના સર્જક છો.”',settings:'ઝડપી સેટિંગ્સ',notifications:'સૂચનાઓ',notificationsDesc:'ઓર્ડર અને સંદેશાના અપડેટ મેળવો',audio:'ઓડિયો સહાય',audioDesc:'પસંદ કરેલી ભાષામાં વર્ણન સાંભળો',keep:'બનાવતા રહો',keepDesc:'તમારી કલા દુનિયાને વધુ સુંદર બનાવે છે!',editProfile:'પ્રોફાઇલ ફેરફાર',enterName:'તમારું નામ દાખલ કરો',enterEmail:'તમારું ઇમેઇલ દાખલ કરો',enterLocation:'તમારું સ્થાન દાખલ કરો',cancel:'રદ કરો',save:'સાચવો',saving:'સાચવી રહ્યા છીએ...',changeLanguage:'ભાષા બદલો',currentPin:'વર્તમાન PIN',newPin:'નવો PIN',confirmPin:'નવો PIN ખાતરી કરો',pinPlaceholder:'4 અંકનો PIN',savePin:'PIN સાચવો',invalidName:'અમાન્ય નામ',nameRequired:'કૃપા કરીને તમારું નામ દાખલ કરો.',invalidEmail:'અમાન્ય ઇમેઇલ',validEmail:'યોગ્ય ઇમેઇલ દાખલ કરો.',sessionError:'સેશન ભૂલ',sessionMissing:'ઓથેન્ટિકેશન સેશન મળ્યું નથી. ફરી લોગિન કરો.',profileUpdated:'પ્રોફાઇલ અપડેટ',profileSaved:'તમારી પ્રોફાઇલ સફળતાપૂર્વક સાચવાઈ.',error:'ભૂલ',saveProfileError:'પ્રોફાઇલ સાચવી શકાઈ નથી.',invalidPin:'અમાન્ય PIN',currentPinDigits:'વર્તમાન PINમાં 4 અંક હોવા જોઈએ.',newPinDigits:'નવા PINમાં 4 અંક હોવા જોઈએ.',pinMismatch:'PIN મેળ ખાતો નથી',pinNotMatch:'નવો PIN અને પુષ્ટિ PIN મેળ ખાતા નથી.',incorrectPin:'ખોટો PIN',incorrectPinText:'વર્તમાન PIN ખોટો છે.',pinUpdated:'PIN અપડેટ',pinUpdatedText:'તમારો 4 અંકનો PIN સફળતાપૂર્વક બદલાયો.',changeLanguageError:'ભાષા બદલી શકાઈ નથી.',confirmSignOut:'શું તમે સાઇન આઉટ કરવા માંગો છો?',signOutFailed:'સાઇન આઉટ નિષ્ફળ',signOutFailedText:'ફરી પ્રયાસ કરો.'},
  pa: { profile:'ਪ੍ਰੋਫ਼ਾਈਲ',myProfile:'ਮੇਰੀ ਪ੍ਰੋਫ਼ਾਈਲ',manage:'ਆਪਣੀ ਜਾਣਕਾਰੀ ਅਤੇ ਪਸੰਦਾਂ ਦਾ ਪ੍ਰਬੰਧ ਕਰੋ',artisan:'ਕਾਰੀਗਰ',customer:'ਗਾਹਕ',loading:'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',bio:'ਪਿਆਰ ਨਾਲ ਹੱਥੋਂ ਬਣੀਆਂ ਕਲਾਕ੍ਰਿਤੀਆਂ ਬਣਾਉਂਦਾ ਹਾਂ 🌿',proud:'ਮਾਣ ਨਾਲ',creator:'ਇੱਕ ਸਿਰਜਣਹਾਰ ♥',personal:'ਨਿੱਜੀ ਜਾਣਕਾਰੀ',edit:'ਸੋਧੋ',name:'ਨਾਮ',mobile:'ਮੋਬਾਈਲ ਨੰਬਰ',email:'ਈਮੇਲ',notAdded:'ਸ਼ਾਮਲ ਨਹੀਂ',add:'ਸ਼ਾਮਲ ਕਰੋ',location:'ਟਿਕਾਣਾ',update:'ਅੱਪਡੇਟ',language:'ਭਾਸ਼ਾ',change:'ਬਦਲੋ',account:'ਖਾਤਾ ਕਾਰਵਾਈਆਂ',changePin:'PIN ਬਦਲੋ',updatePin:'4 ਅੰਕਾਂ ਵਾਲਾ PIN ਅੱਪਡੇਟ ਕਰੋ',signOut:'ਸਾਈਨ ਆਊਟ',logoutDesc:'ਖਾਤੇ ਤੋਂ ਬਾਹਰ ਨਿਕਲੋ',journey:'ਕਲਾ ਯਾਤਰਾ',productsListed:'ਸੂਚੀਬੱਧ ਉਤਪਾਦ',ordersReceived:'ਪ੍ਰਾਪਤ ਆਰਡਰ',shopRating:'ਦੁਕਾਨ ਰੇਟਿੰਗ',quote:'“ਹਰ ਕਲਾ ਇੱਕ ਕਹਾਣੀ ਦੱਸਦੀ ਹੈ,\nਅਤੇ ਤੁਸੀਂ ਉਸ ਕਹਾਣੀ ਦੇ ਸਿਰਜਣਹਾਰ ਹੋ।”',settings:'ਤੁਰੰਤ ਸੈਟਿੰਗਾਂ',notifications:'ਸੂਚਨਾਵਾਂ',notificationsDesc:'ਆਰਡਰ ਅਤੇ ਸੁਨੇਹਿਆਂ ਦੇ ਅੱਪਡੇਟ ਲਵੋ',audio:'ਆਡੀਓ ਸਹਾਇਤਾ',audioDesc:'ਚੁਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਵੇਰਵੇ ਸੁਣੋ',keep:'ਬਣਾਉਂਦੇ ਰਹੋ',keepDesc:'ਤੁਹਾਡੀਆਂ ਕਲਾਵਾਂ ਦੁਨੀਆ ਨੂੰ ਹੋਰ ਸੁੰਦਰ ਬਣਾਉਂਦੀਆਂ ਹਨ!',editProfile:'ਪ੍ਰੋਫ਼ਾਈਲ ਸੋਧੋ',enterName:'ਆਪਣਾ ਨਾਮ ਦਰਜ ਕਰੋ',enterEmail:'ਆਪਣਾ ਈਮੇਲ ਦਰਜ ਕਰੋ',enterLocation:'ਆਪਣਾ ਟਿਕਾਣਾ ਦਰਜ ਕਰੋ',cancel:'ਰੱਦ ਕਰੋ',save:'ਸੇਵ',saving:'ਸੇਵ ਹੋ ਰਿਹਾ ਹੈ...',changeLanguage:'ਭਾਸ਼ਾ ਬਦਲੋ',currentPin:'ਮੌਜੂਦਾ PIN',newPin:'ਨਵਾਂ PIN',confirmPin:'ਨਵਾਂ PIN ਪੁਸ਼ਟੀ ਕਰੋ',pinPlaceholder:'4 ਅੰਕਾਂ ਵਾਲਾ PIN',savePin:'PIN ਸੇਵ ਕਰੋ',invalidName:'ਅਵੈਧ ਨਾਮ',nameRequired:'ਕਿਰਪਾ ਕਰਕੇ ਨਾਮ ਦਰਜ ਕਰੋ।',invalidEmail:'ਅਵੈਧ ਈਮੇਲ',validEmail:'ਸਹੀ ਈਮੇਲ ਦਰਜ ਕਰੋ।',sessionError:'ਸੈਸ਼ਨ ਗਲਤੀ',sessionMissing:'ਪ੍ਰਮਾਣਿਕਤਾ ਸੈਸ਼ਨ ਨਹੀਂ ਮਿਲਿਆ। ਦੁਬਾਰਾ ਲਾਗਇਨ ਕਰੋ।',profileUpdated:'ਪ੍ਰੋਫ਼ਾਈਲ ਅੱਪਡੇਟ',profileSaved:'ਤੁਹਾਡੀ ਪ੍ਰੋਫ਼ਾਈਲ ਸਫਲਤਾਪੂਰਵਕ ਸੇਵ ਹੋ ਗਈ।',error:'ਗਲਤੀ',saveProfileError:'ਪ੍ਰੋਫ਼ਾਈਲ ਸੇਵ ਨਹੀਂ ਹੋ ਸਕੀ।',invalidPin:'ਅਵੈਧ PIN',currentPinDigits:'ਮੌਜੂਦਾ PIN ਵਿੱਚ ਠੀਕ 4 ਅੰਕ ਹੋਣੇ ਚਾਹੀਦੇ ਹਨ।',newPinDigits:'ਨਵੇਂ PIN ਵਿੱਚ ਠੀਕ 4 ਅੰਕ ਹੋਣੇ ਚਾਹੀਦੇ ਹਨ।',pinMismatch:'PIN ਮੇਲ ਨਹੀਂ ਖਾਂਦਾ',pinNotMatch:'ਨਵਾਂ PIN ਅਤੇ ਪੁਸ਼ਟੀ PIN ਮੇਲ ਨਹੀਂ ਖਾਂਦੇ।',incorrectPin:'ਗਲਤ PIN',incorrectPinText:'ਮੌਜੂਦਾ PIN ਗਲਤ ਹੈ।',pinUpdated:'PIN ਅੱਪਡੇਟ',pinUpdatedText:'ਤੁਹਾਡਾ 4 ਅੰਕਾਂ ਵਾਲਾ PIN ਸਫਲਤਾਪੂਰਵਕ ਬਦਲਿਆ ਗਿਆ।',changeLanguageError:'ਭਾਸ਼ਾ ਨਹੀਂ ਬਦਲੀ ਜਾ ਸਕੀ।',confirmSignOut:'ਕੀ ਤੁਸੀਂ ਸਾਈਨ ਆਊਟ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?',signOutFailed:'ਸਾਈਨ ਆਊਟ ਅਸਫਲ',signOutFailedText:'ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ.'},
  or: { profile:'ପ୍ରୋଫାଇଲ',myProfile:'ମୋ ପ୍ରୋଫାଇଲ',manage:'ଆପଣଙ୍କ ସୂଚନା ଏବଂ ପସନ୍ଦ ପରିଚାଳନା କରନ୍ତୁ',artisan:'କାରିଗର',customer:'ଗ୍ରାହକ',loading:'ଲୋଡ୍ ହେଉଛି...',bio:'ଭଲପାଇବା ସହିତ ହାତରେ ତିଆରି କାରୁକାର୍ଯ୍ୟ ସୃଷ୍ଟି କରୁଛି 🌿',proud:'ଗର୍ବର ସହିତ',creator:'ଜଣେ ସୃଷ୍ଟିକର୍ତ୍ତା ♥',personal:'ବ୍ୟକ୍ତିଗତ ସୂଚନା',edit:'ସମ୍ପାଦନା',name:'ନାମ',mobile:'ମୋବାଇଲ୍ ନମ୍ବର',email:'ଇମେଲ୍',notAdded:'ଯୋଡାଯାଇନାହିଁ',add:'ଯୋଡନ୍ତୁ',location:'ସ୍ଥାନ',update:'ଅପଡେଟ୍',language:'ଭାଷା',change:'ବଦଳାନ୍ତୁ',account:'ଖାତା କାର୍ଯ୍ୟ',changePin:'PIN ବଦଳାନ୍ତୁ',updatePin:'4 ଅଙ୍କର PIN ଅପଡେଟ୍ କରନ୍ତୁ',signOut:'ସାଇନ୍ ଆଉଟ୍',logoutDesc:'ଖାତାରୁ ବାହାରନ୍ତୁ',journey:'କାରୁକାର୍ଯ୍ୟ ଯାତ୍ରା',productsListed:'ତାଲିକାଭୁକ୍ତ ଉତ୍ପାଦ',ordersReceived:'ପ୍ରାପ୍ତ ଅର୍ଡର୍',shopRating:'ଦୋକାନ ରେଟିଂ',quote:'“ପ୍ରତ୍ୟେକ କଳା ଏକ କାହାଣୀ କହେ,\nଆପଣ ସେହି କାହାଣୀର ସୃଷ୍ଟିକର୍ତ୍ତା।”',settings:'ଦ୍ରୁତ ସେଟିଂସ୍',notifications:'ବିଜ୍ଞପ୍ତି',notificationsDesc:'ଅର୍ଡର୍ ଏବଂ ସନ୍ଦେଶ ଅପଡେଟ୍ ପାଆନ୍ତୁ',audio:'ଅଡିଓ ସହାୟତା',audioDesc:'ଚୟନିତ ଭାଷାରେ ବର୍ଣ୍ଣନା ଶୁଣନ୍ତୁ',keep:'ସୃଷ୍ଟି କରୁଥାନ୍ତୁ',keepDesc:'ଆପଣଙ୍କ କଳାକୃତି ଦୁନିଆକୁ ଅଧିକ ସୁନ୍ଦର କରେ!',editProfile:'ପ୍ରୋଫାଇଲ୍ ସମ୍ପାଦନା',enterName:'ଆପଣଙ୍କ ନାମ ଲେଖନ୍ତୁ',enterEmail:'ଆପଣଙ୍କ ଇମେଲ୍ ଲେଖନ୍ତୁ',enterLocation:'ଆପଣଙ୍କ ସ୍ଥାନ ଲେଖନ୍ତୁ',cancel:'ବାତିଲ୍',save:'ସେଭ୍',saving:'ସେଭ୍ ହେଉଛି...',changeLanguage:'ଭାଷା ବଦଳାନ୍ତୁ',currentPin:'ବର୍ତ୍ତମାନ PIN',newPin:'ନୂଆ PIN',confirmPin:'ନୂଆ PIN ନିଶ୍ଚିତ କରନ୍ତୁ',pinPlaceholder:'4 ଅଙ୍କର PIN',savePin:'PIN ସେଭ୍ କରନ୍ତୁ',invalidName:'ଅବୈଧ ନାମ',nameRequired:'ଦୟାକରି ଆପଣଙ୍କ ନାମ ଲେଖନ୍ତୁ।',invalidEmail:'ଅବୈଧ ଇମେଲ୍',validEmail:'ସଠିକ୍ ଇମେଲ୍ ଲେଖନ୍ତୁ।',sessionError:'ସେସନ୍ ତ୍ରୁଟି',sessionMissing:'ଅଥେଣ୍ଟିକେସନ୍ ସେସନ୍ ମିଳିଲା ନାହିଁ। ପୁଣି ଲଗଇନ୍ କରନ୍ତୁ।',profileUpdated:'ପ୍ରୋଫାଇଲ୍ ଅପଡେଟ୍',profileSaved:'ଆପଣଙ୍କ ପ୍ରୋଫାଇଲ୍ ସଫଳତାର ସହ ସେଭ୍ ହୋଇଛି।',error:'ତ୍ରୁଟି',saveProfileError:'ପ୍ରୋଫାଇଲ୍ ସେଭ୍ ହୋଇପାରିଲା ନାହିଁ।',invalidPin:'ଅବୈଧ PIN',currentPinDigits:'ବର୍ତ୍ତମାନ PINରେ ଠିକ୍ 4 ଅଙ୍କ ଥିବା ଆବଶ୍ୟକ।',newPinDigits:'ନୂଆ PINରେ ଠିକ୍ 4 ଅଙ୍କ ଥିବା ଆବଶ୍ୟକ।',pinMismatch:'PIN ମେଳ ଖାଉନାହିଁ',pinNotMatch:'ନୂଆ PIN ଏବଂ ନିଶ୍ଚିତ PIN ମେଳ ଖାଉନାହିଁ।',incorrectPin:'ଭୁଲ PIN',incorrectPinText:'ବର୍ତ୍ତମାନ PIN ଭୁଲ ଅଛି।',pinUpdated:'PIN ଅପଡେଟ୍',pinUpdatedText:'ଆପଣଙ୍କ 4 ଅଙ୍କର PIN ସଫଳତାର ସହ ବଦଳାଗଲା।',changeLanguageError:'ଭାଷା ବଦଳାଯାଇପାରିଲା ନାହିଁ।',confirmSignOut:'ଆପଣ ସାଇନ୍ ଆଉଟ୍ କରିବାକୁ ଚାହୁଁଛନ୍ତି କି?',signOutFailed:'ସାଇନ୍ ଆଉଟ୍ ବିଫଳ',signOutFailedText:'ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ.'},
  as: { profile:'প্ৰফাইল',myProfile:'মোৰ প্ৰফাইল',manage:'আপোনাৰ তথ্য আৰু পছন্দসমূহ পৰিচালনা কৰক',artisan:'কাৰিকৰ',customer:'গ্ৰাহক',loading:'লোড হৈ আছে...',bio:'ভালপোৱাৰে হাতেৰে বনোৱা শিল্প সৃষ্টি কৰোঁ 🌿',proud:'গৌৰৱেৰে',creator:'এজন সৃষ্টিকৰ্তা ♥',personal:'ব্যক্তিগত তথ্য',edit:'সম্পাদনা',name:'নাম',mobile:'মোবাইল নম্বৰ',email:'ইমেইল',notAdded:'যোগ কৰা হোৱা নাই',add:'যোগ কৰক',location:'স্থান',update:'আপডেট',language:'ভাষা',change:'সলনি কৰক',account:'একাউণ্ট কাৰ্য',changePin:'PIN সলনি কৰক',updatePin:'4 অংকৰ PIN আপডেট কৰক',signOut:'চাইন আউট',logoutDesc:'একাউণ্টৰ পৰা ওলাই যাওক',journey:'শিল্প যাত্ৰা',productsListed:'তালিকাভুক্ত সামগ্ৰী',ordersReceived:'পোৱা অৰ্ডাৰ',shopRating:'দোকান ৰেটিং',quote:'“প্ৰতিটো শিল্পই এটা কাহিনী কয়,\nআপুনি সেই কাহিনীৰ সৃষ্টিকৰ্তা।”',settings:'দ্ৰুত ছেটিংছ',notifications:'বিজ্ঞপ্তি',notificationsDesc:'অৰ্ডাৰ আৰু বাৰ্তাৰ আপডেট লাভ কৰক',audio:'অডিঅ’ সহায়',audioDesc:'নিৰ্বাচিত ভাষাত বিৱৰণ শুনক',keep:'সৃষ্টি কৰি থাকক',keepDesc:'আপোনাৰ শিল্পই পৃথিৱীখনক অধিক সুন্দৰ কৰে!',editProfile:'প্ৰফাইল সম্পাদনা',enterName:'আপোনাৰ নাম লিখক',enterEmail:'আপোনাৰ ইমেইল লিখক',enterLocation:'আপোনাৰ স্থান লিখক',cancel:'বাতিল',save:'সংৰক্ষণ',saving:'সংৰক্ষণ হৈ আছে...',changeLanguage:'ভাষা সলনি কৰক',currentPin:'বৰ্তমান PIN',newPin:'নতুন PIN',confirmPin:'নতুন PIN নিশ্চিত কৰক',pinPlaceholder:'4 অংকৰ PIN',savePin:'PIN সংৰক্ষণ',invalidName:'অবৈধ নাম',nameRequired:'অনুগ্ৰহ কৰি নাম লিখক।',invalidEmail:'অবৈধ ইমেইল',validEmail:'সঠিক ইমেইল লিখক।',sessionError:'ছেছন ত্ৰুটি',sessionMissing:'প্ৰমাণীকৰণ ছেছন পোৱা নগ’ল। পুনৰ লগইন কৰক।',profileUpdated:'প্ৰফাইল আপডেট',profileSaved:'আপোনাৰ প্ৰফাইল সফলভাৱে সংৰক্ষণ কৰা হৈছে।',error:'ত্ৰুটি',saveProfileError:'প্ৰফাইল সংৰক্ষণ কৰিব পৰা নগ’ল।',invalidPin:'অবৈধ PIN',currentPinDigits:'বৰ্তমান PINত ঠিক 4টা অংক থাকিব লাগিব।',newPinDigits:'নতুন PINত ঠিক 4টা অংক থাকিব লাগিব।',pinMismatch:'PIN মিল নাই',pinNotMatch:'নতুন PIN আৰু নিশ্চিত PIN মিল নাই।',incorrectPin:'ভুল PIN',incorrectPinText:'বৰ্তমান PIN ভুল।',pinUpdated:'PIN আপডেট',pinUpdatedText:'আপোনাৰ 4 অংকৰ PIN সফলভাৱে সলনি কৰা হৈছে।',changeLanguageError:'ভাষা সলনি কৰিব পৰা নগ’ল।',confirmSignOut:'আপুনি চাইন আউট কৰিব বিচাৰে নেকি?',signOutFailed:'চাইন আউট ব্যৰ্থ',signOutFailedText:'পুনৰ চেষ্টা কৰক.'},
  ur: { profile:'پروفائل',myProfile:'میرا پروفائل',manage:'اپنی معلومات اور ترجیحات کا انتظام کریں',artisan:'کاریگر',customer:'گاہک',loading:'لوڈ ہو رہا ہے...',bio:'محبت سے ہاتھ سے بنی دستکاری بناتا ہوں 🌿',proud:'فخر سے',creator:'ایک تخلیق کار ♥',personal:'ذاتی معلومات',edit:'ترمیم',name:'نام',mobile:'موبائل نمبر',email:'ای میل',notAdded:'شامل نہیں',add:'شامل کریں',location:'مقام',update:'اپ ڈیٹ',language:'زبان',change:'تبدیل کریں',account:'اکاؤنٹ کے اقدامات',changePin:'PIN تبدیل کریں',updatePin:'4 ہندسوں کا PIN اپ ڈیٹ کریں',signOut:'سائن آؤٹ',logoutDesc:'اپنے اکاؤنٹ سے باہر نکلیں',journey:'دستکاری کا سفر',productsListed:'درج مصنوعات',ordersReceived:'موصولہ آرڈرز',shopRating:'دکان کی ریٹنگ',quote:'“ہر دستکاری ایک کہانی سناتی ہے،\nاور آپ اس کہانی کے تخلیق کار ہیں۔”',settings:'فوری ترتیبات',notifications:'اطلاعات',notificationsDesc:'آرڈرز اور پیغامات کی اپ ڈیٹس حاصل کریں',audio:'آڈیو معاونت',audioDesc:'اپنی منتخب زبان میں تفصیل سنیں',keep:'تخلیق جاری رکھیں',keepDesc:'آپ کی دستکاریاں دنیا کو مزید خوبصورت بناتی ہیں!',editProfile:'پروفائل میں ترمیم',enterName:'اپنا نام درج کریں',enterEmail:'اپنی ای میل درج کریں',enterLocation:'اپنا مقام درج کریں',cancel:'منسوخ',save:'محفوظ کریں',saving:'محفوظ ہو رہا ہے...',changeLanguage:'زبان تبدیل کریں',currentPin:'موجودہ PIN',newPin:'نیا PIN',confirmPin:'نئے PIN کی تصدیق کریں',pinPlaceholder:'4 ہندسوں کا PIN',savePin:'PIN محفوظ کریں',invalidName:'غلط نام',nameRequired:'براہ کرم اپنا نام درج کریں۔',invalidEmail:'غلط ای میل',validEmail:'درست ای میل درج کریں۔',sessionError:'سیشن کی خرابی',sessionMissing:'تصدیقی سیشن نہیں ملا۔ دوبارہ لاگ ان کریں۔',profileUpdated:'پروفائل اپ ڈیٹ',profileSaved:'آپ کی پروفائل معلومات کامیابی سے محفوظ ہوگئی ہیں۔',error:'خرابی',saveProfileError:'پروفائل محفوظ نہیں ہو سکا۔',invalidPin:'غلط PIN',currentPinDigits:'موجودہ PIN میں بالکل 4 ہندسے ہونے چاہئیں۔',newPinDigits:'نئے PIN میں بالکل 4 ہندسے ہونے چاہئیں۔',pinMismatch:'PIN مماثل نہیں',pinNotMatch:'نیا PIN اور تصدیقی PIN مماثل نہیں ہیں۔',incorrectPin:'غلط PIN',incorrectPinText:'موجودہ PIN غلط ہے۔',pinUpdated:'PIN اپ ڈیٹ',pinUpdatedText:'آپ کا 4 ہندسوں کا PIN کامیابی سے تبدیل ہوگیا۔',changeLanguageError:'زبان تبدیل نہیں ہو سکی۔',confirmSignOut:'کیا آپ سائن آؤٹ کرنا چاہتے ہیں؟',signOutFailed:'سائن آؤٹ ناکام',signOutFailedText:'دوبارہ کوشش کریں۔'},
};

const profileText = (lang: string, key: string) =>
  PROFILE_TEXT[lang]?.[key] || PROFILE_TEXT.en[key] || key;

/* =====================================================
   PROFILE SCREEN
===================================================== */

export const ProfileScreen: React.FC<Props> = ({
  onLogout,
}) => {

  // Profile is used inside a navigation screen. This hook fixes the
  // previously undefined `navigation` value passed to BackHeader.
  const navigation = useNavigation<any>();

  const {
    lang,
    setLang,
  } = useLanguage();

  const {
    width,
  } = useWindowDimensions();

  const isWideScreen =
    width >= 900;

  /* ===================================================
     USER
  =================================================== */

  const [
    user,
    setUser,
  ] = useState<AuthUser | null>(
    null,
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  /* ===================================================
     SETTINGS
  =================================================== */

  const [
    notifications,
    setNotifications,
  ] = useState(true);

  const [
    audioAssistance,
    setAudioAssistance,
  ] = useState(true);

  /* ===================================================
     MODALS
  =================================================== */

  const [
    editModalVisible,
    setEditModalVisible,
  ] = useState(false);

  const [
    pinModalVisible,
    setPinModalVisible,
  ] = useState(false);

  const [
    languageModalVisible,
    setLanguageModalVisible,
  ] = useState(false);

  /* ===================================================
     EDIT PROFILE
  =================================================== */

  const [
    nameInput,
    setNameInput,
  ] = useState('');

  const [
    emailInput,
    setEmailInput,
  ] = useState('');

  const [
    locationInput,
    setLocationInput,
  ] = useState('');

  /* ===================================================
     PIN
  =================================================== */

  const [
    currentPin,
    setCurrentPin,
  ] = useState('');

  const [
    newPin,
    setNewPin,
  ] = useState('');

  const [
    confirmPin,
    setConfirmPin,
  ] = useState('');

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  /* ===================================================
     LOAD USER
  =================================================== */

  useEffect(() => {

    let mounted = true;

    const loadUser =
      async () => {

        try {

          const currentUser =
            await AuthAdapter.getCurrentUser();

          if (mounted) {
            setUser(currentUser);
            try {
              const [products, orders] = await Promise.all([
                ApiAdapter.getProducts(true),
                ApiAdapter.getOrders(true),
              ]);
              if (mounted) {
                setProductCount(Array.isArray(products) ? products.length : 0);
                setOrderCount(Array.isArray(orders) ? orders.length : 0);
              }
            } catch (statsError) {
              console.warn('[ProfileScreen] Stats load failed:', statsError);
            }
          }

        } catch (error) {

          console.warn(
            '[ProfileScreen] Failed to load user:',
            error,
          );

        } finally {

          if (mounted) {
            setLoading(false);
          }

        }
      };

    loadUser();

    return () => {
      mounted = false;
    };

  }, []);

  /* ===================================================
     USER INFORMATION
  =================================================== */

  const name =
    user?.name?.trim() ||
    profileText(lang, 'artisan');

  const phone =
    user?.phone ||
    '';

  const email =
    user?.email ||
    '';

  const location =
    user?.location ||
    'Andhra Pradesh, India';

  const language =
    languageNames[lang] ||
    'English';

  const initial =
    name
      .charAt(0)
      .toUpperCase();

  /* ===================================================
     EDIT PROFILE
  =================================================== */

  const handleEditProfile =
    () => {

      setNameInput(
        user?.name || '',
      );

      setEmailInput(
        user?.email || '',
      );

      setLocationInput(
        user?.location ||
        'Andhra Pradesh, India',
      );

      setEditModalVisible(
        true,
      );
    };

  /* ===================================================
     EMAIL
  =================================================== */

  const handleAddEmail =
    () => {

      setEmailInput(
        user?.email || '',
      );

      setNameInput(
        user?.name || '',
      );

      setLocationInput(
        user?.location ||
        'Andhra Pradesh, India',
      );

      setEditModalVisible(
        true,
      );
    };

  /* ===================================================
     LOCATION
  =================================================== */

  const handleLocation =
    () => {

      setLocationInput(
        user?.location ||
        'Andhra Pradesh, India',
      );

      setNameInput(
        user?.name || '',
      );

      setEmailInput(
        user?.email || '',
      );

      setEditModalVisible(
        true,
      );
    };

  /* ===================================================
     SAVE PROFILE
  =================================================== */

  const handleSaveProfile =
    async () => {

      if (!nameInput.trim()) {

        Alert.alert(
          profileText(lang, 'invalidName'),
          profileText(lang, 'nameRequired'),
        );

        return;
      }

      if (
        emailInput.trim() &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          emailInput.trim(),
        )
      ) {

        Alert.alert(
          profileText(lang, 'invalidEmail'),
          profileText(lang, 'validEmail'),
        );

        return;
      }

      try {

        setSaving(true);

        const session =
          await StorageAdapter.getAuthSession();

        if (!session) {

          Alert.alert(
            profileText(lang, 'sessionError'),
            profileText(lang, 'sessionMissing'),
          );

          return;
        }

        const updatedSession = {
          ...session,

          name:
            nameInput.trim(),

          email:
            emailInput.trim(),

          location:
            locationInput.trim() ||
            'Andhra Pradesh, India',
        };

        await StorageAdapter.setAuthSession(
          updatedSession,
        );

        setUser({
          uid:
            `dev-uid-${updatedSession.phone}`,

          phone:
            updatedSession.phone,

          name:
            updatedSession.name,

          email:
            updatedSession.email,

          location:
            updatedSession.location,

          pin:
            updatedSession.pin || '',

          role:
            updatedSession.role,

          completedOnboarding:
            updatedSession.completedOnboarding,

          token:
            updatedSession.token,
        });

        setEditModalVisible(
          false,
        );

        Alert.alert(
          profileText(lang, 'profileUpdated'),
          profileText(lang, 'profileSaved'),
        );

      } catch (error) {

        console.error(
          '[ProfileScreen] Save profile error:',
          error,
        );

        Alert.alert(
          profileText(lang, 'error'),
          profileText(lang, 'saveProfileError'),
        );

      } finally {

        setSaving(false);
      }
    };

  /* ===================================================
     CHANGE PIN
  =================================================== */

  const handleChangePin =
    () => {

      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');

      setPinModalVisible(
        true,
      );
    };

  /* ===================================================
     SAVE PIN
  =================================================== */

  const handleSavePin =
    async () => {

      if (
        !/^\d{4}$/.test(
          currentPin,
        )
      ) {

        Alert.alert(
          profileText(lang, 'invalidPin'),
          profileText(lang, 'currentPinDigits'),
        );

        return;
      }

      if (
        !/^\d{4}$/.test(
          newPin,
        )
      ) {

        Alert.alert(
          profileText(lang, 'invalidPin'),
          profileText(lang, 'newPinDigits'),
        );

        return;
      }

      if (
        newPin !== confirmPin
      ) {

        Alert.alert(
          profileText(lang, 'pinMismatch'),
          profileText(lang, 'pinNotMatch'),
        );

        return;
      }

      try {

        setSaving(true);

        const session =
          await StorageAdapter.getAuthSession();

        if (!session) {

          Alert.alert(
            profileText(lang, 'sessionError'),
            profileText(lang, 'sessionMissing'),
          );

          return;
        }

        /*
         * If an existing PIN is configured,
         * verify the current PIN.
         *
         * For an account without an existing PIN,
         * the first entered current PIN is accepted
         * so the user can establish their 4-digit PIN.
         */

        if (
          session.pin &&
          session.pin !== currentPin
        ) {

          Alert.alert(
            profileText(lang, 'incorrectPin'),
            profileText(lang, 'incorrectPinText'),
          );

          return;
        }

        await StorageAdapter.setAuthSession({
          ...session,
          pin: newPin,
        });

        setUser({
          uid:
            `dev-uid-${session.phone}`,

          phone:
            session.phone,

          name:
            session.name,

          email:
            session.email || '',

          location:
            session.location ||
            'Andhra Pradesh, India',

          pin:
            newPin,

          role:
            session.role,

          completedOnboarding:
            session.completedOnboarding,

          token:
            session.token,
        });

        setPinModalVisible(
          false,
        );

        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');

        Alert.alert(
          profileText(lang, 'pinUpdated'),
          profileText(lang, 'pinUpdatedText'),
        );

      } catch (error) {

        console.error(
          '[ProfileScreen] Change PIN error:',
          error,
        );

        Alert.alert(
          profileText(lang, 'error'),
          'Unable to change your PIN.',
        );

      } finally {

        setSaving(false);
      }
    };

  /* ===================================================
     LANGUAGE
  =================================================== */

  const handleLanguage =
    () => {

      setLanguageModalVisible(
        true,
      );
    };

  const handleSelectLanguage =
    async (
      code: string,
    ) => {

      try {

        /*
         * Existing LanguageContext handles
         * application-wide language state.
         */

        setLang(code as any);

        /*
         * Also persist the selection directly.
         */
        await StorageAdapter.setSelectedLanguage(
          code,
        );

        setLanguageModalVisible(
          false,
        );

      } catch (error) {

        console.error(
          '[ProfileScreen] Language change error:',
          error,
        );

        Alert.alert(
          profileText(lang, 'error'),
          profileText(lang, 'changeLanguageError'),
        );
      }
    };

  /* ===================================================
     SIGN OUT
  =================================================== */

  const handleSignOut =
    () => {

      Alert.alert(
        profileText(lang, 'signOut'),
        profileText(lang, 'confirmSignOut'),
        [
          {
            text: profileText(lang, 'cancel'),
            style: 'cancel',
          },

          {
            text: profileText(lang, 'signOut'),
            style: 'destructive',

            onPress: async () => {

              try {

                /*
                 * RootNavigator owns the authenticated state.
                 * Therefore use its callback when it is available.
                 *
                 * RootNavigator will:
                 * 1. clear the stored session
                 * 2. set currentUser to null
                 * 3. show WelcomeLanguage again
                 *
                 * This avoids signing out twice.
                 */
                if (onLogout) {
                  onLogout();
                  return;
                }

                /*
                 * Safety fallback for cases where this screen is mounted
                 * without RootNavigator's callback.
                 */
                await AuthAdapter.signOut();

                if (
                  typeof window !== 'undefined' &&
                  typeof window.location?.reload === 'function'
                ) {
                  window.location.reload();
                  return;
                }

                if (navigation.canGoBack()) {
                  navigation.goBack();
                }

              } catch (error) {

                console.error(
                  '[ProfileScreen] Sign out error:',
                  error,
                );

                Alert.alert(
                  profileText(lang, 'signOutFailed'),
                  profileText(lang, 'signOutFailedText'),
                );

              }

            },
          },
        ],
      );
    };

  /* ===================================================
     UI
  =================================================== */

  return (
    <SafeAreaView
      style={
        styles.safeArea
      }
    >

      <BackHeader
        title={profileText(lang, 'profile')}
        navigation={navigation}
      />

      <ScrollView
        style={
          styles.scroll
        }

        contentContainerStyle={[
          styles.container,

          isWideScreen &&
            styles.wideContainer,
        ]}

        showsVerticalScrollIndicator={
          false
        }
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <View
          style={
            styles.pageHeader
          }
        >

          <View
            style={
              styles.headerText
            }
          >

            <Text
              style={
                styles.pageTitle
              }
            >
            {profileText(lang, 'myProfile')}
            </Text>

            <Text
              style={
                styles.pageSubtitle
              }
            >
            {profileText(lang, 'manage')}
            </Text>

          </View>

          <View
            style={
              styles.headerActions
            }
          >

            <TouchableOpacity
              style={
                styles.notificationButton
              }

              activeOpacity={0.8}
            >

              <Ionicons
                name="notifications-outline"
                size={23}
                color="#33271F"
              />

              <View
                style={
                  styles.notificationDot
                }
              />

            </TouchableOpacity>

            <View
              style={
                styles.headerAvatar
              }
            >

              <Text
                style={
                  styles.headerAvatarText
                }
              >
                {initial}
              </Text>

            </View>

            <Ionicons
              name="chevron-down"
              size={17}
              color="#5B5048"
            />

          </View>

        </View>

        {/* =================================================
            HERO
        ================================================= */}

        <View
          style={
            styles.profileHero
          }
        >

          <View
            style={
              styles.avatarSection
            }
          >

            <View
              style={
                styles.largeAvatar
              }
            >

              <Text
                style={
                  styles.largeAvatarText
                }
              >
                {initial}
              </Text>

            </View>

            <TouchableOpacity
              style={
                styles.cameraButton
              }

              onPress={
                handleEditProfile
              }

              activeOpacity={0.8}
            >

              <Ionicons
                name="camera"
                size={17}
                color="#33271F"
              />

            </TouchableOpacity>

          </View>

          <View
            style={
              styles.profileHeroInfo
            }
          >

            <Text
              style={
                styles.profileName
              }
            >
              {loading
                ? profileText(lang, 'loading')
                : name}
            </Text>

            <Text
              style={
                styles.profileRole
              }
            >
              {user?.role === 'CUSTOMER'
                ? profileText(lang, 'customer')
                : profileText(lang, 'artisan')}
            </Text>

            <Text
              style={
                styles.profileBio
              }
            >
              Creating handmade crafts with love 🌿
            </Text>

            <View
              style={
                styles.profileMetaRow
              }
            >

              <View
                style={
                  styles.metaItem
                }
              >

                <Ionicons
                  name="location-outline"
                  size={17}
                  color="#533522"
                />

                <Text
                  style={
                    styles.metaText
                  }

                  numberOfLines={1}
                >
                  {location}
                </Text>

              </View>

              <View
                style={
                  styles.metaDivider
                }
              />

              <View
                style={
                  styles.metaItem
                }
              >

                <Ionicons
                  name="language-outline"
                  size={17}
                  color="#533522"
                />

                <Text
                  style={
                    styles.metaText
                  }
                >
                  {language}
                </Text>

              </View>

            </View>

          </View>

          <View
            style={
              styles.heroDecoration
            }
          >

            <View
              style={
                styles.heroLeaves
              }
            >

              <Ionicons
                name="leaf-outline"
                size={68}
                color="#D7BE9F"
              />

              <Ionicons
                name="leaf"
                size={38}
                color="#B98555"
              />

            </View>

            <Text
              style={
                styles.creatorText
              }
            >
              Proud to be
              {'\n'}
              a Creator ♥
            </Text>

          </View>

        </View>

        {/* =================================================
            CONTENT
        ================================================= */}

        <View
          style={[
            styles.columns,

            !isWideScreen &&
              styles.mobileColumns,
          ]}
        >

          {/* =================================================
              LEFT COLUMN
          ================================================= */}

          <View
            style={[
              styles.leftColumn,

              !isWideScreen &&
                styles.mobileColumn,
            ]}
          >

            {/* =================================================
                PERSONAL INFORMATION
            ================================================= */}

            <View
              style={
                styles.sectionCard
              }
            >

              <View
                style={
                  styles.sectionHeader
                }
              >

                <View
                  style={
                    styles.titleWithIcon
                  }
                >

                  <Ionicons
                    name="person-outline"
                    size={22}
                    color="#55351F"
                  />

                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                  {profileText(lang, 'personal')}
                  </Text>

                </View>

                <TouchableOpacity
                  style={
                    styles.editButton
                  }

                  onPress={
                    handleEditProfile
                  }

                  activeOpacity={0.8}
                >

                  <Ionicons
                    name="pencil-outline"
                    size={15}
                    color="#533522"
                  />

                  <Text
                    style={
                      styles.editButtonText
                    }
                  >
                  {profileText(lang, 'edit')}
                  </Text>

                </TouchableOpacity>

              </View>

              <InfoRow
                icon="person-outline"
                label={profileText(lang, 'name')}
                value={name}
              />

              <InfoRow
                icon="call-outline"
                label={profileText(lang, 'mobile')}
                value={
                  formatPhone(phone)
                }
              />

              <InfoRow
                icon="mail-outline"
                label={profileText(lang, 'email')}
                value={
                  email ||
                  profileText(lang, 'notAdded')
                }

                action={email ? undefined : profileText(lang, 'add')}

                onPress={
                  email
                    ? undefined
                    : handleAddEmail
                }
              />

              <InfoRow
                icon="location-outline"
                label={profileText(lang, 'location')}
                value={
                  location
                }

                action={profileText(lang, 'update')}

                onPress={
                  handleLocation
                }
              />

              <InfoRow
                icon="globe-outline"
                label={profileText(lang, 'language')}
                value={
                  language
                }

                action={profileText(lang, 'change')}

                onPress={
                  handleLanguage
                }

                last
              />

            </View>

            {/* =================================================
                ACCOUNT ACTIONS
            ================================================= */}

            <View
              style={
                styles.sectionCard
              }
            >

              <View
                style={
                  styles.titleWithIcon
                }
              >

                <Ionicons
                  name="shield-checkmark-outline"
                  size={22}
                  color="#55351F"
                />

                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                {profileText(lang, 'account')}
                </Text>

              </View>

              <View
                style={
                  styles.actionRow
                }
              >

                <TouchableOpacity
                  style={
                    styles.actionCard
                  }

                  onPress={
                    handleChangePin
                  }

                  activeOpacity={0.8}
                >

                  <View
                    style={
                      styles.actionIcon
                    }
                  >

                    <Ionicons
                      name="lock-closed-outline"
                      size={22}
                      color="#9B681F"
                    />

                  </View>

                  <View
                    style={
                      styles.actionCopy
                    }
                  >

                    <Text
                      style={
                        styles.actionTitle
                      }
                    >
                    {profileText(lang, 'changePin')}
                    </Text>

                    <Text
                      style={
                        styles.actionSubtitle
                      }
                    >
                    {profileText(lang, 'updatePin')}
                    </Text>

                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={19}
                    color="#8B8177"
                  />

                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionCard,
                    styles.signOutCard,
                  ]}

                  onPress={
                    handleSignOut
                  }

                  activeOpacity={0.8}
                >

                  <View
                    style={[
                      styles.actionIcon,
                      styles.signOutIcon,
                    ]}
                  >

                    <Ionicons
                      name="log-out-outline"
                      size={22}
                      color="#9C492D"
                    />

                  </View>

                  <View
                    style={
                      styles.actionCopy
                    }
                  >

                    <Text
                      style={
                        styles.actionTitle
                      }
                    >
                    {profileText(lang, 'signOut')}
                    </Text>

                    <Text
                      style={
                        styles.actionSubtitle
                      }
                    >
                    {profileText(lang, 'logoutDesc')}
                    </Text>

                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={19}
                    color="#8B8177"
                  />

                </TouchableOpacity>

              </View>

            </View>

          </View>

          {/* =================================================
              RIGHT COLUMN
          ================================================= */}

          <View
            style={[
              styles.rightColumn,

              !isWideScreen &&
                styles.mobileColumn,
            ]}
          >

            {/* =================================================
                CRAFT JOURNEY
            ================================================= */}

            <View
              style={
                styles.sectionCard
              }
            >

              <View
                style={
                  styles.titleWithIcon
                }
              >

                <Ionicons
                  name="trending-up-outline"
                  size={22}
                  color="#55351F"
                />

                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                {profileText(lang, 'journey')}
                </Text>

              </View>

              <View
                style={
                  styles.journeyRow
                }
              >

                <JourneyStat
                  icon="cube-outline"
                  value={String(productCount)}
                  label={profileText(lang, 'productsListed')}
                  type="green"
                />

                <JourneyStat
                  icon="cart-outline"
                  value={String(orderCount)}
                  label={profileText(lang, 'ordersReceived')}
                  type="orange"
                />

                <JourneyStat
                  icon="star"
                  value="—"
                  label={profileText(lang, 'shopRating')}
                  type="yellow"
                />

              </View>

              <View
                style={
                  styles.quoteBox
                }
              >

                <Text
                  style={
                    styles.quote
                  }
                >
                  {profileText(lang, 'quote')}
                </Text>

                <Ionicons
                  name="leaf-outline"
                  size={48}
                  color="#9AAA84"
                />

              </View>

            </View>

            {/* =================================================
                QUICK SETTINGS
            ================================================= */}

            <View
              style={
                styles.sectionCard
              }
            >

              <View
                style={
                  styles.titleWithIcon
                }
              >

                <Ionicons
                  name="settings-outline"
                  size={22}
                  color="#55351F"
                />

                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                {profileText(lang, 'settings')}
                </Text>

              </View>

              <SettingRow
                icon="notifications-outline"
                title={profileText(lang, 'notifications')}
                subtitle={profileText(lang, 'notificationsDesc')}
                value={
                  notifications
                }
                onChange={
                  setNotifications
                }
              />

              <SettingRow
                icon="chatbubble-ellipses-outline"
                title={profileText(lang, 'audio')}
                subtitle={profileText(lang, 'audioDesc')}
                value={
                  audioAssistance
                }
                onChange={
                  setAudioAssistance
                }
                last
              />

            </View>

            {/* =================================================
                KEEP CREATING
            ================================================= */}

            <View
              style={
                styles.keepCreating
              }
            >

              <Ionicons
                name="leaf"
                size={42}
                color="#76925F"
              />

              <View
                style={
                  styles.keepCopy
                }
              >

                <Text
                  style={
                    styles.keepTitle
                  }
                >
                {profileText(lang, 'keep')}
                </Text>

                <Text
                  style={
                    styles.keepText
                  }
                >
                {profileText(lang, 'keepDesc')}
                </Text>

              </View>

              <Ionicons
                name="sparkles-outline"
                size={28}
                color="#A96E3B"
              />

            </View>

          </View>

        </View>

      </ScrollView>

      {/* =====================================================
          EDIT PROFILE MODAL
      ===================================================== */}

      <Modal
        visible={
          editModalVisible
        }

        transparent

        animationType="slide"

        onRequestClose={() =>
          setEditModalVisible(false)
        }
      >

        <View
          style={
            styles.modalOverlay
          }
        >

          <View
            style={
              styles.modalCard
            }
          >

            <Text
              style={
                styles.modalTitle
              }
            >
            {profileText(lang, 'editProfile')}
            </Text>

            <Text
              style={
                styles.inputLabel
              }
            >
            {profileText(lang, 'name')}
            </Text>

            <TextInput
              value={
                nameInput
              }

              onChangeText={
                setNameInput
              }

              placeholder={profileText(lang, 'enterName')}

              placeholderTextColor="#A49A91"

              style={
                styles.modalInput
              }
            />

            <Text
              style={
                styles.inputLabel
              }
            >
            {profileText(lang, 'email')}
            </Text>

            <TextInput
              value={
                emailInput
              }

              onChangeText={
                setEmailInput
              }

              placeholder={profileText(lang, 'enterEmail')}

              placeholderTextColor="#A49A91"

              keyboardType="email-address"

              autoCapitalize="none"

              style={
                styles.modalInput
              }
            />

            <Text
              style={
                styles.inputLabel
              }
            >
            {profileText(lang, 'location')}
            </Text>

            <TextInput
              value={
                locationInput
              }

              onChangeText={
                setLocationInput
              }

              placeholder={profileText(lang, 'enterLocation')}

              placeholderTextColor="#A49A91"

              style={
                styles.modalInput
              }
            />

            <View
              style={
                styles.modalButtonRow
              }
            >

              <TouchableOpacity
                style={
                  styles.modalCancelButton
                }

                onPress={() =>
                  setEditModalVisible(
                    false,
                  )
                }
              >

                <Text
                  style={
                    styles.modalCancelText
                  }
                >
                {profileText(lang, 'cancel')}
                </Text>

              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.modalSaveButton
                }

                onPress={
                  handleSaveProfile
                }

                disabled={
                  saving
                }
              >

                <Text
                  style={
                    styles.modalSaveText
                  }
                >
                  {saving
                    ? 'Saving...'
                    : 'Save'}
                </Text>

              </TouchableOpacity>

            </View>

          </View>

        </View>

      </Modal>

      {/* =====================================================
          CHANGE PIN MODAL
      ===================================================== */}

      <Modal
        visible={
          pinModalVisible
        }

        transparent

        animationType="slide"

        onRequestClose={() =>
          setPinModalVisible(false)
        }
      >

        <View
          style={
            styles.modalOverlay
          }
        >

          <View
            style={
              styles.modalCard
            }
          >

            <Text
              style={
                styles.modalTitle
              }
            >
            {profileText(lang, 'changePin')}
            </Text>

            <Text
              style={
                styles.inputLabel
              }
            >
            {profileText(lang, 'currentPin')}
            </Text>

            <TextInput
              value={
                currentPin
              }

              onChangeText={(text) =>
                setCurrentPin(
                  text
                    .replace(/\D/g, '')
                    .slice(0, 4),
                )
              }

              placeholder={profileText(lang, 'pinPlaceholder')}

              placeholderTextColor="#A49A91"

              keyboardType="number-pad"

              secureTextEntry

              maxLength={4}

              style={
                styles.modalInput
              }
            />

            <Text
              style={
                styles.inputLabel
              }
            >
            {profileText(lang, 'newPin')}
            </Text>

            <TextInput
              value={
                newPin
              }

              onChangeText={(text) =>
                setNewPin(
                  text
                    .replace(/\D/g, '')
                    .slice(0, 4),
                )
              }

              placeholder={profileText(lang, 'pinPlaceholder')}

              placeholderTextColor="#A49A91"

              keyboardType="number-pad"

              secureTextEntry

              maxLength={4}

              style={
                styles.modalInput
              }
            />

            <Text
              style={
                styles.inputLabel
              }
            >
            {profileText(lang, 'confirmPin')}
            </Text>

            <TextInput
              value={
                confirmPin
              }

              onChangeText={(text) =>
                setConfirmPin(
                  text
                    .replace(/\D/g, '')
                    .slice(0, 4),
                )
              }

              placeholder={profileText(lang, 'pinPlaceholder')}

              placeholderTextColor="#A49A91"

              keyboardType="number-pad"

              secureTextEntry

              maxLength={4}

              style={
                styles.modalInput
              }
            />

            <View
              style={
                styles.modalButtonRow
              }
            >

              <TouchableOpacity
                style={
                  styles.modalCancelButton
                }

                onPress={() =>
                  setPinModalVisible(
                    false,
                  )
                }
              >

                <Text
                  style={
                    styles.modalCancelText
                  }
                >
                {profileText(lang, 'cancel')}
                </Text>

              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.modalSaveButton
                }

                onPress={
                  handleSavePin
                }

                disabled={
                  saving
                }
              >

                <Text
                  style={
                    styles.modalSaveText
                  }
                >
                  {saving
                    ? 'Saving...'
                    : 'Save PIN'}
                </Text>

              </TouchableOpacity>

            </View>

          </View>

        </View>

      </Modal>

      {/* =====================================================
          LANGUAGE MODAL
      ===================================================== */}

      <Modal
        visible={
          languageModalVisible
        }

        transparent

        animationType="slide"

        onRequestClose={() =>
          setLanguageModalVisible(
            false,
          )
        }
      >

        <View
          style={
            styles.modalOverlay
          }
        >

          <View
            style={
              styles.languageModalCard
            }
          >

            <View
              style={
                styles.languageModalHeader
              }
            >

              <Text
                style={
                  styles.modalTitle
                }
              >
              {profileText(lang, 'changeLanguage')}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setLanguageModalVisible(
                    false,
                  )
                }
              >

                <Ionicons
                  name="close"
                  size={24}
                  color="#5A3923"
                />

              </TouchableOpacity>

            </View>

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
            >

              {languageOptions.map(
                (item) => {

                  const selected =
                    lang === item.code;

                  return (
                    <TouchableOpacity
                      key={
                        item.code
                      }

                      style={[
                        styles.languageOption,

                        selected &&
                          styles.languageOptionSelected,
                      ]}

                      onPress={() =>
                        handleSelectLanguage(
                          item.code,
                        )
                      }

                      activeOpacity={0.75}
                    >

                      <Text
                        style={[
                          styles.languageOptionText,

                          selected &&
                            styles.languageOptionTextSelected,
                        ]}
                      >
                        {item.name}
                      </Text>

                      {selected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={23}
                          color="#8A5A32"
                        />
                      )}

                    </TouchableOpacity>
                  );
                },
              )}

            </ScrollView>

          </View>

        </View>

      </Modal>

    </SafeAreaView>
  );
};

/* =====================================================
   INFO ROW
===================================================== */

interface InfoRowProps {
  icon:
    keyof typeof Ionicons.glyphMap;

  label: string;

  value: string;

  action?: string;

  onPress?: () => void;

  last?: boolean;
}

const InfoRow: React.FC<
  InfoRowProps
> = ({
  icon,
  label,
  value,
  action,
  onPress,
  last = false,
}) => {

  return (
    <View
      style={[
        styles.infoRow,

        !last &&
          styles.infoRowBorder,
      ]}
    >

      <View
        style={
          styles.infoIcon
        }
      >

        <Ionicons
          name={icon}
          size={20}
          color="#39654D"
        />

      </View>

      <View
        style={
          styles.infoCopy
        }
      >

        <Text
          style={
            styles.infoLabel
          }
        >
          {label}
        </Text>

        <Text
          style={
            styles.infoValue
          }

          numberOfLines={2}
        >
          {value}
        </Text>

      </View>

      {action ? (
        <TouchableOpacity
          onPress={
            onPress
          }

          activeOpacity={0.7}
        >

          <Text
            style={
              styles.infoAction
            }
          >
            {action}
          </Text>

        </TouchableOpacity>
      ) : null}

    </View>
  );
};

/* =====================================================
   JOURNEY STAT
===================================================== */

interface JourneyStatProps {
  icon:
    keyof typeof Ionicons.glyphMap;

  value: string;

  label: string;

  type:
    | 'green'
    | 'orange'
    | 'yellow';
}

const JourneyStat: React.FC<
  JourneyStatProps
> = ({
  icon,
  value,
  label,
  type,
}) => {

  return (
    <View
      style={[
        styles.journeyStat,

        type === 'green' &&
          styles.journeyGreen,

        type === 'orange' &&
          styles.journeyOrange,

        type === 'yellow' &&
          styles.journeyYellow,
      ]}
    >

      <Ionicons
        name={icon}
        size={22}
        color="#8A5A32"
      />

      <Text
        style={
          styles.journeyValue
        }
      >
        {value}
      </Text>

      <Text
        style={
          styles.journeyLabel
        }

        numberOfLines={2}
      >
        {label}
      </Text>

    </View>
  );
};

/* =====================================================
   SETTING ROW
===================================================== */

interface SettingRowProps {
  icon:
    keyof typeof Ionicons.glyphMap;

  title: string;

  subtitle: string;

  value: boolean;

  onChange: (
    value: boolean,
  ) => void;

  last?: boolean;
}

const SettingRow: React.FC<
  SettingRowProps
> = ({
  icon,
  title,
  subtitle,
  value,
  onChange,
  last = false,
}) => {

  return (
    <View
      style={[
        styles.settingRow,

        !last &&
          styles.settingBorder,
      ]}
    >

      <View
        style={
          styles.settingIcon
        }
      >

        <Ionicons
          name={icon}
          size={20}
          color="#453327"
        />

      </View>

      <View
        style={
          styles.settingCopy
        }
      >

        <Text
          style={
            styles.settingTitle
          }
        >
          {title}
        </Text>

        <Text
          style={
            styles.settingSubtitle
          }

          numberOfLines={2}
        >
          {subtitle}
        </Text>

      </View>

      <Switch
        value={
          value
        }

        onValueChange={
          onChange
        }

        trackColor={{
          false: '#D8D0C7',
          true: '#9A5D2C',
        }}

        thumbColor="#FFFFFF"

        ios_backgroundColor="#D8D0C7"
      />

    </View>
  );
};

/* =====================================================
   PHONE FORMATTER
===================================================== */

function formatPhone(
  phone: string,
): string {

  const digits =
    String(phone || '')
      .replace(/\D/g, '')
      .slice(-10);

  if (
    digits.length !== 10
  ) {

    return (
      phone ||
      'Not added'
    );
  }

  return `+91 ${digits.slice(
    0,
    5,
  )} ${digits.slice(5)}`;
}

/* =====================================================
   STYLES
===================================================== */

const styles =
  StyleSheet.create({

    safeArea: {
      flex: 1,
      backgroundColor:
        '#FCFAF6',
    },

    scroll: {
      flex: 1,
    },

    container: {
      paddingHorizontal: 15,
      paddingTop: 8,
      paddingBottom: 110,
    },

    wideContainer: {
      paddingHorizontal: 22,
    },

    /* HEADER */

    pageHeader: {
      minHeight: 58,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 13,
    },

    headerText: {
      flex: 1,
    },

    pageTitle: {
      color: '#30251E',
      fontSize: 27,
      fontWeight: '900',
    },

    pageSubtitle: {
      color: '#84786E',
      fontSize: 12,
      marginTop: 2,
    },

    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    notificationButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor:
        '#FFFFFF',
      borderWidth: 1,
      borderColor:
        '#E8DED3',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },

    notificationDot: {
      position: 'absolute',
      right: 7,
      top: 7,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor:
        '#E25543',
    },

    headerAvatar: {
      width: 43,
      height: 43,
      borderRadius: 22,
      backgroundColor:
        '#9C724A',
      alignItems: 'center',
      justifyContent: 'center',
    },

    headerAvatarText: {
      color: '#FFFFFF',
      fontSize: 17,
      fontWeight: '900',
    },

    /* HERO */

    profileHero: {
      minHeight: 195,
      borderRadius: 18,
      backgroundColor:
        '#F7EBDD',
      borderWidth: 1,
      borderColor:
        '#EBDAC8',
      padding: 20,
      flexDirection: 'row',
      overflow: 'hidden',
      marginBottom: 15,
    },

    avatarSection: {
      width: 125,
      alignItems: 'center',
      justifyContent: 'center',
    },

    largeAvatar: {
      width: 112,
      height: 112,
      borderRadius: 56,
      backgroundColor:
        '#A7784F',
      alignItems: 'center',
      justifyContent: 'center',
    },

    largeAvatarText: {
      color: '#FFFFFF',
      fontSize: 49,
      fontWeight: '900',
    },

    cameraButton: {
      position: 'absolute',
      right: 0,
      bottom: 22,
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor:
        '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 3,
    },

    profileHeroInfo: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 15,
    },

    profileName: {
      color: '#251D18',
      fontSize: 25,
      fontWeight: '900',
    },

    profileRole: {
      color: '#75675D',
      fontSize: 13,
      marginTop: 1,
    },

    profileBio: {
      color: '#65584F',
      fontSize: 12,
      marginTop: 9,
    },

    profileMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 16,
      gap: 11,
    },

    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      maxWidth: 260,
    },

    metaText: {
      color: '#46362A',
      fontSize: 11,
      fontWeight: '600',
    },

    metaDivider: {
      width: 1,
      height: 20,
      backgroundColor:
        '#D4C2B0',
    },

    heroDecoration: {
      width: 180,
      alignItems: 'center',
      justifyContent: 'center',
    },

    heroLeaves: {
      height: 80,
      width: 120,
      alignItems: 'center',
      justifyContent: 'center',
    },

    creatorText: {
      color: '#744423',
      fontSize: 15,
      fontWeight: '600',
      fontStyle: 'italic',
      textAlign: 'center',
      marginTop: 3,
    },

    /* COLUMNS */

    columns: {
      flexDirection: 'row',
      gap: 14,
      alignItems: 'flex-start',
    },

    mobileColumns: {
      flexDirection: 'column',
    },

    leftColumn: {
      flex: 1.15,
      gap: 14,
    },

    rightColumn: {
      flex: 0.85,
      gap: 14,
    },

    mobileColumn: {
      width: '100%',
      flex: 0,
    },

    /* CARD */

    sectionCard: {
      backgroundColor:
        '#FFFFFF',
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        '#E7DED5',
      padding: 15,

      shadowColor:
        '#5D432F',

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity: 0.05,

      shadowRadius: 6,

      elevation: 2,
    },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginBottom: 10,
    },

    titleWithIcon: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      flex: 1,
    },

    sectionTitle: {
      color: '#2D241D',
      fontSize: 17,
      fontWeight: '900',
    },

    editButton: {
      height: 34,
      paddingHorizontal: 13,
      borderRadius: 18,
      backgroundColor:
        '#F5EFE9',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },

    editButtonText: {
      color: '#5A3923',
      fontSize: 11,
      fontWeight: '800',
    },

    /* INFO */

    infoRow: {
      minHeight: 68,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 7,
    },

    infoRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor:
        '#EEE7E0',
    },

    infoIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor:
        '#EAF1EA',
      alignItems: 'center',
      justifyContent: 'center',
    },

    infoCopy: {
      flex: 1,
      marginLeft: 11,
      marginRight: 8,
    },

    infoLabel: {
      color: '#8A8179',
      fontSize: 10,
    },

    infoValue: {
      color: '#302820',
      fontSize: 14,
      fontWeight: '600',
      marginTop: 3,
    },

    infoAction: {
      color: '#75431F',
      fontSize: 11,
      fontWeight: '800',
      marginLeft: 8,
    },

    /* ACCOUNT */

    actionRow: {
      gap: 10,
      marginTop: 12,
    },

    actionCard: {
      minHeight: 75,
      borderRadius: 13,
      borderWidth: 1,
      borderColor:
        '#E8DED4',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 11,
      backgroundColor:
        '#FFFFFF',
    },

    signOutCard: {
      backgroundColor:
        '#FFF9F6',
    },

    actionIcon: {
      width: 43,
      height: 43,
      borderRadius: 13,
      backgroundColor:
        '#FFF2D8',
      alignItems: 'center',
      justifyContent: 'center',
    },

    signOutIcon: {
      backgroundColor:
        '#FCE9E1',
    },

    actionCopy: {
      flex: 1,
      marginHorizontal: 10,
    },

    actionTitle: {
      color: '#322920',
      fontSize: 12,
      fontWeight: '800',
    },

    actionSubtitle: {
      color: '#8A8179',
      fontSize: 9,
      marginTop: 3,
    },

    /* JOURNEY */

    journeyRow: {
      flexDirection: 'row',
      gap: 7,
      marginTop: 12,
    },

    journeyStat: {
      flex: 1,
      minHeight: 105,
      borderRadius: 13,
      padding: 10,
    },

    journeyGreen: {
      backgroundColor:
        '#F0F5EC',
    },

    journeyOrange: {
      backgroundColor:
        '#FFF1E8',
    },

    journeyYellow: {
      backgroundColor:
        '#FFF7E5',
    },

    journeyValue: {
      color: '#2D251E',
      fontSize: 20,
      fontWeight: '900',
      marginTop: 6,
    },

    journeyLabel: {
      color: '#786F67',
      fontSize: 9,
      marginTop: 2,
    },

    quoteBox: {
      minHeight: 95,
      borderRadius: 13,
      backgroundColor:
        '#FBF2E7',
      marginTop: 10,
      padding: 13,
      flexDirection: 'row',
      alignItems: 'center',
    },

    quote: {
      flex: 1,
      color: '#503523',
      fontSize: 14,
      lineHeight: 21,
      fontStyle: 'italic',
    },

    /* SETTINGS */

    settingRow: {
      minHeight: 75,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },

    settingBorder: {
      borderBottomWidth: 1,
      borderBottomColor:
        '#EEE7E0',
    },

    settingIcon: {
      width: 39,
      height: 39,
      borderRadius: 20,
      backgroundColor:
        '#FAF7F2',
      alignItems: 'center',
      justifyContent: 'center',
    },

    settingCopy: {
      flex: 1,
      marginHorizontal: 10,
    },

    settingTitle: {
      color: '#332A23',
      fontSize: 12,
      fontWeight: '700',
    },

    settingSubtitle: {
      color: '#8B827A',
      fontSize: 9,
      marginTop: 3,
    },

    /* KEEP CREATING */

    keepCreating: {
      minHeight: 92,
      borderRadius: 16,
      backgroundColor:
        '#F7EAD8',
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
    },

    keepCopy: {
      flex: 1,
      marginHorizontal: 10,
    },

    keepTitle: {
      color: '#643A20',
      fontSize: 17,
      fontWeight: '900',
    },

    keepText: {
      color: '#796A5D',
      fontSize: 9,
      marginTop: 3,
    },

    /* =================================================
       MODALS
    ================================================= */

    modalOverlay: {
      flex: 1,
      backgroundColor:
        'rgba(0,0,0,0.45)',
      justifyContent: 'center',
      paddingHorizontal: 20,
    },

    modalCard: {
      backgroundColor:
        '#FFFFFF',
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor:
        '#E7DED5',
    },

    modalTitle: {
      color: '#30251E',
      fontSize: 21,
      fontWeight: '900',
      marginBottom: 18,
    },

    inputLabel: {
      color: '#5A3923',
      fontSize: 12,
      fontWeight: '800',
      marginBottom: 6,
      marginTop: 8,
    },

    modalInput: {
      height: 48,
      borderWidth: 1,
      borderColor:
        '#DCCFC2',
      borderRadius: 11,
      paddingHorizontal: 13,
      color: '#302820',
      backgroundColor:
        '#FCFAF6',
      fontSize: 14,
    },

    modalButtonRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 20,
    },

    modalCancelButton: {
      flex: 1,
      height: 46,
      borderRadius: 12,
      borderWidth: 1,
      borderColor:
        '#D8CCC0',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        '#FFFFFF',
    },

    modalCancelText: {
      color: '#6E6259',
      fontSize: 13,
      fontWeight: '800',
    },

    modalSaveButton: {
      flex: 1,
      height: 46,
      borderRadius: 12,
      backgroundColor:
        '#8A5A32',
      alignItems: 'center',
      justifyContent: 'center',
    },

    modalSaveText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '800',
    },

    /* LANGUAGE */

    languageModalCard: {
      backgroundColor:
        '#FFFFFF',
      borderRadius: 20,
      padding: 20,
      maxHeight: '80%',
      borderWidth: 1,
      borderColor:
        '#E7DED5',
    },

    languageModalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginBottom: 8,
    },

    languageOption: {
      minHeight: 52,
      borderRadius: 12,
      paddingHorizontal: 14,
      marginTop: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      borderWidth: 1,
      borderColor:
        '#EEE5DC',
      backgroundColor:
        '#FFFFFF',
    },

    languageOptionSelected: {
      backgroundColor:
        '#F7EBDD',
      borderColor:
        '#C99D75',
    },

    languageOptionText: {
      color: '#45372D',
      fontSize: 14,
      fontWeight: '600',
    },

    languageOptionTextSelected: {
      color: '#744423',
      fontWeight: '900',
    },
  });
