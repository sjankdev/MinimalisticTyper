import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Alert, Text, Dimensions, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';

interface SavedText {
  title: string;
  text: string;
  date: string;
  timestamp: number;
}

const formatDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const MainPage: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [texts, setTexts] = useState<SavedText[]>([]);

  const storeData = async (texts: SavedText[]) => {
    try {
      await AsyncStorage.setItem('@texts', JSON.stringify(texts));
    } catch (e) {
      console.error("Error storing data", e);
    }
  };

  const loadData = async () => {
    try {
      const savedTexts = await AsyncStorage.getItem('@texts');
      if (savedTexts !== null) {
        const parsedTexts = JSON.parse(savedTexts);
        if (Array.isArray(parsedTexts)) {
          const sortedTexts = parsedTexts.sort((a, b) => b.timestamp - a.timestamp);
          setTexts(sortedTexts);
        }
      }
    } catch (e) {
      console.error("Error loading data", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addText = async (title: string, text: string, index?: number) => {
    const date = formatDate(new Date());
    const timestamp = Date.now();
    let updatedTexts;

    if (index !== undefined) {
      const updatedText = { title, text, date, timestamp };
      updatedTexts = texts.filter((_, i) => i !== index);
      updatedTexts = [updatedText, ...updatedTexts];
    } else {
      updatedTexts = [{ title, text, date, timestamp }, ...texts];
    }

    setTexts(updatedTexts);
    await storeData(updatedTexts);
  };

  const handleEditText = (title: string, text: string, index: number) => {
    navigation.navigate('Typing', { addText, initialText: text, initialTitle: title, index });
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
    <SafeAreaView style={styles.container}>
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
          <TouchableOpacity onPress={() => handleEditText(item.title, item.text, index)}>
            <View style={styles.textContainer}>
              <View style={styles.textContent}>
                <Text style={styles.titleText} numberOfLines={1} ellipsizeMode="tail">
                  {item.title}
                </Text>
              </View>
              <View style={styles.dateItem}>
                <Text style={styles.dateText}>{item.date || ''}</Text>
              </View>
              <View style={styles.deleteButton}>
                <TouchableOpacity onPress={() => confirmDelete(index)}>
                  <Icon name="trash-outline" size={28} color="#C62828" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 20,
  },
  titleText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
    width: '100%',
  },
  textContent: {
    width: '60%',
    paddingRight: 10,
  },
  dateItem: {
    width: '25%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    color: 'gray',
    textAlign: 'center',
  },
  deleteButton: {
    width: '15%',
    alignItems: 'flex-end',
  },
});

export default MainPage;
