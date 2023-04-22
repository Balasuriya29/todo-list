// Default or Third Party Library Imports
import React, {useState, Component} from 'react';
import {
  PixelRatio,
  StatusBar,
  StyleSheet,
  View,
  ScrollView,
} from 'react-native';
import {HelperText, TextInput, useTheme} from 'react-native-paper';
import {Formik, useFormikContext} from 'formik';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {connect} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'react-native-image-picker';
import * as Yup from 'yup';
import {Dimensions} from 'react-native';

// Custom Imports
import AppText from '../components/AppText';
import AppBar from '../components/AppBar';
import AppRoundedIcon from '../components/AppRoundedIcon';
import AppRow from '../components/AppRow';
import AppButton from '../components/AppButton';
import AppAvatar from '../components/AppAvatar';

// import colors from "../config/colors";
import {SET_CURRENT_USER, SET_USER} from '../features/actions';

// Dimensions
const {height, width} = Dimensions.get('screen');

class EditProfilePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      image: props.currentUser.profileImage,
      theme: props.theme !== 'light' ? true : false,
      colors:
        props.theme === 'light'
          ? props.themes.lightThemeColors
          : props.themes.darkThemeColors,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.theme !== prevProps.theme) {
      this.setState({
        ...this.state,
        colors:
          this.props.theme === 'light'
            ? this.props.themes.lightThemeColors
            : this.props.themes.darkThemeColors,

        theme: !this.state.theme,
      });
    }
  }

  //State Setter
  setImage = newImage => {
    this.setState({
      ...this.state,
      image: newImage,
    });
  };

  //Util
  joinedDate = new Date(
    Number(
      this.props.currentUser.userId.slice(
        this.props.currentUser.userId.indexOf('-') + 1,
      ),
    ),
  );

  //Yup Validater
  userDetailsSchema = Yup.object().shape({
    username: Yup.string()
      .min(3, 'Too Short!')
      .max(25, 'Too Long!')
      .required('Required'),
    email: Yup.string().email('Email address is invalid!').required('Required'),
    dob: Yup.string(),
    place: Yup.string().required('Required'),
  });

  render() {
    return (
      <ScrollView style={{flex: 1}}>
        <View
          style={[
            styles.container,
            {backgroundColor: this.state.colors.background},
          ]}>
          <AppBar
            name="chevron-back"
            size={32}
            iconColor={this.state.colors.text}
            iconType="ionicon"
            barStyle={{
              backgroundColor: 'transparent',
            }}
            onPressIcon={() => {
              this.props.navigation.goBack();
            }}>
            <View
              style={{flex: 1, alignItems: 'flex-end', paddingRight: '37%'}}>
              <AppText style={styles.pageTitle}>Edit Profile</AppText>
            </View>
          </AppBar>
          <View>
            <AppAvatar size={height * 0.14} profileImage={this.state.image} />
            <AppRoundedIcon
              name={'edit'}
              iconType={'material'}
              backgroundColor={this.state.colors.primary}
              size={30}
              style={{
                position: 'absolute',
                bottom: 2.5,
                right: 2.5,
              }}
              onPress={async () => {
                try {
                  let result = await ImagePicker.launchImageLibrary({
                    mediaTypes: 'photo',
                    quality: 1,
                  });

                  if (!result.didCancel) this.setImage(result.assets[0].uri);
                } catch (err) {
                  console.log(err);
                }
              }}
            />
          </View>
          <View
            style={{
              alignItems: 'center',
              width: width * 0.35,
              marginTop: 15,
            }}>
            {this.state.image ? (
              <AppText
                style={{
                  marginBottom: 10,
                  color: 'red',
                  fontFamily: 'Poppins-SemiBold',
                }}
                onPress={() => this.setImage('')}>
                Delete Profile
              </AppText>
            ) : null}
            <AppText
              style={{
                fontFamily: 'Poppins-SemiBold',
                fontSize: 20 / PixelRatio.getFontScale(),
              }}
              numberOfLines={1}>
              {this.props.currentUser.name}
            </AppText>
            <AppText
              style={{
                color: this.state.colors.grey,
                fontSize: 14 / PixelRatio.getFontScale(),
              }}>
              {this.props.currentUser.place
                ? this.props.currentUser.place
                : 'Set Place'}
            </AppText>
          </View>
          <Formik
            initialValues={{
              email: this.props.currentUser.email,
              username: this.props.currentUser.name,
              place: this.props.currentUser.place
                ? this.props.currentUser.place
                : '',
              dob: this.props.currentUser.dob ? this.props.currentUser.dob : '',
            }}
            validationSchema={this.userDetailsSchema}
            onSubmit={async values => {
              this.props.currentUser.email = values.email.trim();
              this.props.currentUser.name = values.username.trim();
              this.props.currentUser.place = values.place.trim();
              if (values.dob) this.props.currentUser.dob = values.dob.trim();
              if (this.state.image)
                this.props.currentUser.profileImage = this.state.image;

              this.props.users[this.props.currentUser.userId] =
                this.props.currentUser;

              this.props.setUser({users: this.props.users});
              this.props.setCurrentUser({user: this.props.currentUser});

              this.props.navigation.goBack();
            }}>
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <View
                style={{
                  width: width * 0.9,
                }}>
                <TextInputFormik
                  colors={this.state.colors}
                  label={'Email Address'}
                  name={'email'}
                  onBlur={handleBlur}
                  onChangeText={handleChange}
                  value={values.email}
                  width={width}
                  spacing={50}
                />
                {errors.email && touched.email ? (
                  <HelperText type="error" visible={errors.email}>
                    {errors.email}
                  </HelperText>
                ) : null}
                <TextInputFormik
                  colors={this.state.colors}
                  label={'Username'}
                  name={'username'}
                  onBlur={handleBlur}
                  onChangeText={handleChange}
                  value={values.username}
                  width={width}
                  spacing={20}
                />
                {errors.username && touched.username ? (
                  <HelperText type="error" visible={errors.username}>
                    {errors.username}
                  </HelperText>
                ) : null}
                <TextInputFormik
                  colors={this.state.colors}
                  label={'Place'}
                  name={'place'}
                  onBlur={handleBlur}
                  onChangeText={handleChange}
                  value={values.place}
                  width={width}
                  spacing={20}
                />
                {errors.place && touched.place ? (
                  <HelperText type="error" visible={errors.place}>
                    {errors.place}
                  </HelperText>
                ) : null}
                <DateInputFormik
                  colors={this.state.colors}
                  label={'Birth Date (Optional)'}
                  name={'dob'}
                  onBlur={handleBlur}
                  onChangeText={handleChange}
                  value={values.dob}
                  width={width}
                  spacing={20}
                  disabled={false}
                />
                {errors.dob && touched.dob ? (
                  <HelperText type="error" visible={errors.dob}>
                    {errors.dob}
                  </HelperText>
                ) : null}
                <AppButton
                  title={'Save'}
                  onPress={handleSubmit}
                  style={{
                    width: width * 0.3,
                    height: height * 0.05,
                    marginTop: '30%',
                    marginBottom: '5%',
                    alignSelf: 'flex-end',
                  }}
                />
              </View>
            )}
          </Formik>
          <AppRow
            alignSelf="flex-start"
            justifyContent="flex-end"
            style={{position: 'absolute', bottom: 30, left: 30}}>
            <AppText style={{color: this.state.colors.grey}}>Joined </AppText>
            <AppText style={{fontFamily: 'Poppins-Medium'}}>
              {this.joinedDate.toDateString().substring(4)}
            </AppText>
          </AppRow>
        </View>
      </ScrollView>
    );
  }
}

