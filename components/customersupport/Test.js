import React from 'react';
import { View, Text, TextInput, } from "react-native";
import io from "socket.io-client";

var e;
export default class Test extends React.Component {
    constructor(props) {
        super(props);
        e = this;
        this.state = {
            background: 'white',
            temp: '',
        };
        this.socket = io("http://192.168.1.221:3000", { jsonp: false });
        this.socket.on("server-send-color", function (data) {
            e.setState({ background: data });
            console.log(data);
        });
    }
    _touch = () => {
        this.socket.emit("client-send-color", this.state.temp);
    }
    render() {
        const { background, temp } = this.state;
        return (
            <View style={{ flex: 1, backgroundColor: background }}>
                <Text onPress={this._touch}>Touch here</Text>
                <TextInput
                    keyboardType="default"
                    placeholder="........."
                    onChangeText={temp => this.setState({ temp: temp })}
                    value={temp}
                />
            </View>
        );
    }
}