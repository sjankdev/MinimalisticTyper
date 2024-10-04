import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  Dimensions,
  SafeAreaView,
  Alert,
} from "react-native";
import {
  SavedText,
  storeData,
  loadData,
  addText,
  deleteText,
  deleteAllTexts,
  deleteSelectedTexts,
} from "./src/textManagement/textManager";
import Icon from "react-native-vector-icons/Ionicons";
import RenderHTML from "react-native-render-html";
import ConfirmationDialog from "./ConfirmationDialog";
import styles from './src/styles/styles';

const MainPage: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [texts, setTexts] = useState<SavedText[]>([]);
  const [dialogVisible, setDialogVisible] = useState<boolean>(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [sideMenuVisible, setSideMenuVisible] = useState<boolean>(false);
  const [selectionMode, setSelectionMode] = useState<boolean>(false);
  const [selectedTexts, setSelectedTexts] = useState<Set<number>>(new Set());
  const [confirmAction, setConfirmAction] = useState<
    "deleteAll" | "deleteSelected" | null
  >(null);

  const loadTexts = async () => {
    const loadedTexts = await loadData();
    setTexts(loadedTexts);
  };

  const handleDeleteText = (index: number) => {
    const updatedTexts = deleteText(texts, index);
    setTexts(updatedTexts);
    storeData(updatedTexts);
  };

  const handleAddText = async (title: string, text: string, index?: number) => {
    const updatedTexts = addText(texts, title, text, index);
    setTexts(updatedTexts);
    await storeData(updatedTexts);
  };

  const handleDeleteAllTexts = async () => {
    const updatedTexts = deleteAllTexts();
    setTexts(updatedTexts);
    await storeData(updatedTexts);
  };

  const handleDeleteSelectedTexts = async () => {
    const updatedTexts = deleteSelectedTexts(texts, selectedTexts);
    setTexts(updatedTexts);
    await storeData(updatedTexts);
    setSelectedTexts(new Set());
    setSelectionMode(false);
  };

  useEffect(() => {
    loadTexts();
  }, []);

  const confirmDeleteAction = () => {
    if (confirmAction === "deleteAll") {
      handleDeleteAllTexts();
      setSelectionMode(false);
    } else if (confirmAction === "deleteSelected") {
      handleDeleteSelectedTexts();
      setSelectionMode(false);
    } else if (deleteIndex !== null) {
      handleDeleteText(deleteIndex);
    }
    setDialogVisible(false);
    setConfirmAction(null);
    setDeleteIndex(null);
  };

  const renderItem = ({ item, index }: { item: SavedText; index: number }) => {

    const truncatedTitle =
      item.title.length > 15 ? item.title.slice(0, 15) + "..." : item.title;

    const truncatedText =
      item.text.length > 30 ? item.text.slice(0, 30) + "..." : item.text;

    return (
      <TouchableOpacity
        onPress={() =>
          selectionMode
            ? toggleSelectText(index)
            : handleEditText(item.title, item.text, index)
        }
      >
        <View
          style={[
            styles.textContainer,
            selectedTexts.has(index) && styles.selectedText,
          ]}
        >
          <View style={styles.textContent}>
            <Text
              style={styles.titleText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {truncatedTitle}
            </Text>
            <RenderHTML
              contentWidth={Dimensions.get("window").width}
              source={{ html: truncatedText }}
              tagsStyles={{
                body: { color: "gray" },
                p: { color: "gray" },
              }}
            />
          </View>
          <View style={styles.dateItem}>
            <Text style={styles.dateText}>{item.date || ""}</Text>
          </View>
          <View style={styles.deleteButton}>
            {!selectionMode && (
              <TouchableOpacity
                onPress={() => {
                  setDeleteIndex(index);
                  setDialogVisible(true);
                }}
              >
                <Icon name="trash-outline" size={24} color="#C62828" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };


  const toggleSelectText = (index: number) => {
    setSelectedTexts((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(index)) {
        newSelection.delete(index);
      } else {
        newSelection.add(index);
      }
      return newSelection;
    });
  };

  const handleEditText = (title: string, text: string, index: number) => {
    navigation.navigate("Typing", {
      addText: handleAddText,
      initialText: text,
      initialTitle: title,
      index,
    });
  };

  const handleAdditionalOperations = () => {
    setSideMenuVisible(!sideMenuVisible);
  };

  const handleDeleteAllConfirmation = () => {
    setConfirmAction("deleteAll");
    setDialogVisible(true);
  };

  const handleDeleteSelectedConfirmation = () => {
    if (selectedTexts.size > 0) {
      setConfirmAction("deleteSelected");
      setDialogVisible(true);
    } else {
      Alert.alert("No texts selected for deletion.");
    }
  };

  const handleSelectTexts = () => {
    setSelectionMode(true);
    setSelectedTexts(new Set());
    setSideMenuVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={texts}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {selectionMode && (
        <View style={styles.selectionActions}>
          <TouchableOpacity onPress={handleDeleteAllConfirmation}>
            <Text style={styles.actionText}>Delete All</Text>
          </TouchableOpacity>
          {selectedTexts.size === 0 ? (
            <TouchableOpacity
              onPress={() => {
                setSelectionMode(false);
                setSelectedTexts(new Set());
              }}
            >
              <Text style={styles.actionText}>Cancel</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity onPress={handleDeleteSelectedConfirmation}>
                <Text style={styles.actionText}>Delete Selected</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setSelectedTexts(new Set());
                }}
              >
                <Text style={styles.actionText}>Deselect All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setSelectionMode(false);
                  setSelectedTexts(new Set());
                }}
              >
                <Text style={styles.actionText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      <View
        style={[styles.buttonContainer, { bottom: selectionMode ? 80 : 20 }]}
      >
        <TouchableOpacity
          style={styles.startTypingButton}
          onPress={() => navigation.navigate("Typing", { addText: handleAddText })}
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
          <TouchableOpacity
            onPress={texts.length > 0 ? handleSelectTexts : undefined}
            style={styles.menuItem}
          >
            <Text
              style={[
                styles.menuText,
                texts.length === 0 && styles.disabledMenuText,
              ]}
            >
              Select Texts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSideMenuVisible(false)}
            style={styles.menuItem}
          >
            <Text style={styles.menuText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      <ConfirmationDialog
        visible={dialogVisible}
        title={
          confirmAction === "deleteAll"
            ? "Delete All Texts"
            : confirmAction === "deleteSelected"
              ? "Delete Selected Texts"
              : "Delete Text"
        }
        message={
          confirmAction === "deleteAll"
            ? "Are you sure you want to delete all texts?"
            : confirmAction === "deleteSelected"
              ? "Are you sure you want to delete the selected texts?"
              : "Are you sure you want to delete this text?"
        }
        onConfirm={confirmDeleteAction}
        onCancel={() => {
          setDialogVisible(false);
          setConfirmAction(null);
          setDeleteIndex(null);
        }}
      />
    </SafeAreaView>
  );
};

export default MainPage;
