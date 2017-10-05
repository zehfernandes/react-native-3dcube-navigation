import React from 'react';
import PropTypes from 'prop-types'
import { PanResponder, Animated, Dimensions, StyleSheet, Image, View, Text } from 'react-native';
const { width, height } = Dimensions.get('window');

export default class CubeNavigationVertical extends React.Component {
  constructor(props) {
    super(props)

    this.pages = []
    for (var i = 0; i < this.props.children.length; i++) {
      this.pages.push(height * -i)
    }

    this.state = {
      scrollLockPage: this.pages[this.props.scrollLockPage]
    }

  }

  componentWillMount() {
    this._animatedValue = new Animated.ValueXY()
    this._animatedValue.setValue({ x: 0, y: 0 });
    this._value = { x: 0, y: 0 }

    this._animatedValue.addListener((value) => {
      this._value = value
    });

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => Math.abs(gestureState.dy) > 40 /*&& gestureState.dy !== 0*/,
      onPanResponderGrant: (e, gestureState) => {
        this._animatedValue.stopAnimation()
        this._animatedValue.setOffset({ x: this._value.x, y: this._value.y });
      },
      onPanResponderMove: (e, gestureState) => {

        Animated.event([
          null, { dy: this._animatedValue.y }
        ])(e, gestureState)

        // Avoid last movement
        this.lockLast = this.state.scrollLockPage != undefined ? -this.state.scrollLockPage : this.pages[this.pages.length - 1]
        if (this._value.y > this.pages[0] || this._value.y < this.lockLast) {
          this._animatedValue.setValue({ x: 0, y: 0 })
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        if ((Math.abs(gestureState.dy) > 20)) {
          let goTo = this._closest(this._value.y + (gestureState.dy))
          if (this.lockLast > goTo) return //remove in the future

          this._animatedValue.flattenOffset({ x: this._value.x, y: this._value.y });
          Animated.spring(this._animatedValue, {
            toValue: { x: 0, y: goTo },
            friction: 3,
            tension: 0.6
          }).start()
          setTimeout(() => {
            if (this.props.callBackAfterSwipe) this.props.callBackAfterSwipe(goTo)
          }, 500);
        }
      }
    });
  }

  componentWillReceiveProps(props) {
    this.setState({
      scrollLockPage: props.scrollLockPage ? this.pages[props.scrollLockPage] : undefined
    })
  }

  /*
    @page: index
  */
  scrollTo(page, animated) {
    animated = animated || true

    if (animated) {
      Animated.spring(this._animatedValue, {
        toValue: { x: 0, y: this.pages[page] },
        friction: 4,
        tension: 0.8
      }).start()
    } else {
      this._animatedValue.setValue({ x: 0, y: this.pages[page] });
    }
  }

  render() {
    let expandStyle = this.props.expandView ? { top: 0, left: -100, width: width + 200, height } : { width, height }

    return (
      <Animated.View
        style={{ backgroundColor: "#000" }}
        ref={view => { this._scrollView = view; }}
        {...this._panResponder.panHandlers}
      >
        <Animated.View style={[{ backgroundColor: '#000', position: 'absolute', width, height }, expandStyle]}>
          {this.props.children.map(this._renderChild)}
        </Animated.View>
      </Animated.View>
    );
  }

  /*
  Private methods
  */

  _getTransformsFor = (i) => {
    let scrollY = this._animatedValue.y;
    let pageY = -height * i;

    let translateY = scrollY.interpolate({
      inputRange: [pageY - height, pageY, pageY + height],
      outputRange: [(-height - 1) / 2, 0, (height + 1) / 2],
      extrapolate: 'clamp',
    });

    let rotateX = scrollY.interpolate({
      inputRange: [pageY - height, pageY, pageY + height],
      outputRange: ['60deg', '0deg', '-60deg'],
      extrapolate: 'clamp',
    });

    let translateYAfterRotate = scrollY.interpolate({
      inputRange: [pageY - height, pageY, pageY + height],
      inputRange: [
        pageY - height,
        pageY - height + 0.1,
        pageY,
        pageY + height - 0.1,
        pageY + height,
      ],
      outputRange: [(-height - 1), (-height - 1) / 2.38, 0, (height + 1) / 2.38, (+height + 1)],
      extrapolate: 'clamp',
    });

    let opacity = scrollY.interpolate({
      inputRange: [pageY - height, pageY - height + 100, pageY, pageY + height - 100, pageY + height],
      outputRange: [0, 0.6, 1, 0.6, 0],
      extrapolate: 'clamp',
    })

    return {
      transform: [
        { perspective: height },
        { translateY },
        { rotateX: rotateX },
        { translateY: translateYAfterRotate },
      ],
      opacity: opacity
    }
  }

  _renderChild = (child, i) => {
    let expandStyle = this.props.expandView ? { paddingRight: 100, paddingLeft: 100, width: width + 200, height } : { width, height }
    let style = [child.props.style, expandStyle]
    let props = {
      ref: i,
      i,
      style,
    }
    let element = React.cloneElement(child, props)

    return (
      <Animated.View
        style={[StyleSheet.absoluteFill, this._getTransformsFor(i, false)]}
        key={`child- ${i}`}>
        {element}
      </Animated.View>
    );
  }

  _closest = (num) => {

    let array = this.pages

    var i = 0;
    var minDiff = 1000;
    var ans;
    for (i in array) {
      var m = Math.abs(num - array[i]);
      if (m < minDiff) {
        minDiff = m;
        ans = array[i];
      }
    }
    return ans;
  }

}

CubeNavigationVertical.propTypes = {
  callBackAfterSwipe: PropTypes.func,
  scrollLockPage: PropTypes.number,
  expandView: PropTypes.bool
}

CubeNavigationVertical.defaultProps = {
  expandView: false
}