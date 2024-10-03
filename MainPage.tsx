import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text, Dimensions, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import RenderHTML from 'react-native-render-html';
import ConfirmationDialog from './ConfirmationDialog';

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
  const [dialogVisible, setDialogVisible] = useState<boolean>(false);
  const [bulkDeleteDialogVisible, setBulkDeleteDialogVisible] = useState<boolean>(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

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
    setDeleteIndex(index);
    setDialogVisible(true);
  };

  const confirmDeleteSelectedTexts = () => {
    setBulkDeleteDialogVisible(true);
  };

  const deleteSelectedTexts = async () => {
    const updatedTexts = texts.filter((_, i) => !selectedIndices.includes(i));
    setTexts(updatedTexts);
    await storeData(updatedTexts);
    setSelectedIndices([]);
    setIsSelectMode(false);
    setBulkDeleteDialogVisible(false);
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
              <Icon name="trash-outline" size={24} color="#C62828" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.selectButtonContainer}>
        <TouchableOpacity onPress={() => {
          setIsSelectMode(!isSelectMode);
          setSelectedIndices([]);
        }} style={[styles.selectButton, isSelectMode && styles.selectButtonActive]}>
          <Text style={styles.selectButtonText}>{isSelectMode ? 'Cancel Selection' : 'Select Texts'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.spacer} />

      {renderHeader()}

      <FlatList
        data={texts}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.startTypingButton}
        onPress={() => {
          setIsSelectMode(false);
          setSelectedIndices([]);
          navigation.navigate('Typing', { addText });
        }}
      >
        <Icon name="add" size={32} color="#007BFF" />
      </TouchableOpacity>

      <ConfirmationDialog
        visible={dialogVisible}
        title="Delete Text"
        message="Are you sure you want to delete this text?"
        onConfirm={() => {
          if (deleteIndex !== null) {
            deleteText(deleteIndex);
            setDeleteIndex(null);
          }
          setDialogVisible(false);
        }}
        onCancel={() => {
          setDialogVisible(false);
          setDeleteIndex(null);
        }}
      />

      <ConfirmationDialog
        visible={bulkDeleteDialogVisible}
        title="Delete Selected"
        message="Are you sure you want to delete the selected texts?"
        onConfirm={deleteSelectedTexts}
        onCancel={() => setBulkDeleteDialogVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 10,
  },
  titleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textContainer: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectedTextContainer: {
    backgroundColor: '#007BFF',
  },
  dateItem: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  dateText: {
    color: 'lightgray',
    fontSize: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 10,
    backgroundColor: '#121212',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    margin: 4,
  },
  startTypingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 50,
    alignItems: 'center',
    elevation: 3,
  },
  selectButtonContainer: {
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  selectButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignItems: 'center',
    width: 150,
  },
  selectButtonActive: {
    backgroundColor: '#C62828',
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContent: {
    flex: 1,
  },
  spacer: {
    height: 10,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MainPage;
