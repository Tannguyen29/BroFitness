import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image
} from 'react-native';
import { getAvatarSource } from '../../utils/avatarHelper';

const StudentInfoModal = ({ route, navigation }) => {
  const { student } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Student Information</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeButton}>Close</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Image 
          source={getAvatarSource(student)}
          style={styles.avatar}
        />
        <Text style={styles.name}>{student.name}</Text>
        <Text style={styles.email}>{student.email}</Text>

        {student.personalInfo && (
          <View style={styles.infoSection}>
            <InfoItem label="Gender" value={student.personalInfo.gender} />
            <InfoItem label="Age" value={student.personalInfo.age} />
            <InfoItem label="Height" value={`${student.personalInfo.height} cm`} />
            <InfoItem label="Weight" value={`${student.personalInfo.weight} kg`} />
            <InfoItem label="Goal Weight" value={`${student.personalInfo.goalWeight} kg`} />
            <InfoItem label="Activity Level" value={student.personalInfo.physicalActivityLevel} />
            <InfoItem label="Fitness Goal" value={student.personalInfo.fitnessGoal} />
            <InfoItem label="Equipment" value={student.personalInfo.equipment} />
            <InfoItem label="Experience Level" value={student.personalInfo.experienceLevel} />
            <InfoItem label="Target Areas" value={student.personalInfo.bodyParts.join(', ')} />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const InfoItem = ({ label, value }) => (
  <View style={styles.infoItem}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    color: '#FD6300',
    fontSize: 16,
  },
  content: {
    padding: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 16,
  },
  name: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  email: {
    color: 'gray',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  infoSection: {
    backgroundColor: '#2c2c2e',
    borderRadius: 12,
    padding: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  label: {
    color: 'gray',
    fontSize: 16,
  },
  value: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default StudentInfoModal; 