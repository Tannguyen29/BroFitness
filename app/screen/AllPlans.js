import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  StatusBar
} from 'react-native';
import axios from 'axios';
import { Icon } from "@rneui/themed";
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '@env';

const AllPlans = () => {
  const [plans, setPlans] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/plans`);
      setPlans(response.data);
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  const renderPlanItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.planItemContainer}
      onPress={() => navigation.navigate('PlanOverview', { planId: item._id })}
    >
      <ImageBackground source={{ uri: item.backgroundImage }} style={styles.planBackground} imageStyle={styles.planBackgroundImage}>
        <View style={styles.planContent}>
          <Text style={styles.planSubtitle}>{item.subtitle}</Text>
          <View style={styles.titleContainer}>
            {item.title.split(' ').map((word, index) => (
              <Text key={index} style={styles.planTitle}>{word}</Text>
            ))}
          </View>
          {item.isPro && (
            <View style={styles.proBadge}>
              <Text style={[styles.proText, { color: item.accentColor }]}>PRO</Text>
            </View>
          )}
          <Text style={styles.planDescription} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1c1c1e" />
      <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="chevron-left" size={30} color="#FD6300" />
        </TouchableOpacity>
      <Text style={styles.headerTitle}>All Plans</Text>
      <FlatList
        data={plans}
        renderItem={renderPlanItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    padding: 16,
    marginTop: 30
  },
  backButton: {
    position: 'absolute',
    left: 10
  },
  listContainer: {
    padding: 16,
  },
  planItemContainer: {
    height: 200,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  planBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  planBackgroundImage: {
    borderRadius: 20,
  },
  planContent: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  planSubtitle: {
    color: 'white',
    fontSize: 12,
    marginBottom: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  planTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 4,
  },
  proBadge: {
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  proText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  planDescription: {
    color: 'white',
    fontSize: 14,
    marginTop: 8,
  },
});

export default AllPlans;