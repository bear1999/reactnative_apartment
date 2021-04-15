import React from 'react';
import {
	StyleSheet,
	View,
	Text,
	Alert,
	Image,
	TextInput,
	FlatList,
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Hosting as host } from '../../app.json'; //Lấy IP host ra từ webService
import Loading from 'react-native-whc-loading';

export default class MyHome extends React.Component {
	constructor(props) {
		super(props);
		const { idUser, type } = this.props.route.params;
		this.state = {
			dataHome: [],
			type: type,
			formData: {
				idUser: idUser,
			}
		}
	}
	componentDidMount = async () => {
		await this._loadDSCanHo();
	}
	_loadDSCanHo = async () => {
		await fetch(host + '/apartment/LoadApartmentUser.php', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(this.state.formData)
		})
			.then((response) => response.json())
			.then((json) => {
				this.setState({ dataHome: json })
			})
			.catch((err) => { Alert.alert('', 'Không thể kết nối tới máy chủ'); console.log(err) })
	}
	_renderItem = ({ item, index }) => {
		return (
			<View style={{ width: "100%" }}>
				<View style={{ borderBottomWidth: 1, borderColor: '#999999' }}></View>
				<View style={{ flexDirection: 'row', flex: 1 }}>
					<TouchableOpacity onPress={() => {
						this.state.type == 1 ?
							this.props.navigation.navigate('DetailHome', { idMain: item.idMain })
							: this.props.navigation.navigate('DetailServiceHome', { idMain: item.idMain })
					}}>
						<View style={{ flexDirection: 'row' }}>
							<Image
								source={require('../../assets/icons/home.png')}
								style={{ height: 35, width: 35, marginTop: 10, marginLeft: 8, marginRight: 8 }}
							/>
							<View style={{ paddingLeft: 10, padding: 3 }}>
								<Text style={styles.txtCanho}>Mã căn hộ: <Text style={{ fontWeight: 'bold' }}>{item.idMain}</Text></Text>
								<Text style={styles.txtCanho}>Tên căn hộ: <Text style={{ fontWeight: 'bold' }}>{item.name_apartment}</Text></Text>
							</View>
						</View>
					</TouchableOpacity>
				</View>
			</View >
		);
	}
	render() {
		const { dataHome } = this.state;
		return (
			<View style={{ flex: 1 }}>
				<View style={styles.dsCanho}>
					<Text style={styles.textNe}>Danh sách căn hộ</Text>
					<View style={{ paddingTop: 10 }}></View>
					<FlatList
						data={dataHome}
						renderItem={this._renderItem}
						keyExtractor={item => item.idMain.toString()}
					/>
				</View>
				<Loading ref="loading" />
			</View>
		);
	}
}

const styles = StyleSheet.create({
	txtCanho: {
		fontSize: 17,
	},
	dsCanho: {
		backgroundColor: '#fff',
		borderRadius: 1,
		height: '100%',
	},
	container: {
		backgroundColor: '#fff',
		borderRadius: 1,
	},
	btnThem: {
		backgroundColor: '#ff6666',
		textAlign: 'center',
		fontSize: 17,
		borderRadius: 5,
		height: 35,
		paddingTop: 5,
		color: '#fff',
		fontWeight: 'bold',
	},
	textNe: {
		paddingTop: 5,
		fontSize: 20,
		fontWeight: 'bold',
		justifyContent: 'center',
		textAlign: 'center',
		color: '#333333',
	},
	txtInput: {
		height: 44,
		fontSize: 17,
		paddingLeft: 5,
	},
});