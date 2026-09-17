import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  PALETTE,
  RADIUS,
  SPACING,
  TOUCH_TARGET,
  ELEVATION,
} from '../theme/tokens';

import {
  ApiAdapter,
} from '../adapters/api';

import {
  SpeechAdapter,
} from '../adapters/speech';

import {
  useLanguage,
} from '../i18n/LanguageContext';


type Role =
  | 'ARTISAN'
  | 'CUSTOMER'
  | 'ADMIN'
  | 'GUEST';


interface Props {
  role?: Role;
}


export const VoiceAssistant: React.FC<Props> = ({
  role = 'GUEST',
}) => {

  const { lang } =
    useLanguage();

  /*
   * Native Expo recorder.
   *
   * No WebSocket.
   * No Deepgram live stream.
   * No PCM streaming.
   */
  const recorder =
    useAudioRecorder(
      RecordingPresets.HIGH_QUALITY
    );

  const recorderState =
    useAudioRecorderState(
      recorder
    );

  const [panelOpen, setPanelOpen] =
    useState(false);

  const [busy, setBusy] =
    useState(false);

  const [message, setMessage] =
    useState('');

  const [answer, setAnswer] =
    useState('');

  const [error, setError] =
    useState('');


  const roleLabel =
    useMemo(() => {

      switch (role) {

        case 'ARTISAN':
          return 'artisan';

        case 'CUSTOMER':
          return 'buyer';

        case 'ADMIN':
          return 'admin';

        default:
          return 'guest';
      }

    }, [role]);


  const isRecording =
    Boolean(
      recorderState.isRecording
    );


  useEffect(() => {

    return () => {
      SpeechAdapter
        .stop()
        .catch(() => {});
    };

  }, []);


  /*
   * START RECORDING
   */
  const startRecording =
    async () => {

      if (busy || isRecording) {
        return;
      }

      setPanelOpen(true);
      setError('');
      setAnswer('');
      setMessage('');

      try {

        const permission =
          await AudioModule
            .requestRecordingPermissionsAsync();

        if (!permission.granted) {

          throw new Error(
            'Microphone permission is required for the voice assistant.'
          );
        }


        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });


        await recorder
          .prepareToRecordAsync();


        recorder.record();

      } catch (err: any) {

        console.error(
          '[VoiceAssistant] Start error:',
          err
        );

        setError(
          err?.message ||
          'Could not start voice recording.'
        );
      }
    };


  /*
   * STOP RECORDING
   * ↓
   * Sarvam STT
   * ↓
   * Gemini
   * ↓
   * TTS
   */
  const stopRecording =
    async () => {

      if (!isRecording || busy) {
        return;
      }

      setBusy(true);
      setError('');

      try {

        await recorder.stop();


        const audioUri =
          recorder.uri;


        if (!audioUri) {

          throw new Error(
            'The recorded audio file was not created.'
          );
        }


        /*
         * Speech-to-text
         */
        const transcription =
          await ApiAdapter
            .transcribeAudio(
              audioUri,
              lang
            );


        const transcript =
          transcription.transcript
            ?.trim();


        if (!transcript) {

          throw new Error(
            'I could not hear any speech. Please try again.'
          );
        }


        setMessage(
          transcript
        );


        /*
         * Gemini assistant
         */
        const response =
          await ApiAdapter
            .askVoiceAssistant(
              transcript,
              lang,
              roleLabel,
              'global app'
            );


        const assistantText =
          response.answer
            ?.trim();


        if (!assistantText) {

          throw new Error(
            'The assistant returned an empty response.'
          );
        }


        setAnswer(
          assistantText
        );


        /*
         * Text-to-speech
         */
        await SpeechAdapter.speak(
          assistantText,
          lang as any
        );

      } catch (err: any) {

        console.error(
          '[VoiceAssistant] Voice processing error:',
          err
        );

        setError(
          err?.message ||
          'Voice assistant could not process your request.'
        );

      } finally {

        setBusy(false);
      }
    };


  const toggleRecording =
    async () => {

      if (busy) {
        return;
      }

      if (isRecording) {

        await stopRecording();

      } else {

        await startRecording();

      }
    };


  const closePanel =
    async () => {

      try {

        if (isRecording) {
          await recorder.stop();
        }

      } catch {}

      await SpeechAdapter
        .stop()
        .catch(() => {});

      setPanelOpen(false);
      setBusy(false);
      setError('');
    };


  return (

    <View
      pointerEvents="box-none"
      style={styles.overlay}
    >

      {panelOpen && (

        <View style={styles.panel}>

          <View style={styles.panelHeader}>

            <View style={styles.brandMark}>

              <Ionicons
                name="sparkles"
                size={16}
                color={
                  PALETTE.textInverse
                }
              />

            </View>


            <View
              style={
                styles.panelHeaderText
              }
            >

              <Text
                style={
                  styles.panelTitle
                }
              >
                Craft Mastery Assistant
              </Text>


              <Text
                style={
                  styles.panelSubtitle
                }
              >
                Voice help · {roleLabel}
              </Text>

            </View>


            <Pressable
              onPress={
                closePanel
              }
              style={
                styles.closeButton
              }
            >

              <Ionicons
                name="close"
                size={20}
                color={
                  PALETTE.textMuted
                }
              />

            </Pressable>

          </View>


          {message ? (

            <View
              style={
                styles.messageBubble
              }
            >

              <Text
                style={
                  styles.messageLabel
                }
              >
                You said
              </Text>


              <Text
                style={
                  styles.messageText
                }
              >
                {message}
              </Text>

            </View>

          ) : null}


          {answer ? (

            <View
              style={
                styles.answerBubble
              }
            >

              <View
                style={
                  styles.answerHeader
                }
              >

                <Text
                  style={
                    styles.answerLabel
                  }
                >
                  Assistant
                </Text>


                <Ionicons
                  name="volume-high-outline"
                  size={16}
                  color={
                    PALETTE.primary
                  }
                />

              </View>


              <Text
                style={
                  styles.answerText
                }
              >
                {answer}
              </Text>

            </View>

          ) : null}


          {error ? (

            <Text
              style={
                styles.errorText
              }
            >
              {error}
            </Text>

          ) : null}


          <View
            style={
              styles.panelFooter
            }
          >

            <Text
              style={
                styles.hint
              }
            >

              {busy
                ? 'Processing your voice…'
                : isRecording
                  ? 'Tap the microphone when you finish'
                  : 'Ask anything about Craft Mastery'}

            </Text>


            <Pressable
              onPress={
                toggleRecording
              }
              disabled={busy}
              style={[
                styles.micButton,

                isRecording &&
                  styles.micButtonListening,

                busy &&
                  styles.micButtonBusy,
              ]}
            >

              {busy ? (

                <ActivityIndicator
                  color={
                    PALETTE.textInverse
                  }
                />

              ) : (

                <Ionicons
                  name={
                    isRecording
                      ? 'stop'
                      : 'mic'
                  }
                  size={25}
                  color={
                    PALETTE.textInverse
                  }
                />

              )}

            </Pressable>

          </View>

        </View>

      )}


      <Pressable
        onPress={() =>
          setPanelOpen(
            value => !value
          )
        }
        style={[
          styles.fab,
          panelOpen &&
            styles.fabOpen,
        ]}
      >

        <Ionicons
          name={
            panelOpen
              ? 'chevron-down'
              : 'mic'
          }
          size={24}
          color={
            PALETTE.textInverse
          }
        />

        <View
          style={
            styles.fabDot
          }
        />

      </Pressable>

    </View>
  );
};


