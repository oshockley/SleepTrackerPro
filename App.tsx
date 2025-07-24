import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SleepSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
}

export default function App() {
  const [isTracking, setIsTracking] = useState(false);
  const [currentSession, setCurrentSession] = useState<SleepSession | null>(null);
  const [sleepHistory, setSleepHistory] = useState<SleepSession[]>([]);

  useEffect(() => {
    loadSleepHistory();
  }, []);

  const loadSleepHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('sleepHistory');
      if (history) {
        const parsedHistory = JSON.parse(history).map((session: any) => ({
          ...session,
          startTime: new Date(session.startTime),
          endTime: session.endTime ? new Date(session.endTime) : undefined,
        }));
        setSleepHistory(parsedHistory);
      }
    } catch (error) {
      console.error('Error loading sleep history:', error);
    }
  };

  const saveSleepHistory = async (history: SleepSession[]) => {
    try {
      await AsyncStorage.setItem('sleepHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving sleep history:', error);
    }
  };

  const startSleepTracking = () => {
    const newSession: SleepSession = {
      id: Date.now().toString(),
      startTime: new Date(),
    };
    setCurrentSession(newSession);
    setIsTracking(true);
    Alert.alert('Sleep Tracking Started', 'Sweet dreams! 😴');
  };

  const stopSleepTracking = () => {
    if (!currentSession) return;

    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - currentSession.startTime.getTime()) / (1000 * 60));
    
    const completedSession: SleepSession = {
      ...currentSession,
      endTime,
      duration,
    };

    const updatedHistory = [completedSession, ...sleepHistory];
    setSleepHistory(updatedHistory);
    saveSleepHistory(updatedHistory);
    
    setCurrentSession(null);
    setIsTracking(false);
    
    Alert.alert(
      'Sleep Session Completed', 
      `You slept for ${Math.floor(duration / 60)}h ${duration % 60}m`
    );
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Sleep Tracker</Text>
          <Text style={styles.subtitle}>Track your sleep patterns</Text>
        </View>

        <View style={styles.trackingSection}>
          {!isTracking ? (
            <TouchableOpacity style={styles.startButton} onPress={startSleepTracking}>
              <Text style={styles.buttonText}>Start Sleep Tracking</Text>
              <Text style={styles.buttonSubtext}>🌙 Tap to begin</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.trackingActive}>
              <Text style={styles.trackingText}>Sleep tracking active</Text>
              <Text style={styles.trackingTime}>
                Started at {currentSession ? formatTime(currentSession.startTime) : ''}
              </Text>
              <TouchableOpacity style={styles.stopButton} onPress={stopSleepTracking}>
                <Text style={styles.buttonText}>Wake Up</Text>
                <Text style={styles.buttonSubtext}>☀️ End sleep session</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Sleep History</Text>
          {sleepHistory.length === 0 ? (
            <Text style={styles.emptyText}>No sleep sessions recorded yet</Text>
          ) : (
            sleepHistory.slice(0, 10).map((session) => (
              <View key={session.id} style={styles.historyItem}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyDate}>{formatDate(session.startTime)}</Text>
                  {session.duration && (
                    <Text style={styles.historyDuration}>
                      {formatDuration(session.duration)}
                    </Text>
                  )}
                </View>
                <Text style={styles.historyTime}>
                  {formatTime(session.startTime)} - {session.endTime ? formatTime(session.endTime) : 'In progress'}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0a0',
  },
  trackingSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
  },
  trackingActive: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4a90e2',
  },
  trackingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a90e2',
    marginBottom: 8,
  },
  trackingTime: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 20,
  },
  historySection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#a0a0a0',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  historyItem: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  historyDuration: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  historyTime: {
    fontSize: 14,
    color: '#a0a0a0',
  },
});
