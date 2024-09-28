/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#674728';
const tintColorDark = '#d7b898';

export const Colors = {

  light: {
    text: '#120b07',
    background: '#f8ede1',
    primary: '#674728',
    secondary: 'rgba(208, 205, 134, 1)',
    tertiary:'#ceb6a2',
    accent: '#a4b045',
    navBarLight: 'rgba(208, 205, 134, .5)',


    tint: tintColorLight,
    icon: '#6d7356',
    tabIconDefault: '#6d7356',
    tabIconSelected: tintColorLight,
  },
  
  dark: {
    text: '#f8f1ed',
    background: '#070503',
    primary: '#d7b898',
    secondary: '#79772f',
    tertiary:'#5e4531',
    accent: '#aeba4f',
    navBarDark: '#180f06',

    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};
