import React from "react";
import {
  StatusBar,
  Animated,
  Dimensions,
  StyleSheet,
  Image,
  View,
  Text,
  TouchableWithoutFeedback
} from "react-native";
import { CubeNavigationHorizontal } from "react-native-3dcube-navigation";

const { width, height } = Dimensions.get("window");

export default class CubeHorizontal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      move: new Animated.Value(600)
    };
  }

  goToNext = () => {
    this.cube.scrollTo(2);
  };

  callBackAfterSwipe = pos => {
    if (Math.abs(pos) === width * 3) {
      //this.state.move.setValue(400)
      Animated.timing(this.state.move, {
        toValue: 230,
        duration: 4000,
        delay: 100
      }).start();
    }
  };

  render() {
    return (
      <View style={styles.father}>
        <StatusBar hidden={true} />
        <CubeNavigationHorizontal
          ref={view => {
            this.cube = view;
          }}
          callBackAfterSwipe={this.callBackAfterSwipe}
        >
          <View style={[styles.container, { backgroundColor: "#5CDB8B" }]}>
            <Image source={require("../assets/01.png")} style={styles.image} />
            <Text
              style={[
                styles.text,
                { fontSize: 50, textAlign: "center", paddingBottom: 5 }
              ]}
            >
              👋
            </Text>
            <Text style={[styles.text, { paddingBottom: 80 }]}>
              Hi Android & iOS
            </Text>
          </View>
          <View style={[styles.container, { backgroundColor: "#A3F989" }]}>
            <Image source={require("../assets/02.png")} style={styles.image} />
            <Text style={[styles.text, { color: "#fff", paddingBottom: 20 }]}>
              ScrollTo Example
            </Text>
            <TouchableWithoutFeedback onPress={this.goToNext}>
              <View
                style={{
                  width: width - width / 2.5,
                  paddingTop: 15,
                  paddingBottom: 15,
                  marginBottom: 30,
                  borderWidth: 2,
                  borderColor: "#fff",
                  borderRadius: 100
                }}
              >
                <Text
                  style={[
                    styles.text,
                    { fontSize: 18, textAlign: "center", color: "#fff" }
                  ]}
                >
                  Go to next page
                </Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
          <View style={[styles.container, { backgroundColor: "#CBF941" }]}>
            <Image source={require("../assets/01.png")} style={styles.image} />
            <Text
              style={[
                styles.text,
                { fontSize: 50, textAlign: "center", paddingBottom: 5 }
              ]}
            >
              🎩
            </Text>
            <Text style={[styles.text, { paddingBottom: 80 }]}>
              Smooth gesture cube
            </Text>
          </View>
          <View style={[styles.container, { backgroundColor: "#CBF941" }]}>
            <Image source={require("../assets/02.png")} style={styles.image} />
            <Animated.Image
              source={require("../assets/trigger.png")}
              style={[
                styles.trigger,
                {
                  transform: [{ translateY: this.state.move }]
                }
              ]}
            />
            <Text
              style={[
                styles.text,
                { fontSize: 50, textAlign: "center", paddingBottom: 5 }
              ]}
            >
              🌈
            </Text>
            <Text style={[styles.text, { color: "#fff", paddingBottom: 80 }]}>
              Callback after swipe
            </Text>
          </View>
        </CubeNavigationHorizontal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  father: {
    flex: 1,
    position: "relative"
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  text: {
    color: "#3a405a",
    fontSize: 30,
    fontWeight: "bold",
    backgroundColor: "transparent"
  },
  image: {
    position: "absolute",
    top: 0,
    height: height,
    width: width
  },
  trigger: {
    position: "absolute",
    resizeMode: "contain",
    width: 110,
    backgroundColor: "transparent"
  }
});
