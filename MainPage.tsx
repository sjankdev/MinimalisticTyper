import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';

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
    }
  };

  const loadData = async () => {
    try {
      const savedTexts = await AsyncStorage.getItem('@texts');
      if (savedTexts !== null) {
        const parsedTexts = JSON.parse(savedTexts);
        if (Array.isArray(parsedTexts)) {
          setTexts(parsedTexts.reverse());
        }
      }
    } catch (e) {
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
      updatedTexts = [{ text, date }, ...texts];
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
      <View style={texts.length === 0 ? styles.centerButtonContainer : styles.topButtonContainer}>
        <TouchableOpacity
          style={styles.startTypingButton}
          onPress={() => navigation.navigate('Typing', { addText })}
        >
          <Text style={styles.buttonText}>Start Typing</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={texts}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => handleEditText(item.text, index)}>
            <View style={styles.textContainer}>
              <Text style={styles.textItem}>{truncateText(item.text || '')}</Text>
              <Text style={styles.dateItem}>{item.date || ''}</Text>
              <TouchableOpacity onPress={() => confirmDelete(index)}>
                <Icon name="trash-outline" size={24} color="#C62828" />
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
    backgroundColor: 'black',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
  },
  centerButtonContainer: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center', 
    width: '100%',
  },
  topButtonContainer: {
    width: '100%', 
    marginBottom: 20, 
    alignItems: 'center',
  },
  startTypingButton: {
    backgroundColor: 'transparent',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#1E90FF',
    marginBottom: 20,
  },
  buttonText: {
    color: '#1E90FF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textItem: {
    color: 'white',
    flex: 1,
  },
  dateItem: {
    color: 'gray',
  },
});

export default MainPage;
