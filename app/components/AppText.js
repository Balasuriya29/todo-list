import React from 'react';
import {Text} from 'react-native';
import {useSelector} from 'react-redux';

export default function AppText({style, children, onPress, numberOfLines}) {
  const themes = useSelector(state => state.user.themes);
  const currentUser = useSelector(state => state.user.currentUser);

  let color;
  if (JSON.stringify(currentUser) !== '{}' && currentUser.theme === 'light') {
    color = themes.lightThemeColors.black;
  } else color = themes.darkThemeColors.text;

  return (
    <Text
      numberOfLines={numberOfLines}
      onPress={onPress}
      style={[{fontFamily: 'Poppins-Regular', color: color}, style]}>
      {children}
    </Text>
  );
}
