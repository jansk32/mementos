import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Text, ActivityIndicator, StyleSheet, View, Image, Dimensions, TouchableOpacity, Button } from 'react-native';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/EvilIcons';
import moment from 'moment';
import OneSignal from 'react-native-onesignal';
import AsyncStorage from '@react-native-community/async-storage';
import { Assets } from 'react-navigation-stack';
import LinearGradient from 'react-native-linear-gradient';

import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuProvider, withMenuContext, renderers } from 'react-native-popup-menu';
const { SlideInMenu } = renderers;

// Environment variables
import { BACK_END_ENDPOINT, BLANK_PROFILE_PIC_URI } from '../constants';

// Number 
const numColumns = 3;

// To format data
const formatData = (data, numColumns) => {
	const fullRowsNum = Math.floor(data.length / numColumns);

	let numberOfElementsLastRow = data.length - (fullRowsNum * numColumns);
	while (numberOfElementsLastRow !== numColumns && numberOfElementsLastRow !== 0) {
		data.push({ key: `blank-${numberOfElementsLastRow}`, empty: true });
		numberOfElementsLastRow++;
	}
	return data;
};

function useCurrentUser() {
	const [currentUser, setCurrentUser] = useState({});

	useEffect(() => {
		async function fetchCurrentUser() {
			const res = await axios.get(`${BACK_END_ENDPOINT}/user/find/${await AsyncStorage.getItem('userId')}`);
			setCurrentUser(res.data);
		}
		fetchCurrentUser();
	}, []);

	return currentUser;
}

function ProfileScreen({ navigation, ctx }) {
	const { navigate } = navigation;
	const [profile, setProfile] = useState({});
	const [artefact, setArtefact] = useState([]);
	const [hide, setHide] = useState(true);
	const currentUser = useCurrentUser();
	const userId = navigation.state.params && navigation.state.params.userId;

	// Get profile details
	async function getProfile() {
		let targetId = userId
		console.log(targetId);
		if (!userId) {
			const currentUserRes = await axios.get(`${BACK_END_ENDPOINT}/user/find/${await AsyncStorage.getItem('userId')}`);
			targetId = currentUserRes.data._id;
		}
		try {
			const res = await axios.get(`${BACK_END_ENDPOINT}/user/find/${targetId}`);
			setProfile(res.data);
			setHide(false);
		} catch (e) {
			console.trace(e);
		}
	}

	// Get the artefacts of the user
	async function fetchArtefacts() {
		let targetId = userId;
		if (!userId) {
			const currentUserRes = await axios.get(`${BACK_END_ENDPOINT}/user/find/${await AsyncStorage.getItem('userId')}`);
			targetId = currentUserRes.data._id;
		}
		try {
			const res = await axios.get(`${BACK_END_ENDPOINT}/artefact/findbyowner/${targetId}`);
			setArtefact(res.data);
			setHide(false);
		} catch (e) {
			console.trace(e);
		}
	}

	async function fetchProfile() {
		if (profile === null || artefact.length < 1) {
			setHide(true);
		}
		await getProfile();
	}

	// Get profile and artefacts by owner
	useEffect(() => {
		fetchProfile();
		fetchArtefacts();
	}, [userId]);


	// Logout function
	async function logout() {
		try {
			await axios.get(`${BACK_END_ENDPOINT}/logout`);
			await AsyncStorage.multiRemove(['email', 'password', 'userId']);
			OneSignal.removeExternalUserId();
			navigate('Welcome');
		} catch (e) {
			console.trace(e);
		}
	}

	// Render Item invisible if it's just a placeholder for columns in the grid,
	// if not, render the picture for each grid
	renderItem = ({ item, index }) => {

		if (item.empty === true) {
			return <View style={[styles.itemBox, styles.invisibleItem]} />;
		}
		return (
			<View style={styles.itemBox}>
				<TouchableOpacity
					onPress={() => navigate('ItemDetail', { artefactId: item._id })}>
					<Image
						source={{ uri: item.file }}
						style={styles.imageBox} />
				</TouchableOpacity>
			</View>
		);
	};

	// Format date
	moment.locale('en');

	// Return the whole layout for profile
	return (
		<>
			{/* <View style={styles.header}> */}
			<LinearGradient colors={['#4568dc', '#b06ab3']} 
            	start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                 style={styles.header}>

				<Text style={styles.profile}>Profile</Text>
				<View style={[styles.icon, { display: !navigation.state.params ? 'flex' : 'none' }]}>
					<Icon name="navicon" size={40} color={'white'}
						onPress={() => ctx.menuActions.openMenu('profileMenu')} />
					<Menu name="profileMenu" renderer={SlideInMenu}>
						<MenuTrigger>
						</MenuTrigger>
						<MenuOptions customStyles={{ optionText: styles.menuText, optionWrapper: styles.menuWrapper, optionsContainer: styles.menuStyle }}>
							<MenuOption onSelect={() => navigate('ProfileSetting', { setProfile })} text="Profile Setting" />
							<MenuOption onSelect={logout} text="Logout" />
						</MenuOptions>
					</Menu>
				</View>
			</LinearGradient>
			{/* </View> */}
			
			<ScrollView>
		
				<View style={styles.profileBox}>
				{ hide &&
				(
					<ActivityIndicator size="large" color="#0000ff" animating={hide} />
				)
			}
					<Image
						source={{ uri: profile.pictureUrl || BLANK_PROFILE_PIC_URI }}
						style={styles.image}
					/>
					<View style={styles.textBox}>
						<Text
							style={styles.nameText}>{profile.name}</Text>
						<Text
							style={styles.dob}>DOB: {moment(profile.dob).format('L')}</Text>
					</View>
				</View>
				<View style={styles.artefactsBox}>
					<Text style={styles.artText}>My Artefacts</Text>
					<FlatList
						data={formatData(artefact, numColumns)}
						keyExtractor={item => item._id}
						numColumns={3}
						renderItem={renderItem}
					/>
				</View>
			</ScrollView>
		</>
	);
}

