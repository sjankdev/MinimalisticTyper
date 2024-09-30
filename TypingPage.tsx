import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; 

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
        placeholderTextColor="gray" 
        value={inputText}
        onChangeText={setInputText}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleDone} style={styles.button}>
          <Icon name="checkmark" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.button}>
          <Icon name="close" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'flex-start', 
    padding: 20,
  },
  input: {
    flex: 1, 
    borderWidth: 0, 
    color: 'white',
    padding: 10,
    backgroundColor: 'transparent', 
    textAlignVertical: 'top', 
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
