import React, { useState, useEffect } from 'react';
import {
	Text, View, StyleSheet, ScrollView,
	ToastAndroid, TouchableOpacity, Dimensions
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';
import { uploadImage } from '../image-tools';

import { BACK_END_ENDPOINT } from '../constants';
import PictureFrame from './picture-frame';

// Upload profile picture page.
export default function SignUp3({ navigation }) {
	const { navigate } = navigation;
	const [image, setImage] = useState({});

	// Upload sign up data
	async function uploadSignUpData() {
		const dataKeys = ['email', 'name', 'dob', 'password', 'pictureUrl', 'gender'];
		const data = {};
		for (const key of dataKeys) {
			try {
				data[key] = await AsyncStorage.getItem(key);
			} catch (e) {
				ToastAndroid.show('Error getting ' + key, ToastAndroid.SHORT);
			}
		}
		data.isUser = true;
		await axios.post(`${BACK_END_ENDPOINT}/user/create`, data);
	}

	// Automatically login to have give available acct details
	async function login() {
		const email = await AsyncStorage.getItem('email');
		const password = await AsyncStorage.getItem('password');
		console.log('email', email);
		console.log('password', password);

		const res = await axios.post(`${BACK_END_ENDPOINT}/login/local`, {
			email: await AsyncStorage.getItem('email'),
			password: await AsyncStorage.getItem('password')
		});
		AsyncStorage.setItem('userId', res.data._id);
		navigate('Home');
	}

	// Finish sign up and log in straight into the home page
	function finishSignUp() {
		async function task() {
			const pictureUrl = await uploadImage(image.uri);
			try {
				await AsyncStorage.setItem('pictureUrl', pictureUrl);
			} catch (e) {
				ToastAndroid.show('Error storing picture URL', ToastAndroid.SHORT);
			}
			await uploadSignUpData();
			await login();
		}
		navigate('Loading', {loadingMessage: 'Creating Account', task});
	}

	return (
		<ScrollView>
			<View style={styles.container}>
				<PictureFrame
					image={image}
					setImage={setImage}
					width={Dimensions.get('window').width * 0.75}
					height={Dimensions.get('window').width * 0.75}
					editable={true}
					circular={true}
				/>
				<View style={styles.buttonContainer}>
					<TouchableOpacity
						onPress={finishSignUp}>
						<View style={styles.finishButton}>
							<Text style={styles.whiteText}>
								Finish
							</Text>
						</View>
					</TouchableOpacity>
				</View>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	buttonContainer: {
		marginTop: 50,
	},
	text: {
		fontSize: 16,
		color: 'black',
		textAlign: 'center',
	},
	whiteText: {
		fontSize: 20,
		color: 'white',
		textAlign: 'center',
	},
	picButton: {
		backgroundColor: '#fff',
		borderWidth: 1,
		borderColor: '#FBC074',
		width: Dimensions.get('window').width / 3,
		height: Dimensions.get('window').width / 11,
		borderRadius: 50,
		justifyContent: 'flex-end',
		alignSelf: 'flex-end',
		
	},
	finishButton: {
		backgroundColor: '#FBC074',
		borderWidth: 1,
		borderColor: '#FBC074',
		width: Dimensions.get('window').width / 1.75,
		height: Dimensions.get('window').width / 8,
		borderRadius: 50,
		justifyContent: 'center',
		alignSelf: 'center',
		marginTop: 50,
	},
	imageStyle: {
		margin: 2,
		marginTop: '20%',
		width: Dimensions.get('window').width * 0.25,
		height: Dimensions.get('window').width * 0.25,
		alignSelf: 'center',
		borderColor: '#233439',
		borderWidth: 1,
		borderRadius: Math.round(Dimensions.get('window').width + Dimensions.get('window').height) / 2,
	},
	buttonBox: {
		backgroundColor: '#fff',
		marginTop: '5%',
		justifyContent: 'space-between',
		flex: 1,
		marginBottom: '7.5%',
	},
}
)