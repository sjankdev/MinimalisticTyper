import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 10,
  },
  titleText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledMenuText: {
    color: "#999",
    fontStyle: "italic",
  },
  textContainer: {
    backgroundColor: "#222",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  selectedText: {
    backgroundColor: "#444",
  },
  dateItem: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  dateText: {
    color: "lightgray",
    fontSize: 12,
  },
  buttonContainer: {
    position: "absolute",
    right: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  startTypingButton: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 50,
    alignItems: "center",
    elevation: 3,
    marginRight: 10,
  },
  additionalButton: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 50,
    alignItems: "center",
    elevation: 3,
  },
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  textContent: {
    flex: 1,
  },
  sideMenu: {
    position: "absolute",
    bottom: 80,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    elevation: 5,
    width: 200,
  },
  menuItem: {
    paddingVertical: 10,
  },
  menuText: {
    color: "#007BFF",
    fontSize: 16,
  },
  selectionActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-evenly",
    backgroundColor: "#444",
    paddingVertical: 15,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    elevation: 10,
    zIndex: 1000,
  },
  actionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default styles;
