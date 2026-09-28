import React, {
  useState,
  useCallback,
  useMemo,
} from 'react';

import {
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import Animated, {
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';

import {
  PollSticker,
  PollOption,
} from '../../types/story';

interface PollCreationModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (poll: PollSticker) => void;
}

const MAX_QUESTION_LENGTH = 100;
const MAX_OPTION_LENGTH = 20;

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;

const generateOptionId = () =>
  Math.random().toString(36).slice(2, 9);

/**
 * Dynamic Instagram-style Poll Creation Modal
 */
export const PollCreationModal: React.FC<
  PollCreationModalProps
> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [question, setQuestion] = useState('');

  const getInitialOptions = (): PollOption[] => [
    {
      id: generateOptionId(),
      text: '',
      votes: 0,
    },
    {
      id: generateOptionId(),
      text: '',
      votes: 0,
    },
  ];

  const [options, setOptions] =
    useState<PollOption[]>(getInitialOptions);

  /**
   * Validation
   */
  const isValid = useMemo(() => {
    const validOptions = options.filter(
      item => item.text.trim().length > 0,
    );

    return (
      question.trim().length > 0 &&
      validOptions.length >= MIN_OPTIONS
    );
  }, [question, options]);

  /**
   * Add new option
   */
  const handleAddOption = useCallback(() => {
    if (options.length >= MAX_OPTIONS) {
      return;
    }

    setOptions(prev => [
      ...prev,
      {
        id: generateOptionId(),
        text: '',
        votes: 0,
      },
    ]);
  }, [options.length]);

  /**
   * Remove option
   */
  const handleRemoveOption = useCallback(
    (id: string) => {
      if (options.length <= MIN_OPTIONS) {
        return;
      }

      setOptions(prev =>
        prev.filter(item => item.id !== id),
      );
    },
    [options.length],
  );

  /**
   * Update option text
   */
  const handleOptionChange = useCallback(
    (
      id: string,
      value: string,
    ) => {
      setOptions(prev =>
        prev.map(item =>
          item.id === id
            ? {
                ...item,
                text: value,
              }
            : item,
        ),
      );
    },
    [],
  );

  /**
   * Reset form
   */
  const resetState = useCallback(() => {
    setQuestion('');
    setOptions(getInitialOptions());
  }, []);

  /**
   * Submit Poll
   */
  const handleDone = useCallback(() => {
    if (!isValid) {
      return;
    }

    const validOptions = options
      .filter(
        item =>
          item.text.trim().length > 0,
      )
      .map(item => ({
        ...item,
        text: item.text.trim(),
      }));

    const newPoll: PollSticker = {
      id: Math.random()
        .toString(36)
        .slice(2, 11),

      type: 'poll',

      question: question.trim(),

      options: validOptions,

      position: {
        x: 0,
        y: 0,
      },

      scale: 1,
      rotation: 0,

      createdAt: Date.now(),
    };

    onSubmit(newPoll);

    resetState();

    onClose();
  }, [
    isValid,
    options,
    question,
    onSubmit,
    onClose,
    resetState,
  ]);

  const handleClose = useCallback(() => {
    resetState();

    onClose();
  }, [onClose, resetState]);

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
        style={styles.container}>
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleClose}>
              <Text style={styles.cancelText}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDone}
              disabled={!isValid}>
              <Text
                style={[
                  styles.doneText,
                  !isValid &&
                    styles.disabledText,
                ]}>
                Done
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={
              styles.scrollContent
            }
            showsVerticalScrollIndicator={
              false
            }>
            <View style={styles.formContainer}>
              <View style={styles.stickerCard}>
                <TextInput
                  style={
                    styles.questionInput
                  }
                  value={question}
                  onChangeText={
                    setQuestion
                  }
                  placeholder="Ask a question..."
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  maxLength={
                    MAX_QUESTION_LENGTH
                  }
                  autoFocus
                  multiline
                  textAlignVertical="center"
                />

                <View
                  style={
                    styles.optionsList
                  }>
                  {options.map(
                    (
                      option,
                      index,
                    ) => (
                      <View
                        key={
                          option.id
                        }
                        style={
                          styles.optionRow
                        }>
                        <View
                          style={
                            styles.optionInputWrapper
                          }>
                          <TextInput
                            style={
                              styles.optionInput
                            }
                            value={
                              option.text
                            }
                            onChangeText={value =>
                              handleOptionChange(
                                option.id,
                                value,
                              )
                            }
                            placeholder={`Option ${
                              index + 1
                            }`}
                            placeholderTextColor="rgba(0,0,0,0.4)"
                            maxLength={
                              MAX_OPTION_LENGTH
                            }
                            returnKeyType="done"
                          />
                        </View>

                        {options.length >
                          MIN_OPTIONS && (
                          <TouchableOpacity
                            style={
                              styles.removeButton
                            }
                            onPress={() =>
                              handleRemoveOption(
                                option.id,
                              )
                            }>
                            <Text
                              style={
                                styles.removeText
                              }>
                              ✕
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ),
                  )}

                  {options.length <
                    MAX_OPTIONS && (
                    <TouchableOpacity
                      style={
                        styles.addOptionButton
                      }
                      onPress={
                        handleAddOption
                      }>
                      <Text
                        style={
                          styles.addOptionText
                        }>
                        + Add Option
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    backgroundColor:
      'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent:
      'space-between',
    zIndex: 10,
  },

  cancelText: {
    color: 'white',
    fontSize: 16,
  },

  doneText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },

  disabledText: {
    opacity: 0.5,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  formContainer: {
    alignItems: 'center',
  },

  stickerCard: {
    backgroundColor:
      'rgba(255,255,255,0.25)',

    borderRadius: 20,

    padding: 20,

    width: '100%',
    maxWidth: 340,

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.3,

    shadowRadius: 10,

    elevation: 8,
  },

  questionInput: {
    color: 'white',

    fontSize: 24,

    fontWeight: '800',

    textAlign: 'center',

    marginBottom: 24,

    padding: 10,

    minHeight: 70,
  },

  optionsList: {
    gap: 12,
  },

  optionRow: {
    flexDirection: 'row',

    alignItems: 'center',

    gap: 10,
  },

  optionInputWrapper: {
    flex: 1,

    backgroundColor: 'white',

    borderRadius: 10,

    paddingVertical: 14,

    paddingHorizontal: 12,
  },

  optionInput: {
    color: '#000',

    fontSize: 18,

    fontWeight: '700',

    textAlign: 'center',

    padding: 0,
  },

  removeButton: {
    width: 38,

    height: 38,

    borderRadius: 19,

    justifyContent: 'center',

    alignItems: 'center',

    backgroundColor:
      'rgba(255,255,255,0.2)',
  },

  removeText: {
    color: 'white',

    fontSize: 18,

    fontWeight: '700',
  },

  addOptionButton: {
    marginTop: 6,

    alignSelf: 'center',
  },

  addOptionText: {
    color: 'white',

    fontSize: 16,

    fontWeight: '700',
  },
});