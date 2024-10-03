import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Alert, Text, Dimensions, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import RenderHTML from 'react-native-render-html';

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
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isSelectMode, setIsSelectMode] = useState<boolean>(false);

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

  const confirmDeleteSelectedTexts = () => {
    Alert.alert(
      'Delete Selected',
      'Are you sure you want to delete the selected texts?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: deleteSelectedTexts },
      ],
      { cancelable: false }
    );
  };

  const deleteSelectedTexts = async () => {
    const updatedTexts = texts.filter((_, i) => !selectedIndices.includes(i));
    setTexts(updatedTexts);
    await storeData(updatedTexts);
    setSelectedIndices([]);
    setIsSelectMode(false);
  };

  const toggleSelect = (index: number) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter(i => i !== index));
    } else {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIndices.length === texts.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(texts.map((_, index) => index));
    }
  };

  const renderHeader = () => {
    if (isSelectMode) {
      return (
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleSelectAll}>
            <Text style={styles.buttonText}>
              {selectedIndices.length === texts.length ? 'Deselect All' : 'Select All'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={confirmDeleteSelectedTexts} disabled={selectedIndices.length === 0}>
            <Text style={[styles.buttonText, { color: selectedIndices.length === 0 ? 'gray' : '#C62828' }]}>
              Delete Selected
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  const renderItem = ({ item, index }: { item: SavedText; index: number }) => {
    const truncatedText = item.text.length > 100 ? item.text.slice(0, 100) + '...' : item.text;

    return (
      <TouchableOpacity onPress={() => {
        if (isSelectMode) {
          toggleSelect(index);
        } else {
          handleEditText(item.title, item.text, index);
        }
      }}>
        <View style={[styles.textContainer, selectedIndices.includes(index) && styles.selectedTextContainer]}>
          <View style={styles.textContent}>
            <Text style={styles.titleText} numberOfLines={1} ellipsizeMode="tail">
              {item.title}
            </Text>
            <RenderHTML
              contentWidth={Dimensions.get('window').width}
              source={{ html: truncatedText }}
              tagsStyles={{
                body: { color: 'gray' },
                p: { color: 'gray' },
              }}
            />
          </View>
          <View style={styles.dateItem}>
            <Text style={styles.dateText}>{item.date || ''}</Text>
          </View>
          <View style={styles.deleteButton}>
            <TouchableOpacity onPress={() => {
              if (isSelectMode) {
                toggleSelect(index);
              } else {
                confirmDelete(index);
              }
            }}>
              <Icon name="trash-outline" size={28} color="#C62828" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={texts.length === 0 ? styles.centerButtonContainer : styles.topButtonContainer}>
        <TouchableOpacity
          style={styles.startTypingButton}
          onPress={() => {
            setIsSelectMode(false);
            setSelectedIndices([]);
            navigation.navigate('Typing', { addText });
          }}
        >
          <Text style={styles.buttonText}>Start Typing</Text>
        </TouchableOpacity>
      </View>
      {renderHeader()}
      <FlatList
        data={texts}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
      {texts.length > 0 && (
        <TouchableOpacity onPress={() => {
          if (isSelectMode) {
            setSelectedIndices([]);
          }
          setIsSelectMode(!isSelectMode);
        }} style={styles.selectButton}>
          <Text style={styles.buttonText}>{isSelectMode ? 'Cancel' : 'Select'}</Text>
        </TouchableOpacity>
      )}
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
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedTextContainer: {
    backgroundColor: '#1E90FF',
  },
  textContent: {
    flex: 2,
    marginRight: 10,
  },
  dateItem: {
    flex: 1,
    alignItems: 'flex-start',
  },
  dateText: {
    color: 'gray',
    fontSize: 12,
  },
  deleteButton: {
    flex: 0.5,
    alignItems: 'flex-end',
  },
  checkbox: {
    marginRight: 10,
  },
  selectButton: {
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#1E90FF',
    borderRadius: 5,
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'black',
  },
});

export default MainPage;
