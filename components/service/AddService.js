import React from 'react';
import {
	StyleSheet,
	Text,
	TouchableOpacity,
	TextInput,
	View,
	KeyboardAvoidingView,
	Alert,
	Image,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
// Register Form
import { Picker } from '@react-native-community/picker'; //dropdown list
import Loading from 'react-native-whc-loading';
import { Hosting as host } from '../../app.json'; //Lấy IP host ra từ webService
import NumberFormat from 'react-number-format';
import ImagePicker from 'react-native-image-crop-picker'; //Image

class AddService extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			typeService: [{ idType: 0, nameType: "Không hệ số" }, { idType: 1, nameType: "Có hệ số" }],
			avatarSrc: {},
			//Form lưu vào database
			formData: {
				name_service: null,
				description_service: null,
				price_service: null,
				unit: null,
				type: null,
			}
		}
	}
	/* Chọn avatar */
	openGallery = () => {
		ImagePicker.openPicker({
			width: 180, // = với style image
			height: 180,
			mediaType: 'photo',
			cropping: false //True thì đc chọn resize hình
		}).then(image => {
			this.setState({
				avatarSrc: image,
			});
		}).catch((err) => { null });
	}
	/* End chọn avatar */
	/* Lưu đăng ký */
	saveData = async () => {
		if (!this.state.formData.type)
			await this.setState({ formData: { ...this.state.formData, unit: '' } });

		let formDataPost = new FormData();
		const { avatarSrc, formData } = this.state;

		if (!avatarSrc.path)
			return Alert.alert('', 'Vui lòng chọn ảnh Logo');
		else if (!this.state.formData.name_service) //! => false => != null
			return Alert.alert('', 'Vui lòng nhập Tên dịch vụ');
		else if (this.state.formData.name_service.length < 6)
			return Alert.alert('', 'Tên dịch vụ phải dài hơn 6 ký tự');
		else if (!this.state.formData.description_service)
			return Alert.alert('', 'Mô tả dịch vụ không được trống');
		else if (!this.state.formData.price_service)
			return Alert.alert('', 'Giá dịch vụ dịch vụ không được trống');
		else if (isNaN(this.state.formData.price_service))
			return Alert.alert('', 'Giá tiền chỉ được nhập số');
		else if (!this.state.formData.unit && this.state.formData.type)
			return Alert.alert('', 'Đơn vị dịch vụ dịch vụ không được trống');

		this.refs.loading.show(); //Hình gift Loading

		for (let p in formData) formDataPost.append(p, formData[p]);
		formDataPost.append('photo', { //Ghép file Avatar
			uri: avatarSrc.path,
			type: avatarSrc.mime,
			name: 'Avatar',
		});

		await fetch(host + '/service/AddService.php', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'multipart/form-data'
			},
			body: formDataPost
		})
			.then((response) => response.json())
			.then((json) => {
				setTimeout(() => {
					this.refs.loading.close(); //đóng gift loading
					if (JSON.stringify(json) == 1) {
						Alert.alert('', 'Thêm thành công');
						this.setState({
							formData: {
								...this.state.formData,
								name_service: null,
								description_service: null,
								price_service: null,
								unit: null,
								type: null,
							},
							avatarSrc: {},
						})
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
			name_service,
			description_service,
			price_service,
			unit,
			type,
		} = this.state.formData;
		const sourceUri = this.state.avatarSrc.path ? { uri: this.state.avatarSrc.path } : require('../../assets/images/chooseImage.png');
		/* End Lưu database */
		return (
			<ScrollView>
				<KeyboardAvoidingView style={styles.container} enabled>
					<TouchableOpacity onPress={this.openGallery}>
						<View style={{ flex: 1, flexDirection: "row", justifyContent: "center", paddingTop: 5 }}>
							<Image
								source={sourceUri}
								style={{
									width: 100,
									height: 100,
									borderRadius: 2,
								}}
							/>
						</View>
					</TouchableOpacity>
					<Text style={styles.text}>Tên dịch vụ</Text>
					<TextInput
						style={styles.txtInput}
						underlineColorAndroid='#8c8c8c'
						keyboardType="default"
						placeholder="Tên dịch vụ"
						onChangeText={name_service => this.setState(({ formData: { ...this.state.formData, name_service: name_service } }))}
						value={name_service}
					/>
					<Text style={styles.text}>Mô tả</Text>
					<TextInput
						style={styles.txtInput, { borderWidth: 1, borderColor: "#8c8c8c", borderRadius: 5 }}
						multiline={true}
						keyboardType="default"
						placeholder="Mô tả"
						onChangeText={description_service => this.setState(({ formData: { ...this.state.formData, description_service: description_service } }))}
						value={description_service}
					/>
					<Text style={styles.text}>Giá dịch vụ</Text>
					<NumberFormat
						value={price_service}
						displayType={'text'}
						thousandSeparator={true}
						renderText={price_service =>
							!price_service ? <Text style={styles.formatMoney}>0 đ</Text> :
								<Text style={styles.formatMoney}>{price_service} đ</Text>
						}
					/>
					<TextInput
						style={styles.txtInput}
						placeholder="Giá dịch vụ"
						keyboardType="numeric"
						underlineColorAndroid='#8c8c8c'
						onChangeText={price_service => this.setState(({ formData: { ...this.state.formData, price_service: price_service } }))}
						value={this.state.formData.price_service}
					/>
					{this.state.formData.type ?
						<>
							<Text style={styles.text}>Đơn vị</Text>
							<TextInput
								style={styles.txtInput}
								underlineColorAndroid='#8c8c8c'
								keyboardType="default"
								placeholder="Đơn vị"
								onChangeText={unit => this.setState(({ formData: { ...this.state.formData, unit: unit } }))}
								value={unit}
							/>
						</>
						: null
					}
					{/* Trạng thái */}
					<View style={{ paddingTop: 5 }}></View>
					<Text style={styles.text}>Dạng hệ số</Text>
					<View style={{ paddingTop: 5 }}></View>
					<View style={{ backgroundColor: '#fff', borderRadius: 5, padding: 5 }}>
						<Picker
							selectedValue={type}
							style={{ height: 35 }}
							onValueChange={type =>
								this.setState(previousState => ({
									formData: {
										...previousState.formData,
										type
									}
								}))
							}
						>
							{
								this.state.typeService.map((item, index) =>
									<Picker.Item key={item.idType} label={item.nameType} value={item.idType} /> //Tên name_type_apartment trong SQL
								)
							}
						</Picker>
					</View>
					{/* Loại */}
					<View style={{ paddingTop: 5 }}></View>
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
	formatMoney: { paddingTop: 6, textAlign: "center", borderWidth: 1, borderColor: "#8c8c8c", borderRadius: 2, height: 35, fontSize: 17 },
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
		fontSize: 17,
	},
});

export default AddService;