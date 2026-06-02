import React, { useEffect, useState } from "react";
import storageService from "../services/storageService";
import { StyleSheet, View, Text } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';

export default function Gauges({ temp, humdty}) {
    const [historyCount, setHistoryCount] = useState(0);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const msgs = await storageService.getMessages();
                if (mounted) setHistoryCount(Array.isArray(msgs) ? msgs.length : 0);
            } catch (e) {
                console.warn('Gauges load messages error', e);
            }
        })();
        return () => { mounted = false };
    }, []);
    return (
        <View style={styles.row}>
            <View style={styles.gaugeBox}>
                <CircularProgress
                    value = {temp}
                    radius = {60}
                    title = {'ºC'}
                    titleColor = {'#FFF'}
                    activesStrokeColor = {'#E74C3C'}
                    inActiveStrokeColor = {'#2C3E50'}
                    textColor = {'#FFF'}
                />
                <Text style={styles.label}>Temperature</Text>
            </View>

            <View style={styles.gaugeBox}>
                <CircularProgress
                    value = {humdty}
                    radius = {60}
                    title = {'%'}
                    titleColor = {'#FFF'}
                    activesStrokeColor = {'#3498DB'}
                    inActiveStrokeColor = {'#2C3E50'}
                    textColor = {'#FFF'}
                
                />
                <Text style={styles.label}>Humidity</Text>
            </View>
            <View style={{width: '100%', alignItems: 'center', marginTop: 10}}>
                <Text style={{color: '#888', fontSize: 12}}>Histórico local: {historyCount} mensagens</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },

    gaugeBox: {
        backgroundColor: '#1E1E1E',
        padding: 15,
        borderRadius: 20,
        alignItems: 'center',
        width: '48%'
    },

    label: {
        color: '#AAA',
        marginTop: 10,
        fontSize: 14,
    },
});