const styles =
  StyleSheet.create({

    overlay: {
      ...StyleSheet.absoluteFill,
      zIndex: 9999,
      elevation: 9999,
    },

    fab: {
      position: 'absolute',
      right: SPACING.lg,
      bottom: 76,
      width: 58,
      height: 58,
      borderRadius: RADIUS.full,
      backgroundColor:
        PALETTE.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...ELEVATION.fab,
    },

    fabOpen: {
      backgroundColor:
        PALETTE.primaryDark,
    },

    fabDot: {
      position: 'absolute',
      right: 9,
      top: 9,
      width: 8,
      height: 8,
      borderRadius:
        RADIUS.full,
      backgroundColor:
        PALETTE.aiAccent,
      borderWidth: 2,
      borderColor:
        PALETTE.primary,
    },

    panel: {
      position: 'absolute',
      left: SPACING.lg,
      right: SPACING.lg,
      bottom: 146,
      backgroundColor:
        PALETTE.surface,
      borderRadius: RADIUS.xl,
      borderWidth: 1,
      borderColor:
        PALETTE.surfaceBorder,
      padding: SPACING.md,
      ...ELEVATION.sheet,
    },

    panelHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    brandMark: {
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        PALETTE.primary,
    },

    panelHeaderText: {
      flex: 1,
      marginLeft: SPACING.sm,
    },

    panelTitle: {
      color:
        PALETTE.textPrimary,
      fontSize: 14,
      fontWeight: '800',
    },

    panelSubtitle: {
      color:
        PALETTE.textMuted,
      fontSize: 11,
      marginTop: 2,
    },

    closeButton: {
      width:
        TOUCH_TARGET.minWidth,
      height:
        TOUCH_TARGET.minHeight,
      alignItems: 'center',
      justifyContent: 'center',
    },

    messageBubble: {
      marginTop: SPACING.md,
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      backgroundColor:
        PALETTE.surfaceHighlight,
    },

    messageLabel: {
      color:
        PALETTE.textMuted,
      fontSize: 10,
      fontWeight: '700',
      textTransform:
        'uppercase',
    },

    messageText: {
      color:
        PALETTE.textPrimary,
      fontSize: 14,
      lineHeight: 20,
      marginTop: 4,
    },

    answerBubble: {
      marginTop: SPACING.sm,
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      backgroundColor:
        PALETTE.primaryMuted,
      borderWidth: 1,
      borderColor:
        PALETTE.primary + '30',
    },

    answerHeader: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
    },

    answerLabel: {
      color:
        PALETTE.primary,
      fontSize: 10,
      fontWeight: '800',
      textTransform:
        'uppercase',
    },

    answerText: {
      color:
        PALETTE.textPrimary,
      fontSize: 14,
      lineHeight: 21,
      marginTop: 5,
    },

    errorText: {
      color:
        PALETTE.error,
      fontSize: 12,
      lineHeight: 17,
      marginTop: SPACING.sm,
    },

    panelFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: SPACING.md,
    },

    hint: {
      flex: 1,
      color:
        PALETTE.textMuted,
      fontSize: 11,
      lineHeight: 16,
      marginRight: SPACING.sm,
    },

    micButton: {
      width: 52,
      height: 52,
      borderRadius:
        RADIUS.full,
      backgroundColor:
        PALETTE.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },

    micButtonListening: {
      backgroundColor:
        PALETTE.error,
    },

    micButtonBusy: {
      opacity: 0.75,
    },
  });