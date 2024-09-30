import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import Icon from 'react-native-vector-icons/Ionicons'; 

const TypingPage: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { addText, initialText, index } = route.params;
  const [inputText, setInputText] = useState(initialText || '');
  const richText = useRef<RichEditor>(null);

  const handleDone = () => {
    addText(inputText, index);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <RichEditor
        ref={richText}
        initialContentHTML={inputText}
        style={styles.richEditor}
        placeholder="Type here..."
        editorStyle={{
          backgroundColor: 'transparent',
          color: 'white',
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  richEditor: {
    flex: 1,
    padding: 20,
    backgroundColor: 'transparent',
  },
  toolbar: {
    backgroundColor: 'black',
    borderTopWidth: 1,
    borderTopColor: 'gray',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  button: {
    padding: 10,
  },
});

export default TypingPage;
