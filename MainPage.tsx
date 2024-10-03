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
  const [dialogVisible, setDialogVisible] = useState<boolean>(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [sideMenuVisible, setSideMenuVisible] = useState<boolean>(false);
  const [selectionMode, setSelectionMode] = useState<boolean>(false);
  const [selectedTexts, setSelectedTexts] = useState<Set<number>>(new Set());

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

  const handleAdditionalOperations = () => {
    setSideMenuVisible(!sideMenuVisible);
  };

  const handleSelectTexts = () => {
    setSelectionMode(true);
    setSelectedTexts(new Set());
    setSideMenuVisible(false);
  };

  const toggleSelectText = (index: number) => {
    setSelectedTexts(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(index)) {
        newSelection.delete(index);
      } else {
        newSelection.add(index);
      }
      return newSelection;
    });
  };

  const deleteSelectedTexts = async () => {
    const updatedTexts = texts.filter((_, index) => !selectedTexts.has(index));
    setTexts(updatedTexts);
    await storeData(updatedTexts);
    setSelectedTexts(new Set());
    setSelectionMode(false);
  };

  const toggleSelectAllTexts = () => {
    if (selectedTexts.size === texts.length) {
      setSelectedTexts(new Set());
    } else {
      setSelectedTexts(new Set(texts.map((_, i) => i)));
    }
  };

  const renderItem = ({ item, index }: { item: SavedText; index: number }) => {
    const truncatedText = item.text.length > 100 ? item.text.slice(0, 100) + '...' : item.text;

    return (
      <TouchableOpacity onPress={() => selectionMode ? toggleSelectText(index) : handleEditText(item.title, item.text, index)}>
        <View style={[styles.textContainer, selectedTexts.has(index) && styles.selectedText]}>
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
            {!selectionMode && (
              <TouchableOpacity onPress={() => confirmDelete(index)}>
                <Icon name="trash-outline" size={24} color="#C62828" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={texts}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />

      {selectionMode && (
        <View style={styles.selectionActions}>
          <TouchableOpacity onPress={toggleSelectAllTexts}>
            <Text style={styles.actionText}>
              {selectedTexts.size === texts.length ? 'Deselect All' : 'Select All'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={deleteSelectedTexts}>
            <Text style={styles.actionText}>Delete Selected</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            setSelectionMode(false);
            setSelectedTexts(new Set());
          }}>
            <Text style={styles.actionText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.startTypingButton}
          onPress={() => navigation.navigate('Typing', { addText })}
        >
          <Icon name="add" size={32} color="#007BFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.additionalButton}
          onPress={handleAdditionalOperations}
        >
          <Icon name="ellipsis-horizontal" size={32} color="#007BFF" />
        </TouchableOpacity>
      </View>

      {sideMenuVisible && (
        <View style={styles.sideMenu}>
          <TouchableOpacity onPress={handleSelectTexts} style={styles.menuItem}>
            <Text style={styles.menuText}>Select Texts</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSideMenuVisible(false)} style={styles.menuItem}>
            <Text style={styles.menuText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

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
  selectedText: {
    backgroundColor: '#444',
  },
  dateItem: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  dateText: {
    color: 'lightgray',
    fontSize: 12,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  startTypingButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 50,
    alignItems: 'center',
    elevation: 3,
    marginRight: 10,
  },
  additionalButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 50,
    alignItems: 'center',
    elevation: 3,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContent: {
    flex: 1,
  },
  sideMenu: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    elevation: 5,
    width: 200,
  },
  menuItem: {
    paddingVertical: 10,
  },
  menuText: {
    color: '#007BFF',
    fontSize: 16,
  },
  selectionActions: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#444',
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 5,
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default MainPage;
