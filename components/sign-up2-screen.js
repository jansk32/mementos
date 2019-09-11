import React, { useState, useEffect } from 'react';
import {
  Text, View, Image, StyleSheet, TextInput, Button, ScrollView,
  FlatList, SectionList, ToastAndroid, Picker,
} from 'react-native';
import { NavigationEvents } from 'react-navigation';

const styles = StyleSheet.create({
  loginText: {
    fontSize: 30,
  },
  text: {
    fontSize: 16,
  },
  loginBox: {
    backgroundColor: '#fff',
    flex: 1 / 4,
    justifyContent: 'space-evenly',
    textAlign: 'center',
    alignItems: 'center',
    // justifyContent: 'center',
  },
}
)

export default function SigninScreen({ navigation }) {
  const { navigate } = navigation;
  return (
    <>
      <React.Fragment>
        <View style={styles.loginBox}>
          <Text style={styles.loginText}>Sign In</Text>
        </View>
        <View style={styles.loginBox}>
          <Text style={styles.text}>Username</Text>
          <TextInput
            placeholder='Enter Username'
          />
          <Text style={styles.text}>Password</Text>
          <TextInput
            placeholder='Enter Username'
          />
        </View>
        <Button
          title='->'
          onPress={() => navigate('SignUp3')}
        />
        <Button
          title='<-'
          onPress={() => navigate('SignUp1')}
        />
      </React.Fragment>
    </>
  );
}