// Stylesheets to format the layout of the page
const styles = StyleSheet.create({
	profileBox: {
		backgroundColor: '#f5f7fb',
		// borderBottomLeftRadius: 25,
		// borderBottomRightRadius: 25,
	},
	header: {
		flexDirection: 'row',
		padding: 15,
		// margin: 10,
	},

	profile: {
		fontSize: 30,
		fontWeight: 'bold',
		// color: '#2d2e33',
		color: 'white',
		alignItems: 'flex-start',
		paddingLeft: 10,
	},

	icon: {
		alignItems: 'flex-end',
		flex: 3,
		paddingRight: 20,
		paddingTop: 5,
	},
	image: {
		width: 100,
		height: 100,
		borderRadius: 125,
		marginTop: 14,
		marginLeft: 14,
		marginRight: 10,
		marginBottom: 5,
		alignSelf: 'center',
	},
	imageBox: {
		margin: 1,
		width: Dimensions.get('window').width / 3.2,
		height: Dimensions.get('window').width / 3.2,
	},
	textBox: {
		// flex: 1,
		padding: 8,
		marginLeft: 10,
		justifyContent: "center",
		alignSelf: 'center',
	},
	itemBox: {
		backgroundColor: '#FAFAFA',
		alignItems: 'center',
	},
	itemText: {
		color: 'black',
		justifyContent: "center",
		alignSelf: 'center',
	},
	buttonText: {
		fontSize: 15,
	},
	nameText: {
		fontSize: 20,
		fontWeight: 'bold',
		textAlign: 'center',
	},
	dob: {
		fontSize: 15,
		textAlign: 'center',
	},
	artefactsBox: {
		backgroundColor: '#fff',
		paddingTop: 20,
		paddingLeft: 10,
		paddingBottom: 10,
		paddingRight: 10,
	},
	artText: {
		justifyContent: 'center',
		marginBottom: 18,
		marginLeft: 12,
		fontSize: 16,
	},
	container: {
		margin: 20,
	},
	invisibleItem: {
		backgroundColor: 'transparent',
	},
	menuStyle: {
		borderTopEndRadius: 20,
		borderTopStartRadius: 20,
		borderColor: 'black',
		borderWidth: 0.5,
		paddingTop: 20,
		justifyContent: 'space-between',
		paddingBottom: 80,
	},
	menuWrapper: {
		paddingVertical: 15,
		borderBottomColor: 'black',
		borderBottomWidth: 0.5,
		marginHorizontal: 50,
	},
	menuText: {
		textAlign: 'left',
		fontSize: 20,
	},
})

export default withMenuContext(ProfileScreen);