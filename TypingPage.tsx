import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, TextInput } from 'react-native';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import Icon from 'react-native-vector-icons/Ionicons';

const TypingPage: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { addText, initialText, initialTitle, index } = route.params;
  const [inputText, setInputText] = useState(initialText || '');
  const [inputTitle, setInputTitle] = useState(initialTitle || '');
  const richText = useRef<RichEditor>(null);

  const handleDone = () => {
    addText(inputTitle, inputText, index);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.innerContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TextInput
          style={styles.titleInput}
          value={inputTitle}
          placeholder="Insert Title"
          placeholderTextColor="white"
          onChangeText={setInputTitle}
        />

        <RichEditor
          ref={richText}
          initialContentHTML={inputText}
          style={styles.richEditor}
          placeholder="Insert here..."
          editorStyle={{
            backgroundColor: 'transparent',
            color: 'white',
            placeholderColor: 'gray',
          }}
          onChange={(html) => setInputText(html)}
        />

        <RichToolbar
          editor={richText}
          actions={[
            actions.setBold,
            actions.setItalic,
            actions.setUnderline,
            actions.setStrikethrough,
            actions.insertBulletsList,
            actions.insertOrderedList,
            actions.insertLink,
            actions.insertImage,
            actions.insertVideo,
            actions.checkboxList,
            actions.undo,
            actions.redo,
            actions.removeFormat,
          ]}
          iconTint="white"
          style={styles.toolbar}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleDone} style={styles.button}>
            <Icon name="checkmark" size={30} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.button}>
            <Icon name="close" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  innerContainer: {
    flex: 1,
    padding: 20,
  },
  titleInput: {
    height: 50,
    marginBottom: 15,
    color: 'white',
    paddingHorizontal: 10,
    borderBottomWidth: 0.6,
    borderBottomColor: 'gray',
    fontSize: 16,
  },
  richEditor: {
    flex: 1,
    backgroundColor: 'transparent',
    marginBottom: 15,
  },
  toolbar: {
    backgroundColor: 'black',
    borderTopWidth: 1,
    borderTopColor: 'gray',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    padding: 10,
    alignItems: 'center',
  },
});

export default TypingPage;
