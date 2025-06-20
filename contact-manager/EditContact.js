import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';

export default function EditContactScreen({ route, navigation }) {
  const { contact } = route.params;
  const [db, setDb] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [firstName, setFirstName] = useState(contact.firstName);
  const [middleName, setMiddleName] = useState(contact.middleInitial); // Bro this is referencing "middleInitial" in the DB dont forget that dawgi
  const [lastName, setLastName] = useState(contact.lastName);
  const [telephone, setTelephone] = useState(contact.telephone);

  const onRefresh = route?.params?.onRefresh;

  useEffect(() => {
    const initDB = async () => {
      const database = await SQLite.openDatabaseAsync('Contacts.db');
      setDb(database);
    };
    initDB();
  }, []);

  const handleUpdate = () => {
    if (!db) {
      Alert.alert('Database not ready', 'Please try again.');
      return;
    }

    Alert.alert('Confirm Update', 'Do you want to save the changes?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Save',
        onPress: async () => {
          await db.runAsync(
            `UPDATE contacts SET firstName = ?, middleInitial = ?, lastName = ?, telephone = ? WHERE id = ?;`,
            [firstName, middleName, lastName, telephone, contact.id]
          );
          if (onRefresh) onRefresh();
          navigation.goBack();
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('Delete Contact', 'Are you sure you want to delete this contact?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await db.runAsync('DELETE FROM contacts WHERE id = ?;', [contact.id]);
          if (onRefresh) onRefresh();
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {editMode ? (
        <>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            style={styles.input}
          />

          <Text style={styles.label}>Middle Name/Initial (Optional)</Text>
          <TextInput
            value={middleName}
            onChangeText={setMiddleName}
            style={styles.input}
          />

          <Text style={styles.label}>Last Name</Text>
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            style={styles.input}
          />

          <Text style={styles.label}>Telephone Number</Text>
          <TextInput
            value={telephone}
            onChangeText={setTelephone}
            style={styles.input}
            keyboardType="phone-pad"
          />

          <Button title="Save Changes" onPress={handleUpdate} />
        </>
      ) : (
        <>
          <Text style={styles.text}>
            Name: {firstName} {middleName ? middleName + ' ' : ''}{lastName}
          </Text>
          <Text style={styles.text}>Telephone: {telephone}</Text>
          <Button title="Edit" onPress={() => setEditMode(true)} />
          <View style={{ height: 10 }} />
          <Button title="Delete" onPress={handleDelete} color="red" />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#fff',
  },
  label: {
    marginBottom: 4,
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    borderColor: '#ccc',
  },
  text: {
    fontSize: 18,
    marginBottom: 15,
  },
});
