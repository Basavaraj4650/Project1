import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, Text, View, Button, Image, TouchableOpacity, Dimensions, FlatList } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapView, { Marker, Polyline } from "react-native-maps";

WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const [token, setToken] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "",
    iosClientId: "",
    webClientId: "",
  });

  useEffect(() => {
    handleEffect();
  }, [response, token]);

  async function handleEffect() {
    const user = await getLocalUser();
    console.log("user", user);
    if (!user) {
      if (response?.type === "success") {
        getUserInfo(response.authentication.accessToken);
        setIsLoggedIn(true); // Set isLoggedIn to true when the user is logged in
      }
    } else {
      setUserInfo(user);
      setIsLoggedIn(true); // Set isLoggedIn to true if user data is available locally
      console.log("loaded locally");
    }
  }

  const getLocalUser = async () => {
    const data = await AsyncStorage.getItem("@user");
    if (!data) return null;
    return JSON.parse(data);
  };

  const getUserInfo = async (token) => {
    if (!token) return;
    try {
      const response = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const user = await response.json();
      await AsyncStorage.setItem("@user", JSON.stringify(user));
      setUserInfo(user);
    } catch (error) {
      // Add your own error handler here
    }
  };

  const [showMap, setShowMap] = useState(false);
  const [objofLatLong, setObjShowedInMap] = useState({
    latitude: 44.968046,
    longitude: -94.420307,
    name: 'Hospital 1',
    background_color: 'red'
  });

  const listofLatLong = [{
    latitude: 44.968046,
    longitude: -94.420307,
    name: 'Hospital 1',
    background_color: 'red'
  }, {
    latitude: 50.33328,
    longitude: -89.132008,
    name: 'Hospital 2',
    background_color: 'green'
  }, {
    latitude: 46.755787,
    longitude: -116.359998,
    name: 'Hospital 3',
    background_color: 'blue'
  }, {
    latitude: 37.844843,
    longitude: -116.54911,
    name: 'Hospital 4',
    background_color: 'yellow'
  }, {
    latitude: 33.755783,
    longitude: -116.360066,
    name: 'Hospital 5',
    background_color: 'purple'
  }, {
    latitude: 40.920474,
    longitude: -93.447851,
    name: 'Hospital 6',
    background_color: 'black'
  }];

  const OnViewAlbleItemsChanged = useCallback(({ viewableItems, changed }) => {
    if (changed.length > 0) {
      console.log('------>inside function', changed[0]?.item);
      let value = { ...changed[0].item }
      setObjShowedInMap(value);
    }
  }, []);

  return (
    <View style={styles.container}>
      {isLoggedIn ? ( // Show MapView if user is logged in
        showMap ?
          <View style={{ ...StyleSheet.absoluteFillObject }}>
            <MapView
              region={{
                latitude: objofLatLong.latitude || 0,
                longitude: objofLatLong.longitude || 0,
                latitudeDelta: 0.3,
                longitudeDelta: 0.3,
              }}
              onPress={() => { setShowMap(false) }}
              style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
              onRegionChange={(region, details) => { }}
            >
              {listofLatLong.map((MarkerData, index) => {
                return (
                  <Marker
                    key={index}
                    coordinate={{
                      latitude: MarkerData.latitude,
                      longitude: MarkerData.longitude,
                    }}
                    tracksViewChanges={false}
                    children={
                      <View style={{ backgroundColor: MarkerData.background_color, padding: 10, borderRadius: 7 }}>
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>{MarkerData.name}</Text>
                      </View>
                    }
                  />
                )
              })}
            </MapView>
            <View style={{ position: 'absolute', left: 0, right: 0, top: '80%', bottom: '2%', zIndex: 1 }}>
              <FlatList
                data={listofLatLong}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                onViewableItemsChanged={OnViewAlbleItemsChanged}
                renderItem={({ item, index }) => {
                  return (
                    <View key={index} style={{ backgroundColor: 'white', marginRight: 5, width: Dimensions.get("screen").width / 1.1, margin: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center', elevation: 4 }}>
                      <TouchableOpacity onPress={() => { }}>
                        <Text>{item.name}</Text>
                      </TouchableOpacity>
                    </View>
                  )
                }} />
            </View>
          </View> :
          <TouchableOpacity style={{ width: 100, backgroundColor: '#800707', borderRadius: 5 }} activeOpacity={0.5} onPress={() => { setShowMap(true) }}>
            <Text style={{ fontSize: 17, color: 'white', padding: 7 }}>Open Map</Text>
          </TouchableOpacity>
      ) : (
        <View style={styles.buttonContainer}>
          <Button
            title="Sign in with Google"
            disabled={!request}
            onPress={() => {
              promptAsync();
            }}
          />
          <View style={styles.buttonSpacer} />
          <Button
            title="Remove local store"
            onPress={async () => await AsyncStorage.removeItem("@user")}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    alignItems: 'center', 
    marginBottom: 20, 
  },
  buttonSpacer: {
    height: 20, 
  }
});
