import React, { useState, useEffect, Component } from 'react';
import { View, PanResponder, Dimensions, ToastAndroid, TextInput, StyleSheet, Text, Alert, ActivityIndicator, TouchableOpacity, } from 'react-native';
import Svg, { Circle, Line, Image, Defs, ClipPath, G, Text as SvgText } from 'react-native-svg';
import { arrangeFamilyTree, mainDrawLines, getAncestors } from '../build-family-tree.js';
import axios from 'axios';
import { Menu, MenuOptions, MenuOption, MenuTrigger, withMenuContext, renderers } from 'react-native-popup-menu';
const { SlideInMenu } = renderers;
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';


import { BACK_END_ENDPOINT, BLANK_PROFILE_PIC_URI, KinshipEnum } from '../constants';
import AsyncStorage from '@react-native-community/async-storage';

const NODE_RADIUS = 50;
/* SVG panning and zooming is taken from https://snack.expo.io/@msand/svg-pinch-to-pan-and-zoom
 * Written by Mikael Sand 
 * Taken on 22 October 2019 */

function calcDistance(x1, y1, x2, y2) {
	const dx = x1 - x2;
	const dy = y1 - y2;
	return Math.sqrt(dx * dx + dy * dy);
}

function middle(p1, p2) {
	return (p1 + p2) / 2;
}

function calcCenter(x1, y1, x2, y2) {
	return {
		x: middle(x1, x2),
		y: middle(y1, y2),
	};
}

class FamilyTreeSvg extends Component {
	viewBoxSize = 1200;
	resolution = this.viewBoxSize / Math.min(this.props.height, this.props.width);

	state = {
		zoom: 1,
		left: 0,
		top: 0,
		isGesture: false,
	};

	processPinch(x1, y1, x2, y2) {
		const distance = calcDistance(x1, y1, x2, y2);
		const { x, y } = calcCenter(x1, y1, x2, y2);

		if (!this.state.isZooming) {
			const { top, left, zoom } = this.state;
			this.setState({
				isZooming: true,
				initialX: x,
				initialY: y,
				initialTop: top,
				initialLeft: left,
				initialZoom: zoom,
				initialDistance: distance,
			});
		} else {
			const {
				initialX,
				initialY,
				initialTop,
				initialLeft,
				initialZoom,
				initialDistance,
			} = this.state;

			const touchZoom = distance / initialDistance;
			const dx = x - initialX;
			const dy = y - initialY;

			const left = (initialLeft + dx - x) * touchZoom + x;
			const top = (initialTop + dy - y) * touchZoom + y;
			const zoom = initialZoom * touchZoom;

			this.setState({
				zoom,
				left,
				top,
			});
		}
	}

	processTouch(x, y) {
		if (!this.state.isMoving || this.state.isZooming) {
			const { top, left } = this.state;
			this.setState({
				isMoving: true,
				isZooming: false,
				initialLeft: left,
				initialTop: top,
				initialX: x,
				initialY: y,
			});
		} else {
			const { initialX, initialY, initialLeft, initialTop } = this.state;
			const dx = x - initialX;
			const dy = y - initialY;
			this.setState({
				left: initialLeft + dx,
				top: initialTop + dy,
			});
		}
	}

