import React from 'react';
// Importing all existing screens for navigation
import HomeScreen from './components/home-screen';
import FamilyTreeScreen from './components/family-tree-screen';
import ProfileScreen from './components/profile-screen';
import TimelineScreen from './components/timeline-screen';
import ItemDetailScreen from './components/item-detail-screen';
import WelcomeScreen from './components/welcome-screen';
import Login from './components/log-in-screen';
import SignUp1 from './components/sign-up1-screen';
import SignUp2 from './components/sign-up2-screen';
import SignUp3 from './components/sign-up3-screen';
import AddImageDetailsScreen from './components/add-image-details-screen';
import ProfileSettingScreen from './components/profile-setting';
import NotificationScreen from './components/notification-screen';

// Import react navigation tools
import {
	createBottomTabNavigator,
	createAppContainer,
	createSwitchNavigator,
	createStackNavigator,
	createDrawerNavigator,
} from 'react-navigation';

// Import icons
import Icon from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/Entypo';

// Import Firebase.
import * as firebase from 'firebase';
import { Dimensions, Text } from 'react-native';
import { HeaderTitle } from 'react-navigation-stack';

// Initialize Firebase
const firebaseConfig = {
	apiKey: "AIzaSyC4JLE-2HExIPeHTFE0QZmOt7f6koxTqsE",
	authDomain: "mementos-7bca9.firebaseapp.com",
	databaseURL: "https://mementos-7bca9.firebaseio.com",
	projectId: "mementos-7bca9",
	storageBucket: "gs://mementos-7bca9.appspot.com/",
	messagingSenderId: "657679581397",
	appId: "1:657679581397:web:6dbc92e3aa881c59"
};
firebase.initializeApp(firebaseConfig);

// To make drawer
// const ProfileStack = createStackNavigator({
// 	Profile: { screen: ProfileScreen },
// },
// 	{
// 		defaultNavigationOptions: ({ navigation }) => {
// 			return {
// 				headerLeft: (
// 					<Text style={{ fontWeight: 'bold', fontSize: 30, paddingLeft: 10, }}>Profile</Text>
// 				),
// 				headerRight: (
// 					<Icon
// 						style={{ paddingRight: 20 }}
// 						onPress={() => navigation.openDrawer()}
// 						name="md-menu"
// 						size={30}
// 					/>
// 				),
// 				headerStyle: {
// 					borderBottomWidth: 0,
// 					shadowColor: 'transparent',
// 					elevation:0,
// 					paddingTop: 25, 
// 					// backgroundColor: 'red',
// 				}

// 			};
// 		}
// 	},
// );

// const ProfileDrawer = createDrawerNavigator({
// 	back: {screen: ProfileStack},
// 	ProfileSetting: { screen: ProfileSettingScreen },
// 	Logout: { screen: WelcomeScreen },
// },
// );

// Main bottom tab navigator to navigate the main functionalities of the application
const MainNavigator = createBottomTabNavigator({
	Timeline: {
		screen: TimelineScreen,
		navigationOptions: {
			tabBarIcon: ({ tintColor }) => <Icon name="md-hourglass" color={tintColor} size={30} />
		},
	},
	FamilyTree: {
		screen: FamilyTreeScreen,
		navigationOptions: {
			tabBarIcon: ({ tintColor }) => <Icon2 name="tree" color={tintColor} size={30} />
		},
	},
	Home: {
		screen: HomeScreen,
		navigationOptions: {
			tabBarIcon: ({ tintColor }) => <Icon name="md-add" color={tintColor} size={30} />
		},
	},
	Notification: {
		screen: NotificationScreen,
		navigationOptions: {
			tabBarIcon: ({ tintColor }) => <Icon name="md-notifications-outline" color={tintColor} size={30} />
		},
	},
	Profile: {
		// screen: ProfileDrawer,
		screen: ProfileScreen,
		navigationOptions: {
			tabBarIcon: ({ tintColor }) => <Icon name="md-person" color={tintColor} size={30} />
		},
	},
},
	// Tab bar configuration
	{
		initialRouteName: 'Home',
		tabBarOptions: {
			activeTintColor: '#579B93',
			inactiveTintColor: 'black',
			showLabel: true,
			showIcon: true,
			// Edit the tab bar style and UI
			style: {
				backgroundColor: 'white',
				borderTopColor: '#579B93',
				borderTopWidth: .5,
				height: Dimensions.get('window').height / 14,
			},
			// Edit the navigation bar label
			labelStyle: {
				fontSize: 12,
			}
		},
		navigationOptions: {
			header: null,
		},

	},
);

// Stack navigator for uploading artefact
const uploadArtefactStack = createStackNavigator({
	MainNavigator,
	AddImageDetails: { screen: AddImageDetailsScreen },
},
	{
		navigationOptions: {
			header: null,
		},
	});

// Authentication stack navigator for sign up
const SignUpStack = createStackNavigator({
	SignUp1: { screen: SignUp1 },
	SignUp2: {
		screen: SignUp2,
		navigationOptions: ({ navigation }) => ({
			title: 'Enter details',
			headerTitleStyle: { color: '#EC6268' },
		}),
	},
	SignUp3: {
		screen: SignUp3,
		navigationOptions: ({ navigation }) => ({
			title: 'Choose profile picture!',
			headerTitleStyle: { color: '#EC6268' }
		}),
	},
});

// Stack navigator for looking at item details from gallery
const itemStack = createStackNavigator({
	MainNavigator,
	Profile: { screen: ProfileScreen },
	Timeline: { screen: TimelineScreen },
	Notification: { screen: NotificationScreen },
	ItemDetail: { screen: ItemDetailScreen },
},
)

const Stack = createSwitchNavigator({
	Welcome: { screen: WelcomeScreen },
	SignUpStack,
	Login: { screen: Login },
	itemStack,
	uploadArtefactStack,
})

const App = createAppContainer(Stack);

export default App;