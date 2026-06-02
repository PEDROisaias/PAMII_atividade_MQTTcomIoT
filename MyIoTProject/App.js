import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text } from 'react-native';
import MQTTService from './src/services/mqttService';
import StatusModal from './src/components/StatusModal';
import LightControl from "./src/components/LightControl";
import Gauges from "./src/components/Gauges";

const mqtt = new MQTTService();

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isLightOn, setIsLightOn] = useState(false);
  const [temp, setTemp] = useState(0);
  const [humdty, setHumdty] = useState(0);

  const getEnv = (key, def = '') => {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || process.env['REACT_APP_' + key] || process.env['EXPO_PUBLIC_' + key] || def;
    }
    return def;
  };

  const mqttConfig = {
    host: getEnv('MQTT_HOST', ''),
    port: parseInt(getEnv('MQTT_PORT', '1883')),
    path: getEnv('MQTT_PATH', ''),
    user: getEnv('MQTT_USER', ''),
    pass: getEnv('MQTT_PASS', ''),
    clientId: 'RN_App_' + Math.random(),
  };

  useEffect(() => {
    startConnection();
  }, []);

  const startConnection = () => {
    setShowError(false);
    mqtt.connect(
      mqttConfig,
      (topic, message) => {
        if (topic === 'casa/temp') setTemp(parseFloat(message));
        if (topic === 'casa/humdty') setHumdty(parseFloat(message));
        if (topic === 'casa/luz') setIsLightOn(message === '1');
      },
      () => {
        setIsConnected(true);
        mqtt.subscribe('casa/temp');
        mqtt.subscribe('casa/humdty');
        mqtt.subscribe('casa/luz');
      },
    (err) => {
      setIsConnected(false);
      setShowError(true);
    }
    );
  };

  const toggleLight = () => {
    const newState = isLightOn ? "0" : "1";
    mqtt.publish('casa/luz', newState);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Start Home IoT
      </Text>

      <LightControl 
        isLightOn={isLightOn}
        onToggle={toggleLight}
      />

      <Gauges
        temp={temp}
        humdty={humdty}
      />

      <StatusModal
        visible={showError}
        onRetry={startConnection}
        onLater={() => setShowError(false)}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20, 
    alignItems: 'center',
  },

  header: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 20,
  },
});