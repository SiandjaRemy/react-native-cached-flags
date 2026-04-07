import React from 'react';

const View = ({ children, style, testID, ...props }: any) =>
  React.createElement('View', { style, testID, ...props }, children);

const Text = ({ children, style, testID, ...props }: any) =>
  React.createElement('Text', { style, testID, ...props }, children);

const StyleSheet = {
  create: (styles: Record<string, any>) => styles,
  flatten: (style: any) => style,
};

export { View, Text, StyleSheet };
export default { View, Text, StyleSheet };