	UNSAFE_componentWillMount() {
		this._panResponder = PanResponder.create({
			onStartShouldSetPanResponder: () => true,
			onStartShouldSetPanResponderCapture: () => true,
			onMoveShouldSetPanResponder: () => true,
			onMoveShouldSetPanResponderCapture: () => true,
			onPanResponderGrant: (e, gesture) => {
				const { locationX, locationY } = e.nativeEvent;
				const { left, top, zoom } = this.state;

				const tapX = (locationX - left) * this.resolution / zoom;
				const tapY = (locationY - top) * this.resolution / zoom;

				// Look for any node that was tapped
				const tappedNode = this.props.familyTree.find(node => Math.hypot(node.x - tapX, node.y - tapY) <= NODE_RADIUS);
				if (tappedNode) {
					this.setState({ tappedNode });
					// Set long press timeout to open menu if a node was tapped
					const LONG_PRESS_DURATION = 1000;
					this.longPressTimeout = setTimeout(() => {
						this.props.ctx.menuActions.openMenu('familyTreeMenu' + this.props.navigation.state.routeName);
						// Null long press timeout to signal that the timeout has been resolved
						// so on touch release, a tap isn't registered
						this.longPressTimeout = null;
					}, LONG_PRESS_DURATION);
				} else {
					// No node was tapped, clear previous tapped node
					this.setState({ tappedNode: null });
				}
			},
			onPanResponderTerminate: () => { },
			onShouldBlockNativeResponder: () => true,
			onPanResponderTerminationRequest: () => true,
			onPanResponderMove: (evt, gesture) => {
				if (this.state.isGesture) {
					const touches = evt.nativeEvent.touches;
					const length = touches.length;
					if (length === 1) {
						const [{ locationX, locationY }] = touches;
						this.processTouch(locationX, locationY);
					} else if (length === 2) {
						const [touch1, touch2] = touches;
						this.processPinch(
							touch1.locationX,
							touch1.locationY,
							touch2.locationX,
							touch2.locationY
						);
					}
				} else {
					if (Math.hypot(gesture.dx, gesture.dy) > 5) {
						this.setState({ isGesture: true });
						clearTimeout(this.longPressTimeout);
					}
				}
			},
			onPanResponderRelease: async () => {
				clearTimeout(this.longPressTimeout);

				this.setState({
					isZooming: false,
					isMoving: false,
					isGesture: false,
				});

				if (!this.state.isGesture) {
					if (this.state.tappedNode && this.longPressTimeout) {
						// Register touch release as a tap if long press timeout hasn't
						// been nulled by itself which means it hasn't resolved
						const { navigation } = this.props;
						if (navigation.state.params && navigation.state.params.isSendingArtefact) {
							// Send artefact
							// But first check if the user wants to send the artefact to themself
							const userId = await AsyncStorage.getItem('userId');
							if (this.state.tappedNode._id === userId) {
								alert('You cannot send an artefact to yourself.');
								return;
							}
							Alert.alert(
								'Send artefact',
								`Send artefact to ${this.state.tappedNode.name}?`,
								[{
									text: 'Cancel'
								},
								{
									text: 'OK',
									onPress: () => {
										const task = async () => {
											try {
												const userId = await AsyncStorage.getItem('userId');
												await axios.put(`${BACK_END_ENDPOINT}/artefact/assign`, {
													artefactId: navigation.state.params.artefactId,
													recipientId: this.state.tappedNode._id,
													senderId: userId,
												});

												navigation.setParams(null);
												navigation.dismiss();
												// navigation.popToTop();
												// navigation.navigate('Profile');
											} catch (e) {
												console.trace(e);
												ToastAndroid.show('Error sending artefact', ToastAndroid.LONG);
												navigation.goBack();
											}
										}

										navigation.navigate('Loading', { loadingMessage: 'Sending Artefact', task });
									}
								}]);
						} else {
							// Go to profile page but send family member details instead
							navigation.navigate('NewProfile', { userId: this.state.tappedNode._id });
						}
					}
				}
			},
		});
	}

	componentDidMount() {
		const { height, width, familyTree } = this.props;
		const xCoords = familyTree.map(node => node.x);
		const familyTreeWidth = (Math.max(...xCoords) - Math.min(...xCoords)) / this.resolution;
		const yCoords = familyTree.map(node => node.y);
		const familyTreeHeight = (Math.max(...yCoords) - Math.min(...yCoords)) / this.resolution;
		this.setState({
			left: width / 2,
			top: height / 2,
			zoom: 2,
		});
	}

