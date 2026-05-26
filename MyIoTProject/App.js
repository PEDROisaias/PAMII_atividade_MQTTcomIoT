import React, { useState, useEffect, use } from "react";
import { env } from 'expo-env'
import { StyleSheet, View, Text } from 'react-native';
import MQTTService from './src/services/MQTTService';
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

  const mqttConfig = {
    host: env.MQTT_HOST,
    port: parseInt(env.MQTT_PORT),
    path: env.MQTT_PATH,
    user: env.MQTT_USER,
    pass: env.MQTT_PASS,
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