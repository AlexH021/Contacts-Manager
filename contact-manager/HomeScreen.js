import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import * as SQLite from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';

let db = null;

const setupDatabase = async () => {
  db = await SQLite.openDatabaseAsync('Contacts.db');
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT,
      middleInitial TEXT,
      lastName TEXT,
      telephone TEXT,
      favorite INTEGER DEFAULT 0
    );
  `);
};

export default function HomeScreen({ navigation }) {
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSortedAsc, setIsSortedAsc] = useState(true);
  const [favoriteFeedback, setFavoriteFeedback] = useState({});

  useEffect(() => {
    setupDatabase().then(fetchContacts);
    const unsubscribe = navigation.addListener('focus', fetchContacts);
    return unsubscribe;
  }, [navigation]);

  const fetchContacts = async () => {
    if (!db) return;
    const result = await db.getAllAsync(
      'SELECT id, firstName, middleInitial, lastName, telephone, favorite FROM contacts;'
    );

    const formatted = result.map((item) => ({
      id: item.id,
      firstName: item.firstName,
      middleInitial: item.middleInitial,
      lastName: item.lastName,
      telephone: item.telephone,
      favorite: item.favorite === 1,
      name: `${item.firstName}${item.middleInitial ? ' ' + item.middleInitial + ' ' : ' '}${item.lastName}`,
      phone: item.telephone,
    }));

    setContacts(formatted);
  };

  const filteredAndSortedContacts = [...contacts]
    .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (a.favorite !== b.favorite) return b.favorite - a.favorite;
      return isSortedAsc
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    });

  const toggleSortOrder = () => {
    setIsSortedAsc((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topControls}>
        <TextInput
          placeholder="Search contacts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        <TouchableOpacity onPress={toggleSortOrder} style={styles.sortButton}>
          <Ionicons
            name={isSortedAsc ? 'arrow-down' : 'arrow-up'}
            size={24}
            color="black"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate('Add Contact')}
        style={styles.addButton}>
        <Text style={styles.addButtonText}>➕ Add Contact</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredAndSortedContacts}
        keyExtractor={(item) => item.id.toString()}
        style={{ marginTop: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('Edit Contact', { contact: item })}
            style={styles.itemRow}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.phone}>{item.phone}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={async () => {
                    const newFav = item.favorite ? 0 : 1;
                    await db.runAsync(
                      'UPDATE contacts SET favorite = ? WHERE id = ?',
                      [newFav, item.id]
                    );

                    // Show feedback message
                    setFavoriteFeedback((prev) => ({
                      ...prev,
                      [item.id]: newFav
                        ? 'Marked as Favorite'
                        : 'Removed from Favorites',
                    }));

                    // Remove message after 2 seconds
                    setTimeout(() => {
                      setFavoriteFeedback((prev) => {
                        const updated = { ...prev };
                        delete updated[item.id];
                        return updated;
                      });
                    }, 2000);

                    fetchContacts();
                  }}>
                  <Ionicons
                    name={item.favorite ? 'star' : 'star-outline'}
                    size={24}
                    color={item.favorite ? '#facc15' : '#999'}
                  />
                </TouchableOpacity>
                {favoriteFeedback[item.id] && (
                  <Text style={styles.feedbackText}>
                    {favoriteFeedback[item.id]}
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f3f4f6',
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
  },
  sortButton: {
    marginLeft: 10,
    padding: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  addButton: {
    backgroundColor: '#2196f3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  itemRow: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  phone: {
    color: '#555',
  },
  feedbackText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});