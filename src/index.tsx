import React, { useEffect, useMemo } from 'react';
import { setup } from 'goober';
import { create } from 'zustand';
import {
  AIType, CloseFn, State, api, baseUrl, cx, domain, getDescription, getNavigatorLanguage, getTitle, isDarkColor,
} from './util';
import { Backdrop, Button, DialogModal, ChatModal } from './components';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

setup(React.createElement);

const useStore = create<{
  state: State;
  options: ResubscribeOptions | null;
  openConsent: (options: ResubscribeOptions) => void;
  close: () => void;
}>((set) => ({
  state: 'closed' as State,
  options: null as ResubscribeOptions | null,
  openConsent: (options: ResubscribeOptions) => set({ state: 'confirming', options }),
  close: () => set({ state: 'closed', options: null }),
}));

interface ResubscribeColors {
  primary: string;
  text: string;
  background: string;
}

export interface ResubscribeOptions {
  /**
   * The slug of the organization
   */
  slug: string;
  /**
   * The type of AI to use.
   */
  aiType: AIType;
  /**
   * The user's id to record the conversation.
   */
  userId: string;
  /**
   * The user's email for logging and support follow-up.
   */
  userEmail?: string;
  /**
   * Override for the title in the dialog.
   */
  title?: string;
  /**
   * Override for the description in the dialog.
   */
  description?: string;
  /**
   * Override for the primary button text in the dialog.
   */
  primaryButtonText?: string;
  /**
   * Override for the cancel button text in the dialog.
   */
  cancelButtonText?: string;
  /**
   * Callback when the component is closed. Use the via parameter to identify how the modal was closed.
   */
  onClose?: CloseFn;
  /**
   * Color settings.
   */
  colors?: ResubscribeColors;
  /**
   * Class name customizations.
   */
  classNames?: {
    overlay?: string;
    modal?: string;
  }
}

const registerConsent = (options: ResubscribeOptions) => {
  const params: Record<string, any> = {
    slug: options.slug,
    uid: options.userId,
    email: options.userEmail,
    ait: options.aiType,
    brloc: getNavigatorLanguage(),
  }
  api.get(
    'sessions/consent',
    params,
  ).catch((e) => {
    console.error('Failed to fetch sessions/consent: ', e);
  });
};

interface WebViewProps {
  options: ResubscribeOptions;
}
const WebViewComponent: React.FunctionComponent<WebViewProps> = ({
  options,
}) => {
  const url = useMemo(() => {
    const queryParams = {
      'ait': options.aiType,
      'uid': options.userId,
      'email': options.userEmail,
      'iframe': 'true',
      'hideclose': 'true',
    };
    const ret = `${baseUrl}/chat/${options.slug}?${Object.entries(queryParams).filter(([_, value]) => value !== undefined).map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`).join('&')}`;
    return ret;
  }, [options]);

  return (
    <>
      <WebView
        source={{ uri: url }}
        style={{ flex: 1, width: "100%", height: "100%" }}
      />
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => {
          Alert.alert(
            'Close Chat',
            'Are you sure you want to close the chat?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'OK', onPress: () => close('close') },
            ],
            { cancelable: false }
          );
        }}
      >
        <Text style={styles.closeButtonText}>X</Text>
      </TouchableOpacity>
    </>
  )
};

let mounted = false;
const ResubscribeComponent: React.FunctionComponent = () => {
  const { state, options } = useStore();

  useEffect(() => {
    mounted = true;
    return () => {
      mounted = false;
    };
  }, []);

  const fetched = React.useRef(false);
  useEffect(() => {
    if (!options || fetched.current) {
      return;
    }
    if (state === 'confirming') {
      registerConsent(options);
    }
  }, [options, state]);

  if (state === 'closed') {
    return null;
  }

  if (!options) {
    console.error('No options provided');
    return null;
  }

  const {
    aiType,
    title,
    description,
    primaryButtonText,
    cancelButtonText,
    colors,
    classNames,
  } = options;

  const isDark = !colors?.background ? false : isDarkColor(colors.background);

  if (state === 'confirming') {
    return (
      <Backdrop isDark={isDark} className={classNames?.overlay}>
        <DialogModal
          backgroundColor={colors?.background}
          color={colors?.text}
          className={classNames?.modal}
        >
          <Text style={styles.title}>
            {title || getTitle(aiType)}
          </Text>
          <Text style={styles.description}>
            {description || getDescription(aiType)}
          </Text>
          <View style={styles.buttons}>
            <Button
              onPress={() => {
                close('cancel-consent');
              }}
              color={colors?.text}
              style={{ backgroundColor: 'transparent' }}
            >
              {cancelButtonText || 'Not right now'}
            </Button>
            <Button
              onPress={() => {
                useStore.setState({ state: 'open' });
              }}
              style={{ backgroundColor: colors?.primary, color: isDark ? colors?.text : colors?.background }}
            >
              {primaryButtonText || 'Let\'s chat!'}
            </Button>
          </View>
        </DialogModal>
      </Backdrop>
    );
  }

  return (
    <Backdrop
      isDark={isDark}
      className={classNames?.overlay}
    >
      <ChatModal
        backgroundColor={colors?.background}
        className={classNames?.modal}
      >
        <WebViewComponent options={options} />
      </ChatModal>
    </Backdrop>
  );
};

let onClose: CloseFn | null = null;
/**
 * Open the consent dialog and then start the conversation.
 */
const openWithConsent = (options: ResubscribeOptions) => {
  if (!mounted) {
    console.error('ResubscribeComponent is not mounted');
  }
  if (useStore.getState().state !== 'closed') {
    console.warn('ResubscribeComponent is already open');
    return;
  }

  useStore.setState({ state: 'confirming', options });
  if (options.onClose) {
    onClose = options.onClose;
  }
};

/**
 * Close the dialog and start the conversation.
 */
const close = (via: 'cancel-consent' | 'close') => {
  if (!mounted) {
    console.error('ResubscribeComponent is not mounted');
  }
  useStore.setState({ state: 'closed', options: null });
  if (onClose) {
    onClose(via);
    onClose = null;
  }
};

/**
 * Set the options for the component.
 */
let headlessOptions: ResubscribeOptions | null = null;
const setOptions = (options: ResubscribeOptions) => {
  headlessOptions = options;
};

/**
 * Open the dialog without the consent dialog.
 */
const openChat = (partialOptions?: Partial<ResubscribeOptions>) => {
  if (!headlessOptions) {
    console.error('No headless options set');
    return;
  }
  
  if (!mounted) {
    console.error('ResubscribeComponent is not mounted');
  }
  if (useStore.getState().state !== 'closed') {
    console.warn('ResubscribeComponent is already open');
    return;
  }

  const merged = {
    ...headlessOptions,
    ...partialOptions,
  };

  useStore.setState({
    state: 'open',
    options: merged,
  });
  if (merged.onClose) {
    onClose = merged.onClose;
  }
};

/**
 * Register a consent request.
 */
const registerConsentRequest = () => {
  if (!headlessOptions) {
    console.error('No headless options set');
    return;
  }
  registerConsent(headlessOptions);
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  Component: ResubscribeComponent,
  openWithConsent,
  close,
  headless: {
    setOptions,
    openChat,
    registerConsentRequest,
  },
}

const styles = StyleSheet.create({
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 10,
    height: 32,
    width: 32,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#5f6368',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  buttons: {
    marginTop: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
});