const mapStateToProps = state => {
  return {
    users: state.user.users,
    currentUser: state.user.currentUser,
    themes: state.user.themes,
    theme: state.user.currentUser.theme,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setUser: pl => dispatch({type: SET_USER, payload: pl}),
    setCurrentUser: pl => dispatch({type: SET_CURRENT_USER, payload: pl}),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditProfilePage);

//Helpers
function DateInputFormik({
  label,
  name,
  onChangeText,
  onBlur,
  value,
  width,
  spacing,
  disabled,
  colors,
}) {
  //Utils
  const {setFieldValue} = useFormikContext();
  const [showPicker, setShowPicker] = useState(false);

  // TextInput Theme
  const theme = useTheme();
  const themes = {
    poppins: {
      fonts: {
        bodyLarge: {
          ...theme.fonts.bodyLarge,
          fontFamily: 'Poppins-SemiBold',
        },
      },
    },
  };

  // if (fontsLoaded)
  return (
    <View>
      <AppText
        style={[
          styles.menuTitle,
          {
            marginLeft: width * 0.04,
            marginTop: spacing,

            color: colors.grey,
          },
        ]}>
        {label}
      </AppText>
      <TextInput
        textColor={colors.text}
        editable={disabled}
        onChangeText={onChangeText(name)}
        onBlur={onBlur(name)}
        value={value}
        underlineStyle={{
          width: width * 0.8,
          marginLeft: width * 0.04,
          marginBottom: 12,
          backgroundColor: colors.text,
        }}
        style={{
          backgroundColor: 'transparent',
          marginTop: -10,
        }}
        theme={themes.poppins}
        right={
          value === '' ? (
            <TextInput.Icon
              style={{marginRight: 20}}
              icon={'calendar'}
              onPress={() => setShowPicker(true)}
              color={() => colors.text}
            />
          ) : (
            <TextInput.Icon
              style={{marginRight: 20}}
              icon={'close'}
              onPress={() => {
                setFieldValue('dob', '');
              }}
              color={() => colors.text}
            />
          )
        }
      />
      <DateTimePickerModal
        isVisible={showPicker}
        mode="date"
        onConfirm={date => {
          let today = new Date(Date.now()).toISOString().slice(0, 10);
          let selectedDate = date.toISOString().slice(0, 10);
          if (today !== selectedDate) setFieldValue('dob', date.toDateString());
          setShowPicker(false);
        }}
        onCancel={() => setShowPicker(false)}
        value={new Date()}
        maximumDate={new Date()}
      />
    </View>
  );
}

function TextInputFormik({
  label,
  name,
  onChangeText,
  onBlur,
  value,
  width,
  spacing,
  disabled,
  colors,
}) {
  // TextInput Theme
  const theme = useTheme();
  const themes = {
    colors: {
      text: 'white',
    },
    poppins: {
      fonts: {
        bodyLarge: {
          ...theme.fonts.bodyLarge,
          fontFamily: 'Poppins-SemiBold',
        },
      },
    },
  };

  return (
    <View>
      <AppText
        style={[
          styles.menuTitle,
          {
            marginLeft: width * 0.04,
            marginTop: spacing,

            color: colors.grey,
          },
        ]}>
        {label}
      </AppText>
      <TextInput
        editable={disabled}
        onChangeText={onChangeText(name)}
        onBlur={onBlur(name)}
        value={value}
        underlineStyle={{
          width: width * 0.8,
          marginLeft: width * 0.04,
          marginBottom: 12,
          backgroundColor: colors.text,
        }}
        style={{
          backgroundColor: 'transparent',
          marginTop: -10,
        }}
        textColor={colors.text}
        theme={themes.poppins}
      />
    </View>
  );
}

//StyleSheet
const styles = StyleSheet.create({
  circleAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',

    paddingTop: StatusBar.currentHeight,
  },
  menuTitle: {
    fontSize: 13 / PixelRatio.getFontScale(),
  },
  pageTitle: {
    fontSize: 18 / PixelRatio.getFontScale(),
    fontFamily: 'Poppins-Medium',
  },
});
