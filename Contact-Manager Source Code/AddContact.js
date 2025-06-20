import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, Button, StyleSheet, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';

export default function AddContactScreen({ navigation, route }) {
  const [db, setDb] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [telephone, setTelephone] = useState('');

  const onRefresh = route?.params?.onRefresh;

  useEffect(() => {
    const initDB = async () => {
      const database = await SQLite.openDatabaseAsync('Contacts.db');
      setDb(database);
    };
    initDB();
  }, []);

  const handleAdd = async () => {
    if (!db) {
      Alert.alert('Database not ready', 'Please try again in a moment.');
      return;
    }

    if (
      firstName.trim() === '' ||
      lastName.trim() === '' ||
      telephone.trim() === ''
    ) {
      Alert.alert('Missing Info', 'Please fill in all required fields.');
      return;
    }

    Alert.alert(
      'Add Contact',
      'Do you want to add this contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async () => {
            try {
              await db.runAsync(
                'INSERT INTO contacts (firstName, middleInitial, lastName, telephone, favorite) VALUES (?, ?, ?, ?, ?);',
                [firstName, middleName, lastName, telephone, 0]
              );
              if (onRefresh) onRefresh();
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to add contact: ' + error.message);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>First Name</Text>
      <TextInput
        value={firstName}
        onChangeText={setFirstName}
        style={styles.input}
        placeholderTextColor="gray"
      />
      
      <Text style={styles.label}>Middle Name/Initial (Optional)</Text>
      <TextInput
        value={middleName}
        onChangeText={setMiddleName}
        style={styles.input}
        placeholderTextColor="gray"
      />

      <Text style={styles.label}>Last Name</Text>
      <TextInput
        value={lastName}
        onChangeText={setLastName}
        style={styles.input}
        placeholderTextColor="gray"
      />

      <Text style={styles.label}>Telephone Number</Text>
      <TextInput
        value={telephone}
        onChangeText={setTelephone}
        style={styles.input}
        keyboardType="phone-pad"
        placeholderTextColor="gray"
      />

      <Button title="Save Contact" onPress={handleAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#f3f4f6',
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    color: '#000',
  },
});