	render() {
		const { height, width, familyTree, lines, fetchFamilyMembers, navigation } = this.props;
		const { navigate } = navigation;
		const { left, top, zoom } = this.state;

		return (
			<View {...this._panResponder.panHandlers}>
				<Menu name={'familyTreeMenu' + navigation.state.routeName} renderer={SlideInMenu}>
					<MenuTrigger>
					</MenuTrigger>
					<MenuOptions customStyles={{ optionText: styles.menuText, optionWrapper: styles.menuWrapper, optionsContainer: styles.menuStyle }}>
						<MenuOption onSelect={() => navigate('AddParents', { linkedNode: this.state.tappedNode, fetchFamilyMembers, kinship: KinshipEnum.PARENT })} text="Add parents" disabled={this.state.tappedNode && Boolean(this.state.tappedNode.father) && Boolean(this.state.tappedNode.mother)} />
						<MenuOption onSelect={() => navigate('AddFamilyMember', { linkedNode: this.state.tappedNode, fetchFamilyMembers, kinship: KinshipEnum.SPOUSE })} text="Add spouse" disabled={this.state.tappedNode && Boolean(this.state.tappedNode.spouse)} />
						<MenuOption onSelect={() => navigate('AddFamilyMember', { linkedNode: this.state.tappedNode, fetchFamilyMembers, kinship: KinshipEnum.CHILD })} text="Add a child" disabled={this.state.tappedNode && !Boolean(this.state.tappedNode.spouse)} />
						<MenuOption onSelect={async () => {
							await axios.put(`${BACK_END_ENDPOINT}/user/remove-child/${this.state.tappedNode._id}`);
							fetchFamilyMembers();
						}} text="Remove child" />
						<MenuOption onSelect={async () => {
							await axios.put(`${BACK_END_ENDPOINT}/user/remove-spouse/${this.state.tappedNode._id}`);
							fetchFamilyMembers();
						}} text="Remove spouse" />
					</MenuOptions>
				</Menu>

				<Svg
					width={width}
					height={height}
					viewBox={`0 0 ${this.viewBoxSize} ${this.viewBoxSize}`}
					preserveAspectRatio="xMinYMin meet" >
					<G
						transform={{
							translateX: left * this.resolution,
							translateY: top * this.resolution,
							scale: zoom,
						}}>
						{
							familyTree.map(node => <Node data={node} key={node._id} />)
						}
						{
							lines.map((line, i) =>
								<Line
									x1={line.x1}
									y1={line.y1}
									x2={line.x2}
									y2={line.y2}
									stroke="black"
									strokeWidth="3"
									key={i}
								/>
							)
						}
					</G>
				</Svg>
			</View>
		);
	}
}

function Node({ data: { x, y, name, _id, pictureUrl, matchesSearch } }) {
	console.log('rendering node');
	return (
		<>
			<Defs>
				<ClipPath id={_id.toString()}>
					<Circle cx={x} cy={y} r={NODE_RADIUS} />
				</ClipPath>
			</Defs>
			<Circle
				cx={x}
				cy={y}
				r={NODE_RADIUS}
				stroke={matchesSearch ? '#EC6268' : 'white'}
				strokeWidth="8"
				fill="white"
			/>
			<Image
				height={NODE_RADIUS * 2}
				width={NODE_RADIUS * 2}
				x={x - NODE_RADIUS}
				y={y - NODE_RADIUS}
				href={{ uri: pictureUrl || BLANK_PROFILE_PIC_URI }}
				clipPath={`url(#${_id})`}
				preserveAspectRatio="xMidYMid slice"
			/>
			<SvgText
				x={x}
				y={y + 2 * NODE_RADIUS}
				fill="black"
				stroke="black"
				fontSize="30"
				textAnchor="middle"
			>
				{name}
			</SvgText>
		</>
	);
}

