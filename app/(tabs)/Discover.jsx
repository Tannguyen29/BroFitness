import React, { useState } from "react";
import { StyleSheet, Text, SafeAreaView, ScrollView, View, TouchableOpacity, TextInput, StatusBar } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faMagnifyingGlass, faClock } from "@fortawesome/free-solid-svg-icons";

const Discover = () => {
  const [activeTab, setActiveTab] = useState("At Home");
  const [searchValue, setSearchValue] = useState("");

  const tabs = ["At Home", "Gym", "Walk & Run"];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.headerContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.headerText, activeTab === tab && styles.activeHeaderText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.clockIcon}>
            <FontAwesomeIcon icon={faClock} color="#fff" size={20} />
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <FontAwesomeIcon icon={faMagnifyingGlass} color="#8E8E93" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search workouts, plans..."
            placeholderTextColor="#8E8E93"
            value={searchValue}
            onChangeText={setSearchValue}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Discover;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollViewContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10
  },
  headerText: {
    color: '#8E8E93',
    fontSize: 18,
    fontWeight: '400',
  },
  activeHeaderText: {
    color: '#fff',
    fontWeight: '700',
    borderBottomWidth: 2,
    borderBottomColor: '#fff',
    paddingBottom: 5,
  },
  clockIcon: {
    marginLeft: 'auto',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  contentText: {
    color: '#fff',
    fontSize: 16,
  },

})