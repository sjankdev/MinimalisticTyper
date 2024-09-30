import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';

const TypingPage: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const [inputText, setInputText] = useState('');
  const { addText, initialText, index } = route.params;

  useEffect(() => {
    if (initialText) {
      setInputText(initialText);
    }
  }, [initialText]);

  const handleDone = () => {
    addText(inputText, index); 
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        multiline
        placeholder="Type here..."
        value={inputText}
        onChangeText={setInputText}
      />
      <Button title="Done" onPress={handleDone} />
      <Button title="X" onPress={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    height: 200,
    borderColor: 'gray',
    borderWidth: 1,
    color: 'white',
    padding: 10,
  },
});

export default TypingPage;
