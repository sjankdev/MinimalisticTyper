import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SavedText {
  text: string;
  date: string; 
}

const formatDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`; 
};


const MainPage: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [texts, setTexts] = useState<SavedText[]>([]);

  const storeData = async (texts: SavedText[]) => {
    try {
      await AsyncStorage.setItem('@texts', JSON.stringify(texts));
    } catch (e) {
      console.error('Failed to save texts.', e);
    }
  };

  const loadData = async () => {
    try {
      const savedTexts = await AsyncStorage.getItem('@texts');
      if (savedTexts !== null) {
        const parsedTexts = JSON.parse(savedTexts);
        if (Array.isArray(parsedTexts)) {
          setTexts(parsedTexts);
        } else {
          console.error('Loaded data is not an array:', parsedTexts);
        }
      }
    } catch (e) {
      console.error('Failed to load texts.', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addText = async (text: string, index?: number) => {
    const date = formatDate(new Date()); 
    let updatedTexts;

    if (index !== undefined) {
      updatedTexts = [...texts];
      updatedTexts[index] = { text, date };
    } else {
      updatedTexts = [...texts, { text, date }];
    }

    setTexts(updatedTexts);
    await storeData(updatedTexts);
  };

  const handleEditText = (text: string, index: number) => {
    navigation.navigate('Typing', { addText, initialText: text, index });
  };

  const truncateText = (text: string) => {
    return text.length > 30 ? text.slice(0, 30) + '...' : text;
  };

  const deleteText = async (index: number) => {
    const updatedTexts = texts.filter((_, i) => i !== index); 
    setTexts(updatedTexts);
    await storeData(updatedTexts); 
  };

  const confirmDelete = (index: number) => {
    Alert.alert(
      'Delete Text',
      'Are you sure you want to delete this text?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => deleteText(index) },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <Button
        title="Start Typing"
        onPress={() => navigation.navigate('Typing', { addText })}
      />
      <FlatList
        data={texts}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => handleEditText(item.text, index)}>
            <View style={styles.textContainer}>
              <Text style={styles.textItem}>{truncateText(item.text || '')}</Text>
              <Text style={styles.dateItem}>{item.date || ''}</Text>
              <TouchableOpacity onPress={() => confirmDelete(index)}>
                <Text style={styles.deleteItem}>Delete</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%', 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textItem: {
    color: 'blue', 
  },
  dateItem: {
    color: 'gray', 
  },
  deleteItem: {
    color: 'red',
  },
});

export default MainPage;

