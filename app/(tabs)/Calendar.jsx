import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  SafeAreaView, 
  View, 
  TouchableOpacity, 
  Modal,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [isCalendarModalVisible, setCalendarModalVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [isStudentModalVisible, setStudentModalVisible] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [weekSchedules, setWeekSchedules] = useState({});
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedDaySchedules, setSelectedDaySchedules] = useState([]);
  const [addScheduleDate, setAddScheduleDate] = useState(null);
  const [isAddScheduleCalendarVisible, setAddScheduleCalendarVisible] = useState(false);
  
  useEffect(() => {
    fetchStudents();
    fetchWeekSchedules();
  }, [selectedDate]);

  const fetchStudents = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${API_BASE_URL}/students`, {
        headers: { 'x-auth-token': token }
      });
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchWeekSchedules = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const startOfWeek = getStartOfWeek(selectedDate);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);

      const response = await axios.get(`${API_BASE_URL}/schedules/range/${startOfWeek.toISOString()}/${endOfWeek.toISOString()}`, {
        headers: { 'x-auth-token': token }
      });

      const schedulesByDay = groupSchedulesByDay(response.data);
      setWeekSchedules(schedulesByDay);
    } catch (error) {
      console.error('Error fetching week schedules:', error);
    }
  };

  const groupSchedulesByDay = (schedules) => {
    const grouped = {};
    schedules.forEach(schedule => {
      const date = new Date(schedule.date).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(schedule);
    });
    return grouped;
  };

  const getStartOfWeek = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1));
    return startOfWeek;
  };

  const handleViewCalendarSelect = (day) => {
    const newDate = new Date(day.dateString);
    setSelectedDate(newDate);
    setCalendarModalVisible(false);
  };

  const handleAddScheduleDateSelect = (day) => {
    const newDate = new Date(day.dateString);
    setAddScheduleDate(newDate);
    setAddScheduleCalendarVisible(false);
    setTimePickerVisible(true);
  };

  const handleTimeConfirm = (time) => {
    setSelectedTime(time.toLocaleTimeString());
    setTimePickerVisible(false);
    setStudentModalVisible(true);
  };

  const handleAddSchedule = () => {
    setAddScheduleCalendarVisible(true);
  };

  const isStudentAlreadyScheduled = (studentId, date) => {
    const dateString = new Date(date).toDateString();
    const daySchedules = weekSchedules[dateString] || [];
    return daySchedules.some(schedule => schedule.studentId._id === studentId);
  };
  
  const handleScheduleCreate = async () => {
    try {
      if (!addScheduleDate) {
        alert('Please select a date');
        return;
      }

      if (isStudentAlreadyScheduled(selectedStudent._id, addScheduleDate)) {
        alert('This student already has a schedule for this day');
        return;
      }

      const token = await AsyncStorage.getItem('userToken');
      await axios.post(`${API_BASE_URL}/schedules`, {
        studentId: selectedStudent._id,
        date: addScheduleDate.toISOString(),
        startTime: selectedTime,
        endTime: new Date(new Date(`${addScheduleDate.toDateString()} ${selectedTime}`).getTime() + 60*60*1000).toLocaleTimeString()
      }, {
        headers: { 'x-auth-token': token }
      });
      
      setStudentModalVisible(false);
      setSelectedStudent(null);
      setAddScheduleDate(null);
      fetchWeekSchedules();
    } catch (error) {
      console.error('Error creating schedule:', error);
    }
  };
  const renderWeekDays = () => {
    const startOfWeek = getStartOfWeek(selectedDate);
    return WEEKDAYS.map((day, index) => {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(currentDate.getDate() + index);
      const isToday = currentDate.toDateString() === selectedDate.toDateString();
      
      return (
        <View key={day} style={styles.dayWrapper}>
          <Text style={styles.weekdayText}>{day}</Text>
          <View style={[styles.dayItem, isToday && styles.selectedDay]}>
            <Text style={[styles.dateText, isToday && styles.selectedDayText]}>
              {currentDate.getDate()}
            </Text>
          </View>
        </View>
      );
    });
  };

  const handleDaySchedulePress = (dateSchedules) => {
    setSelectedDaySchedules(dateSchedules);
    setDetailModalVisible(true);
  };

  const renderWeekSchedule = () => {
    const startOfWeek = getStartOfWeek(selectedDate);
    return WEEKDAYS.map((day, index) => {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(currentDate.getDate() + index);
      const dateString = currentDate.toDateString();
      const schedules = weekSchedules[dateString] || [];

      if (schedules.length === 0) return null;

      return (
        <TouchableOpacity 
          key={day} 
          style={styles.daySchedule}
          onPress={() => handleDaySchedulePress(schedules)}
        >
          <View style={styles.scheduleHeaderContainer}>
            <Text style={styles.scheduleDate}>
              {currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
            <Text style={styles.scheduleSeparator}>|</Text>
            <Text style={styles.sessionCount}>
              ({schedules.length} sessions)
            </Text>
          </View>
          <Text style={styles.scheduleLocation}>Cosmopolitan Mall</Text>
        </TouchableOpacity>
      );
    });
  };

  const renderDetailModal = () => (
    <Modal
      visible={detailModalVisible}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Schedule Details</Text>
          <ScrollView>
            {selectedDaySchedules.map((schedule, idx) => (
              <View key={idx} style={styles.scheduleDetailItem}>
                <Text style={styles.scheduleTime}>
                  {schedule.startTime} - {schedule.endTime}
                </Text>
                <Text style={styles.studentNameText}>
                  {schedule.studentId.name}
                </Text>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setDetailModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Work schedule</Text>
        <TouchableOpacity onPress={() => setCalendarModalVisible(true)}>
          <Icon name="calendar" size={24} color="#FD6300" />
        </TouchableOpacity>
      </View>

      <View style={styles.weekDaysContainer}>
        {renderWeekDays()}
      </View>

      <ScrollView style={styles.scheduleList}>
        {renderWeekSchedule()}
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={handleAddSchedule}
      >
        <Icon name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {renderDetailModal()}

      {/* Calendar Modal for Viewing Week */}
      <Modal
        visible={isCalendarModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Week to View</Text>
            <Calendar
              onDayPress={handleViewCalendarSelect}
              markedDates={{
                [selectedDate.toISOString().split('T')[0]]: { selected: true, selectedColor: '#FD6300' }
              }}
              theme={{
                backgroundColor: '#fff',
                calendarBackground: '#fff',
                textSectionTitleColor: '#000',
                dayTextColor: '#000',
                todayTextColor: '#FD6300',
                selectedDayTextColor: '#000',
                selectedDayBackgroundColor: '#FD6300',
                arrowColor: '#FD6300'
              }}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setCalendarModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Calendar Modal for Adding Schedule */}
      <Modal
        visible={isAddScheduleCalendarVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Date for New Schedule</Text>
            <Calendar
              onDayPress={handleAddScheduleDateSelect}
              markedDates={{
                [addScheduleDate?.toISOString().split('T')[0]]: { selected: true, selectedColor: '#FD6300' }
              }}
              theme={{
                backgroundColor: '#fff',
                calendarBackground: '#fff',
                textSectionTitleColor: '#000',
                dayTextColor: '#000',
                todayTextColor: '#FD6300',
                selectedDayTextColor: '#000',
                selectedDayBackgroundColor: '#FD6300',
                arrowColor: '#FD6300'
              }}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setAddScheduleCalendarVisible(false);
              }}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleTimeConfirm}
        onCancel={() => setTimePickerVisible(false)}
      />

      <Modal
        visible={isStudentModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Student</Text>
            <ScrollView>
              {students.map((student) => {
                const isScheduled = addScheduleDate && isStudentAlreadyScheduled(student._id, addScheduleDate);
                return (
                  <TouchableOpacity
                    key={student._id}
                    style={[styles.studentItem, isScheduled && styles.disabledStudent]}
                    onPress={() => !isScheduled && setSelectedStudent(student)}
                    disabled={isScheduled}
                  >
                    <Text style={[
                      styles.studentName,
                      selectedStudent?._id === student._id && styles.selectedStudent,
                      isScheduled && styles.disabledStudentText
                    ]}>
                      {student.name} {isScheduled ? '(Already scheduled)' : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setStudentModalVisible(false);
                  setSelectedStudent(null);
                  setAddScheduleDate(null);
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={handleScheduleCreate}
                disabled={!selectedStudent}
              >
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  dayWrapper: {
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  dayItem: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  selectedDay: {
    backgroundColor: '#6B4EFF',
  },
  dayText: {
    fontSize: 14,
    color: '#333',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectedDayText: {
    color: '#fff',
  },
  scheduleList: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  daySchedule: {
    marginBottom: 12,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scheduleHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  scheduleSeparator: {
    marginHorizontal: 8,
    color: '#666',
    fontWeight: '300',
  },
  sessionCount: {
    fontSize: 16,
    color: '#666',
  },
  scheduleLocation: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  detailModalContent: {
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  scheduleDetailItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  scheduleTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  studentNameText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  closeButton: {
    marginTop: 15,
    alignSelf: 'flex-end',
    padding: 8,
  },
  closeButtonText: {
    color: '#6B4EFF',
    fontSize: 16,
    fontWeight: '500',
  },
  studentItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  disabledStudent: {
    backgroundColor: '#f5f5f5',
  },
  disabledStudentText: {
    color: '#999',
  },
  studentName: {
    fontSize: 16,
    color: '#333',
  },
  selectedStudent: {
    color: '#6B4EFF',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    width: '45%',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  confirmButton: {
    backgroundColor: '#6B4EFF',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  calendarContainer: {
    marginBottom: 20,
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FD6300',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default CalendarScreen;