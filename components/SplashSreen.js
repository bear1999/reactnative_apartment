import React from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

class SplashScreen extends React.Component {
  render() {
    return (
      <SafeAreaView style={styles.background}>
        <StatusBar hidden={true} />
        <LinearGradient
          colors={['#ffcccc', 'transparent']}
          style={styles.linear}
        />
        <Text style={styles.text}>NSY Apartment</Text>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  linear: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 250,
  },
  text: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
  background: {
    flex: 1,
    backgroundColor: '#85adad',
    justifyContent: 'center',
  },
});

export default SplashScreen;