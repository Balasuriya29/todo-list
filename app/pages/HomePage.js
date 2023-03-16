// Default or Third Party Library Imports
import React, { useEffect, useRef, useState } from "react";
import {
  Platform,
  StyleSheet,
  View,
  StatusBar,
  TextInput,
  FlatList,
  Modal,
  Text,
  Keyboard,
  useWindowDimensions,
  Pressable,
  ToastAndroid,
} from "react-native";
import { FontAwesome, AntDesign } from "@expo/vector-icons";
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedGestureHandler,
  runOnJS,
  withTiming,
  Easing,
  useAnimatedStyle,
} from "react-native-reanimated";
import "react-native-reanimated";

// Custom Imports
import colors from "../config/colors";
import axios from "axios";
import AppToDoList from "../components/AppToDoList";
import AppBar from "../components/AppBar";
import AppIcon from "../components/AppIcon";
import AppButton from "../components/AppButton";
import search from "../config/search";
import AppSliderBottomNavBar from "../components/AppSliderBottomNavBar";
import AppRow from "../components/AppRow";
import AppChip from "../components/AppChip";
import { Calendar } from "react-native-calendars";

//Custom Hook
function useTodos(todos) {
  let total = 0,
    completed = 0,
    pending = 0;

  todos.filter((todo) => {
    total++;

    if (todo.completed) completed++;
    else pending++;
  });

  return [total, completed, pending];
}

