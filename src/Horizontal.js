import React from 'react';
import PropTypes from 'prop-types';
import {
  PanResponder,
  Animated,
  Dimensions,
  StyleSheet,
  Platform
} from 'react-native';
const { width, height } = Dimensions.get('window');

const PESPECTIVE = Platform.OS === 'ios' ? 2.38 : 1.7;
const TR_POSITION = Platform.OS === 'ios' ? 2 : 1.5;

export default class CubeNavigationHorizontal extends React.Component {
  constructor(props) {
    super(props);

    this.pages = this.props.children.map((child, index) => width * -index);
    this.fullWidth = (this.props.children.length - 1) * width;

    this.state = {
      scrollLockPage: this.pages[this.props.scrollLockPage]
    };
  }

  componentWillMount() {
    this._animatedValue = new Animated.ValueXY();
    this._animatedValue.setValue({ x: 0, y: 0 });
    this._value = { x: 0, y: 0 };

    this._animatedValue.addListener(value => {
      this._value = value;
    });

    const onDoneSwiping = (gestureState) => {
      if (this.props.callbackOnSwipe) {
        this.props.callbackOnSwipe(false);
      }
      let mod = gestureState.dx > 0 ? 100 : -100;

      let goTo = this._closest(this._value.x + mod);
      this._animatedValue.flattenOffset({
        x: this._value.x,
        y: this._value.y
      });
      Animated.spring(this._animatedValue, {
        toValue: { x: goTo, y: 0 },
        friction: 3,
        tension: 0.6
      }).start();
      setTimeout(() => {
        if (this.props.callBackAfterSwipe)
          this.props.callBackAfterSwipe(goTo, Math.abs(goTo / width));
      }, 500);
    }

    this._panResponder = PanResponder.create({
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetResponderCapture: () => Math.abs(gestureState.dx) > 60,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) =>
        Math.abs(gestureState.dx) > 60,
      onPanResponderGrant: (e, gestureState) => {
        if (this.props.callbackOnSwipe) {
          this.props.callbackOnSwipe(true);
        }
        this._animatedValue.stopAnimation();
        this._animatedValue.setOffset({ x: this._value.x, y: this._value.y });
      },
      onPanResponderMove: (e, gestureState) => {
        if (this.props.loop) {
          if (gestureState.dx < 0 && this._value.x < - this.fullWidth) {
            this._animatedValue.setOffset({ x: width });
          } else if (gestureState.dx > 0 && this._value.x > 0) {
            this._animatedValue.setOffset({ x: - (this.fullWidth + width ) });
          }
        }
        Animated.event([null, { dx: this._animatedValue.x }])(e, gestureState);
      },
      onPanResponderRelease: (e, gestureState) => {
        onDoneSwiping(gestureState);
      },
      onPanResponderTerminate: (e, gestureState) => {
        onDoneSwiping(gestureState);
      },
    });
  }

  componentWillReceiveProps(props) {
    this.setState({
      scrollLockPage: props.scrollLockPage
        ? this.pages[props.scrollLockPage]
        : undefined
    });
  }

  /*
    @page: index
  */
  scrollTo(page, animated) {
    animated = animated == undefined ? true : animated;

    if (animated) {
      Animated.spring(this._animatedValue, {
        toValue: { x: this.pages[page], y: 0 },
        friction: 4,
        tension: 0.8
      }).start();
    } else {
      this._animatedValue.setValue({ x: this.pages[page], y: 0 });
    }
  }

  /*
  Private methods
  */

  _getTransformsFor = i => {
    let scrollX = this._animatedValue.x;
    let pageX = -width * i;
    let loopVariable = (variable, sign = 1) => variable + Math.sign(sign) * (this.fullWidth + width );
    let padInput = (variables) => {
      if (!this.props.loop) 
        return variables;
      const returnedVariables = [...variables];
      returnedVariables.unshift(...variables.map(variable => loopVariable(variable, -1)))
      returnedVariables.push(...variables.map(variable => loopVariable(variable, 1)))
      return returnedVariables;
    }
    let padOutput = (variables) => {
      if (!this.props.loop) 
        return variables;
      const returnedVariables = [...variables];
      returnedVariables.unshift(...variables)
      returnedVariables.push(...variables)
      return returnedVariables;
    }

    let translateX = scrollX.interpolate({
      inputRange: padInput([pageX - width, pageX, pageX + width]),
      outputRange: padOutput([(-width - 1) / TR_POSITION, 0, (width + 1) / TR_POSITION]),
      extrapolate: 'clamp'
    });

    let rotateY = scrollX.interpolate({
      inputRange: padInput([pageX - width, pageX, pageX + width]),
      outputRange: padOutput(['-60deg', '0deg', '60deg']),
      extrapolate: 'clamp'
    });

    let translateXAfterRotate = scrollX.interpolate({
      inputRange: padInput([
        pageX - width,
        pageX - width + 0.1,
        pageX,
        pageX + width - 0.1,
        pageX + width
      ]),
      outputRange: padOutput([
        -width - 1,
        (-width - 1) / PESPECTIVE,
        0,
        (width + 1) / PESPECTIVE,
        +width + 1
      ]),
      extrapolate: 'clamp'
    });

    let opacity = scrollX.interpolate({
      inputRange: padInput([
        pageX - width,
        pageX - width + 10,
        pageX,
        pageX + width - 250,
        pageX + width
      ]),
      outputRange: padOutput([0, 0.6, 1, 0.6, 0]),
      extrapolate: 'clamp'
    });

    return {
      transform: [
        { perspective: width },
        { translateX },
        { rotateY: rotateY },
        { translateX: translateXAfterRotate }
      ],
      opacity: opacity
    };
  };

  _renderChild = (child, i) => {
    let expandStyle = this.props.expandView
      ? { paddingTop: 100, paddingBottom: 100, height: height + 200 }
      : { width, height };
    let style = [child.props.style, expandStyle];
    let props = {
      i,
      style
    };
    let element = React.cloneElement(child, props);

    return (
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: 'transparent' },
          this._getTransformsFor(i, false)
        ]}
        key={`child- ${i}`}
      >
        {element}
      </Animated.View>
    );
  };

  _closest = num => {
    let array = this.pages;

    let i = 0;
    let minDiff = 1000;
    let ans;
    for (i in array) {
      let m = Math.abs(num - array[i]);
      if (m < minDiff) {
        minDiff = m;
        ans = array[i];
      }
    }
    return ans;
  };

  render() {
    let expandStyle = this.props.expandView
      ? { top: -100, left: 0, width, height: height + 200 }
      : { width, height };

    return (
      <Animated.View
        style={[{ position: 'absolute' }]}
        ref={view => {
          this._scrollView = view;
        }}
        {...this._panResponder.panHandlers}
      >
        <Animated.View
          style={[
            { backgroundColor: '#000', position: 'absolute', width, height },
            expandStyle
          ]}
        >
          {this.props.children.map(this._renderChild)}
        </Animated.View>
      </Animated.View>
    );
  }
}

CubeNavigationHorizontal.propTypes = {
  callBackAfterSwipe: PropTypes.func,
  callbackOnSwipe: PropTypes.func,
  scrollLockPage: PropTypes.number,
  expandView: PropTypes.bool,
  loop: PropTypes.bool
};

CubeNavigationHorizontal.defaultProps = {
  expandView: false,
  loop: false
};
