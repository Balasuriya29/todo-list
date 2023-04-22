//Temp DB Setter
function tempHandler() {
  async function setDB() {
    let newJSON = {
      completed: [
        {
          categories: ['Movie'],
          completed: true,
          createdDate: 1679616000000,
          dueDate: 1679788800000,
          id: 0.24544126575443878,
          title: 'John Wick Chapter 4',
          userId: '0.18565659353231381679620611913',
        },
      ],
      pending: [
        {
          categories: ['College'],
          completed: false,
          createdDate: 1679909058558,
          dueDate: 1683633601000,
          id: Math.random(),
          title: 'Jatayu Project Submission',
          userId: '0.18565659353231381679620611913',
        },
        {
          categories: ['Meeting'],
          completed: false,
          createdDate: 1679905490956,
          dueDate: 1680262201000,
          id: 0.28906135770700736,
          title: 'Birthday Bash',
          userId: '0.18565659353231381679620611913',
        },
        {
          categories: ['Meeting'],
          completed: false,
          createdDate: 1679902044741,
          dueDate: 1680237001000,
          id: 0.641725742621914,
          title: 'Lessons Learnt',
          userId: '0.18565659353231381679620611913',
        },
        {
          categories: ['College'],
          completed: false,
          createdDate: 1679901015137,
          dueDate: 1682305201000,
          id: 0.3803065137845666,
          title: 'Internals',
          userId: '0.18565659353231381679620611913',
        },
        {
          categories: ['College'],
          completed: false,
          createdDate: 1679901177894,
          dueDate: 1683507601000,
          id: 0.5447209868562931,
          title: 'Semester Exam',
          userId: '0.18565659353231381679620611913',
        },
      ],
    };

    const jsonValue = JSON.stringify(newJSON);
    await AsyncStorage.setItem(`@todos_${route.params.userId}`, jsonValue)
      .then(value => {
        console.log('Sucess');
        return 200;
      })
      .catch(err => {
        ToastAndroid.show('Unable to Connect... Try Again', ToastAndroid.SHORT);
        console.log('Error');
        return 400;
      });
  }

  setDB();
}

//Chips Gestures
const translateX = useSharedValue(200);
const newBoxes = (todoCategories.length - 4) * 116;
const panGestureEventChips = useAnimatedGestureHandler({
  onStart: (event, context) => {
    context.startX = translateX.value;
    context.initX = translateX.value;
  },
  onActive: (event, context) => {
    if (
      event.translationX + context.startX > 0 - newBoxes &&
      event.translationX + context.startX < 210
    )
      translateX.value = event.translationX + context.startX;
  },
  onEnd: (event, context) => {
    if (context.initX > translateX.value)
      translateX.value = withSpring(translateX.value - 15);
    else translateX.value = withSpring(translateX.value + 15);
  },
});
const animatedStyleChips = useAnimatedStyle(() => {
  return {
    transform: [{translateX: translateX.value}],
  };
});

//Profile Model
<Modal
  animationType="fade"
  transparent={true}
  visible={profileModalVisible}
  onRequestClose={profileModelReqClose}>
  <View
    style={[
      styles.centeredView,
      {
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        marginTop: height * 0.205,
      },
    ]}>
    <View style={[styles.profileTriangle, {marginRight: width * 0.11}]} />
    <View
      style={[
        styles.modalView,
        {
          width: width * 0.9,
          alignSelf: 'center',
        },
      ]}>
      <AppRow justifyContent="space-between">
        <AppText style={styles.modalText}>Hi!! {route.params.name}</AppText>
        <AppIcon
          iconType="font-awesome"
          onPress={closeProfileModel}
          name="close"
          size={25}
          style={{
            paddingLeft: 20,
            paddingRight: 10,
            paddingBottom: 20,
          }}
          color={colors.black}
        />
      </AppRow>

      <AppRow justifyContent="space-between">
        <AppText style={styles.analysisBar}>Completed</AppText>
        <AppText style={styles.analysisBar}>Pending</AppText>
      </AppRow>

      <AppRow>
        {globalCompleted.length ? (
          <View
            style={[
              styles.completedBar,
              {
                flex:
                  globalCompleted.length /
                  (globalCompleted.length + globalPending.length),
              },
            ]}>
            <AppText style={styles.completedText}>
              {globalCompleted.length}
            </AppText>
          </View>
        ) : null}
        {globalPending.length ? (
          <View
            style={[
              styles.pendingBar,
              {
                flex:
                  globalPending.length /
                  (globalCompleted.length + globalPending.length),
              },
            ]}>
            <AppText style={styles.pendingText}>{globalPending.length}</AppText>
          </View>
        ) : null}
      </AppRow>

      <AppButton
        onPress={navigation.goBack}
        style={[styles.closeModalBtn, {width: '30%', marginTop: 20}]}
        title="Log Out"
      />
    </View>
  </View>
</Modal>;
