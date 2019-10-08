// Profile setting
import React, { useState, useEffect } from 'react';
import {
	Text, View, StyleSheet, TextInput, TouchableOpacity, ToastAndroid, Dimensions, Image, ScrollView,
} from 'react-native';
import DatePicker from 'react-native-datepicker';
import AsyncStorage from '@react-native-community/async-storage';
import { SCHEMES } from 'uri-js';
import { pickImage, uploadImage } from '../image-tools';
import axios from 'axios';
import moment from 'moment';
moment.locale('en');

/*
TODO
- Create Page ✓
- Link in navigation bar ✓
- Create function

*/

// Edit user details: Name, DOB, password, profile picture
export default function ProfileSettingScreen({ navigation }) {
	const DATE_FORMAT = 'DD-MM-YYYY';
	const { navigate } = navigation;
	// const handleProfileChange = navigation.getParam('handleProfileChange');
	const setProfile = navigation.state.params.setProfile;
	const [user, setUser] = useState({});
	const [name, setName] = useState('');
	const [dob, setDob] = useState('');
	const [oldPassword, setOldPassword] = useState('');
	const [password, setPassword] = useState('');
	const [image, setImage] = useState({});

	// Validate name and new password
	function validateInput() {
		// Check if old password is the same as the new password
		if (password && user.password !== oldPassword) {
			alert("Old password does not match! >:)");
			return false;
		}
		if (password && password.length < 6) {
			alert("Password must be at least 6 characters long");
			return false
		}
		return true;
	}

	// Get profile
	async function obtainProfile() {
		await axios.get("http://localhost:3000/user")
			.then((result) => {
				console.log(result.data);
				setUser(result.data);
				setImage({ uri: result.data.pictureUrl });
			});
		// await console.log(user);
	}

	// Post profile
	// TODO: FIX ERROR -> AFTER CHANGING SETTING, RELOGIN THE PERSON
	async function updateProfile() {
		await validateInput();
		// Upload current image
		const data = {};
		name !== '' ? data.name = name : name;
		dob !== '' ? data.dob = dob : dob;
		password !== '' ? data.password = password : password;
		if (image.uri.includes('firebase') === false) {
			let newImage = await uploadImage(image.uri);
			data.pictureUrl = newImage;
		}
		const res = await axios.put("http://localhost:3000/user/update", data);
		const updatedProfile = res.data;
		console.log(updatedProfile);
		setProfile(updatedProfile);
	}

	// Get user details
	useEffect(() => {
		obtainProfile();
	}, [])

	return (
		<>
			<ScrollView>
				<View style={styles.container}>
					<Image source={{ uri: image.uri }} style={styles.imageStyle} />
					<View style={styles.buttonBox}>
						<TouchableOpacity
							onPress={async () => await setImage(await pickImage())}>
							<View style={styles.picButton}>
								<Text
									style={styles.buttonText}>
									Pick Picture
              </Text>
							</View>
						</TouchableOpacity>
					</View>
					<View style={styles.inputBox}>
						<View style={styles.inputElem}>
							<Text style={styles.text}>Full Name:</Text>
							<TextInput
								placeholder={user.name}
								onChangeText={setName}
								value={name}
								style={styles.textInput}
							/>
						</View>
						<View style={styles.inputElem}>
							<Text style={styles.text}>Date of Birth:</Text>

							<DatePicker
								style={styles.dateInputs}
								date={dob ? dob : user.dob}
								mode="date"
								placeholder={moment(user.dob).format(DATE_FORMAT)}
								format={DATE_FORMAT}
								maxDate={moment().format(DATE_FORMAT)}
								confirmBtnText="Confirm"
								cancelBtnText="Cancel"
								androidMode="spinner"
								customStyles={{
									dateIcon: {
										position: 'absolute',
										left: 0,
										top: 4,
										marginLeft: 0
									},
									dateInput: {
										// borderColor: 'white',
									}
								}}
								showIcon={false}
								onDateChange={newDate => setDob(newDate)}
								value={dob}
							/>
						</View>
						<View style={styles.inputElem}>
							<Text style={styles.text}>Old Password:</Text>
							<TextInput
								placeholder={'Enter Old Password'}
								secureTextEntry={true}
								onChangeText={setOldPassword}
								value={oldPassword}
								style={styles.textInput}
							/>
						</View>
						<View style={styles.inputElem}>
							<Text style={styles.text}> New Password:</Text>
							<TextInput
								placeholder='Enter New Password'
								secureTextEntry={true}
								onChangeText={setPassword}
								value={password}
								style={styles.textInput}
							/>
						</View>
					</View>

					<TouchableOpacity
						onPress={() => {
							updateProfile();
							navigate('Profile');
						}}>
						<View style={styles.redButton}>
							<Text
								style={styles.whiteText}>
								Next
							</Text>
						</View>
					</TouchableOpacity>
				</View>
			</ScrollView>

		</>
	);
}

// Stylesheets for formatting and designing layout
const styles = StyleSheet.create({
	container: {
		backgroundColor: 'white',
		flex: 1,
	},
	text: {
		fontSize: 16,
		color: 'black',
		textAlign: 'center',
		justifyContent: 'center',
		marginTop: 10,
	},
	buttonText: {
		fontSize: 16,
		color: 'black',
		textAlign: 'center',
		justifyContent: 'center',
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
		justifyContent: 'center',
		alignSelf: 'center',
		alignItems: 'center',
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
	},
	imageStyle: {
		margin: 2,
		marginTop: '20%',
		width: Dimensions.get('window').width / 4,
		height: Dimensions.get('window').width / 4,
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
	container: {
		backgroundColor: 'white',
		flex: 1,
	},
	whiteText: {
		fontSize: 20,
		color: 'white',
		textAlign: 'center',
	},
	inputBox: {
		justifyContent: 'space-between',
		paddingHorizontal: 40,
		marginBottom: 40,
	},
	redButton: {
		backgroundColor: '#EC6268',
		width: Dimensions.get('window').width / 1.75,
		height: Dimensions.get('window').width / 8,
		borderRadius: 50,
		justifyContent: 'center',
		alignSelf: 'center',
	},
	textInput: {
		borderColor: 'black',
		borderWidth: 0.5,
		borderRadius: 3,
		alignContent: 'center',
		padding: 5,
		paddingLeft: 10,
		width: Dimensions.get('window').width / 2,
	},
	dateInputs: {
		alignContent: 'center',
		width: Dimensions.get('window').width / 2,
	},
	inputElem: {
		marginBottom: 18,
		flexDirection: 'row',
		justifyContent: 'space-between',
	}
}
)