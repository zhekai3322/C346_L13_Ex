import React, { useState, useEffect } from 'react';
import { FlatList, StatusBar, Text, TextInput, View, StyleSheet, TouchableOpacity, ScrollView, Image, Button, Linking } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

let originalData = [];

const App = () => {
    const navigation = useNavigation();
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    const [transportTypeFilter, setTransportTypeFilter] = useState('');
    const [years, setYears] = useState([]);
    const [transportTypes, setTransportTypes] = useState([]);

    useEffect(() => {
        fetch("https://data.gov.sg/api/action/datastore_search?resource_id=d_75248cf2fbf340de6a746dc91ec9223c")
            .then((response) => response.json())
            .then((json) => {
                if (json && json.result && json.result.records) {
                    const transportData = json.result.records.map((record) => ({
                        year: record.year,
                        transportType: record.type_of_public_transport,
                        averageRidership: record.average_ridership,
                    }));

                    setYears([...new Set(transportData.map((item) => item.year))]);
                    setTransportTypes([...new Set(transportData.map((item) => item.transportType))]);

                    originalData = transportData;
                    setData(transportData);
                }
            })
            .catch((err) => setError(err.message));
    }, []);

    const filterData = () => {
        let filteredData = originalData;

        if (searchText !== '') {
            filteredData = filteredData.filter((item) =>
                item.transportType.toLowerCase().includes(searchText.toLowerCase()) ||
                item.year.toString().includes(searchText)
            );
        }

        if (yearFilter !== '') {
            filteredData = filteredData.filter((item) => item.year === yearFilter);
        }

        if (transportTypeFilter !== '') {
            filteredData = filteredData.filter((item) => item.transportType === transportTypeFilter);
        }

        setData(filteredData);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('Details', { item })}>
            <View style={styles.card}>
                <Text style={styles.title}>{item?.transportType || 'Unknown Transport'}</Text>
                <Text style={styles.subtitle}>Year: {item?.year || 'N/A'}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <Text style={styles.header}>Public Transport Tracker</Text>
            {error && <Text style={styles.errorText}>{error}</Text>}

            <TextInput
                style={styles.input}
                placeholder="Search by transport type or year"
                value={searchText}
                onChangeText={(text) => { setSearchText(text); filterData(); }}
            />

            <Picker
                selectedValue={yearFilter}
                style={styles.picker}
                onValueChange={(itemValue) => { setYearFilter(itemValue); filterData(); }}
            >
                <Picker.Item label="Select Year" value="" />
                {years.map((year) => (
                    <Picker.Item key={year} label={year.toString()} value={year} />
                ))}
            </Picker>

            <Picker
                selectedValue={transportTypeFilter}
                style={styles.picker}
                onValueChange={(itemValue) => { setTransportTypeFilter(itemValue); filterData(); }}
            >
                <Picker.Item label="Select Transport Type" value="" />
                {transportTypes.map((type) => (
                    <Picker.Item key={type} label={type} value={type} />
                ))}
            </Picker>

            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item, index) => item?.transportType + item?.year + index.toString()}
            />

            <TouchableOpacity
                style={styles.mapButton}
                onPress={() => navigation.navigate('Map')}
            >
                <Button
                    title="SG MRT Map"
                    onPress={() => navigation.navigate('Map')}
                    color="#8507a1"
                />
            </TouchableOpacity>
        </View>
    );
};

const DetailsScreen = ({ route }) => {
    const { item } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Transport Details</Text>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>{item?.transportType || 'Unknown Transport'}</Text>
                <Text style={styles.cardText}>Year: {item?.year || 'N/A'}</Text>
                <Text style={styles.cardText}>Average Ridership: {item?.averageRidership || 'N/A'}</Text>
            </View>

            <ScrollView style={styles.card}>
                <Text style={styles.descriptionTitle}>Why This Data Matters:</Text>
                <Text style={styles.descriptionText}>
                    This dataset provides valuable insights into the ridership trends of various public transport modes in Singapore, including MRT, LRT, Bus, and Taxi, over the years.
                </Text>
                <Text style={styles.descriptionText}>
                    These insights are crucial for understanding public transport usage patterns, enabling the planning of future transportation infrastructure to meet the needs of a growing population in line with the Singapore Green Plan 2030.
                </Text>
                <Text style={styles.descriptionText}>
                    The data can help identify gaps in transport accessibility, guiding investments in sustainable and green transport solutions, aligning with the Green Plan’s goal of increasing the share of public transport use.
                </Text>
                <Text style={styles.descriptionText}>
                    By tracking ridership in different transport modes, this information supports the goal of reducing carbon emissions and promoting sustainable mobility options for Singapore's residents.
                </Text>
                <Text style={styles.descriptionText}>
                    With the Green Plan 2030 focusing on sustainability, this data is instrumental in shaping policies to reduce reliance on private vehicles and improve the efficiency of public transport networks.
                </Text>
            </ScrollView>
        </View>
    );
};

const MapScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.header}>SG MRT Map</Text>

            <Image
                source={require('./map.png')}
                style={styles.mapImage}
                resizeMode="contain"
            />

            <TouchableOpacity
                onPress={() => Linking.openURL('https://mrtmapsingapore.com/')}
            >
                <Text style={styles.link}>View Full MRT System Map</Text>
            </TouchableOpacity>
        </View>
    );
};

const Stack = createNativeStackNavigator();

export default function NavigationApp() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home">
                <Stack.Screen name="Home" component={App} />
                <Stack.Screen name="Details" component={DetailsScreen} />
                <Stack.Screen name="Map" component={MapScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#9fd5ea',
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2b2b2b',
        textAlign: 'center',
        marginBottom: 20,
        letterSpacing: 1.5,
    },
    card: {
        backgroundColor: '#ffffff',
        padding: 20,
        marginBottom: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4a148c',
        marginBottom: 10,
    },
    cardText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 8,
    },
    descriptionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 15,
    },
    descriptionText: {
        fontSize: 16,
        color: '#7f8c8d',
        lineHeight: 30,
        marginBottom: 20,
        textAlign: 'justify',
    },
    mapImage: {
        width: '120%',
        height: undefined,
        aspectRatio: 1.5,
        marginBottom: 20,
        objectFit: 'fit',
    },
    link: {
        color: '#007BFF',
        fontSize: 16,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
});
