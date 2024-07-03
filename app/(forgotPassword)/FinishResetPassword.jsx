import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import checked from "../../assets/image/checked.png";
const FinishResetPassword = ({ navigation }) => {

    const handleConfrim = async () => {
        try {
            navigation.navigate('SignIn');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <View style={styles.container} className="w-full justify-center items-center">
            <Image
                source={checked}
                classname="w-[80px] h-[160px] "
                resizeMode='contain'
            />

            <Text style={styles.title}>Congrats</Text>
            <Text style={styles.subtitle}>Your password is changed successfully!</Text>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfrim}>
                <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1C1C1E',
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        marginTop: 20,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FF6600',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#FFFFFF',
        marginBottom: 20,
        
    },
    input: {
        backgroundColor: '#2C2C2E',
        borderRadius: 20,
        padding: 15,
        color: '#FFFFFF',
        marginBottom: 20,
    },
    confirmButton: {
        backgroundColor: '#FF6600',
        borderRadius: 15,
        padding: 15,
        alignItems: 'center',
        marginBottom: 20,
        top: 200,
        width: 350,
        alignSelf: 'center'
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default FinishResetPassword;