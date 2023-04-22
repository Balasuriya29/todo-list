import React, {forwardRef, useState} from 'react';
import {StyleSheet, TextInput, View} from 'react-native';

import colors from '../config/colors';
import AppIcon from './AppIcon';

const AppTextField = forwardRef(
  (
    {iconName, setValue, placeholder, value, style, type = 'text', onPressIcon},
    ref,
  ) => {
    const [backgroundcolor, setBG] = useState(colors.lightGray);
    const elevation = backgroundcolor === colors.lightGray ? 0 : 10;

    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: backgroundcolor,
            elevation: elevation,
          },
          style,
        ]}>
        <AppIcon
          iconType="font-awesome"
          onPress={onPressIcon}
          name={iconName}
          color={colors.black}
          size={24}
          style={{paddingVertical: 20, paddingLeft: 20, paddingRight: 15}}
        />
        <TextInput
          ref={ref}
          secureTextEntry={type === 'password' ? true : false}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.grey}
          onFocus={() => {
            setBG(colors.blurBlue);
          }}
          onEndEditing={() => {
            setBG(colors.lightGray);
          }}
          onChangeText={setValue}
          value={value}
          importantForAutofill="no"
        />
      </View>
    );
  },
);
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 5,
  },
  input: {
    marginHorizontal: 8,
    flex: 1,
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: 'black',
  },
});

export default AppTextField;
