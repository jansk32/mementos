import React from 'react';
// Import all existing screens for navigation
import HomeScreen from './components/home-screen';
import FamilyTreeScreen from './components/family-tree-screen';
import ProfileScreen from './components/profile-screen';
import TimelineScreen from './components/timeline-screen';
import ItemDetailScreen from './components/item-detail-screen';
import WelcomeScreen from './components/welcome-screen';
import LoginScreen from './components/log-in-screen';
import SignUp1Screen from './components/sign-up1-screen';
import SignUp2Screen from './components/sign-up2-screen';
import SignUp3Screen from './components/sign-up3-screen';
import AddImageDetailsScreen from './components/add-image-details-screen';
import ProfileSettingsScreen from './components/profile-settings';
import NotificationScreen from './components/notification-screen';
import AddFamilyMemberScreen from './components/add-family-member-screen';
import AddParentsScreen from './components/add-parents-screen';
import AddParentsManuallyScreen from './components/add-parents-manually-screen';
import LoadingScreen from './components/loading-screen';

import { MenuProvider } from 'react-native-popup-menu';

// Import react-navigation tools
import {
	createAppContainer,
	createSwitchNavigator,
} from 'react-navigation';

import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';

// Import icons
import Icon from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/Entypo';

import { Dimensions } from 'react-native';

// Initialize Firebase
import firebase from 'firebase';
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

// OneSignal
import OneSignal from 'react-native-onesignal';
const ONESIGNAL_APP_ID = 'f9de7906-8c82-4674-808b-a8048c4955f1';
OneSignal.init(ONESIGNAL_APP_ID);
// Incoming notifications are displayed in the notification bar and not as an alert box
// when the app is open
OneSignal.inFocusDisplaying(2);
OneSignal.addEventListener('received', () => console.log('RECEIVED ONESIGNAL'));

// Sending artefact to family stack
const sendFamilyStack = createStackNavigator({
	ItemDetail: {
		screen: ItemDetailScreen,
		navigationOptions: {
			header: null,
		}
	},
	SendFamilyTree: {
		screen: FamilyTreeScreen,
		navigationOptions: {
			header: null,
		}
	},
	Loading: {
		screen: LoadingScreen,
		navigationOptions: {
			header: null,
		}
	},
},
);

const familyStack = createStackNavigator({
	FamilyTree: {
		screen: FamilyTreeScreen,
		navigationOptions: {
			header: null,
		}
	},
	NewProfile: { screen: ProfileScreen },
	ItemDetail: { screen: ItemDetailScreen },
	ProfileSettings: { screen: ProfileSettingsScreen },
	Loading: {
		screen: LoadingScreen,
		navigationOptions: {
			header: null,
		}
	},
	AddFamilyMember: { screen: AddFamilyMemberScreen },
	AddParentsManually: { screen: AddParentsManuallyScreen },
	AddParents: { screen: AddParentsScreen },
});

const notifStack = createStackNavigator({
	Notification: {
		screen: NotificationScreen,
		navigationOptions: {
			header: null,
		}
	},
	sendFamilyStack,
	NewProfile: { screen: ProfileScreen },
});

// Stack navigator for uploading artefact
const uploadArtefactStack = createStackNavigator({
	Home: {
		screen: HomeScreen,
		navigationOptions: {
			header: null,
		}
	},
	AddImageDetails: { screen: AddImageDetailsScreen },
	Loading: {
		screen: LoadingScreen,
		navigationOptions: {
			header: null,
		}
	},
},
	{
		navigationOptions: {
			header: null,
		},
	});

// Stack for profile
const profileStack = createStackNavigator({
	Profile: {
		screen: ProfileScreen,
		navigationOptions: {
			header: null,
		}
	},
	sendFamilyStack,
	ProfileSettings: { screen: ProfileSettingsScreen },
});

const timelineStack = createStackNavigator({
	Timeline: {
		screen: TimelineScreen,
		navigationOptions: {
			header: null,
		}
	},
	sendFamilyStack,

	// ItemDetail: { screen: ItemDetailScreen },
});

// Main bottom tab navigator to navigate the main functionalities of the application
const MainNavigator = createBottomTabNavigator({
	Timeline: {
		screen: timelineStack,
		navigationOptions: {
			tabBarIcon: ({ tintColor }) => <Icon name="md-hourglass" color={tintColor} size={30} />
		},
	},
	FamilyTree: {
		screen: familyStack,
		navigationOptions: {
			tabBarIcon: ({ tintColor }) => <Icon2 name="tree" color={tintColor} size={30} />
		},
	},
	Home: {
		screen: uploadArtefactStack,
		navigationOptions: {
			tabBarIcon: ({ tintColor }) => <Icon name="md-add" color={tintColor} size={30} />
		},
	},
	Notification: {
		screen: notifStack,
		navigationOptions: {
			tabBarIcon: ({ tintColor }) => <Icon name="md-notifications-outline" color={tintColor} size={30} />
		},
	},
	Profile: {
		screen: profileStack,
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
			inactiveTintColor: '#525151',
			showLabel: true,
			showIcon: true,
			// Edit the tab bar style and UI
			style: {
				backgroundColor: '#f5f7fb',
				borderTopColor: '#f5f7fb',
				height: Dimensions.get('window').height / 14,
				paddingTop: 5,
			},
			// Edit the navigation bar label
			labelStyle: {
				fontSize: 12,
			},
		},
		navigationOptions: {
			header: null,
		},
	},
);

// Navigation between the welcome screen, sign-up screen and login screen.
const WelcomeStack = createStackNavigator({
	Welcome: {
		screen: WelcomeScreen,
		navigationOptions: {
			header: null
		}
	},
	SignUp1: {
		screen: SignUp1Screen,
	},
	SignUp2: {
		screen: SignUp2Screen,
		navigationOptions: ({ navigation }) => ({
			title: 'Enter your details',
		}),
	},
	SignUp3: {
		screen: SignUp3Screen,
		navigationOptions: ({ navigation }) => ({
			title: 'Choose a profile picture',
		}),
	},
	Login: {
		screen: LoginScreen,
	},
});

const Stack = createSwitchNavigator({
	WelcomeStack,
	MainNavigator,
});

const NavigationContainer = createAppContainer(Stack);

const App = () => (
	<MenuProvider>
		<NavigationContainer />
	</MenuProvider>
);

export default App;