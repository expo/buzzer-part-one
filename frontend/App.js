import Expo from 'expo';
import React, { Component } from 'react';
import {
  ActivityIndicator,
  Button,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { Constants } from 'expo';

// ===> PUT YOUR SERVER URL HERE :) vvvvvvvvvvvvvvv
const BASE_URL = 'http://localhost:3000';

export default class App extends Component {
  state = {
    loading: false,
    locked: true,
    unlockedAt: null,
    currentDate: null,
  };

  render() {
    return (
      <View style={styles.container}>
        {this.state.unlockedAt
          ? <Text style={styles.countdown}>
              {this._getTimeRemaining()} seconds remaining
            </Text>
          : null}
        {this.state.locked
          ? <Button title="Unlock" onPress={this._unlockAsync} />
          : <Button title="Lock" onPress={this._lockAsync} />}
        {this._maybeRenderLoadingOverlay()}
      </View>
    );
  }

  _handleAuthentication = accessToken => {
    this.setState({ accessToken });
  };

  _maybeRenderLoadingOverlay = () => {
    if (!this.state.loading) {
      return;
    }

    return (
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: 'rgba(0,0,0,0.1)',
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  };

  _getTimeRemaining() {
    return Math.max(
      Math.floor(
        (this.state.unlockedAt.getTime() +
          30000 -
          this.state.currentDate.getTime()) /
          1000
      ),
      0
    );
  }

  _unlockAsync = async () => {
    this.setState({ loading: true });

    try {
      await fetch(`${BASE_URL}/unlock`, { method: 'post' });
      this.setState({
        locked: false,
        unlockedAt: new Date(),
        currentDate: new Date(),
      }, () => {
        this._startCountdownTimer();
      });
    } catch (e) {
      alert('Error, sorry! :(');
    } finally {
      this.setState({ loading: false });
    }
  };

  _lockAsync = async () => {
    this.setState({ loading: true });

    try {
      await fetch(`${BASE_URL}/lock`, { method: 'post' });
      this._clearUnlockState();
    } catch (e) {
      alert('Error, sorry! :(');
    } finally {
      this.setState({ loading: false });
    }
  };

  _startCountdownTimer = () => {
    this._interval = setInterval(() => {
      this.setState({ currentDate: new Date() }, () => {
        if (this._getTimeRemaining() === 0) {
          this._clearUnlockState();
        }
      });
    }, 500);
  };

  _clearUnlockState = () => {
    clearInterval(this._interval);
    this.setState({ locked: true, unlockedAt: null, currentDate: null });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
});
