import React from 'react';
import { StatusBar, Animated, Dimensions, StyleSheet, Image, View, Text, TouchableWithoutFeedback } from 'react-native';
import { CubeNavigationHorizontal } from 'react-native-3dcube-navigation'

export default class CubeHorizontal extends React.Component {
	constructor(props) {
		super(props)
	}

	render() {
		return (
			<View style={styles.father} >
				<StatusBar hidden={true} />
				<CubeNavigationHorizontal
					ref={view => { this.cube = view; }}>
					<View style={[styles.container, { backgroundColor: '#5CDB8B' }]}>
						<Text style={styles.text}>Android & IOS</Text>
					</View>
					<View style={[styles.container, { backgroundColor: '#A3F989' }]}>
						<Text style={styles.text}>Support Events</Text>
					</View>
					<View style={[styles.container, { backgroundColor: '#CBF941' }]}>
						<Text style={styles.text}>Scroll to</Text>
					</View>
				</CubeNavigationHorizontal>
			</View >
		);
	}
}

const styles = StyleSheet.create({
	father: {
		flex: 1,
		position: 'relative',
	},
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	text: {
		color: '#3a405a',
		fontSize: 30,
		fontWeight: 'bold'
	}
});
