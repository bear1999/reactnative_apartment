import React from 'react';
import {
	StyleSheet,
	Text,
	TouchableOpacity,
	TextInput,
	View,
	KeyboardAvoidingView,
	Alert,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
// Register Form
import { Picker } from '@react-native-community/picker'; //dropdown list
import Loading from 'react-native-whc-loading';
import { Hosting as host } from '../../app.json'; //Lấy IP host ra từ webService

class AddApartment extends React.Component {
	constructor(props) {
		super(props);
		const { currentType, idSub } = this.props.route.params;
		this.state = {
			dataApartment: [],
			dataStatus: [],
			//Form lưu vào database
			formData: {
				idType_apartment: currentType, //Vị trí mặc định là tòa nhà
				idStatus: '1',
				Tittle: null, //Null, vừa gõ vừa lưu Tittle
				idSub: idSub,
				priceRent: ''
			}
		}
	}
	async componentDidMount() {
		try {
			await fetch(host + '/getdata/GetTypeApartment.php')
				.then((response) => response.json())
				.then((json) => {
					this.setState({
						dataApartment: json,
					})
				})
			await fetch(host + '/getdata/GetStatus.php')
				.then((response) => response.json())
				.then((json) => {
					this.setState({
						dataStatus: json,
					})
				})
		}
		catch (error) { Alert.alert('', 'Không thể kết nối tới máy chủ') }
	}
	/* Lưu đăng ký */
	saveData = async () => {
		const { idStatus, priceRent } = this.state.formData;
		if (!this.state.formData.Tittle) //! => false => != null
			return Alert.alert('', 'Vui lòng nhập Tiêu đề');
		else if (this.state.formData.Tittle.length < 6)
			return Alert.alert('', 'Tiêu đề phải dài hơn 6 ký tự');
		else if (idStatus == 1 && !priceRent)
			return Alert.alert('', 'Giá thuê phòng không để trống');
		this.refs.loading.show(); //Hình gift Loading

		await fetch(host + '/apartment/AddApartment.php', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(this.state.formData)
		})
			.then((response) => response.json())
			.then((json) => {
				setTimeout(() => {
					this.refs.loading.close(); //đóng gift loading
					if (JSON.stringify(json) == 1) {
						Alert.alert('', 'Thêm thành công');
						this.setState({ formData: { ...this.state.formData, Tittle: null, priceRent: null } })
					}
					else if (JSON.stringify(json) == 2)
						Alert.alert('', 'Thêm thất bại');
				}, 100) //Load time mili giây
			})
			.catch((error) => {
				this.refs.loading.close();
				console.log(error);
				return Alert.alert('', 'Không thể kết nối tới máy chủ');
			});
	}
	/* End Lưu đăng ký */
	render() {
		/* Lưu database */
		const {
			idType_apartment,
			Tittle,
			idStatus,
			priceRent
		} = this.state.formData;
		const { currentType } = this.props.route.params;
		/* End Lưu database */
		return (
			<ScrollView>
				<KeyboardAvoidingView style={styles.container} enabled>
					<Text style={styles.text}>Tiêu đề</Text>
					<TextInput
						style={styles.txtInput}
						underlineColorAndroid='#8c8c8c'
						keyboardType="default"
						placeholder="Tiêu đề"
						onChangeText={Tittle => this.setState(({ formData: { ...this.state.formData, Tittle: Tittle } }))}
						value={Tittle}
					/>
					{/* Trạng thái */}
					<View style={{ paddingTop: 5 }}></View>
					<Text style={styles.text}>Trạng thái</Text>
					<View style={{ paddingTop: 5 }}></View>
					<View style={{ backgroundColor: '#fff', borderRadius: 5, padding: 5 }}>
						<Picker
							selectedValue={idStatus}
							style={{ height: 35 }}
							onValueChange={idStatus =>
								this.setState(previousState => ({
									formData: {
										...previousState.formData,
										idStatus
									}
								}))
							}
						>
							{
								this.state.dataStatus.map((item, index) =>
									<Picker.Item key={item.idStatus} label={item.name_status} value={item.idStatus} /> //Tên name_type_apartment trong SQL
								)
							}
						</Picker>
					</View>
					{/* Loại */}
					<View style={{ paddingTop: 5 }}></View>
					<Text style={styles.text}>Loại</Text>
					<View style={{ paddingTop: 5 }}></View>
					<View style={{ backgroundColor: '#fff', borderRadius: 5, padding: 5 }}>
						<Picker
							selectedValue={idType_apartment}
							style={{ height: 35 }}
							onValueChange={idType_apartment =>
								this.setState(previousState => ({
									formData: {
										...previousState.formData,
										idType_apartment
									}
								}))
							}
						>

							{
								this.state.dataApartment.map((item, index) =>
									this.props.route.params.currentType == item.idType_apartment ?
										<Picker.Item key={item.idType_apartment} label={item.name_type_apartment} value={item.idType_apartment} /> //Tên name_type_apartment trong SQL
										: null
								)
							}
						</Picker>
					</View>
					{currentType == 4 && idStatus == 1 ? <>
						<View style={{ padding: 2 }}></View>
						<Text style={styles.text}>Giá thuê</Text>
						<View style={{ padding: 2 }}></View>
						<TextInput
							style={styles.txtInput1}
							keyboardType="numeric"
							placeholder="Giá thuê"
							onChangeText={priceRent => this.setState(({ formData: { ...this.state.formData, priceRent: priceRent } }))}
							value={priceRent}
						/>
					</> : null
					}
					<View style={{ padding: 4 }}></View>
					<TouchableOpacity onPress={this.saveData}>
						<Text style={styles.button}>Thêm</Text>
					</TouchableOpacity>
				</KeyboardAvoidingView>
				{/* Hiện hình loading khi nhấn đăng ký */}
				<Loading ref="loading" />
			</ScrollView >
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 10,
	},
	text: {
		fontSize: 15,
		padding: 3,
	},
	row: {
		marginBottom: 20,
	},
	button: {
		backgroundColor: '#ff6666',
		padding: 8,
		marginVertical: 3,
		borderRadius: 5,
		fontSize: 20,
		textAlign: 'center',
		color: '#fff',
	},
	txtInput: {
		height: 45,
		borderWidth: 0,
		fontSize: 17,
	},
	txtInput1: {
		height: 45,
		borderWidth: 0,
		fontSize: 17,
		backgroundColor: "#fff",
		paddingHorizontal: 5,
		borderRadius: 5
	},
});

export default AddApartment;