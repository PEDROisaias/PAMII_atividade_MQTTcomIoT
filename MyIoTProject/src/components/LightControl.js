import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import storageService from '../services/storageService';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

export default function LightControl({ isLightOn, onToggle }) {
    const handleToggle = async () => {
        try {
            const newState = !isLightOn;
            if (typeof onToggle === 'function') onToggle(newState);
            await storageService.saveMessage('app/light/toggle', newState ? 'on' : 'off');
        } catch (e) {
            console.warn('LightControl toggle save error', e);
        }
    };

    return (
        <View style={styles.card}>
            <TouchableOpacity onPress={handleToggle}>
                <Icon
                    name={isLightOn ? 'lightbulb-on' : 'lightbulb-outline'}                
                    size={100}
                    color={isLightOn ? '#F1C40F' : '#555'}
                />
            </TouchableOpacity>
            <Text style={styles.label}>
                {isLightOn ? 'Luz Ligada' : 'Luz Desligada'}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#1E1E1E',
        padding: 30,
        width: '100%',
        marginBottom: 20
    },

    label: {
        color: '#AAA',
        marginTop: 10,
        fontSize: 14
    },
});