export default function HomePage({ route, navigation }) {
  //States
  const { height, width } = useWindowDimensions();
  const [taskInputController, settaskInputController] = useState("");
  const [taskSearch, settaskSearch] = useState("");
  const [todos, setTodos] = useState([]);
  const [todosForSearch, setTodosForSearch] = useState([]);
  let [total, completed, pending] = useTodos(todos);
  const [fetching, setFetching] = useState(true);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [todoObject, setTodoObject] = useState({});
  const [keyboardStatus, setKeyboardStatus] = useState(0);
  const isAddOnFocus = useRef();
  const [bottomNavVisible, setBottomNavVisible] = useState(false);
  const [todoCategories, setTodoCategories] = useState([
    { id: 1, title: "Meeting", selected: false },
    { id: 2, title: "Review", selected: false },
    { id: 3, title: "Marketing", selected: false },
    { id: 4, title: "Design Project", selected: false },
  ]);
  const [editTodo, setEditTodo] = useState({});
  const [chipTextController, setChipTextController] = useState("");

  //Get Todos
  useEffect(() => {
    async function getTodos() {
      const userId = route.params.id;
      const response = await axios(
        `https://jsonplaceholder.typicode.com/todos`
      );

      let newTodos = response.data.filter((todo) => {
        if (todo.userId === userId) {
          let y = Math.random() * (1 - 0.996) + 0.996;
          todo.date = new Date(Date.now() * y).toString().slice(0, 24);
          return todo;
        }
      });
      setTodos(newTodos);
      setTodosForSearch(newTodos);
      [total, completed, pending] = useTodos(todos);
      setFetching(false);
    }

    getTodos();
  }, []);

  //Event Listener for KeyBoard
  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardStatus(1);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardStatus(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  //Listener For Bottom Nav Bar
  useEffect(() => {
    if (bottomNavVisible) {
      isAddOnFocus.current.focus();
    } else isAddOnFocus.current.blur();
  }, [bottomNavVisible]);

  //Handlers
  const onPressProfileIcon = () => {
    [total, completed, pending] = useTodos(todos);
    setProfileModalVisible(true);
  };

  const addTodo = () => {
    if (taskInputController.trim() === "") return;
    translateY.value = withTiming(0);
    let newTodos = [
      {
        userId: route.params.id,
        id: todos.length + 1,
        title: taskInputController.trim(),
        completed: false,
        date: new Date().toString().slice(0, 24),
      },
      ...todos,
    ];

    settaskInputController("");
    setTodos(newTodos);
    setTodosForSearch(newTodos);
    setBottomNavVisible(false);
  };

  const closeDetailedView = () => setTodoObject({});

  const closeProfileView = () => setProfileModalVisible(false);

  const showDetailedView = (item) => setTodoObject(item);

  const deletetodo = (item) => {
    let newTodos = todos.filter((todo) => {
      if (todo.id != item.id) return todo;
    });

    setTodos(newTodos);
  };

  const markCompletedOnToDo = (item) => {
    let newTodos = todos.filter((todo) => {
      if (todo.id == item.id) todo.completed = !todo.completed;

      return todo;
    });

    setTodos(newTodos);
  };

  const modelReqClose = () => setTodoObject({});

  const profileModelReqClose = () => setToDoModalVisible(!profileModalVisible);

  const chipModelReqClose = () => {
    if (editTodo.title.trim() === "") {
      ToastAndroid.show("-Enter Chip Name", ToastAndroid.SHORT);
      return;
    }
    setEditTodo({});
  };

  const searchTodo = (newText) => {
    settaskSearch(newText);
    setTodos(search(todosForSearch, newText));
  };

  const editChipOnLongPress = (id) =>
    setEditTodo({ ...todoCategories[id - 1] });

  const saveChipChange = (newTitle) => {
    if (newTitle.trim() === "") {
      ToastAndroid.show("_Enter Chip Name", ToastAndroid.SHORT);
      return;
    }
    todoCategories[editTodo.id - 1].title = editTodo.title = newTitle.trim();
    setTodoCategories([...todoCategories]);
    setChipTextController("");
    chipModelReqClose();
  };

  const selectChip = (id) => {
    todoCategories[id - 1].selected = !todoCategories[id - 1].selected;
    setTodoCategories([...todoCategories]);
  };

  const createNewChip = () => {
    let newTodo = {
      id: todoCategories.length + 1,
      title: "",
      selected: true,
    };
    setTodoCategories([...todoCategories, newTodo]);
    setEditTodo({ ...newTodo });
  };

  //Bottom NavBar Gesture
  const translateY = useSharedValue(0);
  const panGestureEvent = useAnimatedGestureHandler({
    onStart: (event, context) => {
      context.startY = translateY.value;
    },
    onActive: (event, context) => {
      if (height * 0.675 >= (event.translationY + context.startY) * -1)
        translateY.value = event.translationY + context.startY;
    },
    onEnd: () => {
      let h = (height * 0.8) / 2;
      if (h <= translateY.value * -1) {
        translateY.value = withSpring(height * -0.675);
        runOnJS(setBottomNavVisible)(true);
      } else {
        translateY.value = withSpring(0);
        runOnJS(setBottomNavVisible)(false);
        runOnJS(settaskInputController)("");
      }
    },
  });

  const translateX = useSharedValue(0);
  const panGestureEventChips = useAnimatedGestureHandler({
    onStart: (event, context) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      if (event.translationX + context.startX > 0)
        translateX.value = event.translationX + context.startX;
    },
    onEnd: () => {
      console.log(translateX.value);
      // translateX.value = withSpring(0);
    },
  });
  const animatedStyleChips = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.toDoContainer}>
        <Text style={{}}></Text>
        <AppBar
          size={30}
          name={"search1"}
          iconColor="white"
          barStyle={[
            styles.appBarStyle,
            keyboardStatus ? { height: "11.8%" } : {},
          ]}
        >
          <View style={styles.viewHeader}>
            <TextInput
              style={styles.searchBar}
              onChangeText={(newText) => searchTodo(newText)}
              value={taskSearch}
              placeholder={"Search..."}
              placeholderTextColor={"#FFFFF0"}
            />
            {keyboardStatus ? (
              <AntDesign name="close" color={colors.white} size={20} />
            ) : (
              <View style={{ width: 20 }} />
            )}
            <AppIcon
              name="user"
              size={50}
              iconColor={colors.primary}
              backgroundColor={colors.white}
              onPress={onPressProfileIcon}
            />
          </View>
        </AppBar>
        <Modal
          animationType="fade"
          transparent={true}
          visible={profileModalVisible}
          onRequestClose={profileModelReqClose}
        >
          <View
            style={[
              styles.centeredView,
              { justifyContent: "flex-start", marginTop: height * 0.1 },
            ]}
          >
            <View
              style={[
                styles.modalView,
                {
                  width: "90%",
                },
              ]}
            >
              <AppRow justifyContent="space-between">
                <Text
                  style={[
                    styles.modalText,
                    { fontWeight: "bold", fontSize: 18 },
                  ]}
                >
                  Hi!! {route.params.name}
                </Text>
                <FontAwesome
                  onPress={closeProfileView}
                  name="close"
                  size={25}
                  color={colors.black}
                />
              </AppRow>

              <AppRow justifyContent="space-between">
                <Text style={{ fontSize: 15, fontWeight: 600 }}>Completed</Text>
                <Text style={{ fontSize: 15, fontWeight: 600 }}>Pending</Text>
              </AppRow>

              <AppRow>
                <View
                  style={{
                    flex: completed / total,
                    height: 20,
                    backgroundColor: colors.primary,
                    marginVertical: 10,
                  }}
                >
                  <Text style={{ paddingHorizontal: 8, color: colors.white }}>
                    {completed}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1 - completed / total,
                    height: 20,
                    backgroundColor: colors.secondary,
                    marginVertical: 10,
                  }}
                >
                  <Text
                    style={{
                      paddingHorizontal: 8,
                      color: colors.white,
                      alignSelf: "flex-end",
                    }}
                  >
                    {pending}
                  </Text>
                </View>
              </AppRow>

              <AppButton
                onPress={navigation.goBack}
                style={[styles.closeModalBtn, { width: "30%", marginTop: 20 }]}
                title="Log Out"
              />
            </View>
          </View>
        </Modal>
        <Modal
          animationType="slide"
          transparent={true}
          visible={JSON.stringify(todoObject) !== "{}"}
          onRequestClose={modelReqClose}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <React.Fragment>
                <TodoModelRowComponent
                  heading={"Title"}
                  value={todoObject.title}
                />
                <TodoModelRowComponent
                  heading={"Date"}
                  value={todoObject.date}
                />
                <TodoModelRowComponent
                  heading={"Completed"}
                  value={todoObject.completed ? "Completed" : "Pending"}
                />
                <AppButton
                  onPress={closeDetailedView}
                  style={styles.closeModalBtn}
                  title="Close"
                />
              </React.Fragment>
            </View>
          </View>
        </Modal>
        {todos.length !== 0 ? (
          <FlatList
            refreshing={fetching}
            onRefresh={() => {
              setFetching(false);
              setTodos([...todos]);
              setFetching(false);
            }}
            style={styles.list}
            data={todos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              return (
                <AppToDoList
                  key={item.id}
                  onPressCheckBox={() => markCompletedOnToDo(item)}
                  onPressContent={() => showDetailedView(item)}
                  onPressCross={() => deletetodo(item)}
                  data={item}
                />
              );
            }}
          />
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 20 }}>
              {!fetching ? "No Todos Match" : "Loading..."}
            </Text>
          </View>
        )}
      </View>
      <AppSliderBottomNavBar
        translateY={translateY}
        panGestureEvent={panGestureEvent}
      >
        <View
          style={{
            width: "100%",
            height: "100%",
            alignItems: "flex-end",
            // justifyContent: "space-between",
            overflow: "hidden",
          }}
        >
          <View style={{ alignItems: "center", width: "100%" }}>
            <View
              style={{
                backgroundColor: colors.white,
                height: 4,
                width: 30,
                borderRadius: 20,
                marginVertical: 8,
              }}
            />
            {!bottomNavVisible ? (
              <Pressable
                onPress={() => {
                  translateY.value = withTiming(height * -0.675, {
                    duration: 500,
                    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                  });
                  setBottomNavVisible(true);
                }}
              >
                <AppRow alignItems="center">
                  <AntDesign name="pluscircle" color={colors.white} size={45} />
                  <Text
                    style={{
                      marginHorizontal: 10,
                      color: colors.white,
                      fontWeight: "600",
                      fontSize: 18,
                    }}
                  >
                    Add New Todo
                  </Text>
                </AppRow>
              </Pressable>
            ) : (
              <View style={{ height: 30 }} />
            )}
            <TextInput
              ref={isAddOnFocus}
              style={styles.addBar}
              onChangeText={settaskInputController}
              value={taskInputController}
              placeholder={"What do you want to do?"}
              placeholderTextColor={"rgba(255, 255, 255, 0.3)"}
            />

            <PanGestureHandler onGestureEvent={panGestureEventChips}>
              <Animated.View
                style={[
                  {
                    justifyContent: "flex-start",
                    flexDirection: "row",
                    width: width * 2,
                    marginHorizontal: 18,
                    rowGap: 12.5,
                    columnGap: 15,
                    flexWrap: "wrap",
                    marginTop: 30,
                  },
                  animatedStyleChips,
                ]}
              >
                {todoCategories.map((category) => (
                  <Pressable
                    key={category.id}
                    onPress={() => selectChip(category.id)}
                    onLongPress={() => editChipOnLongPress(category.id)}
                  >
                    <AppChip data={category} />
                  </Pressable>
                ))}
                <AppIcon
                  name="plus"
                  size={42}
                  iconColor={colors.black}
                  backgroundColor={colors.white}
                  style={{ borderRadius: 5 }}
                  onPress={createNewChip}
                />
              </Animated.View>
            </PanGestureHandler>
            <View
              style={{
                marginHorizontal: 20,
                marginVertical: 20,
                backgroundColor: "red",
              }}
            >
              <Calendar />
            </View>
            <View
              style={{
                borderWidth: 0.3,
                width: "100%",
                borderColor: "rgba(255, 255, 255, 0.5)",
                marginVertical: 40,
              }}
            />
          </View>
          <AppRow>
            <AppButton
              style={{
                width: 80,
                padding: 10,
                borderRadius: 10,
                marginVertical: 40,
                marginHorizontal: 10,
              }}
              title="Cancel"
              onPress={() => {
                translateY.value = withTiming(0);
                setBottomNavVisible(false);
              }}
            />
            <AppButton
              style={{
                width: 80,
                padding: 10,
                borderRadius: 10,
                marginVertical: 40,
                marginHorizontal: 10,
              }}
              title="Save"
              onPress={addTodo}
            />
          </AppRow>
          <Modal
            animationType="slide"
            transparent={true}
            visible={JSON.stringify(editTodo) !== "{}"}
            onRequestClose={chipModelReqClose}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <React.Fragment>
                  <Text style={{ fontWeight: 700 }}>
                    {editTodo.title !== "" ? "Edit Chip" : "Add Chip"}
                  </Text>
                  <TextInput
                    placeholder={editTodo.title}
                    autoFocus={true}
                    style={{
                      marginBottom: 20,
                      marginTop: 10,
                      borderWidth: 1,
                      padding: 10,
                      borderRadius: 10,
                    }}
                    onChangeText={(newText) => setChipTextController(newText)}
                  />
                  <AppRow alignSelf="flex-end">
                    <AppButton
                      onPress={chipModelReqClose}
                      style={{
                        width: 60,
                        height: 30,
                        marginVertical: 10,
                        marginLeft: 100,
                      }}
                      title="Close"
                    />
                    <AppButton
                      onPress={() => saveChipChange(chipTextController)}
                      style={{
                        width: 60,
                        height: 30,
                        marginVertical: 10,
                        marginLeft: 10,
                      }}
                      title="Save"
                    />
                  </AppRow>
                </React.Fragment>
              </View>
            </View>
          </Modal>
        </View>
      </AppSliderBottomNavBar>
    </GestureHandlerRootView>
  );
}

