import AsyncStorage from "@react-native-async-storage/async-storage";
import { formatDate } from "../utils/utils";

export interface SavedText {
  title: string;
  text: string;
  date: string;
  timestamp: number;
}

export const storeData = async (texts: SavedText[]) => {
  try {
    await AsyncStorage.setItem("@texts", JSON.stringify(texts));
  } catch (e) {
    console.error("Error storing data", e);
  }
};

export const loadData = async () => {
  try {
    const savedTexts = await AsyncStorage.getItem("@texts");
    if (savedTexts !== null) {
      const parsedTexts = JSON.parse(savedTexts);
      if (Array.isArray(parsedTexts)) {
        return parsedTexts.sort((a, b) => b.timestamp - a.timestamp);
      }
    }
    return [];
  } catch (e) {
    console.error("Error loading data", e);
    return [];
  }
};

export const addText = (
  texts: SavedText[],
  title: string,
  text: string,
  index?: number
) => {
  const date = formatDate(new Date());
  const timestamp = Date.now();
  let updatedTexts;

  const updatedText = { title, text, date, timestamp };
  if (index !== undefined) {
    updatedTexts = texts.filter((_, i) => i !== index);
    updatedTexts = [updatedText, ...updatedTexts];
  } else {
    updatedTexts = [updatedText, ...texts];
  }
  return updatedTexts;
};

export const deleteText = (texts: SavedText[], index: number) => {
  return texts.filter((_, i) => i !== index);
};

export const deleteAllTexts = () => {
  return [];
};

export const deleteSelectedTexts = (
  texts: SavedText[],
  selectedTexts: Set<number>
) => {
  return texts.filter((_, index) => !selectedTexts.has(index));
};