function FamilyTreeScreen({ ctx, navigation }) {
	const [familyTree, setFamilyTree] = useState([]);
	const [lines, setLines] = useState([]);
	const [familyMemberSearch, setFamilyMemberSearch] = useState('');
	const [isSvgDimensionsSet, setSvgDimensionsSet] = useState(false);
	const [isLoading, setLoading] = useState(true);
	const [svgWidth, setSvgWidth] = useState(Dimensions.get('window').width);
	const [svgHeight, setSvgHeight] = useState(Dimensions.get('window').height);

	async function fetchFamilyMembers() {
		try {
			setLoading(true);
			const userId = await AsyncStorage.getItem('userId');
			const familyTreeRes = await axios.get(`${BACK_END_ENDPOINT}/family-tree/${userId}`);
			const familyTree = familyTreeRes.data;

			// getAncestors needs to be called at the client side to make the objects in ancestors
			// refer to the same objects in familyTree
			const ancestors = getAncestors(familyTree, userId);

			arrangeFamilyTree(familyTree, ancestors, userId);
			const lines = mainDrawLines(familyTree, ancestors);

			console.log(familyTree);
			setFamilyTree(familyTree);
			setLines(lines);
			setLoading(false)
		} catch (e) {
			console.trace(e);
		}
	}

	useEffect(() => {
		fetchFamilyMembers();
	}, []);

	// Family tree searching and highlighting
	useEffect(() => {
		if (familyTree.length) {
			// Highlight the nodes that match the search string
			// If the search string is empty, there are no matches
			setFamilyTree(familyTree
				.map(node =>
					({ ...node, matchesSearch: familyMemberSearch ? node.name.toLowerCase().includes(familyMemberSearch.toLowerCase()) : false })));
		}
	}, [familyMemberSearch]);

	return (
		<>
			<LinearGradient colors={['#02aab0', '#00cdac']}
				start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
				style={styles.headerContainer}>
				<Text style={styles.add}>This is your</Text>
				<Text style={styles.title}>Family Tree</Text>
				<TouchableOpacity onPress={fetchFamilyMembers} style={styles.refreshButton}>
					<Icon name="md-refresh" size={35} color='#2d2e33'/>
				</TouchableOpacity>
				<View style={styles.searchContainer}>
					<View style={{ paddingTop: 5 }}>
						<Icon name="md-search" size={25} color={'#2d2e33'} />
					</View>
					<TextInput
						placeholder="Search family member"
						value={familyMemberSearch}
						onChangeText={setFamilyMemberSearch}
						style={styles.searchInput}
					/>
				</View>
			</LinearGradient>
			<View style={{ flex: 1, alignSelf: 'stretch' }} onLayout={event => {
				const { width, height } = event.nativeEvent.layout;
				if (isSvgDimensionsSet) {
					return;
				}
				setSvgWidth(width);
				setSvgHeight(height);
				setSvgDimensionsSet(true);
			}}>
				{
					!isLoading && isSvgDimensionsSet ?
						(
							<FamilyTreeSvg
								width={svgWidth}
								height={svgHeight}
								familyTree={familyTree}
								lines={lines}
								ctx={ctx}
								navigation={navigation}
								fetchFamilyMembers={fetchFamilyMembers} />
						)
						:
						<ActivityIndicator size="large" color="#EC6268" />
				}
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	headerContainer: {
		// borderBottomLeftRadius: 30,
		// borderBottomRightRadius: 30,
		backgroundColor: '#f5f7fb',
		paddingBottom: 20,
	},
	searchContainer: {
		flexDirection: 'row',
		padding: 5,
		paddingHorizontal: 20,
		borderRadius: 10,
		borderWidth: 0.5,
		marginLeft: '5%',
		marginRight: '5%',
		backgroundColor: 'white',
		borderColor: 'white',
	},
	searchInput: {
		flex: 1,
		marginLeft: 15,
		padding: 5
	},
	title: {
		fontSize: 30,
		color: 'white',
		paddingBottom: '3%',
		fontWeight: 'bold',
		marginLeft: 10,
	},
	add: {
		fontSize: 20,
		color: 'white',
		marginLeft: 10,
		paddingTop: '5%',
	},
	menuStyle: {
		borderTopEndRadius: 20,
		borderTopStartRadius: 20,
		borderRadius: 20,
		borderColor: 'black',
		backgroundColor: "black",
		borderWidth: 1,
		flex: 1 / 4,
		width: Dimensions.get('window').width * 0.85,
		alignSelf: 'center',
		height: 150,
		marginBottom: 30,
		justifyContent: 'space-evenly',
	},
	menuText: {
		textAlign: 'center',
		fontSize: 20,
		color: 'white',
		borderBottomWidth: 1,
		borderBottomColor: 'white',
		paddingBottom: 7,

		// borderTopColor:'#f5f7fb',
		// borderLeftColor:'#f5f7fb',
	},
	menuStyle: {
		borderTopEndRadius: 20,
		borderTopStartRadius: 20,
		borderColor: '#f5f7fb',
		backgroundColor: '#f5f7fb',
		borderWidth: 0.5,
		paddingTop: 20,
		justifyContent: 'space-between',
		paddingBottom: 80,
	},
	menuWrapper: {
		paddingVertical: 15,
		borderBottomColor: '#2d2e33',
		borderBottomWidth: 0.5,
		marginHorizontal: 50,
	},
	menuText: {
		textAlign: 'left',
		fontSize: 20,
	},
	refreshButton: {
		backgroundColor: 'white',
		width: 50,
		height: 50,
		position: 'absolute',
		right: 0,
		marginRight: 30,
		top: 0,
		marginTop: 30,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 25
	},
});

FamilyTreeScreen.navigationOptions = {
	title: 'Family tree'
};

export default withMenuContext(FamilyTreeScreen);