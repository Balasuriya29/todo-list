import React from 'react';
import {Icon} from '@rneui/themed';

function AppIcon({
  iconType = 'material-community',
  onPress,
  name,
  size = 24,
  color,
  style,
  disabled = false,
}) {
  return (
    <Icon
      activeOpacity={1}
      background={'transparent'}
      underlayColor={'transparent'}
      type={iconType}
      onPress={onPress}
      name={name}
      color={color}
      size={size}
      style={style}
    />
  );
}

export default AppIcon;