// Helper Components
function TodoModelRowComponent({ heading, value }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
      <Text style={[styles.modalText, { fontWeight: "bold", fontSize: 15 }]}>
        {heading} :{" "}
      </Text>
      <Text style={styles.modalText}>{value}</Text>
    </View>
  );
}

// StyleSheet
const styles = StyleSheet.create({
  appBarStyle: {
    backgroundColor: colors.primary,
    width: "95%",
    marginTop: 10,
    borderRadius: 25,
    overflow: "hidden",
  },
  addBar: {
    color: colors.white,
    marginHorizontal: 20,
    fontSize: 25,
    alignSelf: "flex-start",
  },
  button: {
    alignSelf: "flex-start",
    marginTop: 30,
    marginLeft: 40,
    width: "40%",
    height: "4%",
    borderRadius: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  closeModalBtn: { padding: 5, alignSelf: "flex-end" },
  container: {
    flex: 1,
    backgroundColor: "#f8f4f4",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    alignItems: "center",
  },
  input: {
    height: 60,
    width: "80%",
    marginTop: 30,
    borderWidth: 1,
    padding: 10,
    borderColor: colors.grey,
    borderRadius: 5,
  },
  modalText: {
    fontSize: 15,
    marginBottom: 20,
  },
  modalView: {
    marginHorizontal: 50,
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  searchBar: { color: colors.white, flex: 0.8 },
  text: {
    fontSize: 18,
    fontWeight: 700,
    color: colors.white,
  },
  title: {
    fontSize: 24,
    fontWeight: 600,
    marginVertical: 15,
  },
  toDoContainer: {
    width: "100%",
    alignItems: "center",
    height: "100%",
    justifyContent: "flex-end",
  },
  viewHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
});
