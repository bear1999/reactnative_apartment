import React from 'react';
import {
	StyleSheet,
	Text,
	View,
	Alert,
	Image
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Hosting as host } from '../../app.json'; //Lấy IP host ra từ webService
import NumberFormat from 'react-number-format';

export function Currency({ value }) {
	return (
		<NumberFormat
			value={value}
			displayType={'text'}
			thousandSeparator={true}
			suffix={' đ'}
			renderText={formattedValue => <Text>{formattedValue}</Text>} // <--- Don't forget this!
		/>
	);
}

class ListService extends React.Component {
	constructor(props) {
		super(props);
		const { name_service, description_service, unit, type, price_service, imageTypeService } = this.props.route.params;
		this.state = {
			formData: {
				name_service: name_service,
				description_service: description_service,
				unit: unit,
				price_service: price_service,
				type: type,
				imageTypeService: imageTypeService,
			},
		}
	}
	render() {
		const {
			name_service,
			description_service,
			unit,
			price_service,
			type,
			imageTypeService
		} = this.state.formData;
		return (
			<ScrollView style={{ padding: 5, backgroundColor: "#fff" }}>
				<View style={{ flex: 1, flexDirection: "row", justifyContent: "center", padding: 5 }}>
					<Image
						source={{ uri: host + '/assets/logoService/' + imageTypeService }}
						style={{
							width: 250,
							height: 250,
							borderRadius: 2,
							resizeMode: "contain"
						}}
					/>
				</View>
				<View style={{ borderBottomWidth: 0.8, paddingTop: 5, borderColor: "#808080" }}></View>
				<View style={{ paddingTop: 5 }}>
					<Text style={{ textAlign: "center", fontSize: 22, fontWeight: "bold", color: "#fff", backgroundColor: "#CD5C5C", padding: 2, borderRadius: 15 }}>{name_service}</Text>
					<View style={{ flexDirection: "row", paddingTop: 5 }}>
						<Text style={{ fontSize: 15, fontWeight: "bold" }}>Giá dịch vụ: </Text>
						<Text style={{ fontSize: 15 }}><Currency value={price_service} /></Text>
					</View>
					{type ?
						<View style={{ flexDirection: "row" }}>
							<Text style={{ fontSize: 15, fontWeight: "bold" }}>Đơn vị tính: </Text>
							<Text style={{ fontSize: 15 }}>{unit}</Text>
						</View>
						: null}
					<View style={{ flexDirection: "row" }}>
						<Text style={{ fontSize: 15, fontWeight: "bold" }}>Dạng dịch vụ: </Text>
						{
							type ?
								<Text style={{ fontSize: 15 }}>Hệ số</Text> :
								<Text style={{ fontSize: 15 }}>Không hệ số</Text>
						}
					</View>
					<Text style={{ fontSize: 15, fontWeight: "bold" }}>Mô tả:</Text>
					<Text style={{ fontSize: 15 }}>{description_service}</Text>
				</View>
			</ScrollView >
		);
	}
}

const styles = StyleSheet.create({

});

export default ListService;